-- Phase 3 Feature 6 (Sprint 25) — audit retention + 7-year archive.
--
-- SOC2 / compliance asks us to keep audit trails for seven years but
-- the live tables (user_activity_events + role_switch_events) grow
-- fast. Strategy:
--   1. Archive table audit_events_archive holds the long tail in a
--      single canonical shape — same columns as the unified view.
--   2. archive_old_audit_events moves rows older than the cutoff out
--      of the live tables. Default cutoff = 90 days.
--   3. purge_archive_beyond_retention deletes archive rows older than
--      seven years (configurable).
--   4. audit_events_unified UNIONs the archive so the admin export
--      remains a single window over the full retention horizon.
--
-- Both housekeeping RPCs are service_role-only; n8n schedules them
-- daily (n8n/workflows/archive-audit-events.json).

CREATE TABLE IF NOT EXISTS public.audit_events_archive (
  id UUID PRIMARY KEY,
  actor_id UUID,
  action TEXT NOT NULL,
  resource_kind TEXT,
  resource_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  ip_address TEXT,
  user_agent TEXT,
  at TIMESTAMPTZ NOT NULL,
  source TEXT NOT NULL,
  archived_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_archive_at
  ON public.audit_events_archive (at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_archive_actor
  ON public.audit_events_archive (actor_id, at DESC);

ALTER TABLE public.audit_events_archive ENABLE ROW LEVEL SECURITY;

-- Admin / support reads (matches export_audit_events authorisation).
DROP POLICY IF EXISTS "Admin reads audit archive" ON public.audit_events_archive;
CREATE POLICY "Admin reads audit archive" ON public.audit_events_archive
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('mogzu_admin', 'support')
    )
  );

-- Extend the unified view to UNION the archive so a single query
-- spans the full retention window. CREATE OR REPLACE preserves
-- downstream consumers.
CREATE OR REPLACE VIEW public.audit_events_unified AS
  SELECT
    e.id,
    e.actor_id,
    e.event_type AS action,
    e.target_table AS resource_kind,
    e.target_id AS resource_id,
    e.metadata,
    NULL::TEXT AS ip_address,
    NULL::TEXT AS user_agent,
    e.created_at AS at,
    'user_activity'::TEXT AS source
  FROM public.user_activity_events e
  UNION ALL
  SELECT
    r.id,
    r.user_id AS actor_id,
    'role_switch'::TEXT AS action,
    'user_profiles'::TEXT AS resource_kind,
    r.user_id AS resource_id,
    jsonb_build_object('from_role', r.from_role, 'to_role', r.to_role) AS metadata,
    r.ip_address,
    r.user_agent,
    r.switched_at AS at,
    'role_switch'::TEXT AS source
  FROM public.role_switch_events r
  UNION ALL
  SELECT
    a.id,
    a.actor_id,
    a.action,
    a.resource_kind,
    a.resource_id,
    a.metadata,
    a.ip_address,
    a.user_agent,
    a.at,
    a.source
  FROM public.audit_events_archive a;

GRANT SELECT ON public.audit_events_unified TO authenticated;

CREATE OR REPLACE FUNCTION public.archive_old_audit_events(p_cutoff_days INT DEFAULT 90)
RETURNS TABLE (activity_archived INT, role_switch_archived INT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cutoff TIMESTAMPTZ := NOW() - make_interval(days => p_cutoff_days);
  v_activity INT := 0;
  v_role INT := 0;
BEGIN
  IF NOT (auth.role() = 'service_role' OR private.is_mogzu_admin()) THEN
    RAISE EXCEPTION 'archive_old_audit_events: service_role or admin required';
  END IF;

  WITH moved AS (
    DELETE FROM public.user_activity_events e
    WHERE e.created_at < v_cutoff
    RETURNING e.id, e.actor_id, e.event_type, e.target_table, e.target_id,
              e.metadata, e.created_at
  )
  INSERT INTO public.audit_events_archive
    (id, actor_id, action, resource_kind, resource_id, metadata, at, source)
  SELECT id, actor_id, event_type, target_table, target_id, metadata,
         created_at, 'user_activity'
    FROM moved
  ON CONFLICT (id) DO NOTHING;
  GET DIAGNOSTICS v_activity = ROW_COUNT;

  WITH moved AS (
    DELETE FROM public.role_switch_events r
    WHERE r.switched_at < v_cutoff
    RETURNING r.id, r.user_id, r.from_role, r.to_role, r.switched_at,
              r.user_agent, r.ip_address
  )
  INSERT INTO public.audit_events_archive
    (id, actor_id, action, resource_kind, resource_id, metadata,
     ip_address, user_agent, at, source)
  SELECT id, user_id, 'role_switch', 'user_profiles', user_id,
         jsonb_build_object('from_role', from_role, 'to_role', to_role),
         ip_address, user_agent, switched_at, 'role_switch'
    FROM moved
  ON CONFLICT (id) DO NOTHING;
  GET DIAGNOSTICS v_role = ROW_COUNT;

  RETURN QUERY SELECT v_activity, v_role;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.archive_old_audit_events(INT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.archive_old_audit_events(INT) TO service_role;

CREATE OR REPLACE FUNCTION public.purge_archive_beyond_retention(p_retention_years INT DEFAULT 7)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INT := 0;
  v_cutoff TIMESTAMPTZ := NOW() - make_interval(years => p_retention_years);
BEGIN
  IF NOT (auth.role() = 'service_role' OR private.is_mogzu_admin()) THEN
    RAISE EXCEPTION 'purge_archive_beyond_retention: service_role or admin required';
  END IF;

  DELETE FROM public.audit_events_archive WHERE at < v_cutoff;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.purge_archive_beyond_retention(INT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.purge_archive_beyond_retention(INT) TO service_role;
