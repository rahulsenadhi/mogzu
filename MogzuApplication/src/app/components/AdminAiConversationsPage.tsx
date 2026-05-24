// Phase 5 Feature 5 — admin conversation viewer for AI booking agent.
//
// Lists ai_agent_conversations across every agent (cross-agent view).
// Drawer shows the full message transcript so an admin can audit what
// the agent said before / during an escalation. Read-only.

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Loader2, ShieldAlert, AlertCircle, X, Bot, User } from 'lucide-react'
import { AdminAiNavChips } from '@/app/components/admin/AdminAiNavChips'
import { AdminPageTitleRow } from '@/app/components/admin/AdminPageChrome'
import { MOGZU_GLASS_PANEL } from '@/app/components/ui/mogzuGlassStyles'
import {
  MOGZU_CHIP_ACTIVE_GRADIENT,
  MOGZU_MODULE_CONTAINER,
  MOGZU_NAV_SCROLLER,
  MOGZU_PRODUCT_CARD,
  moduleNavChipClass,
} from '@/app/components/ui/mogzuGiftingStyles'
import { useAuth } from '@/lib/auth'
import {
  AI_AGENT_CHANNELS,
  escalateConversation,
  listAgents,
  listAllConversations,
  listMessages,
  type AiAgent,
  type AiAgentChannel,
  type AiAgentConversation,
  type AiAgentConversationStatus,
  type AiAgentMessage,
} from '@/lib/aiAgents'

const STATUS_OPTIONS: Array<{ value: AiAgentConversationStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'escalated', label: 'Escalated' },
  { value: 'qualified_lead', label: 'Qualified lead' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
]

const STATUS_PILL: Record<AiAgentConversationStatus, string> = {
  open: 'bg-blue-100 text-blue-700',
  escalated: 'bg-rose-100 text-rose-700',
  qualified_lead: 'bg-emerald-100 text-emerald-700',
  resolved: 'bg-slate-100 text-slate-600',
  closed: 'bg-zinc-100 text-zinc-500',
}

const DEMO_CONVERSATIONS: AiAgentConversation[] = [
  {
    id: 'demo-conv-1',
    agent_id: 'demo-agent',
    channel: 'web_chat',
    external_thread_id: null,
    contact_name: 'Sarah Mitchell',
    contact_phone: null,
    contact_email: 'sarah@acme.com',
    status: 'open',
    conversation_score: 72,
    escalated_to: null,
    escalated_at: null,
    qualified_lead_payload: null,
    started_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    last_message_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    closed_at: null,
  },
  {
    id: 'demo-conv-2',
    agent_id: 'demo-agent',
    channel: 'whatsapp',
    external_thread_id: null,
    contact_name: 'Raj Patel',
    contact_phone: '+91 98765 43210',
    contact_email: null,
    status: 'qualified_lead',
    conversation_score: 88,
    escalated_to: null,
    escalated_at: null,
    qualified_lead_payload: { budget: '500000', module: 'events' },
    started_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    last_message_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    closed_at: null,
  },
]

