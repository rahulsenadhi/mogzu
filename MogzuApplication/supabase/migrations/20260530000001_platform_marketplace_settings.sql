-- Story 9.1 — platform marketplace module toggles persisted to Supabase
-- (was localStorage-only). Singleton row; anon-readable (corporate browse gating
-- runs for anon/loading users); only mogzu_admin writes.

CREATE TABLE IF NOT EXISTS public.platform_marketplace_settings (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.platform_marketplace_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone reads platform marketplace settings" ON public.platform_marketplace_settings;
CREATE POLICY "Anyone reads platform marketplace settings"
  ON public.platform_marketplace_settings FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Admin manages platform marketplace settings" ON public.platform_marketplace_settings;
CREATE POLICY "Admin manages platform marketplace settings"
  ON public.platform_marketplace_settings FOR ALL
  USING (private.is_mogzu_admin())
  WITH CHECK (private.is_mogzu_admin());

INSERT INTO public.platform_marketplace_settings (id, settings)
  VALUES (1, '{}'::jsonb)
  ON CONFLICT (id) DO NOTHING;
