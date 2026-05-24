// Phase 2 Feature 9 — AI Agents admin console.

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Loader2,
  ShieldAlert,
  Power,
  Plus,
  Trash2,
  ArrowUpRight,
  MessagesSquare,
  Save,
  X,
} from 'lucide-react'
import { AdminAiNavChips } from '@/app/components/admin/AdminAiNavChips'
import { AdminPageTitleRow } from '@/app/components/admin/AdminPageChrome'
import { MOGZU_GLASS_PANEL } from '@/app/components/ui/mogzuGlassStyles'
import {
  MOGZU_CHIP_ACTIVE_GRADIENT,
  MOGZU_CTA_GRADIENT,
  MOGZU_FILTER_SIDEBAR,
  MOGZU_MODULE_CONTAINER,
  filterStatChipClass,
  moduleNavChipClass,
} from '@/app/components/ui/mogzuGiftingStyles'
import { useAuth } from '@/lib/auth'
import {
  AI_AGENT_CHANNELS,
  deleteKbEntry,
  escalateConversation,
  getAgentMetrics,
  listAgents,
  listConversations,
  listKbEntries,
  setAgentActive,
  setAgentChannel,
  updateAgentEscalation,
  upsertKbEntry,
  type AiAgent,
  type AiAgentChannel,
  type AiAgentConversation,
  type AiAgentKbEntry,
  type AiAgentMetricsDay,
} from '@/lib/aiAgents'

type KbDraft = {
  id?: string
  title: string
  body: string
  tags: string
  source_url: string
  is_active: boolean
}

const emptyKbDraft: KbDraft = {
  title: '',
  body: '',
  tags: '',
  source_url: '',
  is_active: true,
}

function sumMetrics(rows: AiAgentMetricsDay[]) {
  return rows.reduce(
    (acc, r) => {
      acc.total += Number(r.total_conversations || 0)
      acc.escalations += Number(r.escalations || 0)
      acc.resolutions += Number(r.resolutions || 0)
      acc.leads += Number(r.leads_qualified || 0)
      return acc
    },
    { total: 0, escalations: 0, resolutions: 0, leads: 0 },
  )
}

