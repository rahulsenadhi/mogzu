import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  Loader2,
  ShieldAlert,
} from 'lucide-react'
import { SharedHeader } from './layouts/SharedHeader'
import { SharedSidebar } from './layouts/SharedSidebar'
import { MogzuCorporateScrollSurface } from './layouts/MogzuCorporateScrollSurface'
import { useAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import type { Booking, Listing } from '@/lib/database.types'

type BookingDetail = Booking & { listings: Listing | null }

const FREE_WINDOW_HOURS = 24

function hoursUntilStart(booking: Booking | null): number | null {
  if (!booking?.start_time) return null
  return (new Date(booking.start_time).getTime() - Date.now()) / 3_600_000
}

function computeFee(booking: Booking | null): { fee: number; insidePolicy: boolean } {
  const hrs = hoursUntilStart(booking)
  if (hrs == null || !booking?.total_amount) return { fee: 0, insidePolicy: true }
  if (hrs >= FREE_WINDOW_HOURS) return { fee: 0, insidePolicy: true }
  // After deadline: 25% of total as cancellation fee (vendor-tunable later).
  return { fee: Math.round(booking.total_amount * 0.25), insidePolicy: false }
}

export default function CancelBookingPage() {
  const navigate = useNavigate()
  const params = useParams<{ id?: string }>()
  const { profile } = useAuth()

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [booking, setBooking] = useState<BookingDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [cancelledRefundId, setCancelledRefundId] = useState<string | null | undefined>(undefined)

  const load = useCallback(async () => {
    if (!params.id) {
      setLoadError('No booking id supplied. Open from your bookings list.')
      setLoading(false)
      return
    }
    setLoading(true)
    setLoadError('')
    const { data, error } = await db.bookings.getById(params.id)
    if (error || !data) {
      setLoadError(error?.message ?? 'Booking not found.')
    } else {
      setBooking(data as BookingDetail)
    }
    setLoading(false)
  }, [params.id])

  useEffect(() => {
    load()
  }, [load])

  const policy = useMemo(() => computeFee(booking), [booking])
  const refundAmount = useMemo(() => {
    if (!booking || booking.payment_status !== 'paid') return 0
    return Math.max(0, (booking.total_amount ?? 0) - policy.fee)
  }, [booking, policy.fee])

  const handleCancel = async () => {
    if (!booking || !profile) return
    const text = reason.trim()
    if (!text) {
      setSubmitError('Provide a cancellation reason.')
      return
    }
    if (text.length < 10) {
      setSubmitError('At least 10 characters of context.')
      return
    }
    setSubmitting(true)
    setSubmitError('')
    const { refundId, error } = await db.bookings.cancelWithRefund(
      booking,
      `Cancelled by user: ${text}`,
      policy.fee,
      profile.id,
    )
    setSubmitting(false)
    if (error) {
      setSubmitError(error.message)
      return
    }

    const { data: vendor } = await db.vendors.getById(booking.vendor_id)
    if (vendor?.user_id) {
      db.notifications.notify({
        userId: vendor.user_id,
        type: 'booking_cancelled',
        title: 'Booking cancelled by booker',
        body: `${booking.listings?.title ?? 'Booking'} — ${text}`,
        linkUrl: `/vendor/booking-requests/${booking.id}`,
      })
    }

    setCancelledRefundId(refundId)
  }

  if (cancelledRefundId !== undefined) {
    const wasWallet = booking?.payment_method === 'wallet'
    return (
      <div className="flex h-screen overflow-hidden bg-[#FFFDF9]">
        <SharedSidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <SharedHeader onMobileMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
          <MogzuCorporateScrollSurface className="flex items-center justify-center">
            <div className="mx-auto max-w-md p-6 text-center">
              <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                <CheckCircle className="size-10" />
              </div>
              <h1 className="mb-2 text-2xl font-bold text-slate-900">Booking cancelled</h1>
              {cancelledRefundId ? (
                <p className="mb-2 text-slate-600">
                  Refund of <strong>₹{refundAmount.toLocaleString('en-IN')}</strong>{' '}
                  {wasWallet
                    ? 'credited to your corporate wallet instantly.'
                    : 'initiated on the original payment method. Funds typically clear in 5–7 business days.'}
                </p>
              ) : (
                <p className="mb-2 text-slate-600">
                  No refund needed — booking had not been paid yet.
                </p>
              )}
              {policy.fee > 0 && (
                <p className="mb-6 text-xs text-amber-700">
                  Cancellation fee ₹{policy.fee.toLocaleString('en-IN')} retained (cancelled inside
                  the {FREE_WINDOW_HOURS}h window).
                </p>
              )}
              <button
                type="button"
                onClick={() => navigate('/bookings')}
                className="rounded-lg bg-[#2563eb] px-6 py-3 text-sm font-medium text-white hover:bg-blue-700"
              >
                Return to bookings
              </button>
            </div>
          </MogzuCorporateScrollSurface>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#FFFDF9]">
      <SharedSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <SharedHeader onMobileMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <MogzuCorporateScrollSurface className="py-10">
          <div className="mx-auto max-w-2xl px-8">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mb-6 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800"
            >
              <ArrowLeft className="size-4" />
              Back
            </button>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="size-6 animate-spin text-slate-400" />
              </div>
            ) : loadError || !booking ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-6">
                <p className="text-sm text-red-700">{loadError || 'Booking not found.'}</p>
              </div>
            ) : ['cancelled', 'completed'].includes(booking.status) ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-6">
                <ShieldAlert className="mb-2 size-6 text-amber-600" />
                <p className="text-sm text-amber-800">
                  Booking is already <strong>{booking.status}</strong>. Cannot cancel.
                </p>
              </div>
            ) : (
              <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Cancel booking</h1>
                  <p className="mt-1 text-sm text-slate-500">
                    {booking.listings?.title ?? '—'} · Reference{' '}
                    <span className="font-mono">{booking.id.slice(0, 8)}</span>
                  </p>
                </div>

                <div
                  className={`flex items-start gap-3 rounded-xl border p-4 ${
                    policy.insidePolicy
                      ? 'border-emerald-200 bg-emerald-50'
                      : 'border-amber-200 bg-amber-50'
                  }`}
                >
                  <AlertTriangle
                    className={`mt-0.5 size-5 shrink-0 ${
                      policy.insidePolicy ? 'text-emerald-600' : 'text-amber-600'
                    }`}
                  />
                  <div className="text-sm">
                    {policy.insidePolicy ? (
                      <p className="font-semibold text-emerald-800">
                        Free cancellation — outside the {FREE_WINDOW_HOURS}h window.
                      </p>
                    ) : (
                      <>
                        <p className="font-semibold text-amber-900">
                          Inside the {FREE_WINDOW_HOURS}h window — fee applies.
                        </p>
                        <p className="mt-1 text-amber-800">
                          Cancellation fee:{' '}
                          <strong>₹{policy.fee.toLocaleString('en-IN')}</strong> (25% of total).
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <dl className="space-y-2 rounded-xl bg-slate-50 p-4 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Total paid</dt>
                    <dd className="font-medium">
                      ₹ {(booking.total_amount ?? 0).toLocaleString('en-IN')}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Cancellation fee</dt>
                    <dd className="font-medium">
                      ₹ {policy.fee.toLocaleString('en-IN')}
                    </dd>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-2 font-semibold">
                    <dt>Refundable</dt>
                    <dd className="text-emerald-700">
                      ₹ {refundAmount.toLocaleString('en-IN')}
                    </dd>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {booking.payment_status !== 'paid'
                      ? 'No payment captured yet — nothing to refund.'
                      : booking.payment_method === 'wallet'
                        ? 'Refund credits to corporate wallet instantly.'
                        : 'Refund flagged for Razorpay gateway. Funds clear in 5–7 business days.'}
                  </p>
                </dl>

                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                    Reason for cancellation
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                    placeholder="Helps vendors improve their offerings"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                  />
                </div>

                {submitError && (
                  <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                    {submitError}
                  </p>
                )}

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Keep booking
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={submitting}
                    className="inline-flex items-center gap-1.5 rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
                  >
                    {submitting && <Loader2 className="size-4 animate-spin" />}
                    Confirm cancellation
                  </button>
                </div>
              </div>
            )}
          </div>
        </MogzuCorporateScrollSurface>
      </div>
    </div>
  )
}
