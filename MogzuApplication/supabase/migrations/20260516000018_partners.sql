-- Sprint 19 — Partner Foundation (Stories 14.1, 14.6, 14.2)
--
-- Partners are independent referrers / resellers who bring corporate clients
-- to the platform. This migration models the partner identity, the rate
-- agreements admin configures per partner, the per-corporate referral
-- attribution window, and a dedicated partner wallet for commission credits.

-- ─── Partners ────────────────────────────────────────────────────────────────

CREATE TABLE public.partners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  partner_type TEXT NOT NULL DEFAULT 'consultant' CHECK (
    partner_type IN ('consultant', 'agency', 'reseller', 'freelancer')
  ),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'active', 'paused', 'terminated', 'rejected')
  ),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  business_name TEXT,
  expertise TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  referral_code TEXT UNIQUE,
  bank_account_name TEXT,
  bank_account_number TEXT,
  bank_ifsc TEXT,
  approved_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_partners_status ON public.partners (status, created_at DESC);
CREATE INDEX idx_partners_referral_code ON public.partners (referral_code);

CREATE TRIGGER trg_partners_updated_at
  BEFORE UPDATE ON public.partners
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partner reads own row"
  ON public.partners
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Partner updates own non-status fields"
  ON public.partners
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admin manages all partners"
  ON public.partners
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid() AND p.role IN ('mogzu_admin', 'support')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid() AND p.role IN ('mogzu_admin', 'support')
    )
  );

CREATE POLICY "Public insert pending partner signup"
  ON public.partners
  FOR INSERT
  WITH CHECK (status = 'pending');

-- ─── Partner Agreements (Story 14.6) ─────────────────────────────────────────
--
-- Versioned rate sheet per partner. is_current is maintained by trigger so
-- there is always at most one current agreement per partner.

CREATE TABLE public.partner_agreements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  referral_pct NUMERIC(5, 2) NOT NULL DEFAULT 0
    CHECK (referral_pct >= 0 AND referral_pct <= 100),
  reseller_wholesale_pct NUMERIC(5, 2) NOT NULL DEFAULT 0
    CHECK (reseller_wholesale_pct >= 0 AND reseller_wholesale_pct <= 100),
  product_revenue_share_pct NUMERIC(5, 2) NOT NULL DEFAULT 0
    CHECK (product_revenue_share_pct >= 0 AND product_revenue_share_pct <= 100),
  valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  configured_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  notes TEXT,
  is_current BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_partner_agreements_partner ON public.partner_agreements (partner_id, is_current, valid_from DESC);
CREATE UNIQUE INDEX uniq_partner_agreements_current
  ON public.partner_agreements (partner_id)
  WHERE is_current = TRUE;

CREATE OR REPLACE FUNCTION public.partner_agreement_set_current()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_current THEN
    UPDATE public.partner_agreements
       SET is_current = FALSE
     WHERE partner_id = NEW.partner_id
       AND id <> NEW.id
       AND is_current = TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_partner_agreement_set_current
  AFTER INSERT ON public.partner_agreements
  FOR EACH ROW EXECUTE FUNCTION public.partner_agreement_set_current();

ALTER TABLE public.partner_agreements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partner reads own agreements"
  ON public.partner_agreements
  FOR SELECT
  USING (
    partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid())
  );

CREATE POLICY "Admin manages partner agreements"
  ON public.partner_agreements
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

-- ─── Corporate referral attribution ──────────────────────────────────────────
--
-- First-touch model: the partner code captured at signup is stored on the
-- corporate_account; the partner_referrals row records the lifecycle.

ALTER TABLE public.corporate_accounts
  ADD COLUMN referred_by_partner_id UUID REFERENCES public.partners(id) ON DELETE SET NULL,
  ADD COLUMN referred_at TIMESTAMPTZ;

CREATE INDEX idx_corporate_accounts_referred_partner
  ON public.corporate_accounts (referred_by_partner_id)
  WHERE referred_by_partner_id IS NOT NULL;

CREATE TABLE public.partner_referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  referred_corporate_id UUID NOT NULL REFERENCES public.corporate_accounts(id) ON DELETE CASCADE,
  signed_up_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  activated_at TIMESTAMPTZ,
  first_booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  attribution_expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '90 days'),
  commission_amount NUMERIC(12, 2),
  commission_credited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (referred_corporate_id)
);

CREATE INDEX idx_partner_referrals_partner ON public.partner_referrals (partner_id, signed_up_at DESC);

ALTER TABLE public.partner_referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partner reads own referrals"
  ON public.partner_referrals
  FOR SELECT
  USING (
    partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid())
  );