export default function AdminAiAgentsPage() {
  const { role, user } = useAuth()
  const isStaff = role === 'mogzu_admin' || role === 'support' || role === 'sales_agent'
  const isAdmin = role === 'mogzu_admin'

  const [agents, setAgents] = useState<AiAgent[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const [kb, setKb] = useState<AiAgentKbEntry[]>([])
  const [conversations, setConversations] = useState<AiAgentConversation[]>([])
  const [metrics, setMetrics] = useState<AiAgentMetricsDay[]>([])

  const [kbDraft, setKbDraft] = useState<KbDraft | null>(null)
  const [escalationEdit, setEscalationEdit] = useState<{
    threshold: number
    keywords: string
    score: number
    followups: string
  } | null>(null)

  const loadAgents = useCallback(async () => {
    setLoading(true)
    const { data, error: err } = await listAgents()
    if (err) setError(err)
    setAgents(data)
    if (!selectedId && data.length > 0) setSelectedId(data[0].id)
    setLoading(false)
  }, [selectedId])

  useEffect(() => {
    if (isStaff) loadAgents()
  }, [isStaff, loadAgents])

  const selected = useMemo(
    () => agents.find((a) => a.id === selectedId) ?? null,
    [agents, selectedId],
  )

  const loadDetail = useCallback(async (agentId: string) => {
    const [kbRes, convRes, metricsRes] = await Promise.all([
      listKbEntries(agentId),
      listConversations(agentId, { limit: 25 }),
      getAgentMetrics(agentId, 30),
    ])
    setKb(kbRes.data)
    setConversations(convRes.data)
    setMetrics(metricsRes.data)
  }, [])

  useEffect(() => {
    if (selected) loadDetail(selected.id)
  }, [selected, loadDetail])

  useEffect(() => {
    if (selected) {
      setEscalationEdit({
        threshold: selected.escalation_threshold,
        keywords: selected.escalation_keywords.join(', '),
        score: selected.escalation_score,
        followups: selected.followup_schedule_days.join(', '),
      })
    } else {
      setEscalationEdit(null)
    }
  }, [selected])

  const toggleActive = async () => {
    if (!selected || !isAdmin) return
    setBusy('active')
    const { error: err } = await setAgentActive(selected.id, !selected.is_active)
    setBusy(null)
    if (err) {
      setError(err)
      return
    }
    setNotice(`Agent ${selected.is_active ? 'disabled' : 'enabled'}.`)
    loadAgents()
  }

  const toggleChannel = async (channel: AiAgentChannel) => {
    if (!selected || !isAdmin) return
    setBusy(`ch-${channel}`)
    const { error: err } = await setAgentChannel(selected.id, channel, !selected.channels[channel])
    setBusy(null)
    if (err) {
      setError(err)
      return
    }
    loadAgents()
  }

  const saveEscalation = async () => {
    if (!selected || !isAdmin || !escalationEdit) return
    setBusy('escalation')
    const { error: err } = await updateAgentEscalation(selected.id, {
      escalation_threshold: Math.max(1, Math.floor(escalationEdit.threshold)),
      escalation_keywords: escalationEdit.keywords
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      escalation_score: Math.max(0, Math.min(100, Math.floor(escalationEdit.score))),
      followup_schedule_days: escalationEdit.followups
        .split(',')
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => Number.isFinite(n) && n > 0),
    })
    setBusy(null)
    if (err) {
      setError(err)
      return
    }
    setNotice('Escalation rules updated.')
    loadAgents()
  }

  const saveKb = async () => {
    if (!selected || !kbDraft || !user?.id || !isAdmin) return
    if (!kbDraft.title.trim() || !kbDraft.body.trim()) {
      setError('Title and body are required for a KB entry')
      return
    }
    setBusy('kb-save')
    const { error: err } = await upsertKbEntry(
      {
        id: kbDraft.id,
        agent_id: selected.id,
        title: kbDraft.title.trim(),
        body: kbDraft.body.trim(),
        tags: kbDraft.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        source_url: kbDraft.source_url || null,
        is_active: kbDraft.is_active,
      },
      user.id,
    )
    setBusy(null)
    if (err) {
      setError(err)
      return
    }
    setNotice('KB entry saved.')
    setKbDraft(null)
    loadDetail(selected.id)
  }

  const removeKb = async (id: string) => {
    if (!isAdmin) return
    if (!window.confirm('Remove this knowledge base entry?')) return
    setBusy(`kb-${id}`)
    const { error: err } = await deleteKbEntry(id)
    setBusy(null)
    if (err) {
      setError(err)
      return
    }
    if (selected) loadDetail(selected.id)
  }

  const onEscalate = async (id: string) => {
    setBusy(`esc-${id}`)
    const { error: err } = await escalateConversation(id)
    setBusy(null)
    if (err) {
      setError(err)
      return
    }
    if (selected) loadDetail(selected.id)
  }

  if (!isStaff) {
    return (
      <div className="p-12 text-center">
        <ShieldAlert className="mx-auto mb-2 size-8 text-amber-500" />
        <p className="text-sm text-amber-800">Support / sales / admin role required.</p>
      </div>
    )
  }

  const totals = sumMetrics(metrics)
  const escalationRate = totals.total > 0 ? Math.round((totals.escalations / totals.total) * 100) : 0
  const resolutionRate = totals.total > 0 ? Math.round((totals.resolutions / totals.total) * 100) : 0

  return (
    <div className={`${MOGZU_MODULE_CONTAINER} mx-auto w-full space-y-5 py-2`}>
      <div className="rounded-2xl border border-white/60 bg-white/55 p-5 backdrop-blur-xl shadow-[0_16px_36px_rgba(37,99,235,0.12)]">
        <AdminPageTitleRow
          title="AI Agents"
          totalLabel={`${agents.length} agents · ${totals.total} conversations in last 30 days`}
        />
        <p className="mt-1 text-[14px] text-[#64748b]">
          Configure channels, escalation rules, and knowledge base per agent.
        </p>
        <div className="mt-4">
          <AdminAiNavChips active="agents" />
        </div>
      </div>

        {notice && (
          <p className="rounded-xl border border-blue-100 bg-blue-50/90 px-4 py-2.5 text-sm text-blue-700">
            {notice}
          </p>
        )}
        {error && (
          <p className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-2.5 text-sm text-rose-700">
            {error}
          </p>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-14">
            <Loader2 className="size-6 animate-spin text-slate-400" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[240px_1fr]">
            {/* Sidebar — agent list */}
            <ul className={`${MOGZU_FILTER_SIDEBAR} space-y-1.5 !p-3`}>
              {agents.map((a) => (
                <li key={a.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(a.id)}
                    className={`${moduleNavChipClass(selectedId === a.id)} w-full justify-between !rounded-xl !px-3 !py-2`}
                    style={selectedId === a.id ? MOGZU_CHIP_ACTIVE_GRADIENT : undefined}
                  >
                    <span>
                      <span className="block font-semibold">{a.name}</span>
                      <span className="text-xs text-slate-500">{a.kind}</span>
                    </span>
                    <span
                      className={`size-2 shrink-0 rounded-full ${a.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`}
                    />
                  </button>
                </li>
              ))}
            </ul>

            {/* Detail */}
            {selected ? (
              <div className="space-y-4">
                <div className={`${MOGZU_GLASS_PANEL} p-5`}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">{selected.name}</h2>
                      <p className="text-xs text-slate-500">{selected.description}</p>
                    </div>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={toggleActive}
                        disabled={busy === 'active'}
                        className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold ${
                          selected.is_active
                            ? 'bg-rose-600 text-white hover:bg-rose-700'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        } disabled:opacity-60`}
                      >
                        {busy === 'active' ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : (
                          <Power className="size-3" />
                        )}
                        {selected.is_active ? 'Disable agent' : 'Enable agent'}
                      </button>
                    )}
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                    <div className={filterStatChipClass(true, 'blue')}>
                      <Stat label="Conversations (30d)" value={totals.total} />
                    </div>
                    <div className={filterStatChipClass(false, 'blue')}>
                      <Stat label="Escalation rate" value={`${escalationRate}%`} />
                    </div>
                    <div className={filterStatChipClass(false, 'emerald')}>
                      <Stat label="Resolution rate" value={`${resolutionRate}%`} />
                    </div>
                    <div className={filterStatChipClass(false, 'blue')}>
                      <Stat label="Leads qualified" value={totals.leads} />
                    </div>
                  </div>
                </div>

                {/* Channels */}
                <div className={`${MOGZU_GLASS_PANEL} p-5`}>
                  <h3 className="mb-3 text-sm font-semibold text-slate-900">Channels</h3>
                  <div className="flex flex-wrap gap-2">
                    {AI_AGENT_CHANNELS.map((c) => {
                      const enabled = selected.channels[c.value]
                      return (
                        <button
                          key={c.value}
                          type="button"
                          disabled={!isAdmin || busy === `ch-${c.value}`}
                          onClick={() => toggleChannel(c.value)}
                          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition ${moduleNavChipClass(enabled)}`}
                          style={enabled ? MOGZU_CHIP_ACTIVE_GRADIENT : undefined}
                        >
                          <span
                            className={`size-2 rounded-full ${enabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
                          />
                          {c.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Escalation rules */}
                <div className={`${MOGZU_GLASS_PANEL} p-5`}>
                  <h3 className="mb-3 text-sm font-semibold text-slate-900">Escalation rules</h3>
                  {escalationEdit && (
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <Field
                        label="Failed-response threshold"
                        hint="Escalate after this many unanswered turns"
                      >
                        <input
                          type="number"
                          min={1}
                          value={escalationEdit.threshold}
                          disabled={!isAdmin}
                          onChange={(e) =>
                            setEscalationEdit({ ...escalationEdit, threshold: Number(e.target.value) })
                          }
                          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                        />
                      </Field>
                      <Field label="Score threshold (0–100)">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={escalationEdit.score}
                          disabled={!isAdmin}
                          onChange={(e) =>
                            setEscalationEdit({ ...escalationEdit, score: Number(e.target.value) })
                          }
                          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                        />
                      </Field>
                      <Field label="Escalation keywords" hint="Comma-separated">
                        <input
                          type="text"
                          value={escalationEdit.keywords}
                          disabled={!isAdmin}
                          onChange={(e) =>
                            setEscalationEdit({ ...escalationEdit, keywords: e.target.value })
                          }
                          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                        />
                      </Field>
                      <Field label="Sales follow-up days" hint="Comma-separated day offsets">
                        <input
                          type="text"
                          value={escalationEdit.followups}
                          disabled={!isAdmin}
                          onChange={(e) =>
                            setEscalationEdit({ ...escalationEdit, followups: e.target.value })
                          }
                          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                        />
                      </Field>
                    </div>
                  )}
                  {isAdmin && (
                    <div className="mt-3 flex justify-end">
                      <button
                        type="button"
                        onClick={saveEscalation}
                        disabled={busy === 'escalation'}
                        className={`inline-flex items-center gap-1.5 ${MOGZU_CTA_GRADIENT} !px-3 !py-1.5 !text-xs disabled:opacity-60`}
                      >
                        {busy === 'escalation' ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : (
                          <Save className="size-3" />
                        )}
                        Save rules
                      </button>
                    </div>
                  )}
                </div>

                {/* Knowledge base */}
                <div className={`${MOGZU_GLASS_PANEL} p-5`}>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-900">
                      Knowledge base ({kb.length})
                    </h3>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => setKbDraft({ ...emptyKbDraft })}
                        className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <Plus className="size-3" />
                        Add entry
                      </button>
                    )}
                  </div>

                  {kb.length === 0 ? (
                    <p className="text-sm text-slate-500">No entries yet.</p>
                  ) : (
                    <ul className="divide-y divide-slate-100">
                      {kb.map((e) => (
                        <li key={e.id} className="flex items-start justify-between gap-3 py-3">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-slate-900">{e.title}</p>
                            <p className="mt-0.5 text-xs text-slate-500">
                              {e.tags.length > 0 ? e.tags.join(' · ') : 'No tags'} ·{' '}
                              {new Date(e.updated_at).toLocaleDateString('en-IN')}
                              {!e.is_active && ' · inactive'}
                            </p>
                            <p className="mt-2 line-clamp-2 text-sm text-slate-700">{e.body}</p>
                          </div>
                          {isAdmin && (
                            <div className="flex flex-col gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  setKbDraft({
                                    id: e.id,
                                    title: e.title,
                                    body: e.body,
                                    tags: e.tags.join(', '),
                                    source_url: e.source_url ?? '',
                                    is_active: e.is_active,
                                  })
                                }
                                className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                disabled={busy === `kb-${e.id}`}
                                onClick={() => removeKb(e.id)}
                                className="inline-flex items-center gap-1 rounded-md border border-rose-200 px-2 py-1 text-xs text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                              >
                                <Trash2 className="size-3" />
                                Remove
                              </button>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Recent conversations */}
                <div className={`${MOGZU_GLASS_PANEL} p-5`}>
                  <h3 className="mb-3 text-sm font-semibold text-slate-900">
                    <MessagesSquare className="mr-1 inline size-4" />
                    Recent conversations
                  </h3>
                  {conversations.length === 0 ? (
                    <p className="text-sm text-slate-500">No conversations yet.</p>
                  ) : (
                    <ul className="divide-y divide-slate-100">
                      {conversations.map((c) => (
                        <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-900">
                              {c.contact_name || c.contact_email || c.contact_phone || 'Anonymous'}
                            </p>
                            <p className="text-xs text-slate-500">
                              {c.channel} · {c.status} · score {c.conversation_score ?? '—'} ·{' '}
                              {new Date(c.last_message_at).toLocaleString('en-IN')}
                            </p>
                          </div>
                          {c.status === 'open' && (
                            <button
                              type="button"
                              disabled={busy === `esc-${c.id}`}
                              onClick={() => onEscalate(c.id)}
                              className="inline-flex items-center gap-1 rounded-md bg-amber-600 px-2 py-1 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-60"
                            >
                              <ArrowUpRight className="size-3" />
                              Escalate
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ) : (
              <p className={`${MOGZU_GLASS_PANEL} p-8 text-sm text-slate-500`}>Select an agent.</p>
            )}
          </div>
        )}

      {kbDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                {kbDraft.id ? 'Edit KB entry' : 'New KB entry'}
              </h2>
              <button
                type="button"
                onClick={() => setKbDraft(null)}
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-3">
              <Field label="Title">
                <input
                  type="text"
                  value={kbDraft.title}
                  onChange={(e) => setKbDraft({ ...kbDraft, title: e.target.value })}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                />
              </Field>
              <Field label="Body">
                <textarea
                  rows={5}
                  value={kbDraft.body}
                  onChange={(e) => setKbDraft({ ...kbDraft, body: e.target.value })}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                />
              </Field>
              <Field label="Tags" hint="Comma-separated">
                <input
                  type="text"
                  value={kbDraft.tags}
                  onChange={(e) => setKbDraft({ ...kbDraft, tags: e.target.value })}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                />
              </Field>
              <Field label="Source URL">
                <input
                  type="url"
                  value={kbDraft.source_url}
                  onChange={(e) => setKbDraft({ ...kbDraft, source_url: e.target.value })}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                />
              </Field>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={kbDraft.is_active}
                  onChange={(e) => setKbDraft({ ...kbDraft, is_active: e.target.checked })}
                />
                Active (agent may cite this entry)
              </label>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setKbDraft(null)}
                className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveKb}
                disabled={busy === 'kb-save'}
                className="inline-flex items-center gap-1.5 rounded-md bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1d4ed8] disabled:opacity-60"
              >
                {busy === 'kb-save' ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                Save entry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <>
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-bold text-[#0e1e3f]">{value}</p>
    </>
  )
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-slate-700">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  )
}
