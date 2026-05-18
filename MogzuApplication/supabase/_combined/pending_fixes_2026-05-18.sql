-- Pending fixes — paste into Supabase Dashboard SQL editor
-- Idempotent; safe to re-run.

-- ══ 20260518000001_fix_commissions_anon_leak.sql ══
-- 2026-05-18 — RLS smoke test caught the global commission row leaking
-- to anonymous clients. The original `commissions_select` policy
-- exposed any row with `scope = 'global'` to everyone (including anon)
-- because the OR branch had no auth predicate. Vendors should see
-- their own rate plus the global rate, but only when authenticated.

DROP POLICY IF EXISTS "commissions_select" ON public.commissions;

CREATE POLICY "commissions_select" ON public.commissions
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND (
      private.is_mogzu_admin()
      OR (vendor_id = private.user_vendor_id() AND scope = 'vendor')
      OR scope = 'global'
    )
  );

-- ══ 20260518000002_cms_promote_service_role.sql ══
-- 2026-05-18 — allow service_role (from N8N cron) to call
-- promote_scheduled_cms_blocks. The original RPC gated on
-- private.is_mogzu_admin() which checks auth.uid() — that's NULL for
-- service role calls, so N8N could never invoke it. Add a service-role
-- escape hatch so the scheduled-publish backfill can run automatically.

CREATE OR REPLACE FUNCTION public.promote_scheduled_cms_blocks()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  IF NOT (auth.role() = 'service_role' OR private.is_mogzu_admin()) THEN
    RAISE EXCEPTION 'promote_scheduled_cms_blocks: service_role or admin required';
  END IF;

  WITH promoted AS (
    UPDATE public.cms_blocks
    SET status = 'published',
        published_at = NOW()
    WHERE status = 'scheduled'
      AND scheduled_publish_at <= NOW()
    RETURNING 1
  )
  SELECT COUNT(*) INTO v_count FROM promoted;

  RETURN v_count;
END;
$$;
