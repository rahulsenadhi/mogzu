import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Loader2,
  Search,
  XCircle,
} from 'lucide-react'
import { VendorAppShell } from './layouts/VendorAppShell'
import { useAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import { realtimeService } from '@/lib/realtime'
import type {
  Booking,
  BookingAddOn,
  CorporateAccount,
  Listing,
  UserProfile,
} from '@/lib/database.types'

type BookingFull = Booking & {
  listings: Listing | null
  user_profiles: UserProfile | null
  corporate_accounts: CorporateAccount | null
}

type BookingDetail = BookingFull & {
  booking_add_ons: BookingAddOn[]
}

type TabKey = 'pending' | 'confirmed' | 'rejected'

function formatDateTime(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  })
}

function slaCountdown(deadlineIso: string | null): {
  text: string
  expired: boolean
  urgent: boolean
} {
  if (!deadlineIso) return { text: 'No SLA', expired: false, urgent: false }
  const ms = new Date(deadlineIso).getTime() - Date.now()
  if (ms <= 0) return { text: 'SLA expired', expired: true, urgent: true }
  const hours = Math.floor(ms / 3_600_000)
  const minutes = Math.floor((ms % 3_600_000) / 60_000)
  return {
    text: `${hours}h ${minutes}m left`,
    expired: false,
    urgent: hours < 4,
  }
}

// ─── List page ────────────────────────────────────────────────────────────────

