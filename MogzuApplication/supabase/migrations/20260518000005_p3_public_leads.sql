-- Phase 3 Feature 3 — Public Lead Capture.
--
-- Anonymous "request a quote" form lands here. The row is routed to
-- the AI Sales Agent (Phase 2 Feature 9) by the
-- assign_lead_to_sales_agent trigger so the existing agent queue is
-- the single source of truth for unqualified leads.

CREATE TABLE IF NOT EXISTS public.public_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
  source_slug TEXT,
  client_name TEXT NOT NULL,
  client_company TEXT,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  requirement_summary TEXT,
  budget_band TEXT CHECK (
    budget_band IN ('lt_50k', '50k_2L', '2L_10L', '10L_50L', 'gt_50L', 'unknown')
  ),
  timeline TEXT CHECK (
    timeline IN ('asap', 'this_month', 'this_quarter', 'this_year', 'exploring')
  ),
  honeypot TEXT,
  turnstile_token TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (
    status IN ('new', 'assigned', 'qualified', 'converted', 'spam', 'closed')
  ),
  assigned_agent_id UUID REFERENCES public.ai_agents(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_public_leads_status
  ON public.public_leads (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_public_leads_listing
  ON public.public_leads (listing_id, created_at DESC);

CREATE TRIGGER trg_public_leads_updated_at
  BEFORE UPDATE ON public.public_leads
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.public_leads ENABLE ROW LEVEL SECURITY;

-- Anon never reads (lead inbox is staff-only).
DROP POLICY IF EXISTS "Staff reads leads" ON public.public_leads;
CREATE POLICY "Staff reads leads" ON public.public_leads
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('mogzu_admin', 'support', 'sales_agent')
    )
  );

DROP POLICY IF EXISTS "Admin manages leads" ON public.public_leads;
CREATE POLICY "Admin manages leads" ON public.public_leads
  FOR ALL
  USING (private.is_mogzu_admin())
  WITH CHECK (private.is_mogzu_admin());

-- Submission RPC — only path anon clients have to write a lead row.
-- Validates honeypot is empty, normalises email, auto-assigns the
-- AI Sales agent if one exists.
CREATE OR REPLACE FUNCTION public.submit_public_lead(p_payload JSONB)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
  v_agent_id UUID;
BEGIN
  IF COALESCE(p_payload->>'honeypot', '') <> '' THEN
    -- Honeypot field is invisible to humans; bots fill it. Pretend
    -- success so spam bots don't probe for the failure mode.
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

  SELECT id INTO v_agent_id
    FROM public.ai_agents
   WHERE kind = 'sales' AND is_active = TRUE
   ORDER BY created_at
   LIMIT 1;

  INSERT INTO public.public_leads (
    listing_id, source_slug, client_name, client_company, client_email, client_phone,
    requirement_summary, budget_band, timeline, honeypot, turnstile_token,
    assigned_agent_id, assigned_at, metadata, user_agent
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
    p_payload->>'turnstile_token',
    v_agent_id,
    CASE WHEN v_agent_id IS NOT NULL THEN NOW() END,
    COALESCE(p_payload->'metadata', '{}'::JSONB),
    p_payload->>'user_agent'
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_public_lead(JSONB) TO anon, authenticated;
