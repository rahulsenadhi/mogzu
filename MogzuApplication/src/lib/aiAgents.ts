// Phase 2 Feature 9 — AI Agents Management service.

import { supabase } from './supabase'

export type AiAgentKind = 'support' | 'sales' | 'onboarding' | 'retention'
export type AiAgentChannel = 'whatsapp' | 'telegram' | 'web_chat' | 'email'
export type AiAgentConversationStatus =
  | 'open'
  | 'escalated'
  | 'resolved'
  | 'qualified_lead'
  | 'closed'

export const AI_AGENT_CHANNELS: { value: AiAgentChannel; label: string }[] = [
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'web_chat', label: 'Web chat' },
  { value: 'email', label: 'Email' },
]

export type AiAgent = {
  id: string
  slug: string
  name: string
  kind: AiAgentKind
  description: string | null
  channels: Record<AiAgentChannel, boolean>
  is_active: boolean
  escalation_threshold: number
  escalation_keywords: string[]
  escalation_score: number
  followup_schedule_days: number[]
  created_at: string
  updated_at: string
}

export type AiAgentKbEntry = {
  id: string
  agent_id: string
  title: string
  body: string
  tags: string[]
  source_url: string | null
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export type AiAgentConversation = {
  id: string
  agent_id: string
  channel: AiAgentChannel
  external_thread_id: string | null
  contact_name: string | null
  contact_phone: string | null
  contact_email: string | null
  status: AiAgentConversationStatus
  conversation_score: number | null
  escalated_to: string | null
  escalated_at: string | null
  qualified_lead_payload: Record<string, unknown> | null
  started_at: string
  last_message_at: string
  closed_at: string | null
}

export type AiAgentMetricsDay = {
  agent_id: string
  day: string
  total_conversations: number
  escalations: number
  resolutions: number
  leads_qualified: number
  avg_score: number | null
}

// ─── agents ─────────────────────────────────────────────────────────────────

export async function listAgents(): Promise<{ data: AiAgent[]; error: string | null }> {
  const { data, error } = await supabase
    .from('ai_agents')
    .select('*')
    .order('kind', { ascending: true })
    .order('name', { ascending: true })
  if (error) return { data: [], error: error.message }
  return { data: (data ?? []) as AiAgent[], error: null }
}

export async function getAgent(id: string): Promise<{ data: AiAgent | null; error: string | null }> {
  const { data, error } = await supabase.from('ai_agents').select('*').eq('id', id).single()
  if (error) return { data: null, error: error.message }
  return { data: data as AiAgent, error: null }
}

export async function setAgentActive(
  id: string,
  isActive: boolean,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('ai_agents')
    .update({ is_active: isActive })
    .eq('id', id)
  return { error: error?.message ?? null }
}

export async function setAgentChannel(
  id: string,
  channel: AiAgentChannel,
  enabled: boolean,
): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc('set_ai_agent_channel', {
    p_agent_id: id,
    p_channel: channel,
    p_enabled: enabled,
  })
  return { error: error?.message ?? null }
}

export async function updateAgentEscalation(
  id: string,
  changes: {
    escalation_threshold?: number
    escalation_keywords?: string[]
    escalation_score?: number
    followup_schedule_days?: number[]
  },
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('ai_agents').update(changes).eq('id', id)
  return { error: error?.message ?? null }
}

// ─── knowledge base ─────────────────────────────────────────────────────────

export async function listKbEntries(
  agentId: string,
): Promise<{ data: AiAgentKbEntry[]; error: string | null }> {
  const { data, error } = await supabase
    .from('ai_agent_kb_entries')
    .select('*')
    .eq('agent_id', agentId)
    .order('updated_at', { ascending: false })
  if (error) return { data: [], error: error.message }
  return { data: (data ?? []) as AiAgentKbEntry[], error: null }
}

export async function upsertKbEntry(
  entry: Partial<AiAgentKbEntry> & { agent_id: string; title: string; body: string },
  createdBy: string,
): Promise<{ data: AiAgentKbEntry | null; error: string | null }> {
  if (entry.id) {
    const { data, error } = await supabase
      .from('ai_agent_kb_entries')
      .update({
        title: entry.title,
        body: entry.body,
        tags: entry.tags ?? [],
        source_url: entry.source_url ?? null,
        is_active: entry.is_active ?? true,
      })
      .eq('id', entry.id)
      .select('*')
      .single()
    if (error) return { data: null, error: error.message }
    return { data: data as AiAgentKbEntry, error: null }
  }
  const { data, error } = await supabase
    .from('ai_agent_kb_entries')
    .insert({
      agent_id: entry.agent_id,
      title: entry.title,
      body: entry.body,
      tags: entry.tags ?? [],
      source_url: entry.source_url ?? null,
      is_active: entry.is_active ?? true,
      created_by: createdBy,
    })
    .select('*')
    .single()
  if (error) return { data: null, error: error.message }
  return { data: data as AiAgentKbEntry, error: null }
}

export async function deleteKbEntry(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('ai_agent_kb_entries').delete().eq('id', id)
  return { error: error?.message ?? null }
}

// ─── conversations + metrics ────────────────────────────────────────────────

export async function listConversations(
  agentId: string,
  options?: { status?: AiAgentConversationStatus; channel?: AiAgentChannel; limit?: number },
): Promise<{ data: AiAgentConversation[]; error: string | null }> {
  let q = supabase
    .from('ai_agent_conversations')
    .select('*')
    .eq('agent_id', agentId)
    .order('last_message_at', { ascending: false })
    .limit(options?.limit ?? 50)
  if (options?.status) q = q.eq('status', options.status)
  if (options?.channel) q = q.eq('channel', options.channel)
  const { data, error } = await q
  if (error) return { data: [], error: error.message }
  return { data: (data ?? []) as AiAgentConversation[], error: null }
}

export async function escalateConversation(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc('escalate_ai_conversation', { p_conversation_id: id })
  return { error: error?.message ?? null }
}

export async function getAgentMetrics(
  agentId: string,
  days = 30,
): Promise<{ data: AiAgentMetricsDay[]; error: string | null }> {
  const since = new Date()
  since.setDate(since.getDate() - days)
  const { data, error } = await supabase
    .from('ai_agent_metrics_daily')
    .select('*')
    .eq('agent_id', agentId)
    .gte('day', since.toISOString().slice(0, 10))
    .order('day', { ascending: false })
  if (error) return { data: [], error: error.message }
  return { data: (data ?? []) as AiAgentMetricsDay[], error: null }
}
