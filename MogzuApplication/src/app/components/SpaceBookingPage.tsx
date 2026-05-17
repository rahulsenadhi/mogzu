import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router'
import {
  ArrowLeft,
  ArrowRight,
  Calendar as CalIcon,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  MapPin,
  MinusCircle,
  PlusCircle,
  QrCode,
  ShieldAlert,
  Users,
} from 'lucide-react'
import { SharedHeader } from './layouts/SharedHeader'
import { SharedSidebar } from './layouts/SharedSidebar'
import { MogzuCorporateScrollSurface } from './layouts/MogzuCorporateScrollSurface'
import { useAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import { storageService } from '@/lib/storage'
import {
  computeResaleMargin,
  loadResaleContext,
  type ResaleContext,
} from '@/lib/partnerCheckout'
import type {
  BudgetRule,
  CalendarSlot,
  Listing,
  ListingAddOn,
  ListingImage,
  Vendor,
} from '@/lib/database.types'

type ListingDetail = Listing & {
  listing_images: ListingImage[]
  listing_add_ons: ListingAddOn[]
  vendors: Vendor | null
}

type StepKey = 'slot' | 'attendees' | 'addons' | 'review' | 'done'

const STEPS: { key: StepKey; label: string }[] = [
  { key: 'slot', label: 'Slot' },
  { key: 'attendees', label: 'Attendees' },
  { key: 'addons', label: 'Add-ons' },
  { key: 'review', label: 'Review' },
]

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7) // 7am–8pm

function startOfMonth(d: Date): Date {
  const r = new Date(d)
  r.setDate(1)
  r.setHours(0, 0, 0, 0)
  return r
}

