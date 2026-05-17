import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import {
  ArrowLeft,
  Camera,
  Check,
  FileText,
  Loader2,
  MapPin,
  ShieldAlert,
} from 'lucide-react'
import { MogzuLogo } from '@/app/components/branding/MogzuLogo'
import { useAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import { supabase } from '@/lib/supabase'
import { storageService } from '@/lib/storage'
import { findStage, getStagePipeline, type TrackerStage } from '@/lib/bookingTracker'
import type {
  Booking,
  BookingPaymentMilestone,
  BookingProofRecord,
  BookingStatusEvent,
  ModuleId,
} from '@/lib/database.types'

type BookingDetail = Booking & {
  listings?: { title: string | null; location_city: string | null } | null
  corporate_accounts?: { name: string | null } | null
}

function fmt(iso: string | null): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

function fmtMoney(n: number | null | undefined): string {
  if (n == null) return '—'
  return `₹ ${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
}

export default function BookingTrackerPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { profile, role } = useAuth()
  const isAdmin = role === 'mogzu_admin' || role === 'support'

  const [booking, setBooking] = useState<BookingDetail | null>(null)
  const [events, setEvents] = useState<BookingStatusEvent[]>([])
  const [proof, setProof] = useState<BookingProofRecord | null>(null)
  const [milestones, setMilestones] = useState<BookingPaymentMilestone[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<'status' | 'proof'>('status')
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    const [{ data: b, error: bErr }, { data: evs }, { data: pr }, { data: ms }] = await Promise.all([
      supabase
        .from('bookings')
        .select('*, listings(title, location_city), corporate_accounts(name)')
        .eq('id', id)
        .maybeSingle(),
      db.bookingTracker.listEvents(id),
      db.bookingProof.getRecord(id),
      db.bookingProof.listMilestones(id),
    ])
    if (bErr || !b) {
      setError(bErr?.message ?? 'Booking not found.')
      setLoading(false)
      return
    }
    setBooking(b as BookingDetail)
    setEvents((evs ?? []) as BookingStatusEvent[])
    setProof((pr as BookingProofRecord | null) ?? null)
    setMilestones((ms ?? []) as BookingPaymentMilestone[])
    setLoading(false)
  }, [id])

  useEffect(() => {
    void load()
  }, [load])

  const handleAdminOverride = async (event: BookingStatusEvent) => {
    if (!profile) return
    const reason = window.prompt(`Override "${event.stage}" — provide reason (logged):`)
    if (!reason || !reason.trim()) return
    setBusyId(event.id)
    const { error: e } = await db.bookingTracker.adminOverride(event.id, reason.trim())
    if (e) setError(e.message)
    else {
      await db.userActivity.log(profile.id, 'booking.proof_override', 'booking_status_events', event.id, {
        booking_id: event.booking_id,
        stage: event.stage,
        reason: reason.trim(),
      })
      await load()
    }
    setBusyId(null)
  }

  const handleAcceptTerms = async () => {
    if (!profile || !booking) return
    setBusyId('accept')
    const { error: e } = await db.bookingProof.accept(
      booking.id,
      profile.id,
      '', // server-side IP capture not wired; placeholder for parity with DB schema
      typeof navigator !== 'undefined' ? navigator.userAgent : '',
    )
    if (e) setError(e.message)
    else {
      await db.userActivity.log(profile.id, 'booking.terms_accepted', 'booking_proof_records', booking.id, {})
      await load()
    }
    setBusyId(null)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-slate-400" />
      </div>
    )
  }
  if (error || !booking) {
    return (
      <div className="mx-auto max-w-md p-12 text-center">
        <ShieldAlert className="mx-auto mb-2 size-8 text-amber-500" />
        <p className="text-sm text-rose-700">{error || 'Booking not available.'}</p>
      </div>
    )
  }

  const pipeline = getStagePipeline(booking.module as ModuleId)
  const eventByStage = new Map(events.map((e) => [e.stage, e]))

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <header className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="size-3.5" /> Back
        </button>
        <MogzuLogo className="h-7" />
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h1 className="text-base font-semibold text-slate-900">
          {booking.listings?.title ?? 'Booking'}
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          {booking.corporate_accounts?.name ?? '—'} · {booking.module} · {fmt(booking.start_time)}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
          <span className="rounded-full bg-slate-100 px-2 py-0.5 capitalize text-slate-700">
            {booking.status}
          </span>
          <span className="text-slate-500">{fmtMoney(booking.total_amount)}</span>
        </div>
      </section>

      <nav className="my-4 flex gap-2">
        <button
          type="button"
          onClick={() => setTab('status')}
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            tab === 'status' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600'
          }`}
        >
          Status tracker
        </button>
        <button
          type="button"
          onClick={() => setTab('proof')}
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            tab === 'proof' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600'
          }`}
        >
          Proof of conditions
        </button>
      </nav>

      {tab === 'status' && (
        <section className="space-y-3">
          {pipeline.map((stage) => {
            const ev = eventByStage.get(stage.key)
            return <StageRow key={stage.key} stage={stage} event={ev} isAdmin={isAdmin} busy={busyId === ev?.id} onOverride={handleAdminOverride} />
          })}
          {pipeline.length === 0 && (
            <p className="text-xs text-slate-500">No pipeline defined for this module.</p>
          )}
        </section>
      )}

      {tab === 'proof' && (
        <ProofTab
          booking={booking}
          proof={proof}
          milestones={milestones}
          onAccept={handleAcceptTerms}
          busy={busyId === 'accept'}
          canEdit={
            // Corporate side can accept; admin can edit free fields. Vendor is
            // read-only via RLS.
            profile?.corporate_id === booking.corporate_id || isAdmin
          }
        />
      )}
    </div>
  )
}

function StageRow({
  stage,
  event,
  isAdmin,
  busy,
  onOverride,
}: {
  stage: TrackerStage
  event: BookingStatusEvent | undefined
  isAdmin: boolean
  busy: boolean
  onOverride: (e: BookingStatusEvent) => void
}) {
  const submitted = event?.otp_verified_at != null
  return (
    <div
      className={`rounded-2xl border p-4 shadow-sm ${
        submitted ? 'border-emerald-200 bg-emerald-50/40' : 'border-slate-200 bg-white'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-medium text-slate-900">
            {submitted && <Check className="size-3 text-emerald-700" />}
            {stage.label}
          </p>
          <p className="text-[11px] text-slate-500">
            Proof: {stage.proofRequired}
            {stage.helper && ` · ${stage.helper}`}
          </p>
        </div>
        {event && isAdmin && (
          <button
            type="button"
            disabled={busy}
            onClick={() => onOverride(event)}
            className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-900 hover:bg-amber-100 disabled:opacity-50"
          >
            Override
          </button>
        )}
      </div>

      {event && (
        <div className="mt-3 grid grid-cols-2 gap-3 text-[11px] text-slate-700">
          <div>Submitted: {fmt(event.submitted_at)}</div>
          {event.gps_lat != null && event.gps_lng != null && (
            <div>
              <MapPin className="mr-1 inline size-3" />
              {event.gps_lat.toFixed(5)}, {event.gps_lng.toFixed(5)}
            </div>
          )}
          {event.photo_path && (
            <div className="col-span-2">
              <img
                src={storageService.bookingProof.getUrl(event.photo_path)}
                alt={`Proof for ${stage.label}`}
                className="mt-1 max-h-40 rounded-md object-cover"
              />
            </div>
          )}
          {event.admin_override_reason && (
            <div className="col-span-2 rounded-md border border-amber-200 bg-amber-50 p-2 text-[11px] text-amber-900">
              Admin override: {event.admin_override_reason}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ProofTab({
  booking,
  proof,
  milestones,
  onAccept,
  busy,
  canEdit,
}: {
  booking: BookingDetail
  proof: BookingProofRecord | null
  milestones: BookingPaymentMilestone[]
  onAccept: () => void
  busy: boolean
  canEdit: boolean
}) {
  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">Agreed scope</h3>
        <p className="mt-1 whitespace-pre-wrap text-xs text-slate-700">
          {proof?.agreed_scope ?? booking.purpose_note ?? '—'}
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">Price history</h3>
        <dl className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-700">
          <dt className="text-slate-500">Quoted</dt>
          <dd>{fmtMoney(proof?.quoted_price ?? booking.base_amount)}</dd>
          <dt className="text-slate-500">Final agreed</dt>
          <dd>{fmtMoney(proof?.final_price ?? booking.total_amount)}</dd>
        </dl>
        {proof?.negotiation_history && proof.negotiation_history.length > 0 && (
          <ol className="mt-3 space-y-1 text-[11px] text-slate-600">
            {proof.negotiation_history.map((n, i) => (
              <li key={i}>
                <strong className="capitalize text-slate-800">{n.party}</strong> · {fmt(n.at)} — {n.note}
                {n.price != null ? ` (₹ ${n.price})` : ''}
              </li>
            ))}
          </ol>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">Payment milestones</h3>
        {milestones.length === 0 ? (
          <p className="mt-1 text-xs text-slate-500">No milestones recorded.</p>
        ) : (
          <ul className="mt-2 divide-y divide-slate-100 text-xs">
            {milestones.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-2 py-2">
                <div>
                  <p className="capitalize text-slate-800">
                    {m.kind.replace('_', ' ')}
                    {m.percentage != null ? ` · ${m.percentage}%` : ''}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Due {fmt(m.due_at)} · Paid {fmt(m.paid_at)}
                  </p>
                </div>
                <p className="font-medium text-slate-800">{fmtMoney(m.amount)}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">Digital acceptance</h3>
        {proof?.accepted_at ? (
          <p className="mt-1 text-xs text-slate-700">
            Accepted {fmt(proof.accepted_at)} by user {proof.accepted_by?.slice(0, 8) ?? '—'}.
            <br />
            User-agent: <code className="text-[10px]">{proof.accepted_user_agent}</code>
          </p>
        ) : canEdit ? (
          <button
            type="button"
            onClick={onAccept}
            disabled={busy}
            className="mt-2 inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {busy && <Loader2 className="size-3 animate-spin" />}
            <Camera className="size-3" /> Accept terms now
          </button>
        ) : (
          <p className="mt-1 text-xs text-slate-500">Awaiting corporate acceptance.</p>
        )}
      </div>

      {proof?.po_document_path && (
        <Link
          to={storageService.documents.getUrl(proof.po_document_path)}
          target="_blank"
          className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
        >
          <FileText className="size-3" /> Open PO document
        </Link>
      )}
    </section>
  )
}
