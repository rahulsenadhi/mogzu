-- Corporate-scoped invites + 72h expiry default.
-- Extends user_invites with corporate_id + department so L3 admins can
-- bulk-invite their team. Status derived view exposes pending/accepted/expired.

ALTER TABLE public.user_invites
  ADD COLUMN IF NOT EXISTS corporate_id UUID REFERENCES public.corporate_accounts(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS department TEXT;

-- Tighten default expiry from 14 days -> 72 hours per FRONTEND_COMPLETION_PLAN
-- Batch 5 acceptance. Existing rows keep their original expires_at.
ALTER TABLE public.user_invites
  ALTER COLUMN expires_at SET DEFAULT (NOW() + INTERVAL '72 hours');

CREATE INDEX IF NOT EXISTS idx_user_invites_corporate
  ON public.user_invites (corporate_id)
  WHERE accepted_at IS NULL;

-- L3 admin manages own-corp invites; existing mogzu_admin policy from
-- 20260516000021_rbac_sub_users.sql stays in force unchanged.
DROP POLICY IF EXISTS "user_invites l3 admin manages own corp"
  ON public.user_invites;

CREATE POLICY "user_invites l3 admin manages own corp"
  ON public.user_invites
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid()
        AND p.corporate_id = user_invites.corporate_id
        AND p.role = 'l3_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid()
        AND p.corporate_id = user_invites.corporate_id
        AND p.role = 'l3_admin'
    )
  );

-- Patch accept_user_invite to also bind corporate_id + department.
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

  UPDATE public.user_profiles
     SET role = v_invite.role,
         full_name = COALESCE(v_invite.full_name, full_name),
         corporate_id = COALESCE(v_invite.corporate_id, corporate_id),
         department = COALESCE(v_invite.department, department),
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

-- Status view exposes pending/accepted/expired derived from accepted_at +
-- expires_at so the UI can render a single sorted list.
CREATE OR REPLACE VIEW public.user_invites_with_status AS
SELECT
  ui.id,
  ui.email,
  ui.role,
  ui.full_name,
  ui.department,
  ui.token,
  ui.corporate_id,
  ui.invited_by,
  ui.expires_at,
  ui.accepted_at,
  ui.created_at,
  CASE
    WHEN ui.accepted_at IS NOT NULL THEN 'accepted'
    WHEN ui.expires_at < NOW() THEN 'expired'
    ELSE 'pending'
  END AS status
FROM public.user_invites ui;

GRANT SELECT ON public.user_invites_with_status TO authenticated;

-- Resend RPC: extends expires_at by 72h + rotates token. Caller must be
-- an L3 admin of the same corporate (enforced by the RLS UPDATE policy
-- since the RPC body issues an UPDATE).
CREATE OR REPLACE FUNCTION public.resend_user_invite(p_invite_id UUID)
RETURNS UUID AS $$
DECLARE
  v_new_token TEXT;
BEGIN
  v_new_token := encode(gen_random_bytes(24), 'hex');
  UPDATE public.user_invites
     SET token = v_new_token,
         expires_at = NOW() + INTERVAL '72 hours',
         accepted_at = NULL
   WHERE id = p_invite_id
     AND accepted_at IS NULL;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'resend_user_invite: invite % not found or already accepted', p_invite_id;
  END IF;
  RETURN p_invite_id;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

GRANT EXECUTE ON FUNCTION public.resend_user_invite(UUID) TO authenticated;

NOTIFY pgrst, 'reload schema';