function addMonths(d: Date, n: number): Date {
  const r = new Date(d)
  r.setMonth(r.getMonth() + n)
  return r
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function formatHour(h: number): string {
  return h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`
}

function formatDateFull(d: Date): string {
  return d.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function buildSlotStart(day: Date, hour: number): Date {
  const r = new Date(day)
  r.setHours(hour, 0, 0, 0)
  return r
}

function slotsOverlap(
  startMs: number,
  endMs: number,
  blocked: CalendarSlot[],
): boolean {
  return blocked.some((s) => {
    const sStart = new Date(s.start_time).getTime()
    const sEnd = new Date(s.end_time).getTime()
    return sStart < endMs && sEnd > startMs
  })
}

export default function SpaceBookingPage() {
  const navigate = useNavigate()
  const params = useParams<{ listingId: string }>()
  const [searchParams] = useSearchParams()
  const { profile, corporateId, role } = useAuth()
  const canBook = role === 'l1_employee' || role === 'l2_manager' || role === 'l3_admin'

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [step, setStep] = useState<StepKey>('slot')

  const [listing, setListing] = useState<ListingDetail | null>(null)
  const [bookedSlots, setBookedSlots] = useState<CalendarSlot[]>([])
  const [budgets, setBudgets] = useState<BudgetRule[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [calendarMonth, setCalendarMonth] = useState<Date>(() => startOfMonth(new Date()))
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [startHour, setStartHour] = useState<number>(10)
  const [endHour, setEndHour] = useState<number>(13)
  const [slotError, setSlotError] = useState('')

  const [attendees, setAttendees] = useState<number>(0)
  const [attendeesError, setAttendeesError] = useState('')

  const [selectedAddOns, setSelectedAddOns] = useState<Record<string, number>>({})
  const [purposeNote, setPurposeNote] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(null)
  const [confirmedStatus, setConfirmedStatus] = useState<'pending_approval' | 'pending_vendor' | null>(null)
  const [resaleCtx2, setResaleCtx2] = useState<ResaleContext | null>(null)

  const loadAll = useCallback(async () => {
    if (!params.listingId || !corporateId) return
    setLoading(true)
    setLoadError('')

    const [lRes, bRes] = await Promise.all([
      db.listings.getById(params.listingId),
      db.budgets.listByCorporate(corporateId),
    ])

    if (lRes.error || !lRes.data) {
      setLoadError(lRes.error?.message ?? 'Listing not found.')
      setLoading(false)
      return
    }
    const l = lRes.data as ListingDetail
    setListing(l)
    setBudgets((bRes.data ?? []) as BudgetRule[])

    // Pre-fill from query params (Hey Genie handoff). Clamp to capacity.
    const headcountParam = parseInt(searchParams.get('headcount') ?? '', 10)
    if (Number.isFinite(headcountParam) && headcountParam > 0) {
      const min = l.min_capacity ?? 1
      const max = l.max_capacity ?? headcountParam
      setAttendees(Math.min(Math.max(headcountParam, min), max))
    } else {
      setAttendees(l.min_capacity ?? 1)
    }
    const dateParam = searchParams.get('date')
    if (dateParam) {
      const parsed = new Date(`${dateParam}T00:00:00`)
      if (!Number.isNaN(parsed.getTime()) && parsed.getTime() >= startOfMonth(new Date()).getTime()) {
        setSelectedDate(parsed)
        setCalendarMonth(startOfMonth(parsed))
      }
    }

    const from = new Date()
    const to = new Date()
    to.setMonth(to.getMonth() + 3)
    const slotsRes = await db.calendar.getSlotsForListing(
      l.id,
      from.toISOString(),
      to.toISOString(),
    )
    setBookedSlots(
      ((slotsRes.data ?? []) as CalendarSlot[]).filter((s) =>
        ['blocked', 'booked'].includes(s.slot_type),
      ),
    )

    setLoading(false)
  }, [params.listingId, corporateId, searchParams])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  useEffect(() => {
    if (!corporateId) {
      setResaleCtx2(null)
      return
    }
    let cancelled = false
    void loadResaleContext(corporateId).then((ctx) => {
      if (!cancelled) setResaleCtx2(ctx)
    })
    return () => {
      cancelled = true
    }
  }, [corporateId])

  // Pricing
  const isHourly = listing?.price_unit === 'per_hour'
  const isDaily = listing?.price_unit === 'per_day'
  const hours = Math.max(0, endHour - startHour)
  const baseRate = listing?.base_price ?? 0
  const baseAmount = isHourly
    ? baseRate * hours
    : isDaily
      ? baseRate
      : baseRate * Math.max(hours, 1)

  const addOnsAmount = useMemo(() => {
    if (!listing) return 0
    return Object.entries(selectedAddOns).reduce((sum, [id, qty]) => {
      const a = listing.listing_add_ons.find((x) => x.id === id)
      return sum + (a ? a.price * qty : 0)
    }, 0)
  }, [selectedAddOns, listing])
  const platformFee = Math.round(baseAmount * 0.05)
  const partnerMarkupPct = resaleCtx2?.markupPct ?? 0
  const partnerMargin = computeResaleMargin(baseAmount + addOnsAmount, partnerMarkupPct)
  const totalAmount = baseAmount + addOnsAmount + platformFee + partnerMargin

  // Approval
  const approvalDecision = useMemo(() => {
    const matching = budgets.find(
      (b) => b.module === null || b.module === listing?.module,
    )
    if (!matching) return { requiresApproval: false, reason: 'No budget rules configured.' }
    if (!matching.requires_approval)
      return { requiresApproval: false, reason: 'Budget rule allows direct booking.' }
    if (matching.auto_approve_below != null && totalAmount <= matching.auto_approve_below) {
      return {
        requiresApproval: false,
        reason: `Under auto-approve threshold (₹${matching.auto_approve_below.toLocaleString('en-IN')}).`,
      }
    }
    return { requiresApproval: true, reason: 'Above auto-approve threshold — manager approval needed.' }
  }, [budgets, listing?.module, totalAmount])

  // Calendar grid
  const monthGrid = useMemo(() => {
    const first = startOfMonth(calendarMonth)
    const startDow = first.getDay()
    const daysInMonth = new Date(
      calendarMonth.getFullYear(),
      calendarMonth.getMonth() + 1,
      0,
    ).getDate()
    const cells: (Date | null)[] = []
    for (let i = 0; i < startDow; i++) cells.push(null)
    for (let i = 1; i <= daysInMonth; i++) {
      cells.push(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), i))
    }
    return cells
  }, [calendarMonth])

  const fullyBlockedDays = useMemo(() => {
    // Day is fully blocked if a slot spans the entire 7am–9pm window
    const set = new Set<string>()
    bookedSlots.forEach((s) => {
      const sStart = new Date(s.start_time)
      const sEnd = new Date(s.end_time)
      if (sEnd.getTime() - sStart.getTime() >= 12 * 3_600_000) {
        set.add(isoDay(sStart))
      }
    })
    return set
  }, [bookedSlots])

  const today = useMemo(() => {
    const t = new Date()
    t.setHours(0, 0, 0, 0)
    return t
  }, [])

  // Hour blocked map for selected day
  const blockedHours = useMemo(() => {
    if (!selectedDate) return new Set<number>()
    const set = new Set<number>()
    const dayStart = new Date(selectedDate)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(selectedDate)
    dayEnd.setHours(23, 59, 59, 0)
    bookedSlots.forEach((s) => {
      const sStart = new Date(s.start_time)
      const sEnd = new Date(s.end_time)
      if (sEnd <= dayStart || sStart > dayEnd) return
      for (let h = 0; h < 24; h++) {
        const cellStart = new Date(selectedDate)
        cellStart.setHours(h, 0, 0, 0)
        const cellEnd = new Date(selectedDate)
        cellEnd.setHours(h + 1, 0, 0, 0)
        if (sStart < cellEnd && sEnd > cellStart) set.add(h)
      }
    })
    return set
  }, [selectedDate, bookedSlots])

  const validateSlot = (): boolean => {
    if (!selectedDate) {
      setSlotError('Select a date.')
      return false
    }
    if (endHour <= startHour) {
      setSlotError('End time must be after start time.')
      return false
    }
    // Check no booked hour falls within selected range
    for (let h = startHour; h < endHour; h++) {
      if (blockedHours.has(h)) {
        setSlotError(`Slot conflicts with an existing booking at ${formatHour(h)}.`)
        return false
      }
    }
    setSlotError('')
    return true
  }

  const validateAttendees = (): boolean => {
    if (!listing) return false
    if (!attendees || attendees < 1) {
      setAttendeesError('At least 1 attendee.')
      return false
    }
    if (listing.min_capacity && attendees < listing.min_capacity) {
      setAttendeesError(`Minimum ${listing.min_capacity}.`)
      return false
    }
    if (listing.max_capacity && attendees > listing.max_capacity) {
      setAttendeesError(`Maximum ${listing.max_capacity}.`)
      return false
    }
    setAttendeesError('')
    return true
  }

  const next = () => {
    if (step === 'slot' && !validateSlot()) return
    if (step === 'attendees' && !validateAttendees()) return
    const order: StepKey[] = ['slot', 'attendees', 'addons', 'review']
    const idx = order.indexOf(step)
    if (idx < order.length - 1) setStep(order[idx + 1])
  }

  const back = () => {
    const order: StepKey[] = ['slot', 'attendees', 'addons', 'review']
    const idx = order.indexOf(step)
    if (idx > 0) setStep(order[idx - 1])
  }

  const handleSubmit = async () => {
    if (!listing || !corporateId || !profile || !selectedDate) return
    setSubmitting(true)
    setSubmitError('')

    const startTime = buildSlotStart(selectedDate, startHour)
    const endTime = buildSlotStart(selectedDate, endHour)

    // Final overlap check
    if (slotsOverlap(startTime.getTime(), endTime.getTime(), bookedSlots)) {
      setSubmitError('This slot was just booked. Pick a different time.')
      setSubmitting(false)
      loadAll()
      return
    }

    let commissionRate: number | null = null
    const vRule = await db.commissions.getForVendor(listing.vendor_id)
    if (vRule.data && vRule.data.length > 0) commissionRate = vRule.data[0].rate
    else {
      const g = await db.commissions.getGlobal()
      if (g.data) commissionRate = g.data.rate
    }

    const status = approvalDecision.requiresApproval ? 'pending_approval' : 'pending_vendor'

    const { data, error } = await db.bookings.create({
      corporate_id: corporateId,
      user_id: profile.id,
      vendor_id: listing.vendor_id,
      listing_id: listing.id,
      module: listing.module,
      status,
      group_size: attendees,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      base_amount: baseAmount,
      add_ons_amount: addOnsAmount,
      platform_fee: platformFee,
      total_amount: totalAmount,
      commission_rate: commissionRate,
      payment_method: null,
      payment_reference: null,
      payment_status: 'pending',
      purpose_note: purposeNote.trim() || null,
      approved_by: null,
      approved_at: null,
      cancelled_at: null,
      cancellation_reason: null,
      cancellation_fee: null,
      vendor_response_deadline:
        status === 'pending_vendor'
          ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          : null,
      completed_at: null,
      partner_id: resaleCtx2?.partner.id ?? null,
      partner_markup_pct: partnerMarkupPct || null,
      partner_margin_amount: partnerMargin || null,
      partner_invoice_token: resaleCtx2 ? resaleCtx2.invoiceToken : null,
    })

    if (error || !data) {
      setSubmitError(error?.message ?? 'Failed to submit booking.')
      setSubmitting(false)
      return
    }

    const addOnRows = Object.entries(selectedAddOns)
      .filter(([, qty]) => qty > 0)
      .map(([id, quantity]) => {
        const a = listing.listing_add_ons.find((x) => x.id === id)!
        return {
          booking_id: data.id,
          add_on_id: id,
          name: a.name,
          price: a.price,
          quantity,
        }
      })
    if (addOnRows.length > 0) {
      await db.bookings.addAddOns(addOnRows)
    }

    setConfirmedBookingId(data.id)
    setConfirmedStatus(status)
    setStep('done')
    setSubmitting(false)
  }

  if (!canBook) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FFFDF9]">
        <div className="max-w-md rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
          <ShieldAlert className="mx-auto mb-2 size-8 text-amber-600" />
          <p className="text-sm text-amber-800">Corporate role required to book a space.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#FFFDF9]">
      <SharedSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeNav="bookings"
      />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <SharedHeader onMobileMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <MogzuCorporateScrollSurface>
          <div className="mx-auto max-w-5xl px-8 py-6">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800"
            >
              <ArrowLeft className="size-4" />
              Back
            </button>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="size-6 animate-spin text-slate-400" />
              </div>
            ) : loadError || !listing ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-6">
                <p className="text-sm text-red-700">{loadError || 'Listing not found.'}</p>
                <button
                  type="button"
                  onClick={loadAll}
                  className="mt-3 rounded-md bg-[#2563eb] px-3 py-1.5 text-xs font-medium text-white"
                >
                  Retry
                </button>
              </div>
            ) : step === 'done' && confirmedBookingId ? (
              <ConfirmationCard
                bookingId={confirmedBookingId}
                status={confirmedStatus!}
                listing={listing}
                date={selectedDate!}
                startHour={startHour}
                endHour={endHour}
                onPay={() => navigate(`/bookings/${confirmedBookingId}/pay`)}
                onView={() => navigate('/bookings')}
              />
            ) : (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
                <div className="space-y-6">
                  <ol className="flex items-center gap-2 overflow-x-auto rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
                    {STEPS.map((s, i) => {
                      const order: StepKey[] = ['slot', 'attendees', 'addons', 'review']
                      const active = step === s.key
                      const done = order.indexOf(step) > i
                      return (
                        <li key={s.key} className="flex items-center gap-2">
                          <span
                            className={`flex size-7 items-center justify-center rounded-full text-xs font-semibold ${
                              done
                                ? 'bg-emerald-100 text-emerald-700'
                                : active
                                  ? 'bg-[#2563eb] text-white'
                                  : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {done ? <CheckCircle2 className="size-4" /> : i + 1}
                          </span>
                          <span className={`text-sm font-medium ${active ? 'text-[#0e1e3f]' : 'text-slate-500'}`}>
                            {s.label}
                          </span>
                          {i < STEPS.length - 1 && <span className="text-slate-300">›</span>}
                        </li>
                      )
                    })}
                  </ol>

                  <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    {step === 'slot' && (
                      <StepSlot
                        listing={listing}
                        calendarMonth={calendarMonth}
                        onMonthPrev={() => setCalendarMonth((d) => addMonths(d, -1))}
                        onMonthNext={() => setCalendarMonth((d) => addMonths(d, 1))}
                        monthGrid={monthGrid}
                        fullyBlockedDays={fullyBlockedDays}
                        today={today}
                        selectedDate={selectedDate}
                        onPickDate={(d) => {
                          setSelectedDate(d)
                          setSlotError('')
                        }}
                        startHour={startHour}
                        endHour={endHour}
                        setStartHour={(h) => {
                          setStartHour(h)
                          setSlotError('')
                        }}
                        setEndHour={(h) => {
                          setEndHour(h)
                          setSlotError('')
                        }}
                        blockedHours={blockedHours}
                        error={slotError}
                      />
                    )}
                    {step === 'attendees' && (
                      <StepAttendees
                        attendees={attendees}
                        setAttendees={(n) => {
                          setAttendees(n)
                          setAttendeesError('')
                        }}
                        listing={listing}
                        error={attendeesError}
                      />
                    )}
                    {step === 'addons' && (
                      <StepAddOns
                        addOns={listing.listing_add_ons}
                        selected={selectedAddOns}
                        onChange={setSelectedAddOns}
                      />
                    )}
                    {step === 'review' && (
                      <StepReview
                        listing={listing}
                        selectedDate={selectedDate!}
                        startHour={startHour}
                        endHour={endHour}
                        hours={hours}
                        attendees={attendees}
                        selectedAddOns={selectedAddOns}
                        baseAmount={baseAmount}
                        addOnsAmount={addOnsAmount}
                        platformFee={platformFee}
                        totalAmount={totalAmount}
                        approvalDecision={approvalDecision}
                        purposeNote={purposeNote}
                        setPurposeNote={setPurposeNote}
                      />
                    )}

                    {submitError && (
                      <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                        {submitError}
                      </p>
                    )}

                    <div className="mt-6 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={back}
                        disabled={step === 'slot'}
                        className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                      >
                        Back
                      </button>
                      {step !== 'review' ? (
                        <button
                          type="button"
                          onClick={next}
                          className="inline-flex items-center gap-1.5 rounded-md bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                        >
                          Continue <ArrowRight className="size-4" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSubmit}
                          disabled={submitting}
                          className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                        >
                          {submitting && <Loader2 className="size-4 animate-spin" />}
                          Submit booking
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <aside className="space-y-4">
                  <ListingCard listing={listing} />
                  <PriceCard
                    listing={listing}
                    hours={hours}
                    baseAmount={baseAmount}
                    addOnsAmount={addOnsAmount}
                    platformFee={platformFee}
                    totalAmount={totalAmount}
                  />
                </aside>
              </div>
            )}
          </div>
        </MogzuCorporateScrollSurface>
      </div>
    </div>
  )
}

