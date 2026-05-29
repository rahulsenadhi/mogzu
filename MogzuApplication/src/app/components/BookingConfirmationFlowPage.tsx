import { CheckCircle2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router'
import { SharedHeader } from './layouts/SharedHeader'
import { SharedSidebar } from './layouts/SharedSidebar'
import { MogzuCorporateScrollSurface } from './layouts/MogzuCorporateScrollSurface'
import { useBookingDraft } from '@/app/lib/bookingDraft'
import { BookingStatusPipeline } from '@/app/components/booking/BookingStatusPipeline'
import { notifyInfo } from '@/app/lib/toast'
import { appendUnifiedBooking, buildUnifiedBookingFromDraft } from '@/app/lib/bookingRecordsStorage'
import { DevMockDataBanner } from '@/app/components/global/DevMockDataBanner'
import { db } from '@/lib/db'
import type { Database } from '@/lib/database.types'

type LiveBooking = Database['public']['Tables']['bookings']['Row'] & {
  listings?: { title?: string | null; location?: string | null } | null
}

const inr = (v: number | null) => `Rs ${Math.max(0, Math.round(v ?? 0)).toLocaleString('en-IN')}`

export default function BookingConfirmationFlowPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { bookingDraft, clearDraft } = useBookingDraft()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [liveBooking, setLiveBooking] = useState<LiveBooking | null>(null)
  const [loadError, setLoadError] = useState('')

  const bookingIdFromUrl = searchParams.get('bookingId') ?? ''
  const bookingIdFromState = (location.state as { bookingId?: string; usedDemo?: boolean } | null)
    ?.bookingId
  const bookingId = bookingIdFromUrl || bookingIdFromState || ''

  const loadLiveBooking = useCallback(async () => {
    if (!bookingId) {
      setLiveBooking(null)
      return
    }
    setLoadError('')
    const { data, error } = await db.bookings.getById(bookingId)
    if (error || !data) {
      setLoadError(error?.message ?? 'Could not load booking confirmation.')
      setLiveBooking(null)
      return
    }
    setLiveBooking(data as LiveBooking)
  }, [bookingId])

  useEffect(() => {
    void loadLiveBooking()
  }, [loadLiveBooking])

  useEffect(() => {
    if (bookingId) return
    if (bookingDraft.status !== 'submitted') {
      navigate('/event-activity', { replace: true })
      return
    }
    if (!bookingDraft.listing) return

    console.log('📧 NOTIFICATION TO VENDOR:')
    console.log(
      '  Listing:',
      String(
        (bookingDraft.listing as { title?: string; name?: string }).title ??
          (bookingDraft.listing as { name?: string }).name ??
          '',
      ),
    )
    console.log('  Booking Ref:', bookingDraft.booking_reference)
    if (bookingDraft.pricing_type === 'request_for_price') {
      console.log('  RFQ Ref:', bookingDraft.booking_reference)
      console.log('  Group Size:', bookingDraft.group_size)
      console.log('  Preferred Date:', bookingDraft.request_data?.preferred_date)
      console.log('  Add-ons:', bookingDraft.selected_addons.map((a) => a.name).join(', '))
      console.log('  Requirements:', bookingDraft.request_data?.requirements)
      console.log(
        '  Respond within:',
        (bookingDraft.listing as { response_time_hours?: number }).response_time_hours ?? 24,
        'hours',
      )
    } else {
      console.log('  Date:', bookingDraft.selected_date)
      console.log('  Slot:', bookingDraft.selected_slot)
      console.log('  Group:', bookingDraft.group_size)
      console.log('  Total:', bookingDraft.calculated.grand_total)
      console.log('  Status: Pending vendor review')
      if (bookingDraft.pricing_type === 'offer_price') {
        console.log('  Offer Amount:', bookingDraft.offer_amount)
        console.log(
          '  Min Acceptable (admin only):',
          (bookingDraft.listing as { min_acceptable_offer?: number }).min_acceptable_offer ?? null,
        )
      }
    }
    console.log('📧 NOTIFICATION TO CORPORATE:')
    console.log('  Booking request submitted.')
    console.log('  Reference:', bookingDraft.booking_reference)

    const unified = buildUnifiedBookingFromDraft(bookingDraft)
    if (unified) appendUnifiedBooking(unified)
  }, [bookingDraft, bookingId, navigate])

  const liveTitle = liveBooking?.listings?.title ?? 'Booking'
  const draftTitle = String(
    (bookingDraft.listing as { title?: string; name?: string } | null)?.title ??
      (bookingDraft.listing as { name?: string } | null)?.name ??
      '',
  )

  const title = useMemo(() => {
    if (liveBooking) {
      return liveBooking.purpose_note?.includes('Request for price')
        ? 'Price Request Sent'
        : 'Booking Request Sent'
    }
    return bookingDraft.pricing_type === 'request_for_price'
      ? 'Price Request Sent'
      : 'Booking Request Sent'
  }, [liveBooking, bookingDraft.pricing_type])

  const reference = liveBooking?.id?.slice(0, 8).toUpperCase() ?? bookingDraft.booking_reference ?? '—'
  const listingTitle = liveBooking ? liveTitle : draftTitle
  const pricingType =
    bookingDraft.pricing_type ??
    (liveBooking?.purpose_note?.includes('Request for price') ? 'request_for_price' : 'transparent')

  if (!bookingId && bookingDraft.status !== 'submitted') return null

  const showDemoBanner = !bookingId

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
          <div className="mx-auto w-full max-w-[1280px] px-5 md:px-8 lg:px-12 py-8 corp-page-enter">
            {showDemoBanner && (
              <div className="mb-4 max-w-3xl mx-auto">
                <DevMockDataBanner message="Confirmation saved locally — submit from a live listing to persist in Supabase." />
              </div>
            )}
            {loadError && bookingId ? (
              <p className="mb-4 max-w-3xl mx-auto rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                {loadError}
              </p>
            ) : null}

            <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-white p-6 md:p-8 corp-soft-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="size-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="size-7 text-emerald-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
                  <p className="corp-body text-slate-600">
                    Reference:{' '}
                    <span className="font-semibold text-slate-900">{reference}</span>
                  </p>
                </div>
              </div>

              <BookingStatusPipeline
                pricing_type={pricingType}
                current_step={1}
                booking_reference={reference}
              />

              <div className="mt-6 rounded-xl border border-slate-200 p-4">
                <h2 className="corp-h3 text-slate-900 mb-2">Summary</h2>
                <p className="corp-body text-slate-700">{listingTitle}</p>

                {liveBooking ? (
                  <div className="mt-2 text-sm text-slate-600 space-y-1">
                    <p>Status: {liveBooking.status.replace(/_/g, ' ')}</p>
                    {liveBooking.start_time ? (
                      <p>
                        When:{' '}
                        {new Date(liveBooking.start_time).toLocaleString('en-IN', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </p>
                    ) : null}
                    <p>Group size: {liveBooking.group_size ?? '—'}</p>
                    <p>Total: {inr(liveBooking.total_amount)}</p>
                  </div>
                ) : bookingDraft.pricing_type === 'request_for_price' ? (
                  <div className="mt-2 text-sm text-slate-600 space-y-1">
                    <p>Preferred date: {bookingDraft.request_data?.preferred_date ?? '-'}</p>
                    <p>Group size: {bookingDraft.group_size ?? '-'}</p>
                    <p>
                      Add-ons:{' '}
                      {bookingDraft.selected_addons.map((a) => a.name).join(', ') || 'None'}
                    </p>
                    <p>
                      Requirements: {(bookingDraft.request_data?.requirements ?? '').slice(0, 100)}
                    </p>
                  </div>
                ) : (
                  <div className="mt-2 text-sm text-slate-600 space-y-1">
                    <p>Date: {bookingDraft.selected_date ?? '-'}</p>
                    <p>
                      Slot:{' '}
                      {bookingDraft.selected_slot
                        ? `${bookingDraft.selected_slot.start_time} - ${bookingDraft.selected_slot.end_time}`
                        : '-'}
                    </p>
                    <p>Group size: {bookingDraft.group_size ?? '-'}</p>
                    {bookingDraft.pricing_type === 'offer_price' ? (
                      <p>
                        Your offer: Rs {(bookingDraft.offer_amount ?? 0).toLocaleString('en-IN')}
                        /person
                      </p>
                    ) : (
                      <p>Total: {inr(bookingDraft.calculated.grand_total)}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                  onClick={() =>
                    navigate(bookingId ? `/bookings/${bookingId}` : '/bookings')
                  }
                >
                  View My Bookings
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  onClick={() => {
                    clearDraft()
                    navigate('/event-activity')
                  }}
                >
                  Browse More Listings
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 inline-flex items-center gap-2"
                  onClick={async () => {
                    const msg = `I've submitted a booking for ${listingTitle} on ${bookingDraft.selected_date ?? 'a selected date'}. Ref: ${reference}`
                    try {
                      if (typeof navigator !== 'undefined' && 'share' in navigator) {
                        await navigator.share({
                          title: `Booked: ${listingTitle}`,
                          text: `I've sent a booking request for ${listingTitle} on ${bookingDraft.selected_date ?? '-'} via Mogzu.`,
                          url: window.location.href,
                        })
                        return
                      }
                      if (navigator.clipboard?.writeText) {
                        await navigator.clipboard.writeText(msg)
                        notifyInfo('Copied to clipboard!')
                      }
                    } catch {
                      // ignore
                    }
                  }}
                >
                  Share this with your team
                </button>
              </div>
            </div>
          </div>
        </MogzuCorporateScrollSurface>
      </div>
    </div>
  )
}
