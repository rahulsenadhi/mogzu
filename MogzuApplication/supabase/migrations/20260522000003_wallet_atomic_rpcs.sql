-- Plan Batch 7 — Razorpay + Wallet hardening (P0 critical).
--
-- Replaces read-modify-write balance updates with two SECURITY DEFINER RPCs:
--   wallet_debit_atomic       — books-and-debits in one transaction with
--                              row lock + balance >= amount enforcement.
--   wallet_topup_request      — records a pending top-up (no balance bump).
--   wallet_topup_confirm      — webhook-only: confirms a pending request,
--                              bumps the balance, inserts the txn row.
--
-- Pending requests live in wallet_topup_requests so we can reconcile
-- against Razorpay's settled-orders report (cron job lands in P5).

CREATE TABLE IF NOT EXISTS public.wallet_topup_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  corporate_id UUID NOT NULL REFERENCES public.corporate_accounts(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  method TEXT NOT NULL,
  external_ref TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed', 'expired')),
  payment_ref TEXT,
  confirmed_at TIMESTAMPTZ,
  failed_reason TEXT,
  created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wallet_topup_requests_corp_status
  ON public.wallet_topup_requests (corporate_id, status, created_at DESC);

ALTER TABLE public.wallet_topup_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "L3 admin reads own corp topup requests" ON public.wallet_topup_requests;
CREATE POLICY "L3 admin reads own corp topup requests"
  ON public.wallet_topup_requests
  FOR SELECT
  USING (
    corporate_id IN (
      SELECT p.corporate_id FROM public.user_profiles p
      WHERE p.id = auth.uid() AND p.role = 'l3_admin'
    )
  );

DROP POLICY IF EXISTS "Admin reads all topup requests" ON public.wallet_topup_requests;
CREATE POLICY "Admin reads all topup requests"
  ON public.wallet_topup_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid() AND p.role IN ('mogzu_admin', 'support')
    )
  );

-- ─── wallet_debit_atomic ─────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.wallet_debit_atomic(
  p_corporate_id UUID,
  p_amount NUMERIC,
  p_booking_id UUID,
  p_description TEXT
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_wallet_id UUID;
  v_balance NUMERIC;
  v_txn_id UUID;
BEGIN
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'wallet_debit_atomic: amount must be positive';
  END IF;

  -- Caller must be L3 admin or mogzu_admin for this corporate.
  IF NOT EXISTS (
    SELECT 1 FROM public.user_profiles p
    WHERE p.id = auth.uid()
      AND (
        (p.role = 'l3_admin' AND p.corporate_id = p_corporate_id)
        OR p.role IN ('mogzu_admin', 'support')
      )
  ) THEN
    RAISE EXCEPTION 'wallet_debit_atomic: not authorized for corporate %', p_corporate_id;
  END IF;

  -- Lock the wallet row for the duration of the txn.
  SELECT id, balance INTO v_wallet_id, v_balance
  FROM public.wallets
  WHERE corporate_id = p_corporate_id
  FOR UPDATE;

  IF v_wallet_id IS NULL THEN
    RAISE EXCEPTION 'wallet_debit_atomic: wallet not found for corporate %', p_corporate_id;
  END IF;

  IF v_balance < p_amount THEN
    RAISE EXCEPTION 'wallet_debit_atomic: insufficient balance (% < %)', v_balance, p_amount;
  END IF;

  UPDATE public.wallets
  SET balance = balance - p_amount,
      updated_at = NOW()
  WHERE id = v_wallet_id;

  INSERT INTO public.wallet_transactions (
    wallet_id, corporate_id, type, amount, booking_id, description
  ) VALUES (
    v_wallet_id, p_corporate_id, 'debit', p_amount, p_booking_id, p_description
  ) RETURNING id INTO v_txn_id;

  RETURN v_txn_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.wallet_debit_atomic(UUID, NUMERIC, UUID, TEXT)
  TO authenticated;

-- ─── wallet_topup_request ────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.wallet_topup_request(
  p_corporate_id UUID,
  p_amount NUMERIC,
  p_method TEXT,
  p_external_ref TEXT
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
BEGIN
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'wallet_topup_request: amount must be positive';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.user_profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'l3_admin'
      AND p.corporate_id = p_corporate_id
  ) THEN
    RAISE EXCEPTION 'wallet_topup_request: not authorized for corporate %', p_corporate_id;
  END IF;

  INSERT INTO public.wallet_topup_requests (
    corporate_id, amount, method, external_ref, created_by
  ) VALUES (
    p_corporate_id, p_amount, p_method, p_external_ref, auth.uid()
  ) RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.wallet_topup_request(UUID, NUMERIC, TEXT, TEXT)
  TO authenticated;

-- ─── wallet_topup_confirm ────────────────────────────────────────────────────
-- Called from the Razorpay webhook edge function under service_role.
CREATE OR REPLACE FUNCTION public.wallet_topup_confirm(
  p_request_id UUID,
  p_payment_ref TEXT
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_req public.wallet_topup_requests%ROWTYPE;
  v_wallet_id UUID;
  v_txn_id UUID;
BEGIN
  SELECT * INTO v_req
  FROM public.wallet_topup_requests
  WHERE id = p_request_id
  FOR UPDATE;

  IF v_req.id IS NULL THEN
    RAISE EXCEPTION 'wallet_topup_confirm: request not found';
  END IF;

  IF v_req.status = 'confirmed' THEN
    RETURN p_request_id; -- idempotent
  END IF;

  IF v_req.status <> 'pending' THEN
    RAISE EXCEPTION 'wallet_topup_confirm: request status is %', v_req.status;
  END IF;

  SELECT id INTO v_wallet_id FROM public.wallets WHERE corporate_id = v_req.corporate_id FOR UPDATE;
  IF v_wallet_id IS NULL THEN
    RAISE EXCEPTION 'wallet_topup_confirm: wallet not found';
  END IF;

  UPDATE public.wallets
  SET balance = balance + v_req.amount,
      updated_at = NOW()
  WHERE id = v_wallet_id;

  INSERT INTO public.wallet_transactions (
    wallet_id, corporate_id, type, amount, reference_id, description
  ) VALUES (
    v_wallet_id, v_req.corporate_id, 'topup', v_req.amount,
    p_payment_ref, 'Top-up via ' || v_req.method
  ) RETURNING id INTO v_txn_id;

  UPDATE public.wallet_topup_requests
  SET status = 'confirmed',
      payment_ref = p_payment_ref,
      confirmed_at = NOW()
  WHERE id = p_request_id;

  RETURN v_txn_id;
END;
$$;

-- service_role only - webhook edge function uses service role key.
REVOKE EXECUTE ON FUNCTION public.wallet_topup_confirm(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.wallet_topup_confirm(UUID, TEXT) TO service_role;
