-- Phase 3 Feature 5 (part 2) — SSO JIT provisioning.
--
-- After a SAML-authenticated user lands back on the app, Supabase Auth
-- has issued them a JWT but their user_profiles row is still detached
-- from any corporate. This RPC closes the gap: it looks up the
-- email_domain against active sso_config rows and binds the profile
-- to the matching corporate with a default role.
--
-- Idempotent: if the profile already carries a corporate_id, the row
-- is left alone (an admin may have manually assigned a higher role).

CREATE OR REPLACE FUNCTION public.jit_provision_sso_user(p_email TEXT)
RETURNS TABLE (
  profile_id UUID,
  corporate_id UUID,
  role TEXT,
  was_provisioned BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID;
  v_corporate_id UUID;
  v_existing_corp UUID;
  v_role TEXT;
  v_provisioned BOOLEAN := FALSE;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'jit_provision_sso_user: requires authenticated session';
  END IF;

  -- Match domain against any active sso_config (enforce_sso is not
  -- required here — if the corporate has an active IdP and the user's
  -- email domain matches, the user belongs to that corporate).
  SELECT s.corporate_id
    INTO v_corporate_id
    FROM public.sso_config s
   WHERE s.is_active = TRUE
     AND s.email_domain = lower(split_part(p_email, '@', 2))
   LIMIT 1;

  IF v_corporate_id IS NULL THEN
    -- No matching IdP — surface current profile state if any.
    RETURN QUERY
      SELECT p.id, p.corporate_id, p.role::TEXT, FALSE
        FROM public.user_profiles p
       WHERE p.id = v_uid;
    RETURN;
  END IF;

  SELECT corporate_id INTO v_existing_corp
    FROM public.user_profiles WHERE id = v_uid;

  IF v_existing_corp IS NOT NULL THEN
    -- Already bound; leave the role intact.
    RETURN QUERY
      SELECT p.id, p.corporate_id, p.role::TEXT, FALSE
        FROM public.user_profiles p
       WHERE p.id = v_uid;
    RETURN;
  END IF;

  UPDATE public.user_profiles
     SET corporate_id = v_corporate_id,
         role = COALESCE(role, 'l1_employee'),
         updated_at = NOW()
   WHERE id = v_uid
   RETURNING role::TEXT INTO v_role;

  v_provisioned := TRUE;

  RETURN QUERY
    SELECT v_uid, v_corporate_id, v_role, v_provisioned;
END;
$$;

GRANT EXECUTE ON FUNCTION public.jit_provision_sso_user(TEXT) TO authenticated;
