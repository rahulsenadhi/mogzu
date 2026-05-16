import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import {
  ArrowLeft,
  ArrowRight,
  Calendar as CalendarIcon,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MinusCircle,
  PlusCircle,
  ShieldAlert,
  Users,
} from 'lucide-react'
import { SharedHeader } from './layouts/SharedHeader'
import { SharedSidebar } from './layouts/SharedSidebar'
import { MogzuCorporateScrollSurface } from './layouts/MogzuCorporateScrollSurface'
import { useAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import { storageService } from '@/lib/storage'
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

type StepKey = 'date' | 'group' | 'addons' | 'review' | 'done'
const STEPS: { key: StepKey; label: string }[] = [
  { key: 'date', label: 'Date' },
  { key: 'group', label: 'Group size' },
  { key: 'addons', label: 'Add-ons' },
  { key: 'review', label: 'Review' },
]

// ─── Date helpers ─────────────────────────────────────────────────────────────

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

function formatDateFull(d: Date): string {
  return d.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function priceUnitLabel(u: Listing['price_unit']): string {
  if (!u) return ''
  return u.replace('_', ' ')
}

function priceLineMultiplier(unit: Listing['price_unit'], groupSize: number): number {
  if (unit === 'per_person') return groupSize
  return 1
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EventBookingPage() {
  const navigate = useNavigate()
  const params = useParams<{ listingId: string }>()
  const { profile, corporateId, role } = useAuth()

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [step, setStep] = useState<StepKey>('date')

  const [listing, setListing] = useState<ListingDetail | null>(null)
  const [bookedSlots, setBookedSlots] = useState<CalendarSlot[]>([])
  const [budgets, setBudgets] = useState<BudgetRule[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  // Form state
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [calendarMonth, setCalendarMonth] = useState<Date>(() => startOfMonth(new Date()))
  const [groupSize, setGroupSize] = useState<number>(0)
  const [groupError, setGroupError] = useState('')
  const [selectedAddOns, setSelectedAddOns] = useState<Record<string, number>>({})
  const [purposeNote, setPurposeNote] = useState('')

  // Submit
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(null)
  const [confirmedStatus, setConfirmedStatus] = useState<'pending_approval' | 'pending_vendor' | null>(null)

  const canBook = role === 'l1_employee' || role === 'l2_manager' || role === 'l3_admin'

  const loadAll = useCallback(async () => {
    if (!params.listingId || !corporateId) return
    setLoading(true)
    setLoadError('')

    const [listingRes, budgetRes] = await Promise.all([
      db.listings.getById(params.listingId),
      db.budgets.listByCorporate(corporateId),
    ])

    if (listingRes.error || !listingRes.data) {
      setLoadError(listingRes.error?.message ?? 'Listing not found.')
      setLoading(false)
      return
    }
    const l = listingRes.data as ListingDetail
    setListing(l)
    setBudgets((budgetRes.data ?? []) as BudgetRule[])
    setGroupSize(l.min_capacity ?? 1)

    // Load booked slots for next 3 months
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
  }, [params.listingId, corporateId])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  // ─── Pricing ────────────────────────────────────────────────────────────────
  const basePrice = listing?.base_price ?? 0
  const baseAmount = basePrice * priceLineMultiplier(listing?.price_unit ?? null, groupSize)
  const addOnsAmount = useMemo(() => {
    if (!listing) return 0
    return Object.entries(selectedAddOns).reduce((sum, [addOnId, qty]) => {
      const a = listing.listing_add_ons.find((x) => x.id === addOnId)
      return sum + (a ? a.price * qty : 0)
    }, 0)
  }, [selectedAddOns, listing])
  const platformFee = Math.round(baseAmount * 0.05)
  const totalAmount = baseAmount + addOnsAmount + platformFee

  // ─── Approval decision ──────────────────────────────────────────────────────
  const approvalDecision = useMemo(() => {
    const matching = budgets.find(
      (b) => b.module === null || b.module === listing?.module,
    )
    if (!matching) return { requiresApproval: false, reason: 'No budget rules configured.' }
    if (!matching.requires_approval) return { requiresApproval: false, reason: 'Budget rule allows direct booking.' }
    const autoFloor = matching.auto_approve_below
    if (autoFloor != null && totalAmount <= autoFloor) {
      return { requiresApproval: false, reason: `Under auto-approve threshold (₹${autoFloor.toLocaleString('en-IN')}).` }
    }
    return { requiresApproval: true, reason: 'Above auto-approve threshold — needs manager approval.' }
  }, [budgets, listing?.module, totalAmount])

  // ─── Calendar grid ──────────────────────────────────────────────────────────
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

  const blockedDays = useMemo(() => {
    const set = new Set<string>()
    bookedSlots.forEach((s) => set.add(isoDay(new Date(s.start_time))))
    return set
  }, [bookedSlots])

  const today = useMemo(() => {
    const t = new Date()
    t.setHours(0, 0, 0, 0)
    return t
  }, [])

  // ─── Step nav ───────────────────────────────────────────────────────────────
  const canAdvance = (): boolean => {
    if (step === 'date') return !!selectedDate
    if (step === 'group') {
      if (!groupSize || groupSize < 1) {
        setGroupError('Group size required.')
        return false
      }
      if (listing?.min_capacity && groupSize < listing.min_capacity) {
        setGroupError(`Minimum group size is ${listing.min_capacity}.`)
        return false
      }
      if (listing?.max_capacity && groupSize > listing.max_capacity) {
        setGroupError(`Maximum group size is ${listing.max_capacity}.`)
        return false
      }
      setGroupError('')
      return true
    }
    return true
  }

  const next = () => {
    if (!canAdvance()) return
    const order: StepKey[] = ['date', 'group', 'addons', 'review']
    const idx = order.indexOf(step)
    if (idx < order.length - 1) setStep(order[idx + 1])
  }

  const back = () => {
    const order: StepKey[] = ['date', 'group', 'addons', 'review']
    const idx = order.indexOf(step)
    if (idx > 0) setStep(order[idx - 1])
  }

  // ─── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!listing || !corporateId || !profile || !selectedDate || !listing.vendors) return
    setSubmitting(true)
    setSubmitError('')

    const startTime = new Date(selectedDate)
    startTime.setHours(10, 0, 0, 0)
    const endTime = new Date(selectedDate)
    endTime.setHours(18, 0, 0, 0)

    const status = approvalDecision.requiresApproval ? 'pending_approval' : 'pending_vendor'

    const { data, error } = await db.bookings.create({
      corporate_id: corporateId,
      user_id: profile.id,
      vendor_id: listing.vendor_id,
      listing_id: listing.id,
      module: listing.module,
      status,
      group_size: groupSize,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      base_amount: baseAmount,
      add_ons_amount: addOnsAmount,
      platform_fee: platformFee,
      total_amount: totalAmount,
      commission_rate: null,
      payment_method: null,
      payment_reference: null,
      payment_status: 'pending',
      purpose_note: purposeNote.trim() || null,
      approved_by: null,
      approved_at: null,
      cancelled_at: null,
      cancellation_reason: null,
      cancellation_fee: null,
      vendor_response_deadline: status === 'pending_vendor'
        ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        : null,
      completed_at: null,
    })

    if (error || !data) {
      setSubmitError(error?.message ?? 'Failed to submit booking.')
      setSubmitting(false)
      return
    }

    // Insert add-ons
    const addOnRows = Object.entries(selectedAddOns)
      .filter(([, qty]) => qty > 0)
      .map(([addOnId, quantity]) => {
        const a = listing.listing_add_ons.find((x) => x.id === addOnId)!
        return {
          booking_id: data.id,
          add_on_id: addOnId,
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

  // ─── Guards ─────────────────────────────────────────────────────────────────
  if (!canBook) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FFFDF9]">
        <div className="max-w-md rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
          <ShieldAlert className="mx-auto mb-2 size-8 text-amber-600" />
          <p className="text-sm text-amber-800">
            Booking requires a corporate role. Please sign in as an employee or manager.
          </p>
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
                onViewBookings={() => navigate('/bookings')}
              />
            ) : (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
                <div className="space-y-6">
                  {/* Stepper */}
                  <ol className="flex items-center gap-2 overflow-x-auto rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
                    {STEPS.map((s, i) => {
                      const order: StepKey[] = ['date', 'group', 'addons', 'review']
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
                          <span
                            className={`text-sm font-medium ${
                              active ? 'text-[#0e1e3f]' : 'text-slate-500'
                            }`}
                          >
                            {s.label}
                          </span>
                          {i < STEPS.length - 1 && <span className="text-slate-300">›</span>}
                        </li>
                      )
                    })}
                  </ol>

                  {/* Step content */}
                  <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    {step === 'date' && (
                      <StepDate
                        listingTitle={listing.title}
                        calendarMonth={calendarMonth}
                        onMonthPrev={() => setCalendarMonth((d) => addMonths(d, -1))}
                        onMonthNext={() => setCalendarMonth((d) => addMonths(d, 1))}
                        monthGrid={monthGrid}
                        blockedDays={blockedDays}
                        today={today}
                        selectedDate={selectedDate}
                        onPick={(d) => setSelectedDate(d)}
                      />
                    )}

                    {step === 'group' && (
                      <StepGroup
                        groupSize={groupSize}
                        setGroupSize={(n) => {
                          setGroupSize(n)
                          setGroupError('')
                        }}
                        minCapacity={listing.min_capacity}
                        maxCapacity={listing.max_capacity}
                        error={groupError}
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
                        groupSize={groupSize}
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
                        disabled={step === 'date'}
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

                {/* Summary sidebar */}
                <aside className="space-y-4">
                  <ListingSummary listing={listing} />
                  <PriceSummary
                    listing={listing}
                    groupSize={groupSize}
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

// ─── Step components ──────────────────────────────────────────────────────────

function StepDate({
  listingTitle,
  calendarMonth,
  onMonthPrev,
  onMonthNext,
  monthGrid,
  blockedDays,
  today,
  selectedDate,
  onPick,
}: {
  listingTitle: string
  calendarMonth: Date
  onMonthPrev: () => void
  onMonthNext: () => void
  monthGrid: (Date | null)[]
  blockedDays: Set<string>
  today: Date
  selectedDate: Date | null
  onPick: (d: Date) => void
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <CalendarIcon className="size-5 text-[#2563eb]" />
        <h2 className="text-lg font-semibold text-[#0e1e3f]">Select a date</h2>
      </div>
      <p className="mb-4 text-sm text-slate-500">
        Pick a date for <span className="font-medium">{listingTitle}</span>. Booked dates are
        shown with a strikethrough.
      </p>
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
            const blocked = blockedDays.has(isoDay(cell))
            const past = cell < today
            const selected = selectedDate && isSameDay(cell, selectedDate)
            const disabled = blocked || past
            return (
              <button
                key={cell.toISOString()}
                type="button"
                onClick={() => !disabled && onPick(cell)}
                disabled={disabled}
                className={`relative aspect-square rounded-lg text-sm transition ${
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
      {selectedDate && (
        <p className="mt-3 text-sm text-emerald-700">
          Selected: <strong>{formatDateFull(selectedDate)}</strong>
        </p>
      )}
    </div>
  )
}

function StepGroup({
  groupSize,
  setGroupSize,
  minCapacity,
  maxCapacity,
  error,
}: {
  groupSize: number
  setGroupSize: (n: number) => void
  minCapacity: number | null
  maxCapacity: number | null
  error: string
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <Users className="size-5 text-[#2563eb]" />
        <h2 className="text-lg font-semibold text-[#0e1e3f]">Group size</h2>
      </div>
      <p className="mb-4 text-sm text-slate-500">
        {minCapacity && maxCapacity
          ? `Allowed range: ${minCapacity}–${maxCapacity} attendees.`
          : maxCapacity
            ? `Up to ${maxCapacity} attendees.`
            : 'Enter the number of attendees.'}
      </p>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => setGroupSize(Math.max(1, groupSize - 1))}
          className="text-slate-400 hover:text-[#2563eb]"
        >
          <MinusCircle className="size-8" />
        </button>
        <input
          type="number"
          min="1"
          value={groupSize}
          onChange={(e) => setGroupSize(Number(e.target.value) || 0)}
          className="h-14 w-32 rounded-xl border border-slate-200 px-4 text-center text-2xl font-bold text-[#0e1e3f] focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
        />
        <button
          type="button"
          onClick={() => setGroupSize(groupSize + 1)}
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
          ? 'No add-ons available for this listing.'
          : 'Pick optional extras to enhance the experience.'}
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
  groupSize,
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
  groupSize: number
  selectedAddOns: Record<string, number>
  baseAmount: number
  addOnsAmount: number
  platformFee: number
  totalAmount: number
  approvalDecision: { requiresApproval: boolean; reason: string }
  purposeNote: string
  setPurposeNote: (s: string) => void
}) {
  const selectedAddOnRows = listing.listing_add_ons
    .filter((a) => (selectedAddOns[a.id] ?? 0) > 0)
    .map((a) => ({ ...a, qty: selectedAddOns[a.id] }))

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-[#0e1e3f]">Review</h2>
      <dl className="space-y-3 rounded-xl border border-slate-200 p-4 text-sm">
        <Row label="Event">{listing.title}</Row>
        <Row label="Vendor">{listing.vendors?.business_name ?? '—'}</Row>
        <Row label="Date">{formatDateFull(selectedDate)}</Row>
        <Row label="Group size">{groupSize} attendees</Row>
        {selectedAddOnRows.length > 0 && (
          <Row label="Add-ons">
            <ul className="space-y-0.5">
              {selectedAddOnRows.map((r) => (
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
          Purpose note (visible to manager + vendor)
        </label>
        <textarea
          value={purposeNote}
          onChange={(e) => setPurposeNote(e.target.value)}
          rows={3}
          placeholder="e.g., Q3 planning offsite for engineering team"
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-4 text-sm">
        <div>Base ({listing.price_unit ? priceUnitLabel(listing.price_unit) : 'flat'})</div>
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
    </div>
  )
}

function ConfirmationCard({
  bookingId,
  status,
  onViewBookings,
}: {
  bookingId: string
  status: 'pending_approval' | 'pending_vendor'
  onViewBookings: () => void
}) {
  return (
    <div className="rounded-2xl border border-emerald-200 bg-white p-8 text-center shadow-sm">
      <CheckCircle2 className="mx-auto mb-3 size-12 text-emerald-500" />
      <h1 className="text-2xl font-bold text-[#0e1e3f]">Booking submitted</h1>
      <p className="mt-1 text-sm text-slate-500">
        Reference: <span className="font-mono">{bookingId.slice(0, 8)}</span>
      </p>
      <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
        Status:{' '}
        <strong>
          {status === 'pending_approval' ? 'Pending Manager Approval' : 'Pending Vendor Confirmation'}
        </strong>
        <br />
        <span className="text-xs text-slate-500">
          {status === 'pending_approval'
            ? 'Your manager will review this shortly.'
            : 'Vendor has 24 hours to confirm.'}
        </span>
      </p>
      <button
        type="button"
        onClick={onViewBookings}
        className="mt-6 inline-flex items-center gap-1.5 rounded-md bg-[#2563eb] px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
      >
        View bookings
      </button>
    </div>
  )
}

// ─── Sidebar widgets ──────────────────────────────────────────────────────────

function ListingSummary({ listing }: { listing: ListingDetail }) {
  const cover = listing.listing_images?.[0]
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      {cover && (
        <img
          src={storageService.listingImages.getUrl(cover.storage_path)}
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
      </div>
    </div>
  )
}

function PriceSummary({
  listing,
  groupSize,
  baseAmount,
  addOnsAmount,
  platformFee,
  totalAmount,
}: {
  listing: ListingDetail
  groupSize: number
  baseAmount: number
  addOnsAmount: number
  platformFee: number
  totalAmount: number
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Price
      </p>
      <div className="mt-3 space-y-1 text-sm">
        {listing.base_price != null && (
          <p className="flex justify-between">
            <span className="text-slate-600">
              ₹{listing.base_price.toLocaleString('en-IN')}
              {listing.price_unit ? ` / ${priceUnitLabel(listing.price_unit)}` : ''}
              {listing.price_unit === 'per_person' ? ` × ${groupSize}` : ''}
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
