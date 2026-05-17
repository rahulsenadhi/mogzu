import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { ArrowLeft, CheckCircle2, Loader2, Star } from 'lucide-react'
import { SharedHeader } from './layouts/SharedHeader'
import { SharedSidebar } from './layouts/SharedSidebar'
import { MogzuCorporateScrollSurface } from './layouts/MogzuCorporateScrollSurface'
import { useAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import type { Booking, Listing, Review } from '@/lib/database.types'

type BookingDetail = Booking & { listings: Listing | null }

export default function ReviewSubmitPage() {
  const navigate = useNavigate()
  const params = useParams<{ id: string }>()
  const { profile } = useAuth()

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [booking, setBooking] = useState<BookingDetail | null>(null)
  const [existing, setExisting] = useState<Review | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [rating, setRating] = useState(0)
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [done, setDone] = useState(false)

  const load = useCallback(async () => {
    if (!params.id) return
    setLoading(true)
    setLoadError('')
    const [bRes, rRes] = await Promise.all([
      db.bookings.getById(params.id),
      db.reviews.getByBooking(params.id),
    ])
    if (bRes.error || !bRes.data) {
      setLoadError(bRes.error?.message ?? 'Booking not found.')
    } else {
      setBooking(bRes.data as BookingDetail)
    }
    setExisting((rRes.data ?? null) as Review | null)
    setLoading(false)
  }, [params.id])

  useEffect(() => {
    load()
  }, [load])

  const eligible = booking?.status === 'completed' && booking.user_id === profile?.id

  const handleSubmit = async () => {
    if (!profile || !booking) return
    if (rating < 1 || rating > 5) {
      setSubmitError('Pick a rating 1–5.')
      return
    }
    if (body.trim().length < 10) {
      setSubmitError('Review body needs at least 10 characters.')
      return
    }
    setSubmitting(true)
    setSubmitError('')
    const { error } = await db.reviews.create({
      listing_id: booking.listing_id,
      vendor_id: booking.vendor_id,
      reviewer_id: profile.id,
      reviewer_name: profile.full_name,
      booking_id: booking.id,
      source: 'booking',
      rating,
      body: body.trim(),
      status: 'approved', // booking-gated reviews skip moderation
      vendor_reply: null,
      vendor_replied_at: null,
      rejection_reason: null,
      approved_by: null,
      approved_at: new Date().toISOString(),
    })
    setSubmitting(false)
    if (error) {
      setSubmitError(error.message)
      return
    }
    setDone(true)
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
          <div className="mx-auto max-w-2xl px-8">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800"
            >
              <ArrowLeft className="size-4" />
              Back
            </button>

            {loading ? (
              <div className="flex items-center justify-center py-14">
                <Loader2 className="size-6 animate-spin text-slate-400" />
              </div>
            ) : loadError || !booking ? (
              <p className="rounded-lg border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
                {loadError || 'Booking not found.'}
              </p>
            ) : !eligible ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
                <p className="text-sm text-amber-800">
                  Reviews are available only for your own completed bookings.
                </p>
              </div>
            ) : existing ? (
              <div className="rounded-2xl border border-emerald-200 bg-white p-8 text-center shadow-sm">
                <CheckCircle2 className="mx-auto mb-2 size-10 text-emerald-500" />
                <h1 className="text-xl font-bold text-[#0e1e3f]">Already reviewed</h1>
                <p className="mt-1 text-sm text-slate-500">
                  You rated {existing.rating}/5 on this booking.
                </p>
                <p className="mt-4 whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm text-slate-800">
                  {existing.body}
                </p>
                {existing.vendor_reply && (
                  <p className="mt-3 rounded-xl border border-slate-100 bg-blue-50 p-3 text-sm text-blue-900">
                    <strong>Vendor reply:</strong> {existing.vendor_reply}
                  </p>
                )}
              </div>
            ) : done ? (
              <div className="rounded-2xl border border-emerald-200 bg-white p-8 text-center shadow-sm">
                <CheckCircle2 className="mx-auto mb-2 size-10 text-emerald-500" />
                <h1 className="text-xl font-bold text-[#0e1e3f]">Review posted</h1>
                <p className="mt-1 text-sm text-slate-500">Thanks for sharing your experience.</p>
                <button
                  type="button"
                  onClick={() => navigate('/bookings')}
                  className="mt-6 rounded-md bg-[#2563eb] px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Back to bookings
                </button>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h1 className="text-xl font-bold text-[#0e1e3f]">Review your experience</h1>
                <p className="mt-1 text-sm text-slate-500">
                  {booking.listings?.title ?? 'Booking'} · One review per completed booking.
                </p>

                <div className="mt-4 flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setRating(n)}
                      className={`rounded-full p-1 ${n <= rating ? 'text-amber-500' : 'text-slate-300 hover:text-slate-500'}`}
                    >
                      <Star
                        className="size-8"
                        fill={n <= rating ? 'currentColor' : 'none'}
                      />
                    </button>
                  ))}
                </div>

                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={4}
                  placeholder="What worked? What could improve?"
                  className="mt-4 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
                />

                {submitError && (
                  <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                    {submitError}
                  </p>
                )}

                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting || rating === 0}
                    className="inline-flex items-center gap-1.5 rounded-md bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                  >
                    {submitting && <Loader2 className="size-4 animate-spin" />}
                    Post review
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
