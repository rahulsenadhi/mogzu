-- Phase 1 P2 — final security hardening pass.
--
-- 1. Sprint 20 shipped a public RLS policy on bookings keyed only on
--    `partner_invoice_token IS NOT NULL`, which exposed every partner-managed
--    booking to anonymous readers (Postgres RLS evaluates the policy without
--    seeing the client-supplied filter, so the predicate is effectively a
--    table-wide allow). Replace it with a SECURITY DEFINER lookup function
--    that returns a single row only when the supplied token matches.
--
-- 2. mark_partner_payout_paid() was trusting the caller-supplied p_admin_id
--    without verifying the caller actually has the mogzu_admin role.
--    Re-derive the admin id from auth.uid() and reject non-admins.

-- ─── 1. Lock down the partner invoice public read ────────────────────────────

DROP POLICY IF EXISTS "Anyone can read booking via invoice token" ON public.bookings;

CREATE OR REPLACE FUNCTION public.get_booking_by_invoice_token(p_token TEXT)
RETURNS TABLE (
  id UUID,
  corporate_id UUID,
  listing_id UUID,
  module TEXT,
  status TEXT,
  group_size INTEGER,
  total_amount NUMERIC,
  base_amount NUMERIC,
  add_ons_amount NUMERIC,
  platform_fee NUMERIC,
  partner_id UUID,
  partner_markup_pct NUMERIC,
  partner_margin_amount NUMERIC,
  partner_invoice_token TEXT,
  created_at TIMESTAMPTZ,
  listing_title TEXT,
  listing_city TEXT,
  corporate_name TEXT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    b.id, b.corporate_id, b.listing_id, b.module, b.status, b.group_size,
    b.total_amount, b.base_amount, b.add_ons_amount, b.platform_fee,
    b.partner_id, b.partner_markup_pct, b.partner_margin_amount,
    b.partner_invoice_token, b.created_at,
    l.title AS listing_title,
    l.location_city AS listing_city,
    c.name AS corporate_name
  FROM public.bookings b
  LEFT JOIN public.listings l ON l.id = b.listing_id
  LEFT JOIN public.corporate_accounts c ON c.id = b.corporate_id
  WHERE b.partner_invoice_token IS NOT NULL
    AND b.partner_invoice_token = p_token
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_booking_by_invoice_token(TEXT) TO anon, authenticated;

-- ─── 2. Require mogzu_admin for payout marking ───────────────────────────────

CREATE OR REPLACE FUNCTION public.mark_partner_payout_paid(
  p_period_id UUID,
  p_admin_id UUID,
  p_note TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_period RECORD;
  v_wallet_id UUID;
  v_tx_id UUID;
  v_caller UUID := auth.uid();
BEGIN
  -- Only callable by the platform admin. p_admin_id is kept in the signature
  -- for backward compatibility but it is no longer trusted — the recorded
  -- paid_by always comes from the authenticated session.
  IF v_caller IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.user_profiles
     WHERE id = v_caller AND role = 'mogzu_admin'
  ) THEN
    RAISE EXCEPTION 'mark_partner_payout_paid: caller is not a mogzu admin';
  END IF;

  SELECT * INTO v_period FROM public.partner_payout_periods
   WHERE id = p_period_id AND status = 'pending';
  IF NOT FOUND THEN RETURN NULL; END IF;
  IF v_period.total_amount <= 0 THEN RETURN NULL; END IF;

  SELECT id INTO v_wallet_id FROM public.partner_wallets
   WHERE partner_id = v_period.partner_id;
  IF v_wallet_id IS NULL THEN
    INSERT INTO public.partner_wallets (partner_id)
    VALUES (v_period.partner_id) RETURNING id INTO v_wallet_id;
  END IF;

  INSERT INTO public.partner_wallet_transactions (
    partner_wallet_id, partner_id, type, amount, description
  ) VALUES (
    v_wallet_id, v_period.partner_id, 'payout', v_period.total_amount,
    'Monthly payout ' || v_period.period_yyyymm || COALESCE(' — ' || p_note, '')
  ) RETURNING id INTO v_tx_id;

  UPDATE public.partner_payout_periods
     SET status = 'paid',
         paid_at = NOW(),
         paid_by = v_caller,
         payout_transaction_id = v_tx_id,
         note = p_note
   WHERE id = p_period_id;

  RETURN v_tx_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
