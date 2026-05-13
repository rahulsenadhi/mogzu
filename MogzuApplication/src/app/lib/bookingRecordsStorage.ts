import type { BookingDraft } from '@/app/lib/bookingDraft'
import { deriveBookingTypeFromStatus } from '@/app/lib/bookingStatus'

export type UnifiedBookingRecord = {
  id: string
  name: string
  venue: string
  vendor: string
  assignTo: string
  fromDate: string
  toDate: string
  attendance: number
  price: number
  status: 'PENDING' | 'Requested' | 'PUBLISHED' | 'CONFIRMED' | 'CANCELLED' | 'INQUIRY' | 'APPROVED'
  type: 'Inquiry' | 'Request' | 'Pending' | 'Confirmed' | 'Cancelled' | 'Approved'
  source: 'classic' | 'gifting'
}

const STORAGE_KEY = 'mogzuUnifiedBookings'
const LEGACY_GIFTING_KEY = 'giftingBookings'

const parseJson = <T>(value: string | null, fallback: T): T => {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

export const loadUnifiedBookings = (): UnifiedBookingRecord[] => {
  if (typeof window === 'undefined') return []
  return parseJson<UnifiedBookingRecord[]>(window.localStorage.getItem(STORAGE_KEY), [])
}

const saveUnifiedBookings = (bookings: UnifiedBookingRecord[]) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings))
}

export const appendUnifiedBooking = (booking: UnifiedBookingRecord) => {
  const current = loadUnifiedBookings()
  const exists = current.some((item) => item.id === booking.id)
  if (exists) {
    const updated = current.map((item) => (item.id === booking.id ? booking : item))
    saveUnifiedBookings(updated)
    return
  }
  saveUnifiedBookings([...current, booking])
}

export const migrateLegacyGiftingBookings = () => {
  if (typeof window === 'undefined') return
  const legacy = parseJson<UnifiedBookingRecord[]>(window.localStorage.getItem(LEGACY_GIFTING_KEY), [])
  if (!legacy.length) return

  const current = loadUnifiedBookings()
  const merged = [...current]
  legacy.forEach((entry) => {
    if (!merged.some((item) => item.id === entry.id)) {
      merged.push({ ...entry, source: 'gifting' })
    }
  })
  saveUnifiedBookings(merged)
  window.localStorage.removeItem(LEGACY_GIFTING_KEY)
}

const toDisplayDate = (dateValue: string | null | undefined) => {
  if (!dateValue) return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const parsed = new Date(dateValue)
  if (Number.isNaN(parsed.getTime())) return dateValue
  return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export const buildUnifiedBookingFromDraft = (draft: BookingDraft): UnifiedBookingRecord | null => {
  if (!draft.booking_reference || !draft.listing) return null

  const listing = draft.listing as { title?: string; name?: string; city?: string; vendor_name?: string }
  const isRfq = draft.pricing_type === 'request_for_price'
  const derivedStatus: UnifiedBookingRecord['status'] = isRfq ? 'INQUIRY' : 'Requested'
  const derivedType: UnifiedBookingRecord['type'] = deriveBookingTypeFromStatus(derivedStatus)
  const fromDate = toDisplayDate(draft.selected_date ?? draft.request_data?.preferred_date)
  const slotEnd = draft.selected_slot?.end_time ?? fromDate

  return {
    id: draft.booking_reference.replace(/^#/, ''),
    name: String(listing.title ?? listing.name ?? 'Booking request'),
    venue: String(listing.city ?? 'TBD'),
    vendor: String(listing.vendor_name ?? 'Mogzu Vendor'),
    assignTo: draft.contact.full_name || 'Pending assignment',
    fromDate,
    toDate: slotEnd,
    attendance: Number(draft.group_size ?? 0),
    price: Math.round(Number(draft.calculated.grand_total ?? 0)),
    status: derivedStatus,
    type: derivedType,
    source: 'classic',
  }
}
