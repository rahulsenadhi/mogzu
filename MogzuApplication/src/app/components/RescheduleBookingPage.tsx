import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import {
  ArrowLeft,
  Calendar as CalIcon,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  ShieldAlert,
} from 'lucide-react'
import { SharedHeader } from './layouts/SharedHeader'
import { SharedSidebar } from './layouts/SharedSidebar'
import { MogzuCorporateScrollSurface } from './layouts/MogzuCorporateScrollSurface'
import { useAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import type {
  Booking,
  CalendarSlot,
  Listing,
} from '@/lib/database.types'

type BookingDetail = Booking & { listings: Listing | null }

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7)

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

export default function RescheduleBookingPage() {
  const navigate = useNavigate()
  const params = useParams<{ id?: string }>()
  const { profile } = useAuth()

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const [booking, setBooking] = useState<BookingDetail | null>(null)
  const [blockedSlots, setBlockedSlots] = useState<CalendarSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [calendarMonth, setCalendarMonth] = useState<Date>(() => startOfMonth(new Date()))
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [startHour, setStartHour] = useState<number>(10)
  const [endHour, setEndHour] = useState<number>(13)

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const load = useCallback(async () => {
    if (!params.id) {
      setLoadError('No booking id supplied.')
      setLoading(false)
      return
    }
    setLoading(true)
    setLoadError('')
    const { data, error } = await db.bookings.getById(params.id)
    if (error || !data) {
      setLoadError(error?.message ?? 'Booking not found.')
      setLoading(false)
      return
    }
    const b = data as BookingDetail
    setBooking(b)

    if (b.start_time) {
      const start = new Date(b.start_time)
      const end = b.end_time ? new Date(b.end_time) : start
      setStartHour(start.getHours())
      setEndHour(end.getHours() || start.getHours() + 1)
    }

    const from = new Date()
    const to = new Date()
    to.setMonth(to.getMonth() + 3)
    const slotsRes = await db.calendar.getSlotsForListing(
      b.listing_id,
      from.toISOString(),
      to.toISOString(),
    )
    setBlockedSlots(
      ((slotsRes.data ?? []) as CalendarSlot[]).filter(
        (s) =>
          ['blocked', 'booked'].includes(s.slot_type) && s.booking_id !== b.id,
      ),
    )

    setLoading(false)
  }, [params.id])

  useEffect(() => {
    load()
  }, [load])

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
    const set = new Set<string>()
    blockedSlots.forEach((s) => {
      const sStart = new Date(s.start_time)
      const sEnd = new Date(s.end_time)
      if (sEnd.getTime() - sStart.getTime() >= 12 * 3_600_000) {
        set.add(isoDay(sStart))
      }
    })
    return set
  }, [blockedSlots])

  const today = useMemo(() => {
    const t = new Date()
    t.setHours(0, 0, 0, 0)
    return t
  }, [])

  const blockedHours = useMemo(() => {
    if (!selectedDate) return new Set<number>()
    const set = new Set<number>()
    blockedSlots.forEach((s) => {
      const sStart = new Date(s.start_time)
      const sEnd = new Date(s.end_time)
      if (!isSameDay(sStart, selectedDate) && !isSameDay(sEnd, selectedDate)) return
      for (let h = 0; h < 24; h++) {
        const cellStart = new Date(selectedDate)
        cellStart.setHours(h, 0, 0, 0)
        const cellEnd = new Date(selectedDate)
        cellEnd.setHours(h + 1, 0, 0, 0)
        if (sStart < cellEnd && sEnd > cellStart) set.add(h)
      }
    })
    return set
  }, [selectedDate, blockedSlots])

  const handleSubmit = async () => {
    if (!booking || !profile || !selectedDate) {
      setSubmitError('Pick a new date first.')
      return
    }
    if (endHour <= startHour) {
      setSubmitError('End time must be after start time.')
      return
    }
    for (let h = startHour; h < endHour; h++) {
      if (blockedHours.has(h)) {
        setSubmitError(`Slot conflicts with vendor's existing booking at ${formatHour(h)}.`)
        return
      }
    }

    setSubmitting(true)
    setSubmitError('')

    const newStart = new Date(selectedDate)
    newStart.setHours(startHour, 0, 0, 0)
    const newEnd = new Date(selectedDate)
    newEnd.setHours(endHour, 0, 0, 0)

    // Free up the existing booked calendar slot tied to this booking, if any.
    await db.calendar.deleteByBooking(booking.id)

    // Move booking back to pending_vendor with fresh 24h SLA so vendor re-confirms.
    const { error } = await db.bookings.updateStatus(booking.id, 'pending_vendor', {
      start_time: newStart.toISOString(),
      end_time: newEnd.toISOString(),
      vendor_response_deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      cancellation_reason: null,
      cancelled_at: null,
    })

    setSubmitting(false)
    if (error) {
      setSubmitError(error.message)
      return
    }
    setSubmitted(true)
  }

  if (submitted && booking && selectedDate) {
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
              <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <CheckCircle className="size-10" />
              </div>
              <h1 className="mb-2 text-2xl font-bold text-slate-900">Reschedule requested</h1>
              <p className="mb-2 text-slate-600">
                Booking reference{' '}
                <span className="font-mono">{booking.id.slice(0, 8)}</span> moved to{' '}
                <strong>{formatDateFull(selectedDate)}</strong>,{' '}
                <strong>
                  {formatHour(startHour)} – {formatHour(endHour)}
                </strong>
                .
              </p>
              <p className="mb-6 text-xs text-slate-500">
                Vendor has 24 hours to re-confirm. Original calendar block has been released.
              </p>
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
                  Booking is <strong>{booking.status}</strong>. Cannot reschedule.
                </p>
              </div>
            ) : (
              <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Reschedule booking</h1>
                  <p className="mt-1 text-sm text-slate-500">
                    {booking.listings?.title ?? '—'} · Reference{' '}
                    <span className="font-mono">{booking.id.slice(0, 8)}</span>
                  </p>
                  {booking.start_time && (
                    <p className="mt-1 text-xs text-slate-500">
                      Current slot:{' '}
                      <strong>
                        {new Date(booking.start_time).toLocaleString('en-IN', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </strong>
                    </p>
                  )}
                </div>

                <div className="rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between border-b border-slate-200 p-3">
                    <button
                      type="button"
                      onClick={() => setCalendarMonth((d) => addMonths(d, -1))}
                      className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                    <p className="text-sm font-semibold text-[#0e1e3f]">
                      {calendarMonth.toLocaleDateString('en-IN', {
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                    <button
                      type="button"
                      onClick={() => setCalendarMonth((d) => addMonths(d, 1))}
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
                          onClick={() => !disabled && setSelectedDate(cell)}
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

                {selectedDate && (
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <Clock className="size-4 text-[#2563eb]" />
                      <p className="text-sm font-semibold">Time window</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <select
                        value={startHour}
                        onChange={(e) => setStartHour(Number(e.target.value))}
                        className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
                      >
                        {HOURS.map((h) => (
                          <option key={h} value={h} disabled={blockedHours.has(h)}>
                            {formatHour(h)}
                            {blockedHours.has(h) ? ' (booked)' : ''}
                          </option>
                        ))}
                      </select>
                      <select
                        value={endHour}
                        onChange={(e) => setEndHour(Number(e.target.value))}
                        className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
                      >
                        {HOURS.concat([21]).map((h) => (
                          <option key={h} value={h}>
                            {formatHour(h)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                <p className="rounded-xl bg-slate-100 px-4 py-3 text-xs text-slate-600">
                  Reschedule preserves your booking reference. Vendor must re-confirm the new
                  slot within 24 hours; current calendar block is released on submit.
                </p>

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
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting || !selectedDate}
                    className="inline-flex items-center gap-1.5 rounded-md bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                  >
                    {submitting && <Loader2 className="size-4 animate-spin" />}
                    <CalIcon className="size-4" />
                    Request reschedule
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
