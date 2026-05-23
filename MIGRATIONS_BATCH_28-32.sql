-- ============================================================================
-- Mogzu — Pending migrations bundle (plan Batches 4, 7, 8, 9, 12, 14)
-- Generated 2026-05-23 for one-shot paste into Supabase SQL Editor.
--
-- Apply order matters (relies on prior schema). Each individual migration
-- is idempotent: re-running the bundle is safe. Does NOT update the CLI
-- migration history table — track separately if you want CLI alignment.
--
--   1. 20260522000002_vendor_kyc.sql            (Batch 4 slice 4)
--   2. 20260522000003_wallet_atomic_rpcs.sql    (Batch 7 slice 1)
--   3. 20260522000004_refund_failure_autoticket (Batch 7 slice 4)
--   4. 20260522000005_category_disable_cascade  (Batch 8)
--   5. 20260522000006_rbac_scoped_booking_access(Batch 9)
--   6. 20260522000007_corporate_region          (Batch 12)
--   7. 20260522000008_push_subscriptions        (Batch 14)
-- ============================================================================


-- ─── 20260522000002_vendor_kyc.sql ─────────────────────────────────────────────
-- Plan Batch 4 slice 4 — vendor KYC stub.
--
-- Pre-Persona/Onfido placeholder: vendor uploads a single identity/business
-- document to the documents bucket, status starts at 'submitted', admin
-- flips it through review/approved/rejected from the application queue.
-- vendors.kyc_status='approved' is the new gate the admin approve action
-- enforces before flipping vendor.status='active'.

ALTER TABLE public.vendors
  ADD COLUMN IF NOT EXISTS kyc_doc_url TEXT,
  ADD COLUMN IF NOT EXISTS kyc_status TEXT NOT NULL DEFAULT 'not_started'
    CHECK (kyc_status IN ('not_started', 'submitted', 'review', 'approved', 'rejected'));

CREATE INDEX IF NOT EXISTS idx_vendors_kyc_status
  ON public.vendors (kyc_status)
  WHERE kyc_status <> 'not_started';


-- ─── 20260522000003_wallet_atomic_rpcs.sql ─────────────────────────────────────
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
    RETURN p_request_id;
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

