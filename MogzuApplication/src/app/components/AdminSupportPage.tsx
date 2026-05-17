import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Loader2,
  Send,
  ShieldAlert,
} from 'lucide-react'
import { AdminPageTitleRow } from '@/app/components/admin/AdminPageChrome'
import { useAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import type {
  SupportTicket,
  SupportTicketNote,
  TicketAudience,
  TicketPriority,
  TicketStatus,
} from '@/lib/database.types'

type QueueRow = SupportTicket & {
  user_profiles?: { full_name: string | null; department: string | null } | null
  vendors?: { business_name: string | null } | null
  corporate_accounts?: { name: string | null } | null
}

const STATUS_META: Record<TicketStatus, { label: string; className: string }> = {
  open: { label: 'Open', className: 'bg-amber-100 text-amber-800' },
  in_progress: { label: 'In progress', className: 'bg-blue-100 text-blue-700' },
  waiting_user: { label: 'Awaiting user', className: 'bg-rose-100 text-rose-700' },
  resolved: { label: 'Resolved', className: 'bg-emerald-100 text-emerald-700' },
  closed: { label: 'Closed', className: 'bg-slate-100 text-slate-600' },
}

const PRIORITY_ORDER: TicketPriority[] = ['urgent', 'high', 'normal', 'low']
const PRIORITY_META: Record<
  TicketPriority,
  { label: string; className: string; weight: number }
> = {
  urgent: { label: 'Urgent', className: 'bg-rose-100 text-rose-700', weight: 0 },
  high: { label: 'High', className: 'bg-amber-100 text-amber-800', weight: 1 },
  normal: { label: 'Normal', className: 'bg-slate-100 text-slate-700', weight: 2 },
  low: { label: 'Low', className: 'bg-slate-50 text-slate-500', weight: 3 },
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function slaBreach(t: SupportTicket): { breached: boolean; risk: boolean; hoursLeft: number } {
  if (['resolved', 'closed'].includes(t.status)) {
    return { breached: false, risk: false, hoursLeft: 0 }
  }
  const created = new Date(t.created_at).getTime()
  const deadline = created + t.sla_hours * 3_600_000
  const hoursLeft = (deadline - Date.now()) / 3_600_000
  return { breached: hoursLeft < 0, risk: hoursLeft >= 0 && hoursLeft < 4, hoursLeft }
}

export default function AdminSupportPage() {
  const params = useParams<{ id?: string }>()
  const { role } = useAuth()
  const isSupport = role === 'support' || role === 'mogzu_admin' || role === 'account_manager'

  if (!isSupport) {
    return (
      <div className="p-12 text-center">
        <ShieldAlert className="mx-auto mb-2 size-8 text-amber-500" />
        <p className="text-sm text-amber-800">Support role required.</p>
      </div>
    )
  }

  if (params.id) return <AgentDetail ticketId={params.id} />
  return <Queue />
}

function Queue() {
  const navigate = useNavigate()
  const [tickets, setTickets] = useState<QueueRow[]>([])
  const [loading, setLoading] = useState(true)
  const [audience, setAudience] = useState<TicketAudience | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('open')
  const [search, setSearch] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await db.supportTickets.listQueue(
      audience,
      statusFilter === 'all' ? undefined : statusFilter,
    )
    setTickets((data ?? []) as QueueRow[])
    setLoading(false)
  }, [audience, statusFilter])

  useEffect(() => {
    load()
  }, [load])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    let list = tickets
    if (q) {
      list = list.filter(
        (t) =>
          t.id.toLowerCase().includes(q) ||
          t.subject.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          (t.user_profiles?.full_name ?? '').toLowerCase().includes(q) ||
          (t.vendors?.business_name ?? '').toLowerCase().includes(q),
      )
    }
    // Sort: SLA breach first, then priority weight, then created_at asc
    return [...list].sort((a, b) => {
      const sa = slaBreach(a)
      const sb = slaBreach(b)
      if (sa.breached !== sb.breached) return sa.breached ? -1 : 1
      const pw = PRIORITY_META[a.priority].weight - PRIORITY_META[b.priority].weight
      if (pw !== 0) return pw
      return a.created_at.localeCompare(b.created_at)
    })
  }, [tickets, search])

  const counts = useMemo(() => {
    return {
      total: tickets.length,
      breached: tickets.filter((t) => slaBreach(t).breached).length,
      risk: tickets.filter((t) => slaBreach(t).risk).length,
      urgent: tickets.filter((t) => t.priority === 'urgent').length,
    }
  }, [tickets])

  return (
    <div className="min-h-screen bg-[#FFFDF9]">
      <div className="mx-auto max-w-6xl px-6 py-6">
        <AdminPageTitleRow
          title="Support queue"
          subtitle="Active tickets sorted by SLA breach risk and priority. Internal notes hidden from submitters."
        />

        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Total" value={counts.total} />
          <Stat
            label="SLA breached"
            value={counts.breached}
            className={counts.breached ? 'text-rose-700' : ''}
          />
          <Stat
            label="At risk"
            value={counts.risk}
            className={counts.risk ? 'text-amber-700' : ''}
          />
          <Stat label="Urgent" value={counts.urgent} />
        </div>

        <div className="mb-3 flex flex-wrap gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ID, subject, submitter…"
            className="h-9 w-72 rounded-md border border-slate-200 px-3 text-sm"
          />
          <select
            value={audience}
            onChange={(e) => setAudience(e.target.value as TicketAudience | 'all')}
            className="h-9 rounded-md border border-slate-200 px-2 text-sm"
          >
            <option value="all">Audience: All</option>
            <option value="corporate">Corporate</option>
            <option value="vendor">Vendor</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as TicketStatus | 'all')}
            className="h-9 rounded-md border border-slate-200 px-2 text-sm"
          >
            <option value="all">Status: All</option>
            <option value="open">Open</option>
            <option value="in_progress">In progress</option>
            <option value="waiting_user">Awaiting user</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {loading ? (
            <div className="flex items-center justify-center py-14">
              <Loader2 className="size-6 animate-spin text-slate-400" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="p-12 text-center text-sm text-slate-500">No tickets match.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">Ticket</th>
                  <th className="px-4 py-3">Submitter</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">SLA</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((t) => {
                  const sla = slaBreach(t)
                  return (
                    <tr
                      key={t.id}
                      className="cursor-pointer hover:bg-slate-50/50"
                      onClick={() => navigate(`/admin/support/${t.id}`)}
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">{t.subject}</p>
                        <p className="font-mono text-[11px] text-slate-500">
                          {t.id.slice(0, 8)} · {t.audience}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        {t.audience === 'vendor'
                          ? t.vendors?.business_name ?? '—'
                          : t.user_profiles?.full_name ?? '—'}
                        {t.user_profiles?.department && (
                          <p className="text-[11px] text-slate-500">
                            {t.user_profiles.department}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{t.category}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${PRIORITY_META[t.priority].className}`}
                        >
                          {PRIORITY_META[t.priority].label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {sla.breached ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 font-medium text-rose-700">
                            <AlertTriangle className="size-3" />
                            Breached
                          </span>
                        ) : sla.risk ? (
                          <span className="text-amber-700">
                            {Math.max(0, Math.floor(sla.hoursLeft))}h left
                          </span>
                        ) : sla.hoursLeft > 0 ? (
                          <span className="text-slate-500">
                            {Math.floor(sla.hoursLeft)}h
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_META[t.status].className}`}
                        >
                          {STATUS_META[t.status].label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

function AgentDetail({ ticketId }: { ticketId: string }) {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [ticket, setTicket] = useState<SupportTicket | null>(null)
  const [notes, setNotes] = useState<SupportTicketNote[]>([])
  const [loading, setLoading] = useState(true)
  const [reply, setReply] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const [posting, setPosting] = useState(false)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const [tRes, nRes] = await Promise.all([
      db.supportTickets.getById(ticketId),
      db.supportTicketNotes.listByTicket(ticketId),
    ])
    if (tRes.data) setTicket(tRes.data as SupportTicket)
    setNotes((nRes.data ?? []) as SupportTicketNote[])
    setLoading(false)
  }, [ticketId])

  useEffect(() => {
    load()
  }, [load])

  const handleStatus = async (next: TicketStatus) => {
    if (!ticket) return
    setBusy(true)
    const patch: Partial<SupportTicket> = { status: next }
    if (next === 'resolved') patch.resolved_at = new Date().toISOString()
    if (next === 'closed') patch.closed_at = new Date().toISOString()
    await db.supportTickets.update(ticket.id, patch)
    setBusy(false)
    load()
  }

  const handleReply = async () => {
    if (!profile || !reply.trim()) return
    setPosting(true)
    await db.supportTicketNotes.create({
      ticket_id: ticketId,
      author_id: profile.id,
      body: reply.trim(),
      is_internal: isInternal,
    })
    setReply('')
    setPosting(false)
    load()
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFFDF9]">
        <Loader2 className="size-6 animate-spin text-slate-400" />
      </div>
    )
  }
  if (!ticket) {
    return <p className="p-12 text-center text-sm text-slate-500">Ticket not found.</p>
  }

  const sla = slaBreach(ticket)

  return (
    <div className="min-h-screen bg-[#FFFDF9]">
      <div className="mx-auto max-w-4xl px-6 py-6">
        <button
          type="button"
          onClick={() => navigate('/admin/support')}
          className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800"
        >
          <ArrowLeft className="size-4" />
          Back to queue
        </button>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Ticket {ticket.id.slice(0, 8)} · {ticket.category} · {ticket.audience}
              </p>
              <h1 className="mt-1 text-xl font-bold text-slate-900">{ticket.subject}</h1>
              <p className="mt-1 text-xs text-slate-500">
                Opened {formatDate(ticket.created_at)} ·{' '}
                <span className={`rounded-full px-2 py-0.5 ${PRIORITY_META[ticket.priority].className}`}>
                  {PRIORITY_META[ticket.priority].label}
                </span>{' '}
                · SLA {ticket.sla_hours}h
                {sla.breached && (
                  <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 font-medium text-rose-700">
                    <AlertTriangle className="size-3" />
                    Breached
                  </span>
                )}
              </p>
            </div>
            <select
              value={ticket.status}
              onChange={(e) => handleStatus(e.target.value as TicketStatus)}
              disabled={busy}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${STATUS_META[ticket.status].className}`}
            >
              {(['open', 'in_progress', 'waiting_user', 'resolved', 'closed'] as const).map(
                (s) => (
                  <option key={s} value={s}>
                    {STATUS_META[s].label}
                  </option>
                ),
              )}
            </select>
          </div>

          <p className="mt-4 whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm text-slate-800">
            {ticket.body}
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 text-xs">
            <p>
              <strong className="text-slate-500">Page:</strong> {ticket.context_url ?? '—'}
            </p>
            <p>
              <strong className="text-slate-500">Role:</strong> {ticket.context_role ?? '—'}
            </p>
            <p className="col-span-2">
              <strong className="text-slate-500">User agent:</strong>{' '}
              {ticket.context_user_agent ?? '—'}
            </p>
            {ticket.related_booking_id && (
              <p>
                <strong className="text-slate-500">Booking:</strong>{' '}
                <span className="font-mono">{ticket.related_booking_id.slice(0, 8)}</span>
              </p>
            )}
            {ticket.related_payout_id && (
              <p>
                <strong className="text-slate-500">Payout:</strong>{' '}
                <span className="font-mono">{ticket.related_payout_id.slice(0, 8)}</span>
              </p>
            )}
          </div>

          {ticket.csat_score && (
            <p className="mt-3 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
              <CheckCircle2 className="size-3" />
              CSAT: {ticket.csat_score}/5
              {ticket.csat_feedback ? ` — "${ticket.csat_feedback}"` : ''}
            </p>
          )}
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Notes
          </h2>
          {notes.length === 0 ? (
            <p className="text-sm text-slate-500">No notes yet.</p>
          ) : (
            <ul className="space-y-3">
              {notes.map((n) => (
                <li
                  key={n.id}
                  className={`rounded-xl border p-3 ${
                    n.is_internal
                      ? 'border-amber-200 bg-amber-50'
                      : 'border-slate-100 bg-slate-50'
                  }`}
                >
                  <p className="flex items-center gap-1 text-[11px] text-slate-500">
                    {n.is_internal && <Lock className="size-3 text-amber-600" />}
                    {n.is_internal ? 'Internal note · ' : ''}
                    {n.author_id === profile?.id ? 'You' : n.author_id.slice(0, 8)} ·{' '}
                    {formatDate(n.created_at)}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{n.body}</p>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-4">
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              rows={3}
              placeholder={isInternal ? 'Internal note (hidden from submitter)…' : 'Reply to submitter…'}
              className={`w-full rounded-xl border px-3 py-2.5 text-sm ${
                isInternal
                  ? 'border-amber-200 bg-amber-50'
                  : 'border-slate-200 bg-slate-50'
              }`}
            />
            <div className="mt-2 flex items-center justify-between">
              <label className="inline-flex items-center gap-2 text-xs text-slate-600">
                <input
                  type="checkbox"
                  checked={isInternal}
                  onChange={(e) => setIsInternal(e.target.checked)}
                  className="size-4 rounded border-slate-300"
                />
                Internal note (hidden from submitter)
              </label>
              <button
                type="button"
                onClick={handleReply}
                disabled={posting || !reply.trim()}
                className="inline-flex items-center gap-1.5 rounded-md bg-[#2563eb] px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {posting && <Loader2 className="size-3 animate-spin" />}
                <Send className="size-3" />
                Post
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Stat({
  label,
  value,
  className = '',
}: {
  label: string
  value: number
  className?: string
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 text-xl font-bold ${className || 'text-slate-900'}`}>{value}</p>
    </div>
  )
}
