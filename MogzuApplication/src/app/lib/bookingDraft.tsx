import { createContext, createElement, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type BookingPricingType = 'transparent' | 'offer_price' | 'request_for_price'
export type BookingStatus = 'draft' | 'submitted' | 'vendor_reviewing' | 'confirmed' | 'rejected' | 'completed'

export type BookingDraft = {
  listing: Record<string, unknown> | null
  pricing_type: BookingPricingType | null
  selected_date: string | null
  selected_slot: { start_time: string; end_time: string; slots_available: number } | null
  group_size: number | null
  duration: string | null
  selected_addons: Array<{ name: string; price: number | null; negotiable: boolean }>
  offer_amount: number | null
  request_data: {
    requirements: string | null
    preferred_date: string | null
  } | null
  calculated: {
    base_subtotal: number | null
    addons_total: number | null
    platform_fee: number | null
    grand_total: number | null
  }
  contact: {
    full_name: string
    work_email: string
    phone: string
    company_name: string
    special_instructions: string
  }
  agreement_checked: boolean
  booking_reference: string | null
  status: BookingStatus | null
  submitted_at: string | null
}

const STORAGE_KEY = 'mogzu_booking_draft'
const NAV_EVENT = 'mogzu-history-changed'

const defaultDraft = (): BookingDraft => ({
  listing: null,
  pricing_type: null,
  selected_date: null,
  selected_slot: null,
  group_size: null,
  duration: null,
  selected_addons: [],
  offer_amount: null,
  request_data: null,
  calculated: {
    base_subtotal: null,
    addons_total: null,
    platform_fee: null,
    grand_total: null,
  },
  contact: {
    full_name: '',
    work_email: '',
    phone: '',
    company_name: '',
    special_instructions: '',
  },
  agreement_checked: false,
  booking_reference: null,
  status: 'draft',
  submitted_at: null,
})

const isAllowedPath = (path: string) => {
  return /^\/event-activity\/[^/]+$/.test(path) || path === '/booking/new' || path === '/booking-confirmation' || path === '/booking/confirmation'
}

function patchHistoryEvents() {
  if (typeof window === 'undefined') return
  const marker = '__mogzuHistoryPatched__'
  if ((window as Window & { [k: string]: unknown })[marker]) return
  ;(window as Window & { [k: string]: unknown })[marker] = true
  const patch = (method: 'pushState' | 'replaceState') => {
    const original = window.history[method]
    window.history[method] = function (...args) {
      const result = original.apply(this, args as never)
      window.dispatchEvent(new Event(NAV_EVENT))
      return result
    } as History['pushState']
  }
  patch('pushState')
  patch('replaceState')
}

type Ctx = {
  bookingDraft: BookingDraft
  setDraftPartial: (patch: Partial<BookingDraft>) => void
  clearDraft: () => void
  setContactField: (key: keyof BookingDraft['contact'], value: string) => void
}

const BookingDraftContext = createContext<Ctx | undefined>(undefined)

export function BookingDraftProvider({ children }: { children: ReactNode }) {
  const [bookingDraft, setBookingDraft] = useState<BookingDraft>(() => {
    if (typeof window === 'undefined') return defaultDraft()
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY)
      if (!raw) return defaultDraft()
      const parsed = JSON.parse(raw) as BookingDraft
      if (parsed?.status === 'submitted') {
        window.sessionStorage.removeItem(STORAGE_KEY)
        return defaultDraft()
      }
      return { ...defaultDraft(), ...parsed }
    } catch {
      return defaultDraft()
    }
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (bookingDraft.status === 'submitted') {
      window.sessionStorage.removeItem(STORAGE_KEY)
      return
    }
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(bookingDraft))
  }, [bookingDraft])

  useEffect(() => {
    if (typeof window === 'undefined') return
    patchHistoryEvents()
    const clearWhenLeavingFlow = () => {
      if (!isAllowedPath(window.location.pathname)) {
        setBookingDraft((prev) => (prev.listing || prev.booking_reference ? defaultDraft() : prev))
      }
    }
    window.addEventListener('popstate', clearWhenLeavingFlow)
    window.addEventListener(NAV_EVENT, clearWhenLeavingFlow)
    clearWhenLeavingFlow()
    return () => {
      window.removeEventListener('popstate', clearWhenLeavingFlow)
      window.removeEventListener(NAV_EVENT, clearWhenLeavingFlow)
    }
  }, [])

  const setDraftPartial = (patch: Partial<BookingDraft>) => {
    setBookingDraft((prev) => ({ ...prev, ...patch }))
  }

  const setContactField = (key: keyof BookingDraft['contact'], value: string) => {
    setBookingDraft((prev) => ({ ...prev, contact: { ...prev.contact, [key]: value } }))
  }

  const clearDraft = () => {
    setBookingDraft(defaultDraft())
    if (typeof window !== 'undefined') window.sessionStorage.removeItem(STORAGE_KEY)
  }

  const value = useMemo<Ctx>(
    () => ({ bookingDraft, setDraftPartial, clearDraft, setContactField }),
    [bookingDraft],
  )

  return createElement(BookingDraftContext.Provider, { value }, children)
}

export function useBookingDraft() {
  const ctx = useContext(BookingDraftContext)
  if (!ctx) throw new Error('useBookingDraft must be used within BookingDraftProvider')
  return ctx
}