REVOKE EXECUTE ON FUNCTION public.wallet_topup_confirm(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.wallet_topup_confirm(UUID, TEXT) TO service_role;


-- ─── 20260522000004_refund_failure_autoticket.sql ─────────────────────────────
-- Plan Batch 7 slice 4 — refund failure auto-ticket.

CREATE OR REPLACE FUNCTION public.refund_failed_open_ticket()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_existing UUID;
BEGIN
  IF NEW.status <> 'failed' THEN RETURN NEW; END IF;
  IF OLD.status = 'failed' THEN RETURN NEW; END IF;

  SELECT id INTO v_existing
  FROM public.support_tickets
  WHERE context_url = '/refunds/' || NEW.id::text
  LIMIT 1;
  IF v_existing IS NOT NULL THEN RETURN NEW; END IF;

  INSERT INTO public.support_tickets (
    audience,
    submitter_id,
    corporate_id,
    category,
    subject,
    body,
    status,
    priority,
    sla_hours,
    context_url,
    context_role,
    context_last_action,
    related_booking_id
  ) VALUES (
    'corporate',
    NEW.initiated_by,
    NEW.corporate_id,
    'payments',
    'Refund failed: ₹' || NEW.amount::text,
    'A refund of ₹' || NEW.amount::text
      || ' for booking ' || COALESCE(NEW.booking_id::text, 'unknown')
      || ' could not be processed via ' || COALESCE(NEW.method, 'unknown')
      || E'.\n\nReason: ' || COALESCE(NEW.failure_reason, '(not provided)')
      || E'\n\nAuto-opened by the payments pipeline. Please confirm the failure '
      || 'with finance and either retry the refund or initiate a manual transfer.',
    'open',
    'high',
    4,
    '/refunds/' || NEW.id::text,
    'system',
    'refund_failed',
    NEW.booking_id
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_refund_failed_autoticket ON public.refunds;
CREATE TRIGGER trg_refund_failed_autoticket
  AFTER UPDATE OF status ON public.refunds
  FOR EACH ROW
  WHEN (NEW.status = 'failed' AND (OLD.status IS DISTINCT FROM 'failed'))
  EXECUTE FUNCTION public.refund_failed_open_ticket();


-- ─── 20260522000005_category_disable_cascade.sql ──────────────────────────────
-- Plan Batch 8 — admin category disable cascades to consumer catalogue.

ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS hidden_by_category BOOLEAN NOT NULL DEFAULT FALSE;

CREATE OR REPLACE FUNCTION public.cascade_category_visibility()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.is_active = TRUE AND NEW.is_active = FALSE THEN
    UPDATE public.listings
    SET public_visible = FALSE,
        hidden_by_category = TRUE,
        updated_at = NOW()
    WHERE category_id = NEW.id
      AND public_visible = TRUE;
    RETURN NEW;
  END IF;

  IF OLD.is_active = FALSE AND NEW.is_active = TRUE THEN
    UPDATE public.listings
    SET public_visible = TRUE,
        hidden_by_category = FALSE,
        updated_at = NOW()
    WHERE category_id = NEW.id
      AND hidden_by_category = TRUE;
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_cascade_category_visibility ON public.listing_categories;
CREATE TRIGGER trg_cascade_category_visibility
  AFTER UPDATE OF is_active ON public.listing_categories
  FOR EACH ROW
  WHEN (OLD.is_active IS DISTINCT FROM NEW.is_active)
  EXECUTE FUNCTION public.cascade_category_visibility();

CREATE INDEX IF NOT EXISTS idx_listings_hidden_by_category
  ON public.listings (category_id)
  WHERE hidden_by_category = TRUE;


-- ─── 20260522000006_rbac_scoped_booking_access.sql ────────────────────────────
-- Plan Batch 9 — scoped RBAC for field_agent + account_manager + partner.

DROP POLICY IF EXISTS "bookings_select_field_agent" ON public.bookings;
CREATE POLICY "bookings_select_field_agent" ON public.bookings
  FOR SELECT
  USING (
    private.user_role() = 'field_agent'
    AND status IN ('confirmed', 'pending_vendor', 'in_progress')
  );

DROP POLICY IF EXISTS "bookings_select_account_manager" ON public.bookings;
CREATE POLICY "bookings_select_account_manager" ON public.bookings
  FOR SELECT
  USING (
    private.user_role() = 'account_manager'
    AND corporate_id IN (
      SELECT id FROM public.corporate_accounts
      WHERE account_manager_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "bookings_select_partner" ON public.bookings;
CREATE POLICY "bookings_select_partner" ON public.bookings
  FOR SELECT
  USING (
    private.user_role() = 'partner'
    AND partner_id IN (
      SELECT id FROM public.partners WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "booking_add_ons_select_scoped_roles" ON public.booking_add_ons;
CREATE POLICY "booking_add_ons_select_scoped_roles" ON public.booking_add_ons
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = booking_id
        AND (
          (private.user_role() = 'field_agent' AND b.status IN ('confirmed','pending_vendor','in_progress'))
          OR (private.user_role() = 'account_manager' AND b.corporate_id IN (
                SELECT id FROM public.corporate_accounts WHERE account_manager_id = auth.uid()
              ))
          OR (private.user_role() = 'partner' AND b.partner_id IN (
                SELECT id FROM public.partners WHERE user_id = auth.uid()
              ))
        )
    )
  );

CREATE INDEX IF NOT EXISTS idx_corporate_accounts_am
  ON public.corporate_accounts (account_manager_id)
  WHERE account_manager_id IS NOT NULL;


-- ─── 20260522000007_corporate_region.sql ──────────────────────────────────────
-- BATCH 12 — corporate region + default currency.

ALTER TABLE public.corporate_accounts
  ADD COLUMN IF NOT EXISTS region TEXT CHECK (length(region) = 2),
  ADD COLUMN IF NOT EXISTS default_currency TEXT REFERENCES public.currencies(code);

CREATE INDEX IF NOT EXISTS idx_corporate_accounts_region
  ON public.corporate_accounts (region)
  WHERE region IS NOT NULL;

INSERT INTO public.currencies (code, symbol, decimal_places, fx_rate, is_active, display_order) VALUES
  ('SAR', 'ر.س', 2, 22.20000000, TRUE, 7)
ON CONFLICT (code) DO NOTHING;


-- ─── 20260522000008_push_subscriptions.sql ────────────────────────────────────
-- BATCH 14 — push notification opt-in storage.

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS push_subscription JSONB,
  ADD COLUMN IF NOT EXISTS push_opt_in_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS push_declined_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_user_profiles_push_subscribed
  ON public.user_profiles ((push_subscription IS NOT NULL))
  WHERE push_subscription IS NOT NULL;


-- ============================================================================
-- End of bundle. Verify with:
--   SELECT count(*) FROM public.wallet_topup_requests;
--   SELECT column_name FROM information_schema.columns
--     WHERE table_name='vendors' AND column_name LIKE 'kyc%';
--   SELECT column_name FROM information_schema.columns
--     WHERE table_name='corporate_accounts' AND column_name IN ('region','default_currency');
--   SELECT column_name FROM information_schema.columns
--     WHERE table_name='user_profiles' AND column_name LIKE 'push%';
-- ============================================================================
