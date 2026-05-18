-- Phase 5 — International + Network Effects + Compliance.
--
-- Schema-only landing for P5.1 (region pinning), P5.2 (vendor self-
-- serve onboarding), P5.4 (white-label partners), P5.5 (autonomous AI
-- agent audit trail), P5.6 (SOC2 access reviews). Runtime integrations
-- (Persona KYC, region-aware DB routing, autonomous-agent execution)
-- land in P5 sprints; the DB shape lands here so service modules can
-- evolve independently.

-- ─── P5.1 Region pinning ───────────────────────────────────────────────────

ALTER TABLE public.corporate_accounts
  ADD COLUMN IF NOT EXISTS region TEXT NOT NULL DEFAULT 'in'
    CHECK (region IN ('in', 'sg', 'ae', 'us', 'uk', 'eu'));

CREATE INDEX IF NOT EXISTS idx_corporate_accounts_region
  ON public.corporate_accounts (region);

ALTER TABLE public.vendors
  ADD COLUMN IF NOT EXISTS region TEXT NOT NULL DEFAULT 'in'
    CHECK (region IN ('in', 'sg', 'ae', 'us', 'uk', 'eu'));

-- ─── P5.2 Vendor self-serve onboarding ─────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.vendor_onboarding_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  applicant_email TEXT NOT NULL,
  applicant_name TEXT NOT NULL,
  business_name TEXT NOT NULL,
  region TEXT NOT NULL CHECK (region IN ('in', 'sg', 'ae', 'us', 'uk', 'eu')),
  kyc_provider TEXT CHECK (kyc_provider IN ('persona', 'onfido', 'manual')),
  kyc_session_id TEXT,
  kyc_status TEXT NOT NULL DEFAULT 'pending' CHECK (
    kyc_status IN ('pending', 'approved', 'review', 'rejected')
  ),
  payout_method JSONB,
  catalogue_draft JSONB NOT NULL DEFAULT '[]'::JSONB,
  sla_signed_at TIMESTAMPTZ,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (
    status IN ('submitted', 'kyc_in_review', 'awaiting_admin', 'approved', 'rejected')
  ),
  admin_notes TEXT,
  reviewed_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vendor_onboarding_status
  ON public.vendor_onboarding_applications (status, created_at);

CREATE TRIGGER trg_vendor_onboarding_applications_updated_at
  BEFORE UPDATE ON public.vendor_onboarding_applications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.vendor_onboarding_applications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin manages onboarding" ON public.vendor_onboarding_applications;
CREATE POLICY "Admin manages onboarding" ON public.vendor_onboarding_applications
  FOR ALL USING (private.is_mogzu_admin()) WITH CHECK (private.is_mogzu_admin());

-- Applicants don't have accounts yet; submission RPC writes a row
-- and returns the application ID so they can come back to check status.
CREATE OR REPLACE FUNCTION public.submit_vendor_application(p_payload JSONB)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO public.vendor_onboarding_applications (
    applicant_email, applicant_name, business_name, region,
    kyc_provider, payout_method, catalogue_draft
  ) VALUES (
    lower(p_payload->>'applicant_email'),
    p_payload->>'applicant_name',
    p_payload->>'business_name',
    COALESCE(p_payload->>'region', 'in'),
    COALESCE(p_payload->>'kyc_provider', 'persona'),
    p_payload->'payout_method',
    COALESCE(p_payload->'catalogue_draft', '[]'::JSONB)
  )
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;
GRANT EXECUTE ON FUNCTION public.submit_vendor_application(JSONB) TO anon, authenticated;

-- ─── P5.4 White-label partners ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.white_label_partners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  business_name TEXT NOT NULL,
  primary_color TEXT NOT NULL DEFAULT '#2563eb',
  secondary_color TEXT NOT NULL DEFAULT '#0e1e3f',
  logo_url TEXT,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  commercial_model TEXT NOT NULL DEFAULT 'revenue_share'
    CHECK (commercial_model IN ('revenue_share', 'flat_infra_fee', 'per_corporate_seat')),
  revenue_share_pct NUMERIC(5, 2) CHECK (revenue_share_pct IS NULL OR (revenue_share_pct >= 0 AND revenue_share_pct <= 100)),
  flat_fee_monthly NUMERIC(12, 2),
  per_seat_fee NUMERIC(12, 2),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_white_label_partners_updated_at
  BEFORE UPDATE ON public.white_label_partners
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.corporate_accounts
  ADD COLUMN IF NOT EXISTS white_label_partner_id UUID REFERENCES public.white_label_partners(id) ON DELETE SET NULL;
