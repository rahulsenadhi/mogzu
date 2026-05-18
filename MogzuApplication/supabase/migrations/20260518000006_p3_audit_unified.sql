-- Phase 3 Feature 6 — Unified audit log + export.
--
-- A single VIEW joining user_activity_events + role_switch_events
-- (Phase 1) into a canonical (actor, action, resource_kind, resource_id,
-- at, ip, user_agent) shape so compliance reports + SOC2 evidence
-- pulls don't have to know about each underlying table. Future audit
-- sources (admin RPC calls, support tickets, etc.) can be UNION'd in
-- via this same view without breaking downstream consumers.

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
  FROM public.role_switch_events r;

GRANT SELECT ON public.audit_events_unified TO authenticated;

-- Server-side export — admin only. Returns a JSON array of the
-- filtered slice; the front-end converts to CSV. The function is
-- SECURITY DEFINER so it can read both underlying tables regardless
-- of the caller's RLS scope.
CREATE OR REPLACE FUNCTION public.export_audit_events(
  p_from TIMESTAMPTZ,
  p_to TIMESTAMPTZ,
  p_actor_id UUID DEFAULT NULL,
  p_action TEXT DEFAULT NULL,
  p_resource_kind TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('mogzu_admin', 'support')
    )
  ) THEN
    RAISE EXCEPTION 'export_audit_events: admin or support required';
  END IF;

  RETURN COALESCE(
    (
      SELECT jsonb_agg(row_to_json(e.*) ORDER BY e.at DESC)
      FROM public.audit_events_unified e
      WHERE e.at >= p_from
        AND e.at < p_to
        AND (p_actor_id IS NULL OR e.actor_id = p_actor_id)
        AND (p_action IS NULL OR e.action = p_action)
        AND (p_resource_kind IS NULL OR e.resource_kind = p_resource_kind)
    ),
    '[]'::JSONB
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.export_audit_events(
  TIMESTAMPTZ, TIMESTAMPTZ, UUID, TEXT, TEXT
) TO authenticated;