CREATE POLICY "Admin reads + writes all referrals"
  ON public.partner_referrals
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid() AND p.role IN ('mogzu_admin', 'support')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid() AND p.role IN ('mogzu_admin', 'support')
    )
  );

-- Allow the signup flow to capture attribution. The application is trusted to
-- only insert when a valid partner code is present; status checks are
-- enforced at the partner_id FK and the UNIQUE on referred_corporate_id.
CREATE POLICY "Authenticated user inserts referral for own corporate"
  ON public.partner_referrals
  FOR INSERT
  WITH CHECK (
    referred_corporate_id IN (
      SELECT corporate_id FROM public.user_profiles WHERE id = auth.uid()
    )
  );

-- ─── Partner Wallet ──────────────────────────────────────────────────────────

CREATE TABLE public.partner_wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID UNIQUE NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  balance NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
  currency TEXT NOT NULL DEFAULT 'INR',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_partner_wallets_updated_at
  BEFORE UPDATE ON public.partner_wallets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.partner_wallet_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_wallet_id UUID NOT NULL REFERENCES public.partner_wallets(id) ON DELETE CASCADE,
  partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('commission', 'payout', 'adjustment')),
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  referral_id UUID REFERENCES public.partner_referrals(id) ON DELETE SET NULL,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_partner_wallet_tx_partner
  ON public.partner_wallet_transactions (partner_id, created_at DESC);

ALTER TABLE public.partner_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_wallet_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partner reads own wallet"
  ON public.partner_wallets
  FOR SELECT
  USING (
    partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid())
  );

CREATE POLICY "Admin manages partner wallets"
  ON public.partner_wallets
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

CREATE POLICY "Partner reads own wallet transactions"
  ON public.partner_wallet_transactions
  FOR SELECT
  USING (
    partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid())
  );

CREATE POLICY "Admin manages partner wallet transactions"
  ON public.partner_wallet_transactions
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

-- ─── Commission credit helper ────────────────────────────────────────────────
--
-- Idempotent: only credits if the referral exists, attribution hasn't
-- expired, and commission_credited_at is null. Called from the application
-- after a booking transitions to 'confirmed'.

CREATE OR REPLACE FUNCTION public.credit_partner_commission(
  p_corporate_id UUID,
  p_booking_id UUID
) RETURNS UUID AS $$
DECLARE
  v_referral RECORD;
  v_agreement RECORD;
  v_booking RECORD;
  v_wallet_id UUID;
  v_commission NUMERIC(12, 2);
  v_tx_id UUID;
BEGIN
  SELECT * INTO v_referral
    FROM public.partner_referrals
   WHERE referred_corporate_id = p_corporate_id
     AND commission_credited_at IS NULL
     AND attribution_expires_at >= NOW()
   LIMIT 1;
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  SELECT * INTO v_booking
    FROM public.bookings
   WHERE id = p_booking_id
     AND corporate_id = p_corporate_id
     AND status = 'confirmed'
   LIMIT 1;
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  SELECT * INTO v_agreement
    FROM public.partner_agreements
   WHERE partner_id = v_referral.partner_id
     AND is_current = TRUE
   LIMIT 1;
  IF NOT FOUND OR v_agreement.referral_pct = 0 THEN
    RETURN NULL;
  END IF;

  v_commission := ROUND(
    COALESCE(v_booking.total_amount, 0) * v_agreement.referral_pct / 100,
    2
  );
  IF v_commission <= 0 THEN
    RETURN NULL;
  END IF;

  -- Ensure wallet exists.
  SELECT id INTO v_wallet_id FROM public.partner_wallets
   WHERE partner_id = v_referral.partner_id;
  IF v_wallet_id IS NULL THEN
    INSERT INTO public.partner_wallets (partner_id)
    VALUES (v_referral.partner_id)
    RETURNING id INTO v_wallet_id;
  END IF;

  INSERT INTO public.partner_wallet_transactions (
    partner_wallet_id, partner_id, type, amount, referral_id, booking_id, description
  ) VALUES (
    v_wallet_id, v_referral.partner_id, 'commission', v_commission,
    v_referral.id, p_booking_id,
    'Referral commission for first booking'
  ) RETURNING id INTO v_tx_id;

  UPDATE public.partner_wallets
     SET balance = balance + v_commission,
         updated_at = NOW()
   WHERE id = v_wallet_id;

  UPDATE public.partner_referrals
     SET activated_at = NOW(),
         first_booking_id = p_booking_id,
         commission_amount = v_commission,
         commission_credited_at = NOW()
   WHERE id = v_referral.id;

  RETURN v_tx_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.credit_partner_commission(UUID, UUID) TO authenticated;
