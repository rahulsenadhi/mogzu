import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router'
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Loader2,
  MessageSquare,
  Plus,
  Send,
} from 'lucide-react'
import { SharedHeader } from './layouts/SharedHeader'
import { SharedSidebar } from './layouts/SharedSidebar'
import { MogzuCorporateScrollSurface } from './layouts/MogzuCorporateScrollSurface'
import { useAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import type {
  SupportTicket,
  SupportTicketNote,
  TicketPriority,
  TicketStatus,
} from '@/lib/database.types'

const CATEGORIES_CORP = [
  'Booking issue',
  'Payment / refund',
  'Approval workflow',
  'Wallet',
  'Account / login',
  'Gifting',
  'Other',
]
const CATEGORIES_VENDOR = [
  'Payout dispute',
  'Listing approval',
  'Booking dispute',
  'Onboarding / KYC',
  'Account / login',
  'Other',
]

const STATUS_META: Record<TicketStatus, { label: string; className: string }> = {
  open: { label: 'Open', className: 'bg-amber-100 text-amber-800' },
  in_progress: { label: 'In progress', className: 'bg-blue-100 text-blue-700' },
  waiting_user: { label: 'Awaiting you', className: 'bg-rose-100 text-rose-700' },
  resolved: { label: 'Resolved', className: 'bg-emerald-100 text-emerald-700' },
  closed: { label: 'Closed', className: 'bg-slate-100 text-slate-600' },
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

export default function SupportPage({
  audience = 'corporate',
}: {
  audience?: 'corporate' | 'vendor'
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams<{ id?: string }>()
  const { profile, corporateId, vendorId, role } = useAuth()

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [composeOpen, setComposeOpen] = useState(false)

  const load = useCallback(async () => {
    if (!profile) return
    setLoading(true)
    const { data } = await db.supportTickets.listMine(profile.id)
    setTickets(((data ?? []) as SupportTicket[]).filter((t) => t.audience === audience))
    setLoading(false)
  }, [profile, audience])

  useEffect(() => {
    load()
  }, [load])

  if (params.id) {
    return <TicketDetail ticketId={params.id} />
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#FFFDF9]">
      <SharedSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <SharedHeader onMobileMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <MogzuCorporateScrollSurface className="py-8">
          <div className="mx-auto max-w-4xl px-8">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="flex items-center gap-2 text-2xl font-bold text-[#0e1e3f]">
                  <MessageSquare className="size-5" />
                  Support
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Raise a ticket — we typically respond within 24 hours. Critical issues
                  (payments, refunds, outages) get priority handling.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setComposeOpen(true)}
                className="inline-flex items-center gap-2 rounded-md bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <Plus className="size-4" />
                New ticket
              </button>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              {loading ? (
                <div className="flex items-center justify-center py-14">
                  <Loader2 className="size-6 animate-spin text-slate-400" />
                </div>
              ) : tickets.length === 0 ? (
                <p className="p-12 text-center text-sm text-slate-500">
                  No tickets yet.
                </p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {tickets.map((t) => (
                    <li key={t.id}>
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            audience === 'vendor'
                              ? `/vendor/support/${t.id}`
                              : `/support/${t.id}`,
                          )
                        }
                        className="block w-full px-4 py-3 text-left transition hover:bg-slate-50"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-medium text-slate-900">{t.subject}</p>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_META[t.status].className}`}
                          >
                            {STATUS_META[t.status].label}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {t.category} · {formatDate(t.created_at)} · SLA {t.sla_hours}h
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </MogzuCorporateScrollSurface>
      </div>

      {composeOpen && profile && (
        <ComposeTicketModal
          audience={audience}
          submitterId={profile.id}
          corporateId={corporateId}
          vendorId={vendorId}
          contextUrl={location.pathname}
          contextRole={role}
          onClose={() => setComposeOpen(false)}
          onCreated={() => {
            setComposeOpen(false)
            load()
          }}
        />
      )}
    </div>
  )
}

function ComposeTicketModal({
  audience,
  submitterId,
  corporateId,
  vendorId,
  contextUrl,
  contextRole,
  onClose,
  onCreated,
}: {
  audience: 'corporate' | 'vendor'
  submitterId: string
  corporateId: string | null
  vendorId: string | null
  contextUrl: string
  contextRole: string | null
  onClose: () => void
  onCreated: () => void
}) {
  const categories = audience === 'vendor' ? CATEGORIES_VENDOR : CATEGORIES_CORP
  const [category, setCategory] = useState(categories[0])
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [priority, setPriority] = useState<TicketPriority>('normal')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!subject.trim() || !body.trim()) {
      setError('Subject and description are required.')
      return
    }
    setSubmitting(true)
    setError('')
    const { error: insErr } = await db.supportTickets.create({
      audience,
      submitter_id: submitterId,
      corporate_id: audience === 'corporate' ? corporateId : null,
      vendor_id: audience === 'vendor' ? vendorId : null,
      category,
      subject: subject.trim(),
      body: body.trim(),
      status: 'open',
      priority,
      sla_hours: priority === 'urgent' ? 4 : priority === 'high' ? 12 : 24,
      context_url: contextUrl,
      context_role: contextRole,
      context_last_action: null,
      context_user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      assigned_to: null,
      related_booking_id: null,
      related_payout_id: null,
      csat_score: null,
      csat_feedback: null,
      resolved_at: null,
      closed_at: null,
    })
    setSubmitting(false)
    if (insErr) setError(insErr.message)
    else onCreated()
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-black/40 p-4">
      <div className="my-8 w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-bold text-slate-900">New support ticket</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
          >
            ✕
          </button>
        </div>
        <div className="space-y-4 px-6 py-5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TicketPriority)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
              >
                <option value="low">Low (48h)</option>
                <option value="normal">Normal (24h)</option>
                <option value="high">High (12h)</option>
                <option value="urgent">Urgent (4h)</option>
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Subject <span className="text-rose-500">*</span>
            </label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Short summary"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              placeholder="Detail what happened, expected outcome, and any reference IDs."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
            />
          </div>
          <p className="rounded-lg bg-slate-100 px-3 py-2 text-[11px] text-slate-600">
            Auto-captured context: page {contextUrl}, role {contextRole ?? '—'}, your browser. Helps
            us debug faster.
          </p>
          {error && (
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#1D4ED8] disabled:opacity-60"
            >
              {submitting && <Loader2 className="size-4 animate-spin" />}
              <Send className="size-4" />
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function TicketDetail({ ticketId }: { ticketId: string }) {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [ticket, setTicket] = useState<SupportTicket | null>(null)
  const [notes, setNotes] = useState<SupportTicketNote[]>([])
  const [loading, setLoading] = useState(true)
  const [reply, setReply] = useState('')
  const [posting, setPosting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const [tRes, nRes] = await Promise.all([
      db.supportTickets.getById(ticketId),
      db.supportTicketNotes.listByTicket(ticketId),
    ])
    if (tRes.data) setTicket(tRes.data as SupportTicket)
    setNotes(((nRes.data ?? []) as SupportTicketNote[]).filter((n) => !n.is_internal))
    setLoading(false)
  }, [ticketId])

  useEffect(() => {
    load()
  }, [load])

  const handleReply = async () => {
    if (!profile || !reply.trim()) return
    setPosting(true)
    await db.supportTicketNotes.create({
      ticket_id: ticketId,
      author_id: profile.id,
      body: reply.trim(),
      is_internal: false,
    })
    setReply('')
    setPosting(false)
    load()
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#FFFDF9]">
      <SharedSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <SharedHeader onMobileMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <MogzuCorporateScrollSurface className="py-8">
          <div className="mx-auto max-w-3xl px-8">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800"
            >
              <ArrowLeft className="size-4" />
              Back
            </button>
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="size-6 animate-spin text-slate-400" />
              </div>
            ) : !ticket ? (
              <p className="text-sm text-rose-700">Ticket not found.</p>
            ) : (
              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Ticket {ticket.id.slice(0, 8)} · {ticket.category}
                      </p>
                      <h1 className="mt-1 text-xl font-bold text-slate-900">
                        {ticket.subject}
                      </h1>
                      <p className="mt-1 text-xs text-slate-500">
                        Opened {formatDate(ticket.created_at)} · SLA {ticket.sla_hours}h ·
                        Priority {ticket.priority}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_META[ticket.status].className}`}
                    >
                      {STATUS_META[ticket.status].label}
                    </span>
                  </div>
                  <p className="mt-4 whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm text-slate-800">
                    {ticket.body}
                  </p>
                  {ticket.status === 'resolved' && !ticket.csat_score && (
                    <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                      <p className="text-sm font-semibold text-emerald-800">
                        How was your support experience?
                      </p>
                      <div className="mt-2 flex gap-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={async () => {
                              await db.supportTickets.update(ticket.id, {
                                csat_score: n,
                                status: 'closed',
                                closed_at: new Date().toISOString(),
                              })
                              load()
                            }}
                            className="size-9 rounded-full bg-white text-sm font-medium text-emerald-800 transition hover:bg-emerald-100"
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                      <p className="mt-1 text-[11px] text-emerald-700">
                        1 = poor · 5 = excellent
                      </p>
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                    Conversation
                  </h2>
                  {notes.length === 0 ? (
                    <p className="text-sm text-slate-500">No replies yet.</p>
                  ) : (
                    <ul className="space-y-3">
                      {notes.map((n) => (
                        <li
                          key={n.id}
                          className="rounded-xl border border-slate-100 bg-slate-50 p-3"
                        >
                          <p className="text-[11px] text-slate-500">
                            {n.author_id === profile?.id ? 'You' : 'Support'} ·{' '}
                            {formatDate(n.created_at)}
                          </p>
                          <p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">
                            {n.body}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}

                  {ticket.status !== 'closed' && (
                    <div className="mt-4">
                      <textarea
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        rows={3}
                        placeholder="Add a reply..."
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
                      />
                      <div className="mt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={handleReply}
                          disabled={posting || !reply.trim()}
                          className="inline-flex items-center gap-1.5 rounded-md bg-[#2563eb] px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                        >
                          {posting && <Loader2 className="size-3 animate-spin" />}
                          <Send className="size-3" />
                          Send reply
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </MogzuCorporateScrollSurface>
      </div>
    </div>
  )
}

export function VendorSupportPage() {
  return <SupportPage audience="vendor" />
}
