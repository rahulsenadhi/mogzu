-- Phase 2 Feature 9 — AI Agents Management.
--
-- Two agents ship from the spec (support, sales) but the schema does not
-- hard-code them — `kind` is a free-form check so future agents (e.g.
-- onboarding, retention) can be added without a migration. Channel
-- on/off state is stored as a JSONB map (`channels`) rather than a row
-- per channel because the per-channel knobs are sparse and the read
-- pattern is "show me everything for this agent".

CREATE TABLE public.ai_agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('support', 'sales', 'onboarding', 'retention')),
  description TEXT,
  channels JSONB NOT NULL DEFAULT
    '{"whatsapp": false, "telegram": false, "web_chat": false, "email": false}'::JSONB,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  escalation_threshold INTEGER NOT NULL DEFAULT 2
    CHECK (escalation_threshold > 0),
  escalation_keywords TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  escalation_score INTEGER NOT NULL DEFAULT 60
    CHECK (escalation_score BETWEEN 0 AND 100),
  followup_schedule_days INTEGER[] NOT NULL DEFAULT ARRAY[1, 3, 7],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_ai_agents_updated_at
  BEFORE UPDATE ON public.ai_agents
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── knowledge base entries ─────────────────────────────────────────────────

CREATE TABLE public.ai_agent_kb_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  source_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_agent_kb_entries_agent
  ON public.ai_agent_kb_entries (agent_id, created_at DESC);
CREATE INDEX idx_ai_agent_kb_entries_tags
  ON public.ai_agent_kb_entries USING GIN (tags);

CREATE TRIGGER trg_ai_agent_kb_entries_updated_at
  BEFORE UPDATE ON public.ai_agent_kb_entries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── conversations ──────────────────────────────────────────────────────────

CREATE TABLE public.ai_agent_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'telegram', 'web_chat', 'email')),
  external_thread_id TEXT,
  contact_name TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (
    status IN ('open', 'escalated', 'resolved', 'qualified_lead', 'closed')
  ),
  conversation_score INTEGER CHECK (
    conversation_score IS NULL OR conversation_score BETWEEN 0 AND 100
  ),
  escalated_to UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  escalated_at TIMESTAMPTZ,
  qualified_lead_payload JSONB,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMPTZ
);

CREATE INDEX idx_ai_agent_conversations_agent
  ON public.ai_agent_conversations (agent_id, last_message_at DESC);
CREATE INDEX idx_ai_agent_conversations_status
  ON public.ai_agent_conversations (status, last_message_at DESC);

-- ─── messages ───────────────────────────────────────────────────────────────

CREATE TABLE public.ai_agent_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.ai_agent_conversations(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'agent', 'human')),
  body TEXT NOT NULL,
  intent_tag TEXT,
  failed_response BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_agent_messages_conversation
  ON public.ai_agent_messages (conversation_id, created_at);

-- ─── metrics view (rolled up per agent / day) ───────────────────────────────

CREATE OR REPLACE VIEW public.ai_agent_metrics_daily AS
  SELECT
    c.agent_id,
    DATE_TRUNC('day', c.started_at)::DATE AS day,
    COUNT(*) AS total_conversations,
    COUNT(*) FILTER (WHERE c.status = 'escalated') AS escalations,
    COUNT(*) FILTER (WHERE c.status IN ('resolved', 'qualified_lead', 'closed')) AS resolutions,
    COUNT(*) FILTER (WHERE c.status = 'qualified_lead') AS leads_qualified,
    AVG(c.conversation_score) FILTER (WHERE c.conversation_score IS NOT NULL) AS avg_score
  FROM public.ai_agent_conversations c
  GROUP BY c.agent_id, DATE_TRUNC('day', c.started_at);

GRANT SELECT ON public.ai_agent_metrics_daily TO authenticated;

-- ─── RLS — admin + support only across the board ────────────────────────────

ALTER TABLE public.ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_agent_kb_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_agent_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_agent_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff read agents" ON public.ai_agents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid() AND p.role IN ('mogzu_admin', 'support', 'sales_agent')
    )
  );
CREATE POLICY "Admin manages agents" ON public.ai_agents
  FOR ALL
  USING (private.is_mogzu_admin())
  WITH CHECK (private.is_mogzu_admin());

CREATE POLICY "Staff read kb" ON public.ai_agent_kb_entries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid() AND p.role IN ('mogzu_admin', 'support', 'sales_agent')
    )
  );
CREATE POLICY "Admin manages kb" ON public.ai_agent_kb_entries
  FOR ALL
  USING (private.is_mogzu_admin())
  WITH CHECK (private.is_mogzu_admin());

CREATE POLICY "Staff read conversations" ON public.ai_agent_conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid() AND p.role IN ('mogzu_admin', 'support', 'sales_agent')
    )
  );
CREATE POLICY "Admin manages conversations" ON public.ai_agent_conversations
  FOR ALL
  USING (private.is_mogzu_admin())
  WITH CHECK (private.is_mogzu_admin());

CREATE POLICY "Staff read messages" ON public.ai_agent_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid() AND p.role IN ('mogzu_admin', 'support', 'sales_agent')
    )
  );
CREATE POLICY "Admin manages messages" ON public.ai_agent_messages
  FOR ALL
  USING (private.is_mogzu_admin())
  WITH CHECK (private.is_mogzu_admin());

-- ─── RPCs ───────────────────────────────────────────────────────────────────

-- Toggle a single channel on/off; rest of the channels JSON is untouched.
CREATE OR REPLACE FUNCTION public.set_ai_agent_channel(
  p_agent_id UUID,
  p_channel TEXT,
  p_enabled BOOLEAN
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT private.is_mogzu_admin() THEN
    RAISE EXCEPTION 'set_ai_agent_channel: admin required';
  END IF;

  IF p_channel NOT IN ('whatsapp', 'telegram', 'web_chat', 'email') THEN
    RAISE EXCEPTION 'set_ai_agent_channel: unknown channel %', p_channel;
  END IF;

  UPDATE public.ai_agents
  SET channels = jsonb_set(channels, ARRAY[p_channel], to_jsonb(p_enabled), TRUE)
  WHERE id = p_agent_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'set_ai_agent_channel: agent % not found', p_agent_id;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_ai_agent_channel(UUID, TEXT, BOOLEAN) TO authenticated;

-- Mark conversation as escalated; records who picked it up and when so
-- ops can see who is responsible for the hand-off.
CREATE OR REPLACE FUNCTION public.escalate_ai_conversation(p_conversation_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.user_profiles p
    WHERE p.id = auth.uid() AND p.role IN ('mogzu_admin', 'support', 'sales_agent')
  ) THEN
    RAISE EXCEPTION 'escalate_ai_conversation: staff required';
  END IF;

  UPDATE public.ai_agent_conversations
  SET status = 'escalated',
      escalated_to = auth.uid(),
      escalated_at = NOW()
  WHERE id = p_conversation_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'escalate_ai_conversation: conversation % not found', p_conversation_id;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.escalate_ai_conversation(UUID) TO authenticated;

-- ─── seed the two agents from the spec ──────────────────────────────────────

INSERT INTO public.ai_agents (slug, name, kind, description)
VALUES
  ('customer-support', 'AI Customer Support Agent', 'support',
   'Answers FAQs, booking status queries, and platform navigation help. Escalates to human support based on keywords or conversation score.'),
  ('sales-qualifier', 'AI Sales Agent', 'sales',
   'Qualifies inbound enquiries (company, requirement, budget, timeline). Shares catalogue links and hands qualified leads to human Sales Agents.')
ON CONFLICT (slug) DO NOTHING;