// ─── Steps ────────────────────────────────────────────────────────────────────

function StepSlot({
  listing,
  calendarMonth,
  onMonthPrev,
  onMonthNext,
  monthGrid,
  fullyBlockedDays,
  today,
  selectedDate,
  onPickDate,
  startHour,
  endHour,
  setStartHour,
  setEndHour,
  blockedHours,
  error,
}: {
  listing: Listing
  calendarMonth: Date
  onMonthPrev: () => void
  onMonthNext: () => void
  monthGrid: (Date | null)[]
  fullyBlockedDays: Set<string>
  today: Date
  selectedDate: Date | null
  onPickDate: (d: Date) => void
  startHour: number
  endHour: number
  setStartHour: (h: number) => void
  setEndHour: (h: number) => void
  blockedHours: Set<number>
  error: string
}) {
  const isDaily = listing.price_unit === 'per_day'
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <CalIcon className="size-5 text-[#2563eb]" />
        <h2 className="text-lg font-semibold text-[#0e1e3f]">Select a slot</h2>
      </div>
      <div className="rounded-xl border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-200 p-3">
          <button
            type="button"
            onClick={onMonthPrev}
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
          >
            <ChevronLeft className="size-4" />
          </button>
          <p className="text-sm font-semibold text-[#0e1e3f]">
            {calendarMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          </p>
          <button
            type="button"
            onClick={onMonthNext}
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 p-3 text-center text-[11px] text-slate-400">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 px-3 pb-3">
          {monthGrid.map((cell, i) => {
            if (!cell) return <span key={`b-${i}`} />
            const blocked = fullyBlockedDays.has(isoDay(cell))
            const past = cell < today
            const selected = selectedDate && isSameDay(cell, selectedDate)
            const disabled = blocked || past
            return (
              <button
                key={cell.toISOString()}
                type="button"
                onClick={() => !disabled && onPickDate(cell)}
                disabled={disabled}
                className={`aspect-square rounded-lg text-sm ${
                  selected
                    ? 'bg-[#2563eb] text-white'
                    : disabled
                      ? 'text-slate-300 line-through'
                      : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {cell.getDate()}
              </button>
            )
          })}
        </div>
      </div>

      {!isDaily && selectedDate && (
        <div className="mt-4">
          <div className="mb-2 flex items-center gap-2">
            <Clock className="size-5 text-[#2563eb]" />
            <h3 className="font-semibold text-[#0e1e3f]">Time window</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Start
              </label>
              <select
                value={startHour}
                onChange={(e) => setStartHour(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
              >
                {HOURS.map((h) => (
                  <option key={h} value={h} disabled={blockedHours.has(h)}>
                    {formatHour(h)}
                    {blockedHours.has(h) ? ' (booked)' : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                End
              </label>
              <select
                value={endHour}
                onChange={(e) => setEndHour(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
              >
                {HOURS.concat([21]).map((h) => (
                  <option key={h} value={h}>
                    {formatHour(h)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {error}
        </p>
      )}

      {selectedDate && (
        <p className="mt-3 text-sm text-emerald-700">
          <strong>{formatDateFull(selectedDate)}</strong>
          {!isDaily && (
            <span>
              {' '}· {formatHour(startHour)} – {formatHour(endHour)}
            </span>
          )}
        </p>
      )}
    </div>
  )
}

function StepAttendees({
  attendees,
  setAttendees,
  listing,
  error,
}: {
  attendees: number
  setAttendees: (n: number) => void
  listing: ListingDetail
  error: string
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <Users className="size-5 text-[#2563eb]" />
        <h2 className="text-lg font-semibold text-[#0e1e3f]">Attendees</h2>
      </div>
      <p className="mb-4 text-sm text-slate-500">
        {listing.min_capacity && listing.max_capacity
          ? `Allowed: ${listing.min_capacity}–${listing.max_capacity}.`
          : listing.max_capacity
            ? `Up to ${listing.max_capacity}.`
            : 'Enter the number of attendees.'}
      </p>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => setAttendees(Math.max(1, attendees - 1))}
          className="text-slate-400 hover:text-[#2563eb]"
        >
          <MinusCircle className="size-8" />
        </button>
        <input
          type="number"
          min="1"
          value={attendees}
          onChange={(e) => setAttendees(Number(e.target.value) || 0)}
          className="h-14 w-32 rounded-xl border border-slate-200 px-4 text-center text-2xl font-bold"
        />
        <button
          type="button"
          onClick={() => setAttendees(attendees + 1)}
          className="text-slate-400 hover:text-[#2563eb]"
        >
          <PlusCircle className="size-8" />
        </button>
      </div>
      {error && <p className="mt-3 text-sm text-rose-700">{error}</p>}
    </div>
  )
}

function StepAddOns({
  addOns,
  selected,
  onChange,
}: {
  addOns: ListingAddOn[]
  selected: Record<string, number>
  onChange: (next: Record<string, number>) => void
}) {
  const setQty = (id: string, qty: number) => {
    const next = { ...selected }
    if (qty <= 0) delete next[id]
    else next[id] = qty
    onChange(next)
  }
  return (
    <div>
      <h2 className="mb-2 text-lg font-semibold text-[#0e1e3f]">Add-ons</h2>
      <p className="mb-4 text-sm text-slate-500">
        {addOns.length === 0
          ? 'No add-ons available for this space.'
          : 'Catering, AV equipment, etc.'}
      </p>
      <div className="space-y-3">
        {addOns.map((a) => {
          const qty = selected[a.id] ?? 0
          return (
            <div
              key={a.id}
              className="flex items-center justify-between rounded-xl border border-slate-200 p-4"
            >
              <div className="flex-1">
                <p className="font-medium text-[#0e1e3f]">{a.name}</p>
                {a.description && (
                  <p className="mt-0.5 text-xs text-slate-500">{a.description}</p>
                )}
                <p className="mt-1 text-sm font-semibold text-[#2563eb]">
                  ₹ {a.price.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQty(a.id, qty - 1)}
                  className="text-slate-400 hover:text-[#2563eb]"
                >
                  <MinusCircle className="size-6" />
                </button>
                <span className="w-6 text-center font-semibold">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty(a.id, qty + 1)}
                  className="text-slate-400 hover:text-[#2563eb]"
                >
                  <PlusCircle className="size-6" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function StepReview({
  listing,
  selectedDate,
  startHour,
  endHour,
  hours,
  attendees,
  selectedAddOns,
  baseAmount,
  addOnsAmount,
  platformFee,
  totalAmount,
  approvalDecision,
  purposeNote,
  setPurposeNote,
}: {
  listing: ListingDetail
  selectedDate: Date
  startHour: number
  endHour: number
  hours: number
  attendees: number
  selectedAddOns: Record<string, number>
  baseAmount: number
  addOnsAmount: number
  platformFee: number
  totalAmount: number
  approvalDecision: { requiresApproval: boolean; reason: string }
  purposeNote: string
  setPurposeNote: (s: string) => void
}) {
  const isDaily = listing.price_unit === 'per_day'
  const addOnRows = listing.listing_add_ons
    .filter((a) => (selectedAddOns[a.id] ?? 0) > 0)
    .map((a) => ({ ...a, qty: selectedAddOns[a.id] }))
  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-[#0e1e3f]">Review</h2>
      <dl className="space-y-3 rounded-xl border border-slate-200 p-4 text-sm">
        <Row label="Space">{listing.title}</Row>
        <Row label="Vendor">{listing.vendors?.business_name ?? '—'}</Row>
        <Row label="Date">{formatDateFull(selectedDate)}</Row>
        {!isDaily && (
          <Row label="Time">
            {formatHour(startHour)} – {formatHour(endHour)} ({hours}h)
          </Row>
        )}
        <Row label="Attendees">{attendees}</Row>
        {addOnRows.length > 0 && (
          <Row label="Add-ons">
            <ul className="space-y-0.5">
              {addOnRows.map((r) => (
                <li key={r.id} className="flex justify-between">
                  <span>
                    {r.name} × {r.qty}
                  </span>
                  <span>₹ {(r.price * r.qty).toLocaleString('en-IN')}</span>
                </li>
              ))}
            </ul>
          </Row>
        )}
      </dl>

      <div className="mt-4">
        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
          Purpose note (manager + vendor)
        </label>
        <textarea
          value={purposeNote}
          onChange={(e) => setPurposeNote(e.target.value)}
          rows={3}
          placeholder="e.g., Q3 planning workshop for engineering"
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-4 text-sm">
        <div>
          Base ({listing.price_unit?.replace('_', ' ') ?? 'flat'})
        </div>
        <div className="text-right">₹ {baseAmount.toLocaleString('en-IN')}</div>
        <div>Add-ons</div>
        <div className="text-right">₹ {addOnsAmount.toLocaleString('en-IN')}</div>
        <div>Platform fee (5%)</div>
        <div className="text-right">₹ {platformFee.toLocaleString('en-IN')}</div>
        <div className="border-t border-slate-200 pt-2 font-semibold">Total</div>
        <div className="border-t border-slate-200 pt-2 text-right font-semibold text-[#0e1e3f]">
          ₹ {totalAmount.toLocaleString('en-IN')}
        </div>
      </div>

      <div
        className={`mt-4 rounded-xl border p-4 ${
          approvalDecision.requiresApproval
            ? 'border-amber-200 bg-amber-50 text-amber-800'
            : 'border-emerald-200 bg-emerald-50 text-emerald-800'
        }`}
      >
        <p className="text-sm font-semibold">
          {approvalDecision.requiresApproval
            ? 'Manager approval required'
            : 'Goes directly to vendor confirmation'}
        </p>
        <p className="mt-1 text-xs">{approvalDecision.reason}</p>
      </div>

      <p className="mt-4 rounded-xl bg-slate-100 px-4 py-3 text-xs text-slate-600">
        Modification window: free up to 24h before check-in. After that, cancellation fee per
        vendor policy.
      </p>
    </div>
  )
}

function ConfirmationCard({
  bookingId,
  status,
  listing,
  date,
  startHour,
  endHour,
  onPay,
  onView,
}: {
  bookingId: string
  status: 'pending_approval' | 'pending_vendor'
  listing: ListingDetail
  date: Date
  startHour: number
  endHour: number
  onPay: () => void
  onView: () => void
}) {
  const isDaily = listing.price_unit === 'per_day'
  return (
    <div className="rounded-2xl border border-emerald-200 bg-white p-8 text-center shadow-sm">
      <CheckCircle2 className="mx-auto mb-3 size-12 text-emerald-500" />
      <h1 className="text-2xl font-bold text-[#0e1e3f]">Booking submitted</h1>
      <p className="mt-1 text-sm text-slate-500">
        Reference: <span className="font-mono">{bookingId.slice(0, 8)}</span>
      </p>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_180px] sm:gap-4">
        <div className="rounded-xl bg-slate-50 px-4 py-3 text-left text-sm">
          <p>
            <strong>{listing.title}</strong>
          </p>
          {listing.location_address && (
            <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
              <MapPin className="size-3" /> {listing.location_address}
            </p>
          )}
          <p className="mt-2 text-xs">
            <strong>{formatDateFull(date)}</strong>
            {!isDaily && (
              <span>
                {' '}· {formatHour(startHour)} – {formatHour(endHour)}
              </span>
            )}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Status:{' '}
            {status === 'pending_approval'
              ? 'Pending manager approval'
              : 'Pending vendor confirmation (24h SLA)'}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            Access instructions + QR will be emailed once vendor confirms (Resend pending).
          </p>
        </div>
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-3 text-slate-400">
          <QrCode className="size-16" />
          <p className="mt-1 font-mono text-[10px] text-slate-500">{bookingId.slice(0, 8)}</p>
          <p className="text-[9px] text-slate-400">Final QR on confirmation</p>
        </div>
      </div>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
        <button
          type="button"
          onClick={onPay}
          className="inline-flex items-center justify-center gap-1.5 rounded-md bg-[#2563eb] px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Proceed to payment
        </button>
        <button
          type="button"
          onClick={onView}
          className="inline-flex items-center justify-center gap-1.5 rounded-md border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          View bookings
        </button>
      </div>
    </div>
  )
}

// ─── Sidebar widgets ──────────────────────────────────────────────────────────

function ListingCard({ listing }: { listing: ListingDetail }) {
  const cover = listing.listing_images?.[0]
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      {cover && (
        <img
          src={storageService.spaceImages.getUrl(cover.storage_path)}
          alt=""
          className="h-32 w-full object-cover"
        />
      )}
      <div className="p-4">
        <p className="text-xs uppercase tracking-wide text-slate-500">
          {listing.module.replace('_', ' ')}
        </p>
        <h3 className="mt-1 font-semibold text-[#0e1e3f]">{listing.title}</h3>
        {listing.location_city && (
          <p className="text-xs text-slate-500">{listing.location_city}</p>
        )}
        {listing.max_capacity && (
          <p className="mt-1 text-xs text-slate-500">
            Capacity: up to {listing.max_capacity}
          </p>
        )}
      </div>
    </div>
  )
}

function PriceCard({
  listing,
  hours,
  baseAmount,
  addOnsAmount,
  platformFee,
  totalAmount,
}: {
  listing: ListingDetail
  hours: number
  baseAmount: number
  addOnsAmount: number
  platformFee: number
  totalAmount: number
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Price</p>
      <div className="mt-3 space-y-1 text-sm">
        {listing.base_price != null && (
          <p className="flex justify-between">
            <span className="text-slate-600">
              ₹{listing.base_price.toLocaleString('en-IN')}
              {listing.price_unit ? ` / ${listing.price_unit.replace('_', ' ')}` : ''}
              {listing.price_unit === 'per_hour' && hours > 0 ? ` × ${hours}` : ''}
            </span>
            <span className="font-medium">₹ {baseAmount.toLocaleString('en-IN')}</span>
          </p>
        )}
        {addOnsAmount > 0 && (
          <p className="flex justify-between">
            <span className="text-slate-600">Add-ons</span>
            <span className="font-medium">₹ {addOnsAmount.toLocaleString('en-IN')}</span>
          </p>
        )}
        <p className="flex justify-between">
          <span className="text-slate-600">Platform fee</span>
          <span className="font-medium">₹ {platformFee.toLocaleString('en-IN')}</span>
        </p>
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
        <span className="text-sm font-semibold text-slate-700">Total</span>
        <span className="text-xl font-bold text-[#0e1e3f]">
          ₹ {totalAmount.toLocaleString('en-IN')}
        </span>
      </div>
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-medium text-[#0e1e3f]">{children}</dd>
    </div>
  )
}
