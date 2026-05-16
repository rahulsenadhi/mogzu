-- ─── Role Switcher (Story 1.5) ───────────────────────────────────────────────
--
-- Allow a single user_profile to hold multiple roles (e.g. L2 Manager + L3 Admin
-- in the same corporate, or vendor + mogzu_admin during onboarding). The
-- profile's primary role stays in user_profiles.role; additional grants live in
-- available_roles[]. UI reads the union and lets the user pick an active role
-- per session.
--
-- Switches are audited in role_switch_events.

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS available_roles TEXT[] DEFAULT '{}'::TEXT[];

CREATE TABLE public.role_switch_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  from_role TEXT NOT NULL,
  to_role TEXT NOT NULL,
  switched_at TIMESTAMPTZ DEFAULT NOW(),
  user_agent TEXT,
  ip_address TEXT
);

CREATE INDEX idx_role_switch_user_time ON public.role_switch_events (user_id, switched_at DESC);

ALTER TABLE public.role_switch_events ENABLE ROW LEVEL SECURITY;

-- User can read their own switches; mogzu_admin reads everything
CREATE POLICY "User can read own role_switch_events"
  ON public.role_switch_events
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid() AND p.role = 'mogzu_admin'
    )
  );

-- Only the acting user inserts their own switches
CREATE POLICY "User can log own role switches"
  ON public.role_switch_events
  FOR INSERT
  WITH CHECK (user_id = auth.uid());
