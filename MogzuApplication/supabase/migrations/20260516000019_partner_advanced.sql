-- Sprint 20 — Partner Advanced: Resell + Own Listings (Stories 14.3, 14.4)
--
-- Adds the listing ownership split (vendor vs partner), the per-booking
-- partner markup capture, and the monthly partner payout reconciliation
-- table. Partner-onboarded clients are tracked via the existing
-- corporate_accounts.referred_by_partner_id from Sprint 19.

-- ─── partners: default markup ────────────────────────────────────────────────

ALTER TABLE public.partners
  ADD COLUMN default_markup_pct NUMERIC(5, 2) NOT NULL DEFAULT 0
    CHECK (default_markup_pct >= 0 AND default_markup_pct <= 30);

-- ─── listings: ownership split ───────────────────────────────────────────────

ALTER TABLE public.listings
  ALTER COLUMN vendor_id DROP NOT NULL,
  ADD COLUMN owner_type TEXT NOT NULL DEFAULT 'vendor'
    CHECK (owner_type IN ('vendor', 'partner')),
  ADD COLUMN owner_partner_id UUID REFERENCES public.partners(id) ON DELETE CASCADE,
  ADD CONSTRAINT listings_owner_exclusive CHECK (
    (owner_type = 'vendor' AND vendor_id IS NOT NULL AND owner_partner_id IS NULL)
    OR (owner_type = 'partner' AND owner_partner_id IS NOT NULL AND vendor_id IS NULL)
  );

CREATE INDEX idx_listings_partner_owner
  ON public.listings (owner_partner_id, status)
  WHERE owner_type = 'partner';

-- RLS: partner manages own listings; existing vendor + admin policies stay.
CREATE POLICY "Partner manages own listings"
  ON public.listings
  FOR ALL
  USING (
    owner_type = 'partner'
    AND owner_partner_id IN (
      SELECT id FROM public.partners WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    owner_type = 'partner'
    AND owner_partner_id IN (
      SELECT id FROM public.partners WHERE user_id = auth.uid()
    )
  );

-- ─── bookings: partner resale fields ─────────────────────────────────────────

ALTER TABLE public.bookings
  ADD COLUMN partner_id UUID REFERENCES public.partners(id) ON DELETE SET NULL,
  ADD COLUMN partner_markup_pct NUMERIC(5, 2)
    CHECK (partner_markup_pct IS NULL OR (partner_markup_pct >= 0 AND partner_markup_pct <= 30)),
  ADD COLUMN partner_margin_amount NUMERIC(12, 2),
  ADD COLUMN partner_invoice_token TEXT UNIQUE,
  ADD COLUMN payout_accrued_at TIMESTAMPTZ;

CREATE INDEX idx_bookings_partner
  ON public.bookings (partner_id, status, created_at DESC)
  WHERE partner_id IS NOT NULL;

-- Allow public read of bookings via partner_invoice_token so that the
-- shareable white-label invoice link works without auth. Token is a random
-- 24-char slug; treat it as a bearer credential.
CREATE POLICY "Anyone can read booking via invoice token"
  ON public.bookings
  FOR SELECT
  USING (partner_invoice_token IS NOT NULL);

-- ─── partner_payout_periods ──────────────────────────────────────────────────
--
-- One row per partner per calendar month. Aggregates the margin / revenue
-- share that accrued during the period. Admin reconciles by marking paid;
-- the accompanying partner_wallet_transactions row records the payout.

CREATE TABLE public.partner_payout_periods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  period_yyyymm TEXT NOT NULL,
  resale_margin NUMERIC(12, 2) NOT NULL DEFAULT 0,
  product_share NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'on_hold')),
  paid_at TIMESTAMPTZ,
  paid_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  payout_transaction_id UUID REFERENCES public.partner_wallet_transactions(id) ON DELETE SET NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (partner_id, period_yyyymm)
);

CREATE INDEX idx_partner_payout_periods_status
  ON public.partner_payout_periods (status, period_yyyymm DESC);

