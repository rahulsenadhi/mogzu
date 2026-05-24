import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import {
  ArrowLeft,
  Camera,
  Check,
  FileText,
  Loader2,
  MapPin,
  Printer,
  ShieldAlert,
} from 'lucide-react'
import { MogzuLogo } from '@/app/components/branding/MogzuLogo'
import { useAuth } from '@/lib/auth'
import { canAccessBookingByRole } from '@/lib/bookingScope'
import { db } from '@/lib/db'
import { supabase } from '@/lib/supabase'
import { storageService } from '@/lib/storage'
import { getStagePipeline, type TrackerStage } from '@/lib/bookingTracker'
import { BookingProofCaptureCard } from '@/app/components/booking/BookingProofCaptureCard'
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
  vendors?: { id: string; user_id: string | null } | null
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

function isoToLocalInput(iso: string | null | undefined): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`
}

function localInputToIso(local: string): string | null {
  if (!local.trim()) return null
  const d = new Date(local)
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString()
}

function syntheticStageEvent(booking: BookingDetail, stage: string, at: string): BookingStatusEvent {
  return {
    id: `synthetic-${booking.id}-${stage}`,
    booking_id: booking.id,
    stage,
    otp_code: null,
    otp_sent_to: null,
    otp_verified_at: at,
    photo_path: null,
    gps_lat: null,
    gps_lng: null,
    submitted_by: null,
    submitted_at: at,
    notes: null,
    admin_override_reason: null,
    created_at: at,
    updated_at: at,
  }
}

function deriveSyntheticEvents(booking: BookingDetail, existing: BookingStatusEvent[]): BookingStatusEvent[] {
  const out: BookingStatusEvent[] = []
  const seen = new Set(existing.map((e) => e.stage))
  const at = booking.updated_at ?? booking.created_at ?? new Date().toISOString()
  const add = (stage: string) => {
    if (seen.has(stage)) return
    out.push(syntheticStageEvent(booking, stage, at))
    seen.add(stage)
  }

  if (booking.module === 'gifting') {
    if (booking.status !== 'draft' && booking.status !== 'pending_approval') add('order_placed')
    if (
      booking.fulfilment_stage === 'packed' ||
      booking.fulfilment_stage === 'dispatched' ||
      booking.fulfilment_stage === 'out_for_delivery' ||
      booking.fulfilment_stage === 'delivered' ||
      booking.fulfilment_stage === 'returned'
    ) {
      add('in_production')
    }
    if (
      booking.fulfilment_stage === 'dispatched' ||
      booking.fulfilment_stage === 'out_for_delivery' ||
      booking.fulfilment_stage === 'delivered' ||
      booking.fulfilment_stage === 'returned'
    ) {
      add('dispatched')
    }
    if (
      booking.fulfilment_stage === 'out_for_delivery' ||
      booking.fulfilment_stage === 'delivered' ||
      booking.fulfilment_stage === 'returned'
    ) {
      add('out_for_delivery')
    }
    if (
      booking.fulfilment_stage === 'delivered' ||
      booking.fulfilment_stage === 'returned' ||
      booking.status === 'completed'
    ) {
      add('delivered')
    }
    if (booking.status === 'completed') add('confirmed')
    return out
  }

  if (
    booking.status === 'pending_vendor' ||
    booking.status === 'confirmed' ||
    booking.status === 'completed' ||
    booking.status === 'disputed'
  ) {
    add('booking_confirmed')
  }
  if (booking.status === 'completed') add('booking_closed')
  return out
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
        .select('*, listings(title, location_city), corporate_accounts(name), vendors(id, user_id)')
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
    const scope = await canAccessBookingByRole({
      booking: b as BookingDetail,
      role,
      profile,
      requireFieldAgentActive: true,
    })
    if (!scope.ok) {
      setError(scope.reason ?? 'Access denied.')
      setLoading(false)
      return
    }
    setBooking(b as BookingDetail)
    setEvents((evs ?? []) as BookingStatusEvent[])
    setProof((pr as BookingProofRecord | null) ?? null)
    setMilestones((ms ?? []) as BookingPaymentMilestone[])
    setLoading(false)
  }, [id, profile, role])

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
  const syntheticEvents = deriveSyntheticEvents(booking, events)
  const eventByStage = new Map([...events, ...syntheticEvents].map((e) => [e.stage, e]))
  const isVendorOfBooking = profile?.id != null && booking.vendors?.user_id === profile.id
  const isFieldAgent = role === 'field_agent'
  const canSubmitProof = isAdmin || isVendorOfBooking || isFieldAgent

  return (
    <div className="mx-auto max-w-3xl px-6 py-8 print:max-w-none print:px-0 print:py-0">
      <style>{`
        @media print {
          body { background: white !important; }
          .print\\:hidden, [data-no-print] { display: none !important; }
          .print\\:break-before-page { break-before: page; }
        }
      `}</style>
      <header className="mb-6 flex items-center justify-between print:hidden">
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

      <nav className="my-4 flex flex-wrap items-center gap-2 print:hidden">
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
        {tab === 'proof' && (
          <button
            type="button"
            onClick={() => window.print()}
            className="ml-auto inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <Printer className="size-3" />
            Download PDF
          </button>
        )}
      </nav>

      {tab === 'status' && (
        <section className="space-y-3 print:hidden">
          {pipeline.map((stage) => {
            const ev = eventByStage.get(stage.key)
            return <StageRow key={stage.key} stage={stage} event={ev} isAdmin={isAdmin} busy={busyId === ev?.id} onOverride={handleAdminOverride} />
          })}
          {pipeline.length === 0 && (
            <p className="text-xs text-slate-500">No pipeline defined for this module.</p>
          )}
          {canSubmitProof && profile && (
            <BookingProofCaptureCard
              bookingId={booking.id}
              module={booking.module as ModuleId}
              submittedKeys={events.map((e) => e.stage)}
              existingEvents={events}
              submittedBy={profile.id}
              onSubmitted={() => void load()}
            />
          )}
        </section>
      )}

      {tab === 'proof' && (
        <ProofTab
          booking={booking}
          proof={proof}
          milestones={milestones}
          onAccept={handleAcceptTerms}
          onProofUpdated={load}
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
  onProofUpdated,
  busy,
  canEdit,
}: {
  booking: BookingDetail
  proof: BookingProofRecord | null
  milestones: BookingPaymentMilestone[]
  onAccept: () => void
  onProofUpdated: () => Promise<void>
  busy: boolean
  canEdit: boolean
}) {
  const [agreedScope, setAgreedScope] = useState('')
  const [quotedPrice, setQuotedPrice] = useState('')
  const [finalPrice, setFinalPrice] = useState('')
  const [negotiationText, setNegotiationText] = useState('')
  const [poPath, setPoPath] = useState<string | null>(null)
  const [milestoneRows, setMilestoneRows] = useState<
    Array<{
      id?: string
      kind: BookingPaymentMilestone['kind']
      percentage: string
      amount: string
      dueAt: string
      paidAt: string
      paidReference: string
    }>
  >([])
  const [saveBusy, setSaveBusy] = useState(false)
  const [milestoneBusy, setMilestoneBusy] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saveOk, setSaveOk] = useState('')

  useEffect(() => {
    setAgreedScope(proof?.agreed_scope ?? booking.purpose_note ?? '')
    setQuotedPrice(
      proof?.quoted_price != null
        ? String(proof.quoted_price)
        : booking.base_amount != null
          ? String(booking.base_amount)
          : '',
    )
    setFinalPrice(
      proof?.final_price != null
        ? String(proof.final_price)
        : booking.total_amount != null
          ? String(booking.total_amount)
          : '',
    )
    if (proof?.negotiation_history?.length) {
      setNegotiationText(
        proof.negotiation_history
          .map((n) => `${n.party} | ${n.note}${n.price != null ? ` | ${n.price}` : ''}`)
          .join('\n'),
      )
    } else {
      setNegotiationText('')
    }
    setPoPath(proof?.po_document_path ?? null)
    setMilestoneRows(
      milestones.map((m) => ({
        id: m.id,
        kind: m.kind,
        percentage: m.percentage != null ? String(m.percentage) : '',
        amount: m.amount != null ? String(m.amount) : '',
        dueAt: isoToLocalInput(m.due_at),
        paidAt: isoToLocalInput(m.paid_at),
        paidReference: m.paid_reference ?? '',
      })),
    )
    setSaveError('')
    setSaveOk('')
  }, [proof, milestones, booking.purpose_note, booking.base_amount, booking.total_amount])

  const parseNegotiation = () => {
    const trimmed = negotiationText.trim()
    if (!trimmed) return [] as BookingProofRecord['negotiation_history']
    return trimmed
      .split('\n')
      .map((row) => row.trim())
      .filter(Boolean)
      .map((row) => {
        const [partyRaw, noteRaw, priceRaw] = row.split('|').map((x) => x.trim())
        const party = partyRaw === 'vendor' || partyRaw === 'admin' ? partyRaw : 'corporate'
        const priceNum = priceRaw ? Number(priceRaw) : undefined
        return {
          at: new Date().toISOString(),
          party: party as 'corporate' | 'vendor' | 'admin',
          note: noteRaw || row,
          ...(Number.isFinite(priceNum) ? { price: priceNum } : {}),
        }
      })
  }

  const handlePoUpload = async (file: File) => {
    setSaveError('')
    setSaveOk('')
    setSaveBusy(true)
    const upload = await storageService.documents.upload(`booking-proof/${booking.id}`, file)
    setSaveBusy(false)
    if (upload.error) {
      setSaveError(upload.error)
      return
    }
    setPoPath(upload.path)
    setSaveOk('PO document uploaded. Click save to persist.')
  }

  const handleSaveProof = async () => {
    setSaveError('')
    setSaveOk('')
    const quoted = quotedPrice.trim() ? Number(quotedPrice) : null
    const final = finalPrice.trim() ? Number(finalPrice) : null
    if (quotedPrice.trim() && !Number.isFinite(quoted)) {
      setSaveError('Quoted price must be a valid number.')
      return
    }
    if (finalPrice.trim() && !Number.isFinite(final)) {
      setSaveError('Final agreed price must be a valid number.')
      return
    }
    setSaveBusy(true)
    const { error } = await db.bookingProof.upsertRecord(booking.id, {
      agreed_scope: agreedScope.trim() || null,
      quoted_price: quoted,
      final_price: final,
      negotiation_history: parseNegotiation(),
      po_document_path: poPath,
    })
    setSaveBusy(false)
    if (error) {
      setSaveError(error.message)
      return
    }
    setSaveOk('Proof of conditions saved.')
    await onProofUpdated()
  }

  const updateMilestoneRow = (
    idx: number,
    patch: Partial<{
      kind: BookingPaymentMilestone['kind']
      percentage: string
      amount: string
      dueAt: string
      paidAt: string
      paidReference: string
    }>,
  ) => {
    setMilestoneRows((prev) => prev.map((row, i) => (i === idx ? { ...row, ...patch } : row)))
  }

  const addMilestoneRow = () => {
    setMilestoneRows((prev) => [
      ...prev,
      {
        kind: 'milestone',
        percentage: '',
        amount: '',
        dueAt: '',
        paidAt: '',
        paidReference: '',
      },
    ])
  }

  const handleSaveMilestones = async () => {
    setSaveError('')
    setSaveOk('')
    setMilestoneBusy(true)
    for (const row of milestoneRows) {
      const amount = row.amount.trim() ? Number(row.amount) : null
      const percentage = row.percentage.trim() ? Number(row.percentage) : null
      const dueAtIso = row.dueAt.trim() ? localInputToIso(row.dueAt) : null
      const paidAtIso = row.paidAt.trim() ? localInputToIso(row.paidAt) : null
      if (row.amount.trim() && !Number.isFinite(amount)) {
        setMilestoneBusy(false)
        setSaveError('Milestone amount must be numeric.')
        return
      }
      if (row.percentage.trim() && !Number.isFinite(percentage)) {
        setMilestoneBusy(false)
        setSaveError('Milestone percentage must be numeric.')
        return
      }
      if (row.dueAt.trim() && !dueAtIso) {
        setMilestoneBusy(false)
        setSaveError('Due date must be a valid date/time.')
        return
      }
      if (row.paidAt.trim() && !paidAtIso) {
        setMilestoneBusy(false)
        setSaveError('Paid date must be a valid date/time.')
        return
      }
      if (dueAtIso && paidAtIso && new Date(paidAtIso).getTime() < new Date(dueAtIso).getTime()) {
        setMilestoneBusy(false)
        setSaveError('Paid date cannot be earlier than due date.')
        return
      }
      const { error } = await db.bookingProof.upsertMilestone({
        ...(row.id ? { id: row.id } : {}),
        booking_id: booking.id,
        kind: row.kind,
        percentage,
        amount,
        due_at: dueAtIso,
        paid_at: paidAtIso,
        paid_reference: row.paidReference.trim() || null,
      })
      if (error) {
        setMilestoneBusy(false)
        setSaveError(error.message)
        return
      }
    }
    setMilestoneBusy(false)
    setSaveOk('Payment milestones saved.')
    await onProofUpdated()
  }

  return (
    <section className="space-y-4">
      <div className="hidden print:block">
        <h2 className="text-lg font-semibold text-slate-900">Proof of Conditions</h2>
        <p className="text-xs text-slate-600">
          Booking {booking.id} · {booking.listings?.title ?? 'Booking'} ·{' '}
          {booking.corporate_accounts?.name ?? '—'}
          <br />
          Generated {new Date().toLocaleString('en-IN')}
        </p>
        <hr className="my-3 border-slate-300" />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">Agreed scope</h3>
        {canEdit ? (
          <textarea
            value={agreedScope}
            onChange={(e) => setAgreedScope(e.target.value)}
            rows={4}
            className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700"
            placeholder="Scope of work agreed by both parties"
          />
        ) : (
          <p className="mt-1 whitespace-pre-wrap text-xs text-slate-700">
            {proof?.agreed_scope ?? booking.purpose_note ?? '—'}
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">Price history</h3>
        {canEdit ? (
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <label className="text-xs text-slate-600">
              Quoted amount
              <input
                type="text"
                inputMode="decimal"
                value={quotedPrice}
                onChange={(e) => setQuotedPrice(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700"
                placeholder="0"
              />
            </label>
            <label className="text-xs text-slate-600">
              Final agreed amount
              <input
                type="text"
                inputMode="decimal"
                value={finalPrice}
                onChange={(e) => setFinalPrice(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700"
                placeholder="0"
              />
            </label>
            <label className="sm:col-span-2 text-xs text-slate-600">
              Negotiation history (one row per line: `party | note | price`)
              <textarea
                value={negotiationText}
                onChange={(e) => setNegotiationText(e.target.value)}
                rows={4}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700"
                placeholder="corporate | Requested discount for weekday slot | 42000"
              />
            </label>
          </div>
        ) : (
          <dl className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-700">
            <dt className="text-slate-500">Quoted</dt>
            <dd>{fmtMoney(proof?.quoted_price ?? booking.base_amount)}</dd>
            <dt className="text-slate-500">Final agreed</dt>
            <dd>{fmtMoney(proof?.final_price ?? booking.total_amount)}</dd>
          </dl>
        )}
        {!canEdit && proof?.negotiation_history && proof.negotiation_history.length > 0 && (
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
        {!canEdit && milestones.length === 0 ? (
          <p className="mt-1 text-xs text-slate-500">No milestones recorded.</p>
        ) : !canEdit ? (
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
        ) : (
          <div className="mt-2 space-y-3">
            {milestoneRows.map((m, idx) => (
              <div key={m.id ?? `new-${idx}`} className="grid grid-cols-1 gap-2 rounded-lg border border-slate-200 p-3 sm:grid-cols-3">
                <label className="text-[11px] text-slate-600">
                  Kind
                  <select
                    value={m.kind}
                    onChange={(e) =>
                      updateMilestoneRow(idx, {
                        kind: e.target.value as BookingPaymentMilestone['kind'],
                      })
                    }
                    className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs"
                  >
                    <option value="advance">advance</option>
                    <option value="milestone">milestone</option>
                    <option value="balance">balance</option>
                    <option value="final_settlement">final_settlement</option>
                  </select>
                </label>
                <label className="text-[11px] text-slate-600">
                  Percentage
                  <input
                    value={m.percentage}
                    onChange={(e) => updateMilestoneRow(idx, { percentage: e.target.value })}
                    className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs"
                    placeholder="e.g. 25"
                  />
                </label>
                <label className="text-[11px] text-slate-600">
                  Amount
                  <input
                    value={m.amount}
                    onChange={(e) => updateMilestoneRow(idx, { amount: e.target.value })}
                    className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs"
                    placeholder="e.g. 10000"
                  />
                </label>
                <label className="text-[11px] text-slate-600">
                  Due at
                  <input
                    type="datetime-local"
                    value={m.dueAt}
                    onChange={(e) => updateMilestoneRow(idx, { dueAt: e.target.value })}
                    className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs"
                  />
                </label>
                <label className="text-[11px] text-slate-600">
                  Paid at
                  <input
                    type="datetime-local"
                    value={m.paidAt}
                    onChange={(e) => updateMilestoneRow(idx, { paidAt: e.target.value })}
                    className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs"
                  />
                </label>
                <label className="text-[11px] text-slate-600">
                  Paid reference
                  <input
                    value={m.paidReference}
                    onChange={(e) => updateMilestoneRow(idx, { paidReference: e.target.value })}
                    className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs"
                    placeholder="UTR / txn id"
                  />
                </label>
              </div>
            ))}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={addMilestoneRow}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Add milestone
              </button>
              <button
                type="button"
                onClick={() => void handleSaveMilestones()}
                disabled={milestoneBusy}
                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {milestoneBusy && <Loader2 className="mr-1 inline size-3 animate-spin" />}
                Save milestones
              </button>
            </div>
          </div>
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
      {canEdit && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">PO document</h3>
          <input
            type="file"
            accept=".pdf,image/*"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) void handlePoUpload(f)
              e.currentTarget.value = ''
            }}
            className="mt-2 block w-full text-xs"
            disabled={saveBusy}
          />
          {poPath && (
            <Link
              to={storageService.documents.getUrl(poPath)}
              target="_blank"
              className="mt-2 inline-flex items-center gap-1 rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
            >
              <FileText className="size-3" /> Open uploaded PO
            </Link>
          )}
          {saveError && (
            <p className="mt-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {saveError}
            </p>
          )}
          {saveOk && (
            <p className="mt-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
              {saveOk}
            </p>
          )}
          <button
            type="button"
            onClick={() => void handleSaveProof()}
            disabled={saveBusy}
            className="mt-3 inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {saveBusy && <Loader2 className="size-3 animate-spin" />}
            Save proof details
          </button>
        </div>
      )}
    </section>
  )
}
