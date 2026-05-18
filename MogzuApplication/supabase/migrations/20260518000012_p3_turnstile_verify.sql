-- Phase 3 Feature 3 — Cloudflare Turnstile verification.
--
-- The widget hands a one-time token to the client; submit_public_lead
-- stashes the token but cannot call out to challenges.cloudflare.com
-- from inside Postgres (no pg_net guarantee). Instead, an external
-- worker (n8n: n8n/workflows/verify-turnstile-leads.json) polls
-- unverified leads, calls Cloudflare siteverify, and flips
-- turnstile_verified via mark_turnstile_verified.
--
-- AI Sales agent assignment is now deferred until verification passes;
-- this keeps spam out of the agent queue without blocking the form
-- response.

ALTER TABLE public.public_leads
  ADD COLUMN IF NOT EXISTS turnstile_verified BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS turnstile_verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS turnstile_error TEXT;

CREATE INDEX IF NOT EXISTS idx_public_leads_unverified
  ON public.public_leads (created_at)
  WHERE turnstile_verified = FALSE
    AND turnstile_token IS NOT NULL
    AND status = 'new';

-- Allow the verifier worker (service-role) to flip verification flags.
-- We do not expose this to anon/authenticated — only service_role keys
-- bypass RLS, which is the worker's only credential.
CREATE OR REPLACE FUNCTION public.mark_turnstile_verified(
  p_lead_id UUID,
  p_ok BOOLEAN,
  p_error TEXT DEFAULT NULL
)
RETURNS public.public_leads
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_lead public.public_leads;
  v_agent_id UUID;
BEGIN
  UPDATE public.public_leads
     SET turnstile_verified = p_ok,
         turnstile_verified_at = NOW(),
         turnstile_error = CASE WHEN p_ok THEN NULL ELSE p_error END,
         status = CASE
           WHEN p_ok THEN status         -- assignment runs below
           ELSE 'spam'
         END
   WHERE id = p_lead_id
   RETURNING * INTO v_lead;

  IF v_lead.id IS NULL THEN
    RAISE EXCEPTION 'mark_turnstile_verified: lead % not found', p_lead_id;
  END IF;

  -- On success, route to AI Sales agent if one exists + still 'new'.
  IF p_ok AND v_lead.status = 'new' AND v_lead.assigned_agent_id IS NULL THEN
    SELECT id INTO v_agent_id
      FROM public.ai_agents
     WHERE kind = 'sales' AND is_active = TRUE
     ORDER BY created_at
     LIMIT 1;

    IF v_agent_id IS NOT NULL THEN
      UPDATE public.public_leads
         SET assigned_agent_id = v_agent_id,
             assigned_at = NOW(),
             status = 'assigned'
       WHERE id = p_lead_id
       RETURNING * INTO v_lead;
    END IF;
  END IF;

  RETURN v_lead;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.mark_turnstile_verified(UUID, BOOLEAN, TEXT) FROM anon, authenticated;
-- Only the service_role (worker) calls this; explicit grant kept tight.
GRANT EXECUTE ON FUNCTION public.mark_turnstile_verified(UUID, BOOLEAN, TEXT) TO service_role;

-- Replace submit_public_lead: defer agent assignment until verifier.
-- A lead with no turnstile_token (e.g. dev env with no site key
-- configured) is auto-verified so legacy flow still works.
CREATE OR REPLACE FUNCTION public.submit_public_lead(p_payload JSONB)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
  v_token TEXT;
  v_auto_verify BOOLEAN;
  v_agent_id UUID;
BEGIN
  IF COALESCE(p_payload->>'honeypot', '') <> '' THEN
    INSERT INTO public.public_leads (
      client_name, client_email, requirement_summary, status, metadata, user_agent
    ) VALUES (
      'spam', 'spam@spam', NULL, 'spam',
      jsonb_build_object('payload', p_payload),
      p_payload->>'user_agent'
    ) RETURNING id INTO v_id;
    RETURN v_id;
  END IF;

  IF p_payload->>'client_name' IS NULL OR p_payload->>'client_email' IS NULL THEN
    RAISE EXCEPTION 'submit_public_lead: client_name + client_email required';
  END IF;

  v_token := p_payload->>'turnstile_token';
  -- No token at all → environment has Turnstile disabled, auto-verify.
  -- With a token, mark unverified so the worker takes over.
  v_auto_verify := (v_token IS NULL OR v_token = '');

  IF v_auto_verify THEN
    SELECT id INTO v_agent_id
      FROM public.ai_agents
     WHERE kind = 'sales' AND is_active = TRUE
     ORDER BY created_at
     LIMIT 1;
  END IF;

  INSERT INTO public.public_leads (
    listing_id, source_slug, client_name, client_company, client_email, client_phone,
    requirement_summary, budget_band, timeline, honeypot, turnstile_token,
    turnstile_verified, turnstile_verified_at,
    assigned_agent_id, assigned_at, status, metadata, user_agent
  )
  VALUES (
    NULLIF(p_payload->>'listing_id','')::UUID,
    p_payload->>'source_slug',
    p_payload->>'client_name',
    p_payload->>'client_company',
    lower(p_payload->>'client_email'),
    p_payload->>'client_phone',
    p_payload->>'requirement_summary',
    p_payload->>'budget_band',
    p_payload->>'timeline',
    p_payload->>'honeypot',
    v_token,
    v_auto_verify,
    CASE WHEN v_auto_verify THEN NOW() END,
    CASE WHEN v_auto_verify THEN v_agent_id END,
    CASE WHEN v_auto_verify AND v_agent_id IS NOT NULL THEN NOW() END,
    CASE WHEN v_auto_verify AND v_agent_id IS NOT NULL THEN 'assigned' ELSE 'new' END,
    COALESCE(p_payload->'metadata', '{}'::JSONB),
    p_payload->>'user_agent'
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_public_lead(JSONB) TO anon, authenticated;