ALTER TABLE public.vendors
  ADD COLUMN IF NOT EXISTS white_label_partner_id UUID REFERENCES public.white_label_partners(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_corporate_accounts_wl
  ON public.corporate_accounts (white_label_partner_id);

ALTER TABLE public.white_label_partners ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin manages white_label_partners" ON public.white_label_partners;
CREATE POLICY "Admin manages white_label_partners" ON public.white_label_partners
  FOR ALL USING (private.is_mogzu_admin()) WITH CHECK (private.is_mogzu_admin());

DROP POLICY IF EXISTS "Anyone reads active white_label_partners" ON public.white_label_partners;
CREATE POLICY "Anyone reads active white_label_partners" ON public.white_label_partners
  FOR SELECT USING (is_active = TRUE);

-- ─── P5.5 Autonomous AI agent — audit trail on bookings ────────────────────

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS created_by_agent_id UUID REFERENCES public.ai_agents(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS agent_action_policy JSONB;

CREATE INDEX IF NOT EXISTS idx_bookings_by_agent
  ON public.bookings (created_by_agent_id, created_at DESC)
  WHERE created_by_agent_id IS NOT NULL;

-- Per-corporate autonomy preferences.
CREATE TABLE IF NOT EXISTS public.ai_autonomy_settings (
  corporate_id UUID PRIMARY KEY REFERENCES public.corporate_accounts(id) ON DELETE CASCADE,
  is_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  spend_cap_inr NUMERIC(12, 2) NOT NULL DEFAULT 50000,
  blocked_categories TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  updated_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.ai_autonomy_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin manages autonomy" ON public.ai_autonomy_settings;
CREATE POLICY "Admin manages autonomy" ON public.ai_autonomy_settings
  FOR ALL USING (private.is_mogzu_admin()) WITH CHECK (private.is_mogzu_admin());

DROP POLICY IF EXISTS "Corporate L3 manages own autonomy" ON public.ai_autonomy_settings;
CREATE POLICY "Corporate L3 manages own autonomy" ON public.ai_autonomy_settings
  FOR ALL
  USING (
    corporate_id IN (
      SELECT p.corporate_id FROM public.user_profiles p
      WHERE p.id = auth.uid() AND p.role = 'l3_admin'
    )
  )
  WITH CHECK (
    corporate_id IN (
      SELECT p.corporate_id FROM public.user_profiles p
      WHERE p.id = auth.uid() AND p.role = 'l3_admin'
    )
  );

-- ─── P5.6 SOC2 access reviews + security questionnaires ────────────────────

CREATE TABLE IF NOT EXISTS public.access_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scheduled_for DATE NOT NULL,
  reviewed_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  snapshot JSONB NOT NULL DEFAULT '[]'::JSONB,
  decisions JSONB NOT NULL DEFAULT '{}'::JSONB,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'in_progress', 'completed', 'skipped')
  ),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_access_reviews_due
  ON public.access_reviews (status, scheduled_for);

CREATE TRIGGER trg_access_reviews_updated_at
  BEFORE UPDATE ON public.access_reviews
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.access_reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin manages access_reviews" ON public.access_reviews;
CREATE POLICY "Admin manages access_reviews" ON public.access_reviews
  FOR ALL USING (private.is_mogzu_admin()) WITH CHECK (private.is_mogzu_admin());

CREATE TABLE IF NOT EXISTS public.security_questionnaires (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_email TEXT NOT NULL,
  requester_company TEXT,
  source TEXT,
  questionnaire_payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'received' CHECK (
    status IN ('received', 'auto_filled', 'admin_review', 'sent', 'closed')
  ),
  filled_payload JSONB,
  filled_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  filled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_security_questionnaires_updated_at
  BEFORE UPDATE ON public.security_questionnaires
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.security_questionnaires ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin manages questionnaires" ON public.security_questionnaires;
CREATE POLICY "Admin manages questionnaires" ON public.security_questionnaires
  FOR ALL USING (private.is_mogzu_admin()) WITH CHECK (private.is_mogzu_admin());

-- Snapshot helper for access reviews: dumps active sub-users + their
-- permissions at the moment of call so the review is reproducible.
CREATE OR REPLACE FUNCTION public.snapshot_access_review(p_review_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_snapshot JSONB;
BEGIN
  IF NOT private.is_mogzu_admin() THEN
    RAISE EXCEPTION 'snapshot_access_review: admin required';
  END IF;

  SELECT jsonb_agg(jsonb_build_object(
    'user_id', p.id,
    'full_name', p.full_name,
    'email', p.email,
    'role', p.role,
    'available_roles', p.available_roles,
    'status', p.status,
    'permissions', (
      SELECT jsonb_agg(jsonb_build_object('resource', up.resource, 'action', up.action))
      FROM public.user_permissions up WHERE up.user_id = p.id
    )
  ))
  INTO v_snapshot
  FROM public.user_profiles p
  WHERE p.status = 'active'
    AND p.role IN ('mogzu_admin', 'support', 'sales_agent', 'account_manager', 'l3_admin');

  UPDATE public.access_reviews
  SET snapshot = COALESCE(v_snapshot, '[]'::JSONB),
      status = 'in_progress'
  WHERE id = p_review_id;
END;
$$;
GRANT EXECUTE ON FUNCTION public.snapshot_access_review(UUID) TO authenticated;