const DEMO_MESSAGES: AiAgentMessage[] = [
  {
    id: 'm1',
    conversation_id: 'demo-conv-1',
    role: 'user',
    body: 'We need a corporate offsite for 120 people in Bangalore next month.',
    metadata: null,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'm2',
    conversation_id: 'demo-conv-1',
    role: 'assistant',
    body: 'I can help with that. What is your approximate budget per person, and do you prefer a venue with outdoor space?',
    metadata: null,
    created_at: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
  },
  {
    id: 'm3',
    conversation_id: 'demo-conv-1',
    role: 'user',
    body: 'Around ₹3,500 per person. Outdoor space would be nice.',
    metadata: null,
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
]

function fmt(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function AdminAiConversationsPage() {
  const { role } = useAuth()
  const isAdmin = role === 'mogzu_admin' || role === 'account_manager'

  const [agents, setAgents] = useState<AiAgent[]>([])
  const [rows, setRows] = useState<AiAgentConversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState<AiAgentConversationStatus | 'all'>('all')
  const [channelFilter, setChannelFilter] = useState<AiAgentChannel | 'all'>('all')

  const [activeId, setActiveId] = useState<string | null>(null)
  const [messages, setMessages] = useState<AiAgentMessage[]>([])
  const [msgLoading, setMsgLoading] = useState(false)
  const [usingDemo, setUsingDemo] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    const [{ data: a, error: e1 }, { data: c, error: e2 }] = await Promise.all([
      listAgents(),
      listAllConversations({
        status: statusFilter === 'all' ? undefined : statusFilter,
        channel: channelFilter === 'all' ? undefined : channelFilter,
        limit: 200,
      }),
    ])
    setAgents(a.length > 0 ? a : [{ id: 'demo-agent', slug: 'booking', name: 'Booking Agent (demo)', kind: 'sales', description: null, channels: { whatsapp: true, telegram: false, web_chat: true, email: false }, is_active: true, escalation_threshold: 3, escalation_keywords: [], escalation_score: 70, followup_schedule_days: [1, 3, 7], created_at: '', updated_at: '' }])
    if (c.length === 0 && !e2) {
      setRows(DEMO_CONVERSATIONS)
      setUsingDemo(true)
    } else {
      setRows(c)
      setUsingDemo(false)
    }
    if (e1 || e2) setError(e1 || e2 || '')
    setLoading(false)
  }, [statusFilter, channelFilter])

  useEffect(() => {
    if (isAdmin) void load()
  }, [isAdmin, load])

  const openConversation = useCallback(async (id: string) => {
    setActiveId(id)
    setMsgLoading(true)
    if (usingDemo || id.startsWith('demo-')) {
      setMessages(DEMO_MESSAGES)
      setMsgLoading(false)
      return
    }
    const { data, error: err } = await listMessages(id)
    setMessages(data)
    if (err) setError(err)
    setMsgLoading(false)
  }, [usingDemo])

  const agentName = useMemo(() => {
    const m = new Map<string, string>()
    for (const a of agents) m.set(a.id, a.name)
    return m
  }, [agents])

  const escalate = useCallback(
    async (id: string) => {
      const { error: err } = await escalateConversation(id)
      if (err) setError(err)
      else void load()
    },
    [load],
  )

  const active = activeId ? rows.find((r) => r.id === activeId) : null

  if (!isAdmin) {
    return (
      <div className="p-12 text-center">
        <ShieldAlert className="mx-auto mb-2 size-8 text-amber-500" />
        <p className="text-sm text-amber-800">Admin / account manager role required.</p>
      </div>
    )
  }

  return (
    <div className={`${MOGZU_MODULE_CONTAINER} mx-auto w-full space-y-5 py-2`}>
      <div className="rounded-2xl border border-white/60 bg-white/55 p-5 backdrop-blur-xl shadow-[0_16px_36px_rgba(37,99,235,0.12)]">
        <AdminPageTitleRow
          title="AI agent conversations"
          totalLabel={loading ? 'Loading…' : `${rows.length} conversations`}
        />
        <p className="mt-1 text-[14px] text-[#64748b]">
          Audit booking agent transcripts before and during escalations.
        </p>
        <div className="mt-4">
          <AdminAiNavChips active="conversations" />
        </div>
        <div className={`mt-3 space-y-2`}>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Status</p>
          <div className={MOGZU_NAV_SCROLLER}>
            {STATUS_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => setStatusFilter(o.value)}
                className={moduleNavChipClass(statusFilter === o.value)}
                style={statusFilter === o.value ? MOGZU_CHIP_ACTIVE_GRADIENT : undefined}
              >
                {o.label}
              </button>
            ))}
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Channel</p>
          <div className={MOGZU_NAV_SCROLLER}>
            <button
              type="button"
              onClick={() => setChannelFilter('all')}
              className={moduleNavChipClass(channelFilter === 'all')}
              style={channelFilter === 'all' ? MOGZU_CHIP_ACTIVE_GRADIENT : undefined}
            >
              All channels
            </button>
            {AI_AGENT_CHANNELS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setChannelFilter(c.value)}
                className={moduleNavChipClass(channelFilter === c.value)}
                style={channelFilter === c.value ? MOGZU_CHIP_ACTIVE_GRADIENT : undefined}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {usingDemo && (
        <p className="rounded-xl border border-amber-200/80 bg-amber-50/90 px-4 py-2.5 text-sm text-amber-800">
          Showing demo conversations — connect Supabase for live transcripts.
        </p>
      )}

      {error && (
        <p className="flex items-center gap-2 rounded-xl border border-rose-100 bg-rose-50 px-4 py-2.5 text-sm text-rose-700">
          <AlertCircle className="size-4 shrink-0" /> {error}
        </p>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-6 animate-spin text-slate-400" />
        </div>
      ) : (
        <section className={`${MOGZU_GLASS_PANEL} overflow-hidden`}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/60 bg-white/40 text-left text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                <th className="px-4 py-3">Started</th>
                <th className="px-4 py-3">Agent</th>
                <th className="px-4 py-3">Channel</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Score</th>
                <th className="px-4 py-3 text-right" />
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} className="border-b border-slate-100/80 last:border-0 hover:bg-white/50">
                  <td className="px-4 py-3 text-xs text-slate-500">{fmt(c.started_at)}</td>
                  <td className="px-4 py-3 font-semibold text-[#0e1e3f]">
                    {agentName.get(c.agent_id) ?? c.agent_id.slice(0, 8)}
                  </td>
                  <td className="px-4 py-3 text-xs capitalize text-slate-600">
                    {c.channel.replace('_', ' ')}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {c.contact_name ?? c.contact_email ?? c.contact_phone ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_PILL[c.status]}`}
                    >
                      {c.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs text-slate-500">
                    {c.conversation_score ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-1">
                      {c.status === 'open' && !usingDemo && (
                        <button
                          type="button"
                          onClick={() => void escalate(c.id)}
                          className="rounded-lg border border-rose-200 bg-rose-50/90 px-2 py-1 text-xs text-rose-700 hover:bg-rose-100"
                        >
                          Escalate
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => void openConversation(c.id)}
                        className="rounded-lg border border-white/70 bg-white/60 px-2 py-1 text-xs text-slate-700 backdrop-blur-sm hover:border-[#93c5fd]"
                      >
                        View transcript
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-xs text-slate-400">
                    No conversations matching filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      )}

      {activeId && (
        <div className="fixed inset-0 z-40 flex">
          <button
            type="button"
            aria-label="Close transcript"
            onClick={() => setActiveId(null)}
            className="flex-1 bg-black/40 backdrop-blur-sm"
          />
          <aside className={`flex w-full max-w-md flex-col ${MOGZU_PRODUCT_CARD} rounded-none border-l shadow-2xl`}>
            <header className="flex items-start justify-between border-b border-white/60 px-5 py-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500">Transcript</p>
                <h2 className="text-base font-bold text-[#0e1e3f]">
                  {active ? agentName.get(active.agent_id) ?? 'Agent' : ''}
                </h2>
                <p className="text-xs text-slate-500">
                  {active?.contact_name ?? active?.contact_email ?? active?.contact_phone ?? ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveId(null)}
                className="rounded-lg border border-white/70 bg-white/60 p-1 text-slate-600 backdrop-blur-sm hover:border-[#93c5fd]"
              >
                <X className="size-4" />
              </button>
            </header>
            <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
              {msgLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="size-5 animate-spin text-slate-400" />
                </div>
              ) : messages.length === 0 ? (
                <p className="text-center text-xs text-slate-400">No messages logged.</p>
              ) : (
                messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex gap-2 ${m.role === 'assistant' ? 'flex-row' : 'flex-row-reverse'}`}
                  >
                    <div
                      className={`flex size-7 shrink-0 items-center justify-center rounded-full ${
                        m.role === 'assistant'
                          ? 'bg-blue-100 text-blue-700'
                          : m.role === 'system'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {m.role === 'assistant' ? (
                        <Bot className="size-4" />
                      ) : (
                        <User className="size-4" />
                      )}
                    </div>
                    <div
                      className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                        m.role === 'assistant'
                          ? 'bg-white/70 text-slate-800 backdrop-blur-sm'
                          : m.role === 'system'
                            ? 'bg-amber-50/90 text-amber-900'
                            : 'bg-emerald-50/90 text-emerald-900'
                      }`}
                    >
                      {m.body}
                      <p className="mt-1 text-[10px] text-slate-500">{fmt(m.created_at)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
