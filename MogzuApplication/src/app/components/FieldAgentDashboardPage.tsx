import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { Camera, Check, Loader2, MapPin, ShieldAlert } from 'lucide-react'
import { MogzuLogo } from '@/app/components/branding/MogzuLogo'
import { useAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import { storageService } from '@/lib/storage'
import {
  findStage,
  generateOtpCode,
  getStagePipeline,
  nextStage,
  type TrackerStage,
} from '@/lib/bookingTracker'
import type { BookingStatusEvent, ModuleId } from '@/lib/database.types'

type QueueRow = {
  id: string
  module: ModuleId
  status: string
  group_size: number | null
  start_time: string | null
  end_time: string | null
  listings?: { title: string | null; location_city: string | null } | null
  corporate_accounts?: { name: string | null } | null
}

type BookingDetail = QueueRow & {
  events: BookingStatusEvent[]
  next: TrackerStage | null
}

function syntheticStageEvent(row: QueueRow, stage: string, at: string): BookingStatusEvent {
  return {
    id: `synthetic-${row.id}-${stage}`,
    booking_id: row.id,
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

function deriveSyntheticEvents(row: QueueRow, existing: BookingStatusEvent[]): BookingStatusEvent[] {
  const out: BookingStatusEvent[] = []
  const seen = new Set(existing.map((e) => e.stage))
  const at = row.end_time ?? row.start_time ?? new Date().toISOString()
  const add = (stage: string) => {
    if (seen.has(stage)) return
    out.push(syntheticStageEvent(row, stage, at))
    seen.add(stage)
  }

  if (row.module === 'gifting') {
    if (row.status !== 'draft' && row.status !== 'pending_approval') add('order_placed')
    return out
  }

  if (row.status === 'pending_vendor' || row.status === 'confirmed' || row.status === 'completed') {
    add('booking_confirmed')
  }
  if (row.status === 'completed') add('booking_closed')
  return out
}

export default function FieldAgentDashboardPage() {
  const navigate = useNavigate()
  const { role, profile, signOut } = useAuth()
  const [queue, setQueue] = useState<BookingDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    const { data: rows, error: e } = await db.bookingTracker.listFieldAgentQueue()
    if (e) {
      setError(e.message)
      setLoading(false)
      return
    }
    const enriched: BookingDetail[] = []
    for (const r of (rows ?? []) as QueueRow[]) {
      const { data: events } = await db.bookingTracker.listEvents(r.id)
      const realEvents = (events ?? []) as BookingStatusEvent[]
      const syntheticEvents = deriveSyntheticEvents(r, realEvents)
      const allEvents = [...realEvents, ...syntheticEvents]
      const submittedKeys = allEvents
        .filter((ev) => ev.otp_verified_at != null)
        .map((ev) => ev.stage)
      enriched.push({
        ...r,
        events: allEvents,
        next: nextStage(r.module, submittedKeys),
      })
    }
    setQueue(enriched)
    setLoading(false)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  if (role !== 'field_agent' && role !== 'mogzu_admin') {
    return (
      <div className="mx-auto max-w-md p-12 text-center">
        <ShieldAlert className="mx-auto mb-2 size-8 text-amber-500" />
        <p className="text-sm text-amber-800">Field agent access required.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-6">
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MogzuLogo className="h-8" />
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {profile?.full_name ?? 'Field Agent'}
            </p>
            <p className="text-[11px] text-slate-500">Field agent · proof submission</p>
          </div>
        </div>
        <button
          type="button"
          onClick={async () => {
            await signOut()
            navigate('/login')
          }}
          className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          Sign out
        </button>
      </header>

      {error && (
        <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
          {error}
        </div>
      )}

      {queue.length === 0 ? (
        <p className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          No active bookings in your queue.
        </p>
      ) : (
        <ul className="space-y-3">
          {queue.map((row) => (
            <BookingCard key={row.id} row={row} onChanged={load} />
          ))}
        </ul>
      )}
    </div>
  )
}

function BookingCard({
  row,
  onChanged,
}: {
  row: BookingDetail
  onChanged: () => Promise<void>
}) {
  const { profile } = useAuth()
  const [expanded, setExpanded] = useState(false)
  const [busy, setBusy] = useState(false)
  const [otp, setOtp] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [pendingEvent, setPendingEvent] = useState<BookingStatusEvent | null>(null)
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [notes, setNotes] = useState('')
  const [notice, setNotice] = useState('')

  const pipeline = getStagePipeline(row.module)
  const completed = new Set(
    row.events.filter((e) => e.otp_verified_at != null).map((e) => e.stage),
  )
  const requiresPhoto = row.next?.proofRequired === 'mandatory'
  const requiresOtp =
    row.next != null &&
    ['arrived_at_venue', 'work_started', 'work_completed', 'check_in', 'check_out', 'delivered'].includes(
      row.next.key,
    )
  const requiresGps = row.next != null && ['arrived_at_venue', 'check_in'].includes(row.next.key)
  const requiresTracking = row.next?.key === 'dispatched'
  const existingNextEvent = row.next ? row.events.find((e) => e.stage === row.next?.key) : undefined

  const startStage = async () => {
    if (!row.next) return
    if (existingNextEvent) {
      setPendingEvent(existingNextEvent)
      setNotice('Resuming existing stage event.')
      return
    }
    setBusy(true)
    setNotice('')
    const code = generateOtpCode()
    const sentTo = row.corporate_accounts?.name ?? 'booking contact'
    const { data, error } = await db.bookingTracker.createOtp(
      row.id,
      row.next.key,
      code,
      sentTo,
    )
    setBusy(false)
    if (error || !data) {
      setNotice(error?.message ?? 'Failed to create OTP event.')
      return
    }
    setPendingEvent(data as BookingStatusEvent)
    setNotice(
      `OTP ${code} generated. Booking contact would receive this; relay verbally for now.`,
    )
    // Capture GPS in parallel — non-blocking.
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {},
        { enableHighAccuracy: true, timeout: 8000 },
      )
    }
  }

  const submitProof = async () => {
    if (!pendingEvent || !profile) return
    if (requiresPhoto && !photo && !pendingEvent.photo_path) {
      setNotice('A photo is required for this stage.')
      return
    }
    if (requiresOtp && !/^\d{6}$/.test(otp.trim())) {
      setNotice('Enter the 6-digit OTP for this stage.')
      return
    }
    if (pendingEvent.otp_code && otp.trim() !== pendingEvent.otp_code) {
      setNotice('Entered OTP does not match the issued code.')
      return
    }
    if (requiresGps && !coords && (pendingEvent.gps_lat == null || pendingEvent.gps_lng == null)) {
      setNotice('Capture GPS before submitting this stage.')
      return
    }
    if (requiresTracking && !notes.trim()) {
      setNotice('Tracking ID / dispatch reference is required for dispatch stage.')
      return
    }
    setBusy(true)
    setNotice('')
    let photoPath: string | null = null
    if (photo) {
      const up = await storageService.bookingProof.upload(row.id, pendingEvent.stage, photo)
      if (up.error) {
        setNotice(`Photo upload failed: ${up.error}`)
        setBusy(false)
        return
      }
      photoPath = up.path ?? null
    }
    const { error } = await db.bookingTracker.submitProof(pendingEvent.id, {
      photo_path: photoPath,
      gps_lat: coords?.lat ?? pendingEvent.gps_lat ?? null,
      gps_lng: coords?.lng ?? pendingEvent.gps_lng ?? null,
      submitted_by: profile.id,
      notes: notes.trim() || null,
    })
    setBusy(false)
    if (error) {
      setNotice(error.message)
      return
    }
    await db.userActivity.log(profile.id, 'booking.proof_submitted', 'booking_status_events', pendingEvent.id, {
      booking_id: row.id,
      stage: pendingEvent.stage,
    })
    setPendingEvent(null)
    setOtp('')
    setPhoto(null)
    setCoords(null)
    setNotes('')
    setNotice('Proof submitted.')
    await onChanged()
  }

  return (
    <li className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-start justify-between gap-3 text-left"
      >
        <div className="min-w-0">
          <p className="font-medium text-slate-900">{row.listings?.title ?? 'Booking'}</p>
          <p className="text-xs text-slate-500">
            {row.corporate_accounts?.name ?? '—'} · {row.module} ·{' '}
            {row.listings?.location_city ?? ''}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            {row.events.filter((e) => e.otp_verified_at).length} / {pipeline.length} stages
            done · next: <strong className="text-slate-700">{row.next?.label ?? 'complete'}</strong>
          </p>
        </div>
        <span className="text-[10px] uppercase tracking-wide text-slate-400">
          {expanded ? 'Hide' : 'Open'}
        </span>
      </button>

      {expanded && (
        <div className="mt-4 space-y-3 border-t border-slate-100 pt-3">
          <ol className="space-y-1 text-xs">
            {pipeline.map((s) => {
              const done = completed.has(s.key)
              const isNext = row.next?.key === s.key
              return (
                <li
                  key={s.key}
                  className={`flex items-center gap-2 rounded-md px-2 py-1 ${
                    done
                      ? 'bg-emerald-50 text-emerald-800'
                      : isNext
                        ? 'bg-amber-50 text-amber-900'
                        : 'text-slate-500'
                  }`}
                >
                  {done ? <Check className="size-3" /> : <span className="size-3 rounded-full border border-current" />}
                  <span className="font-medium">{s.label}</span>
                  <span className="text-[10px] text-slate-500">· {s.proofRequired}</span>
                </li>
              )
            })}
          </ol>

          {row.next && row.next.proofRequired !== 'auto' && !pendingEvent && (
            <button
              type="button"
              disabled={busy}
              onClick={startStage}
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              Start &quot;{row.next.label}&quot;
            </button>
          )}

          {pendingEvent && (
            <div className="space-y-2 rounded-xl border border-indigo-100 bg-indigo-50/40 p-3">
              <p className="text-xs font-semibold text-slate-900">
                Submit proof for{' '}
                {findStage(row.module, pendingEvent.stage)?.label ?? pendingEvent.stage}
              </p>
              <label className="block space-y-1">
                <span className="text-[11px] text-slate-700">OTP from booking contact</span>
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="h-9 w-full rounded-md border border-slate-200 px-3 text-sm"
                  inputMode="numeric"
                  maxLength={6}
                />
              </label>
              <label className="block space-y-1">
                <span className="text-[11px] text-slate-700">Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
                  className="text-xs"
                />
              </label>
              <p className="text-[11px] text-slate-600">
                <MapPin className="mr-1 inline size-3" />
                {coords
                  ? `GPS ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`
                  : 'GPS will be captured at submit.'}
              </p>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder={
                  requiresTracking ? 'Tracking ID / dispatch reference (required)' : 'Notes (optional)'
                }
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-xs"
              />
              <button
                type="button"
                disabled={busy}
                onClick={submitProof}
                className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                <Camera className="size-3" /> Submit proof
              </button>
            </div>
          )}

          {notice && (
            <p className="rounded-md border border-slate-200 bg-slate-50 p-2 text-[11px] text-slate-700">
              {notice}
            </p>
          )}
        </div>
      )}
    </li>
  )
}
