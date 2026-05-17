-- Phase 2 — Feature 6: Sub-Users & RBAC.
--
-- Adds two new internal roles (sales_agent, field_agent), a per-user
-- permission grant table, and a lightweight activity log for sub-user
-- actions. The existing 'support' role continues to cover the PRD's
-- "Customer Support" persona; 'account_manager' covers Account Manager;
-- 'partner' covers External Partner.

-- ─── 1. Expand UserRole CHECK ────────────────────────────────────────────────

ALTER TABLE public.user_profiles
  DROP CONSTRAINT IF EXISTS user_profiles_role_check;

ALTER TABLE public.user_profiles
  ADD CONSTRAINT user_profiles_role_check CHECK (
    role IN (
      'l1_employee', 'l2_manager', 'l3_admin',
      'vendor', 'mogzu_admin', 'account_manager',
      'partner', 'support',
      'sales_agent', 'field_agent'
    )
  );

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS invited_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS invited_at TIMESTAMPTZ;

-- Extend the status enum to support the invited lifecycle. Existing rows
-- with 'active' / 'deactivated' are untouched.
ALTER TABLE public.user_profiles
  DROP CONSTRAINT IF EXISTS user_profiles_status_check;

ALTER TABLE public.user_profiles
  ADD CONSTRAINT user_profiles_status_check CHECK (
    status IN ('active', 'deactivated', 'invited')
  );

-- ─── 2. Per-user permission grants ───────────────────────────────────────────
--
-- Granular allow-list. The (role) provides a baseline; this table layers
-- additional grants on top. Admin tooling toggles rows; server-side checks
-- go through private.user_can() so we can reuse it from RLS.

CREATE TABLE public.user_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  resource TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('view', 'create', 'update', 'delete', 'approve')),
  granted_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, resource, action)
);

CREATE INDEX idx_user_permissions_user ON public.user_permissions (user_id);

ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own permissions"
  ON public.user_permissions
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admin manages all permissions"
  ON public.user_permissions
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

CREATE OR REPLACE FUNCTION private.user_can(p_resource TEXT, p_action TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_permissions
     WHERE user_id = auth.uid()
       AND resource = p_resource
       AND action = p_action
  )
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ─── 3. Activity log for sub-users ───────────────────────────────────────────

CREATE TABLE public.user_activity_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  target_table TEXT,
  target_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_activity_actor
  ON public.user_activity_events (actor_id, created_at DESC);

ALTER TABLE public.user_activity_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User reads own activity"
  ON public.user_activity_events
  FOR SELECT
  USING (actor_id = auth.uid());

CREATE POLICY "Admin reads all activity"
  ON public.user_activity_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid() AND p.role = 'mogzu_admin'
    )
  );

CREATE POLICY "Any authenticated user inserts own activity"
  ON public.user_activity_events
  FOR INSERT
  WITH CHECK (actor_id = auth.uid());

-- ─── 4. Invite tokens ────────────────────────────────────────────────────────
--
-- Admin creates a pending sub-user row with an invite token. The user opens
-- /invite/:token to choose a password, which triggers a normal supabase
-- signup. On first sign-in the application binds the auth.users row to the
-- pre-seeded user_profiles row (matched by email) and clears the token.

CREATE TABLE public.user_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  full_name TEXT,
  token TEXT NOT NULL UNIQUE,
  invited_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '14 days'),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_invites_token ON public.user_invites (token);
CREATE INDEX idx_user_invites_email ON public.user_invites (lower(email));

ALTER TABLE public.user_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin manages all invites"
  ON public.user_invites
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

-- Public lookup goes through a SECURITY DEFINER RPC so the table itself
-- stays admin-only — same hardening pattern as the partner invoice token.
CREATE OR REPLACE FUNCTION public.get_user_invite_by_token(p_token TEXT)
RETURNS TABLE (
  id UUID,
  email TEXT,
  role TEXT,
  full_name TEXT,
  expires_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, email, role, full_name, expires_at, accepted_at
    FROM public.user_invites
   WHERE token = p_token
   LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_invite_by_token(TEXT) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.accept_user_invite(p_token TEXT)
RETURNS UUID AS $$
DECLARE
  v_invite RECORD;
  v_user UUID := auth.uid();
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'accept_user_invite: must be signed in';
  END IF;

  SELECT * INTO v_invite FROM public.user_invites
   WHERE token = p_token
     AND accepted_at IS NULL
     AND expires_at > NOW();
  IF NOT FOUND THEN RETURN NULL; END IF;

  -- Bind the freshly signed-up auth user to the role + invite metadata.
  UPDATE public.user_profiles
     SET role = v_invite.role,
         full_name = COALESCE(v_invite.full_name, full_name),
         status = 'active',
         invited_by = v_invite.invited_by,
         invited_at = v_invite.created_at
   WHERE id = v_user;

  UPDATE public.user_invites
     SET accepted_at = NOW()
   WHERE id = v_invite.id;

  RETURN v_invite.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.accept_user_invite(TEXT) TO authenticated;
