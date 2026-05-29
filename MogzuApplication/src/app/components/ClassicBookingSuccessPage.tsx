import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router'
import { CheckCircle2, Calendar, MapPin, Users, Receipt } from 'lucide-react'
import { SharedHeader } from './layouts/SharedHeader'
import { SharedSidebar } from './layouts/SharedSidebar'
import { MogzuCorporateScrollSurface } from './layouts/MogzuCorporateScrollSurface'
import { DevMockDataBanner } from '@/app/components/global/DevMockDataBanner'
import { db } from '@/lib/db'
import type { Database } from '@/lib/database.types'

interface ClassicBookingSuccessState {
  category?: string
  bookingId?: string
  bookingFlow?: {
    spaceName?: string
    location?: string
    spaceImage?: string
    bookingStartDate?: string
    bookingFromTime?: string
    bookingToTime?: string
    attendees?: number
    spaceTypes?: string
  }
  paymentTiming?: 'full' | 'partial'
  amountPaid?: number
  remainingAmount?: number
  vendorOrderId?: string
}

type LiveBooking = Database['public']['Tables']['bookings']['Row'] & {
  listings?: { title?: string | null; location?: string | null } | null
}

function generateRef() {
  return `MG-${Date.now().toString(36).toUpperCase().slice(-6)}`
}

const inr = (v: number | undefined | null) =>
  `₹${Math.max(0, Math.round(v ?? 0)).toLocaleString('en-IN')}`

export default function ClassicBookingSuccessPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as ClassicBookingSuccessState | undefined
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [fallbackRef] = useState(() => generateRef())
  const [liveBooking, setLiveBooking] = useState<LiveBooking | null>(null)
  const [loadError, setLoadError] = useState('')

  const bookingId = state?.bookingId ?? ''

  const loadBooking = useCallback(async () => {
    if (!bookingId) {
      setLiveBooking(null)
      return
    }
    const { data, error } = await db.bookings.getById(bookingId)
    if (error || !data) {
      setLoadError(error?.message ?? 'Could not load booking details.')
      setLiveBooking(null)
      return
    }
    setLiveBooking(data as LiveBooking)
  }, [bookingId])

  useEffect(() => {
    void loadBooking()
  }, [loadBooking])

  useEffect(() => {
    if (!state?.category && !state?.bookingFlow && !bookingId) {
      navigate('/event-activity', { replace: true })
    }
  }, [state, bookingId, navigate])

  if (!state && !bookingId) return null

  const { category = 'conference', bookingFlow, amountPaid, remainingAmount, paymentTiming } =
    state ?? {}

  const categoryLabel: Record<string, string> = {
    conference: 'Conference Room',
    coworking: 'Co-working Space',
    activity: 'Activity Booking',
    meeting: 'Meeting Room',
    event: 'Event Venue',
    promotion: 'Promotional Package',
    default: 'Space Booking',
  }

  const ref = liveBooking?.id?.slice(0, 8).toUpperCase() ?? fallbackRef
  const venueName =
    liveBooking?.listings?.title ?? bookingFlow?.spaceName ?? categoryLabel[category] ?? categoryLabel.default
  const venueLocation =
    liveBooking?.listings?.location ?? bookingFlow?.location ?? 'Mumbai'
  const date = bookingFlow?.bookingStartDate
    ? bookingFlow.bookingStartDate
    : liveBooking?.start_time
      ? new Date(liveBooking.start_time).toLocaleDateString('en-IN', { dateStyle: 'medium' })
      : 'Scheduled Date'
  const timeSlot =
    bookingFlow?.bookingFromTime && bookingFlow?.bookingToTime
      ? `${bookingFlow.bookingFromTime} – ${bookingFlow.bookingToTime}`
      : liveBooking?.start_time && liveBooking?.end_time
        ? `${new Date(liveBooking.start_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} – ${new Date(liveBooking.end_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`
        : null
  const attendees = bookingFlow?.attendees ?? liveBooking?.group_size
  const paidAmount = amountPaid ?? (liveBooking?.payment_status === 'paid' ? liveBooking.total_amount : null)

  return (
    <div className="flex h-screen bg-[#FFFDF9] overflow-hidden">
      <SharedSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <SharedHeader
          onMobileMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          searchPlaceholder="Search"
        />
        <MogzuCorporateScrollSurface>
          <div className="mx-auto w-full max-w-[1280px] px-5 md:px-8 lg:px-12 py-8">
            {!bookingId && (
              <div className="max-w-2xl mx-auto mb-4">
                <DevMockDataBanner message="Demo confirmation — classic checkout without a live listing UUID." />
              </div>
            )}
            {loadError && bookingId ? (
              <p className="max-w-2xl mx-auto mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                {loadError}
              </p>
            ) : null}

            <div className="max-w-2xl mx-auto rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
              <div className="flex items-start gap-4 mb-6">
                <div className="size-14 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="size-8 text-emerald-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Booking Confirmed!</h1>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Reference: <span className="font-semibold text-slate-800">{ref}</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    A confirmation has been sent to your registered email.
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 mb-6 space-y-3">
                <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">
                  Booking Summary
                </h2>

                <div className="flex items-center gap-3">
                  <MapPin className="size-4 text-slate-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">{venueName}</p>
                    <p className="text-xs text-slate-500">{venueLocation}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="size-4 text-slate-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">{date}</p>
                    {timeSlot && <p className="text-xs text-slate-500">{timeSlot}</p>}
                  </div>
                </div>

                {attendees != null && (
                  <div className="flex items-center gap-3">
                    <Users className="size-4 text-slate-400 flex-shrink-0" />
                    <p className="text-sm text-slate-700">{attendees} attendees</p>
                  </div>
                )}

                {paidAmount != null && (
                  <div className="flex items-center gap-3">
                    <Receipt className="size-4 text-slate-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {inr(paidAmount)} paid
                        {paymentTiming === 'partial' ? ' (partial)' : ''}
                      </p>
                      {remainingAmount != null && remainingAmount > 0 && (
                        <p className="text-xs text-amber-600">
                          {inr(remainingAmount)} remaining — payable at venue
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 mb-6">
                <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">
                  What happens next
                </h2>
                <ol className="space-y-4">
                  {[
                    { label: 'Booking request received', done: true },
                    { label: 'Vendor reviewing your request', done: false },
                    { label: 'Confirmation & invoice sent', done: false },
                    { label: 'Day of event / booking', done: false },
                  ].map(({ label, done }, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div
                        className={`size-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          done
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {done ? <CheckCircle2 className="size-4" /> : i + 1}
                      </div>
                      <span
                        className={`text-sm ${done ? 'font-medium text-slate-900' : 'text-slate-500'}`}
                      >
                        {label}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => navigate(bookingId ? `/bookings/${bookingId}` : '/bookings')}
                  className="flex-1 py-3 bg-[#2563eb] text-white rounded-xl text-sm font-semibold hover:bg-[#1d4ed8] transition-colors"
                >
                  View My Bookings
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/dspace/classic')}
                  className="flex-1 py-3 border border-slate-300 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
                >
                  Browse More Spaces
                </button>
              </div>
            </div>
          </div>
        </MogzuCorporateScrollSurface>
      </div>
    </div>
  )
}