export default function VendorBookingRequestsPage() {
  const navigate = useNavigate()
  const params = useParams<{ bookingId?: string }>()
  const { vendorId } = useAuth()

  const [bookings, setBookings] = useState<BookingFull[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [activeTab, setActiveTab] = useState<TabKey>('pending')
  const [search, setSearch] = useState('')

  const loadBookings = useCallback(async () => {
    if (!vendorId) return
    setLoading(true)
    setLoadError('')
    const { data, error } = await db.bookings.listByVendor(vendorId)
    if (error) setLoadError(error.message)
    else setBookings((data ?? []) as BookingFull[])
    setLoading(false)
  }, [vendorId])

  useEffect(() => {
    loadBookings()
  }, [loadBookings])

  // Realtime
  useEffect(() => {
    if (!vendorId) return
    return realtimeService.watchVendorBookings<Booking>(vendorId, () => loadBookings())
  }, [vendorId, loadBookings])

  // Auto-cancel sweep for expired pending_vendor SLAs (client-side stopgap)
  useEffect(() => {
    const expired = bookings.filter(
      (b) =>
        b.status === 'pending_vendor' &&
        b.vendor_response_deadline &&
        new Date(b.vendor_response_deadline).getTime() < Date.now(),
    )
    if (expired.length === 0) return
    Promise.all(
      expired.map((b) =>
        db.bookings.cancel(b.id, 'Auto-cancelled: 24h vendor SLA expired', 0),
      ),
    ).then(() => loadBookings())
  }, [bookings, loadBookings])

  const byTab = useMemo(() => {
    return {
      pending: bookings.filter((b) => b.status === 'pending_vendor'),
      confirmed: bookings.filter((b) =>
        ['confirmed', 'completed'].includes(b.status),
      ),
      rejected: bookings.filter((b) => b.status === 'cancelled'),
    }
  }, [bookings])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const list = byTab[activeTab]
    if (!q) return list
    return list.filter(
      (b) =>
        b.id.toLowerCase().includes(q) ||
        (b.listings?.title ?? '').toLowerCase().includes(q) ||
        (b.corporate_accounts?.name ?? '').toLowerCase().includes(q) ||
        (b.user_profiles?.full_name ?? '').toLowerCase().includes(q),
    )
  }, [byTab, activeTab, search])

  // If route has :bookingId, render detail panel
  if (params.bookingId) {
    return <BookingDetailScreen bookingId={params.bookingId} onChanged={loadBookings} />
  }

  return (
    <VendorAppShell activeNav="orders" routeSource="vendor-booking-requests">
      <main className="min-h-full w-full bg-transparent">
        <section className="p-4 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Booking requests</h1>
              <p className="text-sm text-slate-500">
                Review corporate booking requests and confirm availability within 24 hours.
              </p>
            </div>
            <div className="relative w-full max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ID, listing, company"
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/80 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div className="mb-4 flex gap-2 border-b border-slate-200">
            {(['pending', 'confirmed', 'rejected'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setActiveTab(t)}
                className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition ${
                  activeTab === t
                    ? 'border-[#2563EB] text-[#2563EB]'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {t === 'pending'
                  ? `Pending (${byTab.pending.length})`
                  : t === 'confirmed'
                    ? `Confirmed (${byTab.confirmed.length})`
                    : `Rejected (${byTab.rejected.length})`}
              </button>
            ))}
          </div>

          {loadError && (
            <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-700">{loadError}</p>
              <button
                type="button"
                onClick={loadBookings}
                className="mt-2 rounded-md bg-[#2563eb] px-3 py-1.5 text-xs font-medium text-white"
              >
                Retry
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-14">
              <Loader2 className="size-6 animate-spin text-slate-400" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 bg-white p-12 text-center">
              <p className="text-sm text-slate-500">No {activeTab} requests.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {filtered.map((b) => {
                const sla = slaCountdown(b.vendor_response_deadline)
                return (
                  <li
                    key={b.id}
                    className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
                  >
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-semibold text-slate-900">
                          {b.listings?.title ?? '—'}
                        </p>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                          {b.id.slice(0, 8)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500">
                        {b.corporate_accounts?.name ?? '—'} ·{' '}
                        {b.user_profiles?.full_name ?? '—'} · Group {b.group_size ?? '—'}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Requested {formatDateTime(b.created_at)} · Event{' '}
                        {formatDate(b.start_time)}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2 sm:items-end">
                      <span className="font-semibold text-slate-900">
                        ₹ {(b.total_amount ?? 0).toLocaleString('en-IN')}
                      </span>
                      {activeTab === 'pending' && (
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                            sla.expired
                              ? 'bg-rose-100 text-rose-700'
                              : sla.urgent
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {sla.expired ? (
                            <AlertTriangle className="size-3" />
                          ) : (
                            <Clock className="size-3" />
                          )}
                          {sla.text}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => navigate(`/vendor/booking-requests/${b.id}`)}
                        className="rounded-md bg-[#2563EB] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1D4ED8]"
                      >
                        {activeTab === 'pending' ? 'Review' : 'View'}
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </main>
    </VendorAppShell>
  )
}

// ─── Detail screen ────────────────────────────────────────────────────────────

function BookingDetailScreen({
  bookingId,
  onChanged,
}: {
  bookingId: string
  onChanged: () => void
}) {
  const navigate = useNavigate()
  const { vendorId } = useAuth()

  const [booking, setBooking] = useState<BookingDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [rejectReason, setRejectReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [actionError, setActionError] = useState('')
  const [actionSuccess, setActionSuccess] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    const { data, error } = await db.bookings.getById(bookingId)
    if (error || !data) {
      setLoadError(error?.message ?? 'Booking not found.')
      setBooking(null)
    } else {
      setBooking(data as BookingDetail)
    }
    setLoading(false)
  }, [bookingId])

  useEffect(() => {
    load()
  }, [load])

  const isMine = booking?.vendor_id === vendorId
  const canRespond = booking?.status === 'pending_vendor' && isMine

  const handleConfirm = async () => {
    if (!booking) return
    setSubmitting(true)
    setActionError('')
    const { error: updErr } = await db.bookings.updateStatus(booking.id, 'confirmed')
    if (updErr) {
      setActionError(updErr.message)
      setSubmitting(false)
      return
    }
    // Block the calendar slot for this booking window
    if (booking.start_time && booking.end_time) {
      await db.calendar.blockSlot({
        vendor_id: booking.vendor_id,
        listing_id: booking.listing_id,
        slot_type: 'booked',
        start_time: booking.start_time,
        end_time: booking.end_time,
        booking_id: booking.id,
        recurrence_rule: null,
        notes: `Booking ${booking.id.slice(0, 8)}`,
      })
    }
    setActionSuccess('Booking confirmed. Calendar slot blocked.')
    setSubmitting(false)
    onChanged()
    load()
  }

  const handleReject = async () => {
    if (!booking) return
    const reason = rejectReason.trim()
    if (!reason) {
      setActionError('Provide a rejection reason.')
      return
    }
    if (reason.length < 10) {
      setActionError('Provide at least 10 characters of context.')
      return
    }
    setSubmitting(true)
    setActionError('')
    const refundAmount = booking.payment_status === 'paid' ? booking.total_amount ?? 0 : 0
    const { error } = await db.bookings.cancel(
      booking.id,
      `Vendor rejected: ${reason}${refundAmount > 0 ? ` (refund ₹${refundAmount} initiated)` : ''}`,
      0,
    )
    if (error) {
      setActionError(error.message)
      setSubmitting(false)
      return
    }
    setActionSuccess(
      refundAmount > 0
        ? 'Booking rejected. Refund flagged for processing.'
        : 'Booking rejected.',
    )
    setSubmitting(false)
    onChanged()
    load()
  }

  return (
    <VendorAppShell activeNav="orders" routeSource="vendor-booking-request-detail">
      <main className="min-h-full w-full bg-transparent">
        <section className="p-4 sm:p-6">
          <button
            type="button"
            onClick={() => navigate('/vendor/booking-requests')}
            className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft className="size-4" />
            Back to requests
          </button>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="size-6 animate-spin text-slate-400" />
            </div>
          ) : loadError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-6">
              <p className="text-sm text-red-700">{loadError}</p>
            </div>
          ) : !booking ? (
            <p className="text-sm text-slate-500">Booking not found.</p>
          ) : !isMine ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-6">
              <p className="text-sm text-rose-700">
                This booking belongs to a different vendor.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Request {booking.id.slice(0, 8)}
                    </p>
                    <h1 className="mt-1 text-2xl font-bold text-slate-900">
                      {booking.listings?.title ?? '—'}
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                      Submitted {formatDateTime(booking.created_at)}
                    </p>
                  </div>
                  <StatusBadge status={booking.status} sla={booking.vendor_response_deadline} />
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2">
                  <Detail label="Corporate account">
                    <p className="font-medium text-slate-900">
                      {booking.corporate_accounts?.name ?? '—'}
                    </p>
                  </Detail>
                  <Detail label="Requested by">
                    <p className="font-medium text-slate-900">
                      {booking.user_profiles?.full_name ?? '—'}
                    </p>
                    {booking.user_profiles?.department && (
                      <p className="text-xs text-slate-500">
                        {booking.user_profiles.department}
                      </p>
                    )}
                  </Detail>
                  <Detail label="Event date">
                    <p className="font-medium text-slate-900">
                      {formatDateTime(booking.start_time)}
                    </p>
                    <p className="text-xs text-slate-500">
                      to {formatDateTime(booking.end_time)}
                    </p>
                  </Detail>
                  <Detail label="Group size">
                    <p className="font-medium text-slate-900">
                      {booking.group_size ?? '—'} attendees
                    </p>
                  </Detail>
                  <Detail label="Total amount">
                    <p className="text-xl font-bold text-slate-900">
                      ₹ {(booking.total_amount ?? 0).toLocaleString('en-IN')}
                    </p>
                    <p className="text-xs text-slate-500">
                      Payment: {booking.payment_status}
                    </p>
                  </Detail>
                  <Detail label="Vendor SLA">
                    <p className="font-medium text-slate-900">
                      {formatDateTime(booking.vendor_response_deadline)}
                    </p>
                  </Detail>
                </div>

                {booking.purpose_note && (
                  <div className="mt-4 rounded-lg bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Purpose note
                    </p>
                    <p className="mt-1 text-sm text-slate-800">{booking.purpose_note}</p>
                  </div>
                )}

                {booking.booking_add_ons && booking.booking_add_ons.length > 0 && (
                  <div className="mt-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Add-ons
                    </p>
                    <ul className="space-y-1 text-sm">
                      {booking.booking_add_ons.map((a) => (
                        <li key={a.id} className="flex justify-between">
                          <span>
                            {a.name} × {a.quantity}
                          </span>
                          <span>₹ {(a.price * a.quantity).toLocaleString('en-IN')}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {booking.status === 'cancelled' && booking.cancellation_reason && (
                  <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-4">
                    <p className="text-xs font-semibold text-rose-800">Cancellation</p>
                    <p className="mt-1 text-sm text-rose-800">
                      {booking.cancellation_reason}
                    </p>
                  </div>
                )}
              </div>

              {canRespond && (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-slate-900">Respond</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Confirm to block your calendar for this date, or reject with a reason.
                  </p>

                  {actionSuccess && (
                    <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                      {actionSuccess}
                    </p>
                  )}
                  {actionError && (
                    <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                      {actionError}
                    </p>
                  )}

                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={submitting}
                        className="inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                      >
                        {submitting && <Loader2 className="size-4 animate-spin" />}
                        Confirm booking
                      </button>
                      <p className="mt-2 text-[11px] text-slate-500">
                        Blocks the time on your calendar automatically.
                      </p>
                    </div>
                    <div>
                      <label
                        htmlFor="rejectReason"
                        className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500"
                      >
                        Rejection reason
                      </label>
                      <textarea
                        id="rejectReason"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        rows={3}
                        placeholder="e.g., Date no longer available; team unavailable"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                      />
                      <button
                        type="button"
                        onClick={handleReject}
                        disabled={submitting}
                        className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </VendorAppShell>
  )
}

function StatusBadge({
  status,
  sla,
}: {
  status: Booking['status']
  sla: string | null
}) {
  if (status === 'pending_vendor') {
    const c = slaCountdown(sla)
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
          c.expired
            ? 'bg-rose-100 text-rose-700'
            : c.urgent
              ? 'bg-amber-100 text-amber-800'
              : 'bg-blue-100 text-blue-800'
        }`}
      >
        <Clock className="size-3.5" /> Pending — {c.text}
      </span>
    )
  }
  if (status === 'confirmed' || status === 'completed') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
        <CheckCircle2 className="size-3.5" />
        {status === 'confirmed' ? 'Confirmed' : 'Completed'}
      </span>
    )
  }
  if (status === 'cancelled') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
        <XCircle className="size-3.5" /> Cancelled
      </span>
    )
  }
  return (
    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
      {status}
    </span>
  )
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <div className="mt-1">{children}</div>
    </div>
  )
}