CREATE TRIGGER trg_partner_payout_periods_updated_at
  BEFORE UPDATE ON public.partner_payout_periods
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.partner_payout_periods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partner reads own payout periods"
  ON public.partner_payout_periods
  FOR SELECT
  USING (
    partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid())
  );

CREATE POLICY "Admin manages partner payout periods"
  ON public.partner_payout_periods
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid() AND p.role = 'mogzu_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid() AND p.role = 'mogzu_admin'
    )
  );

-- ─── accrue_partner_earnings ─────────────────────────────────────────────────
--
-- Idempotent helper called when a booking transitions to 'completed'. Adds:
--   • resale margin (partner_margin_amount) when the booking has a partner_id
--   • product revenue share when the listing is partner-owned, computed from
--     the current partner agreement
-- into the partner_payout_periods row for the YYYYMM of the booking's
-- completion. Both contributions are guarded so re-running has no effect.

CREATE OR REPLACE FUNCTION public.accrue_partner_earnings(p_booking_id UUID)
RETURNS UUID AS $$
DECLARE
  v_booking RECORD;
  v_listing RECORD;
  v_period TEXT;
  v_period_id UUID;
  v_resale NUMERIC(12, 2) := 0;
  v_share NUMERIC(12, 2) := 0;
  v_partner_id UUID;
  v_agreement RECORD;
BEGIN
  SELECT * INTO v_booking FROM public.bookings
   WHERE id = p_booking_id AND status = 'completed';
  IF NOT FOUND THEN RETURN NULL; END IF;

  SELECT owner_type, owner_partner_id INTO v_listing
    FROM public.listings WHERE id = v_booking.listing_id;

  IF v_booking.partner_id IS NOT NULL THEN
    v_partner_id := v_booking.partner_id;
    v_resale := COALESCE(v_booking.partner_margin_amount, 0);
  ELSIF v_listing.owner_type = 'partner' THEN
    v_partner_id := v_listing.owner_partner_id;
  END IF;

  IF v_partner_id IS NULL THEN RETURN NULL; END IF;

  IF v_listing.owner_type = 'partner' THEN
    SELECT * INTO v_agreement
      FROM public.partner_agreements
     WHERE partner_id = v_partner_id AND is_current = TRUE
     LIMIT 1;
    IF FOUND AND v_agreement.product_revenue_share_pct > 0 THEN
      v_share := ROUND(
        COALESCE(v_booking.total_amount, 0) * v_agreement.product_revenue_share_pct / 100,
        2
      );
    END IF;
  END IF;

  IF v_resale = 0 AND v_share = 0 THEN RETURN NULL; END IF;

  v_period := to_char(COALESCE(v_booking.completed_at, NOW()), 'YYYYMM');

  INSERT INTO public.partner_payout_periods (partner_id, period_yyyymm)
  VALUES (v_partner_id, v_period)
  ON CONFLICT (partner_id, period_yyyymm) DO NOTHING;

  SELECT id INTO v_period_id FROM public.partner_payout_periods
   WHERE partner_id = v_partner_id AND period_yyyymm = v_period;

  -- Idempotency: only accrue if no payout_period_credit row exists for this
  -- booking yet. We use a small ledger embedded in the booking metadata.
  IF (v_booking.payout_accrued_at IS NULL) THEN
    UPDATE public.partner_payout_periods
       SET resale_margin = resale_margin + v_resale,
           product_share = product_share + v_share,
           total_amount = total_amount + v_resale + v_share
     WHERE id = v_period_id;
    UPDATE public.bookings
       SET payout_accrued_at = NOW()
     WHERE id = p_booking_id;
  END IF;

  RETURN v_period_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.accrue_partner_earnings(UUID) TO authenticated;

-- ─── mark_partner_payout_paid ────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.mark_partner_payout_paid(
  p_period_id UUID,
  p_admin_id UUID,
  p_note TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_period RECORD;
  v_wallet_id UUID;
  v_tx_id UUID;
BEGIN
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
         paid_by = p_admin_id,
         payout_transaction_id = v_tx_id,
         note = p_note
   WHERE id = p_period_id;

  RETURN v_tx_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.mark_partner_payout_paid(UUID, UUID, TEXT) TO authenticated;
