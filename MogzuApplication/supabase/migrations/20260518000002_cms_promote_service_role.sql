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
