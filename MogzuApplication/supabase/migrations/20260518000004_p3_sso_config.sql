-- Phase 3 Feature 5 (part 1) — SSO / SAML configuration.
--
-- One row per corporate holds the IdP metadata; the runtime SAML flow
-- (domain routing + JIT provisioning) lands in part 2. Storing the
-- config separately keeps it auditable and lets admin test connection
-- before flipping enforce_sso on.

CREATE TABLE IF NOT EXISTS public.sso_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  corporate_id UUID NOT NULL UNIQUE REFERENCES public.corporate_accounts(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (
    provider IN ('okta', 'azure_ad', 'google_workspace', 'onelogin', 'generic_saml')
  ),
  display_name TEXT,
  entity_id TEXT NOT NULL,
  sso_url TEXT NOT NULL,
  acs_url TEXT,
  certificate TEXT NOT NULL,
  email_domain TEXT NOT NULL,
  email_attribute_name TEXT NOT NULL DEFAULT 'email',
  enforce_sso BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  last_tested_at TIMESTAMPTZ,
  last_tested_status TEXT CHECK (last_tested_status IN ('ok', 'failed')),
  last_tested_error TEXT,
  created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sso_config_domain
  ON public.sso_config (email_domain)
  WHERE is_active = TRUE;

CREATE TRIGGER trg_sso_config_updated_at
  BEFORE UPDATE ON public.sso_config
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.sso_config ENABLE ROW LEVEL SECURITY;

-- Admin reads + manages everything.
DROP POLICY IF EXISTS "Admin manages sso_config" ON public.sso_config;
CREATE POLICY "Admin manages sso_config" ON public.sso_config
  FOR ALL
  USING (private.is_mogzu_admin())
  WITH CHECK (private.is_mogzu_admin());

-- L3 corporate admins read their own row (cannot edit — IdP changes
-- go through Mogzu support to avoid lock-outs).
DROP POLICY IF EXISTS "Corporate L3 reads own sso_config" ON public.sso_config;
CREATE POLICY "Corporate L3 reads own sso_config" ON public.sso_config
  FOR SELECT
  USING (
    corporate_id IN (
      SELECT p.corporate_id FROM public.user_profiles p
      WHERE p.id = auth.uid() AND p.role = 'l3_admin'
    )
  );

-- Helper: which corporate (if any) owns this email domain. Used by the
-- runtime SAML flow in part 2; exposed now so the admin "Test
-- connection" button can preview routing.
CREATE OR REPLACE FUNCTION public.resolve_sso_for_email(p_email TEXT)
RETURNS TABLE (
  config_id UUID,
  corporate_id UUID,
  provider TEXT,
  sso_url TEXT,
  enforce_sso BOOLEAN
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, corporate_id, provider, sso_url, enforce_sso
    FROM public.sso_config
   WHERE is_active = TRUE
     AND email_domain = lower(split_part(p_email, '@', 2))
   LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.resolve_sso_for_email(TEXT) TO anon, authenticated;
