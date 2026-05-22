// Phase 5 Feature 5 — admin conversation viewer for AI booking agent.
//
// Lists ai_agent_conversations across every agent (cross-agent view).
// Drawer shows the full message transcript so an admin can audit what
// the agent said before / during an escalation. Read-only.

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Loader2, ShieldAlert, AlertCircle, X, Bot, User } from 'lucide-react'
import { AdminPageTitleRow } from '@/app/components/admin/AdminPageChrome'
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
    setAgents(a)
    setRows(c)
    if (e1 || e2) setError(e1 || e2 || '')
    setLoading(false)
  }, [statusFilter, channelFilter])

  useEffect(() => {
    if (isAdmin) void load()
  }, [isAdmin, load])

  const openConversation = useCallback(async (id: string) => {
    setActiveId(id)
    setMsgLoading(true)
    const { data, error: err } = await listMessages(id)
    setMessages(data)
    if (err) setError(err)
    setMsgLoading(false)
  }, [])

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
    <div className="min-h-screen bg-[#FFFDF9]">
      <div className="mx-auto max-w-6xl px-6 py-6">
        <AdminPageTitleRow
          title="AI agent conversations"
          totalLabel={loading ? 'Loading…' : `${rows.length} conversations`}
        />

        {error && (
          <p className="mt-3 flex items-center gap-2 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            <AlertCircle className="size-4" /> {error}
          </p>
        )}

        <section className="mt-4 flex flex-wrap gap-3">
          <label className="text-sm">
            <span className="mb-1 block text-xs font-medium text-slate-600">Status</span>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as AiAgentConversationStatus | 'all')
              }
              className="rounded-md border border-slate-200 px-3 py-2 text-sm"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-xs font-medium text-slate-600">Channel</span>
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value as AiAgentChannel | 'all')}
              className="rounded-md border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="all">All</option>
              {AI_AGENT_CHANNELS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
        </section>

        {loading ? (
          <div className="mt-10 flex items-center justify-center">
            <Loader2 className="size-6 animate-spin text-slate-400" />
          </div>
        ) : (
          <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-2">Started</th>
                  <th className="px-4 py-2">Agent</th>
                  <th className="px-4 py-2">Channel</th>
                  <th className="px-4 py-2">Contact</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2 text-right">Score</th>
                  <th className="px-4 py-2 text-right"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <tr key={c.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-2 text-xs text-slate-500">{fmt(c.started_at)}</td>
                    <td className="px-4 py-2 font-medium text-slate-900">
                      {agentName.get(c.agent_id) ?? c.agent_id.slice(0, 8)}
                    </td>
                    <td className="px-4 py-2 text-xs capitalize text-slate-600">
                      {c.channel.replace('_', ' ')}
                    </td>
                    <td className="px-4 py-2 text-slate-700">
                      {c.contact_name ?? c.contact_email ?? c.contact_phone ?? '—'}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_PILL[c.status]}`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right font-mono text-xs text-slate-500">
                      {c.conversation_score ?? '—'}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <div className="inline-flex gap-1">
                        {c.status === 'open' && (
                          <button
                            type="button"
                            onClick={() => void escalate(c.id)}
                            className="rounded-md border border-rose-200 px-2 py-1 text-xs text-rose-700 hover:bg-rose-50"
                          >
                            Escalate
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => void openConversation(c.id)}
                          className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                        >
                          View transcript
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-xs text-slate-400">
                      No conversations matching filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
        )}
      </div>

      {activeId && (
        <div className="fixed inset-0 z-40 flex">
          <button
            type="button"
            aria-label="Close transcript"
            onClick={() => setActiveId(null)}
            className="flex-1 bg-black/40"
          />
          <aside className="flex w-full max-w-md flex-col bg-white shadow-xl">
            <header className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500">Transcript</p>
                <h2 className="text-base font-bold text-slate-900">
                  {active ? agentName.get(active.agent_id) ?? 'Agent' : ''}
                </h2>
                <p className="text-xs text-slate-500">
                  {active?.contact_name ?? active?.contact_email ?? active?.contact_phone ?? ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveId(null)}
                className="rounded-md border border-slate-200 p-1 text-slate-600 hover:bg-slate-50"
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
                          ? 'bg-slate-100 text-slate-800'
                          : m.role === 'system'
                            ? 'bg-amber-50 text-amber-900'
                            : 'bg-emerald-50 text-emerald-900'
                      }`}
                    >
                      {m.body}
                      <p
                        className={`mt-1 text-[10px] ${
                          m.role === 'assistant' ? 'text-slate-500' : 'text-slate-500'
                        }`}
                      >
                        {fmt(m.created_at)}
                      </p>
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
