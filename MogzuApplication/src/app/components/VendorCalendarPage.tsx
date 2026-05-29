import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Lock,
  CalendarDays,
  AlertTriangle,
  Loader2,
} from 'lucide-react'
import { VendorAppShell } from './layouts/VendorAppShell'
import { MogzuLegacyDemoBanner } from './ui/MogzuLegacyDemoBanner'
import { useAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import { supabase } from '@/lib/supabase'
import { subscribeToTable } from '@/lib/realtime'
import type { CalendarSlot, Listing, VendorAvailabilityRule } from '@/lib/database.types'
import {
  DAY_LABELS,
  createRule,
  deleteRule,
  hhmmToMinutes,
  listRules,
  minutesToHHMM,
} from '@/lib/vendorAvailability'

// ─── Date helpers ─────────────────────────────────────────────────────────────

function startOfWeek(d: Date): Date {
  const day = new Date(d)
  day.setHours(0, 0, 0, 0)
  const dow = day.getDay() // 0=Sun
  day.setDate(day.getDate() - dow)
  return day
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

function isoDate(d: Date): string {
  return d.toISOString()
}

function formatHour(h: number): string {
  return h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`
}

function formatSlotTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
}

function dayLabel(d: Date): string {
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' })
}

function monthLabel(d: Date): string {
  return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
}

const HOURS = Array.from({ length: 11 }, (_, i) => i + 8) // 8am–6pm

// ─── Slot positioning ─────────────────────────────────────────────────────────

function slotsForCell(slots: CalendarSlot[], day: Date, hour: number): CalendarSlot[] {
  const cellStart = new Date(day)
  cellStart.setHours(hour, 0, 0, 0)
  const cellEnd = new Date(day)
  cellEnd.setHours(hour + 1, 0, 0, 0)
  const cellStartMs = cellStart.getTime()
  const cellEndMs = cellEnd.getTime()
  return slots.filter((s) => {
    const sStart = new Date(s.start_time).getTime()
    const sEnd = new Date(s.end_time).getTime()
    return sStart < cellEndMs && sEnd > cellStartMs
  })
}

function slotStyle(type: CalendarSlot['slot_type']): string {
  switch (type) {
    case 'blocked':
      return 'bg-rose-100 border border-rose-300 text-rose-700'
    case 'booked':
      return 'bg-blue-100 border border-blue-300 text-blue-800'
    case 'available':
      return 'bg-emerald-50 border border-emerald-200 text-emerald-700'
  }
}

// ─── Block Slot Modal ─────────────────────────────────────────────────────────

type BlockTarget = { day: Date; hour: number; durationHours?: number }

type BlockForm = {
  listingId: string
  durationHours: string
  notes: string
}

function BlockSlotModal({
  target,
  listings,
  onClose,
  onSave,
  saving,
  error,
}: {
  target: BlockTarget
  listings: Listing[]
  onClose: () => void
  onSave: (form: BlockForm) => Promise<void>
  saving: boolean
  error: string
}) {
  const [form, setForm] = useState<BlockForm>({
    listingId: listings[0]?.id ?? '',
    durationHours: target.durationHours ? String(target.durationHours) : '1',
    notes: '',
  })
  const [validationError, setValidationError] = useState('')

  const set = <K extends keyof BlockForm>(k: K, v: BlockForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.listingId) {
      setValidationError('Select a listing to block.')
      return
    }
    const dur = Number(form.durationHours)
    if (!dur || dur < 0.5 || dur > 24) {
      setValidationError('Duration must be between 0.5 and 24 hours.')
      return
    }
    setValidationError('')
    await onSave(form)
  }

  const startLabel = `${dayLabel(target.day)} ${formatHour(target.hour)}`
  const rangeLabel =
    target.durationHours && target.durationHours > 1
      ? `${startLabel} – ${formatHour(target.hour + target.durationHours)} (${target.durationHours}h)`
      : startLabel

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Block time slot</h2>
            <p className="text-xs text-slate-500">{rangeLabel}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
            <X className="size-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          {listings.length === 0 ? (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <span>No listings found. Create a listing first before blocking calendar time.</span>
            </div>
          ) : (
            <>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                  Listing <span className="text-rose-500">*</span>
                </label>
                <select
                  value={form.listingId}
                  onChange={(e) => set('listingId', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                >
                  {listings.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                  Duration (hours)
                </label>
                <input
                  type="number"
                  min="0.5"
                  max="24"
                  step="0.5"
                  value={form.durationHours}
                  onChange={(e) => set('durationHours', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                  Notes (optional)
                </label>
                <input
                  type="text"
                  value={form.notes}
                  onChange={(e) => set('notes', e.target.value)}
                  placeholder="e.g. Maintenance, Personal leave"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                />
              </div>
            </>
          )}

          {(validationError || error) && (
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {validationError || error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            {listings.length > 0 && (
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-700 disabled:opacity-60"
              >
                {saving ? 'Blocking…' : 'Block time'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Unblock Confirm ──────────────────────────────────────────────────────────

function UnblockModal({
  slot,
  listingTitle,
  onClose,
  onConfirm,
  saving,
}: {
  slot: CalendarSlot
  listingTitle: string
  onClose: () => void
  onConfirm: () => Promise<void>
  saving: boolean
}) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-bold text-slate-900">Unblock this slot?</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
            <X className="size-5" />
          </button>
        </div>
        <div className="px-6 py-5">
          <p className="text-sm text-slate-600">
            <span className="font-medium">{listingTitle}</span>
            <br />
            {formatSlotTime(slot.start_time)} — {formatSlotTime(slot.end_time)}
            {slot.notes && <span className="block mt-1 text-slate-400 italic">{slot.notes}</span>}
          </p>
          <div className="mt-5 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={onConfirm}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {saving ? 'Unblocking…' : 'Unblock'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function VendorCalendarPage() {
  const { vendorId } = useAuth()
  const navigate = useNavigate()

  const [weekStart, setWeekStart] = useState<Date>(() => startOfWeek(new Date()))
  const [slots, setSlots] = useState<CalendarSlot[]>([])
  const [listings, setListings] = useState<Listing[]>([])
  const [listingsReady, setListingsReady] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [pageNotice, setPageNotice] = useState('')

  // Block modal
  const [blockTarget, setBlockTarget] = useState<BlockTarget | null>(null)
  const [blockSaving, setBlockSaving] = useState(false)
  const [blockError, setBlockError] = useState('')

  // Unblock modal
  const [unblockSlot, setUnblockSlot] = useState<CalendarSlot | null>(null)
  const [unblockSaving, setUnblockSaving] = useState(false)

  // Drag-to-block selection
  const [dragAnchor, setDragAnchor] = useState<{ dayIdx: number; hour: number } | null>(null)
  const [dragCurrent, setDragCurrent] = useState<{ dayIdx: number; hour: number } | null>(null)
  const [suppressNextClick, setSuppressNextClick] = useState(false)

  const weekEnd = addDays(weekStart, 7)
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  // Load slots + listings
  const loadSlots = useCallback(async () => {
    if (!vendorId) return
    setIsLoading(true)
    setLoadError('')
    const { data, error } = await db.calendar.getBookedSlots(
      vendorId,
      isoDate(weekStart),
      isoDate(weekEnd),
    )
    if (error) setLoadError(error.message)
    else setSlots(data ?? [])
    setIsLoading(false)
  }, [vendorId, weekStart.toISOString()])

  useEffect(() => { loadSlots() }, [loadSlots])

  // Load listings once
  useEffect(() => {
    if (!vendorId) return
    setListingsReady(false)
    db.listings.listByVendor(vendorId).then(({ data }) => {
      setListings(data ?? [])
      setListingsReady(true)
    })
  }, [vendorId])

  // Realtime: calendar_slots for this vendor
  useEffect(() => {
    if (!vendorId) return
    return subscribeToTable<CalendarSlot>(`vendor-calendar-${vendorId}`, {
      table: 'calendar_slots',
      filter: `vendor_id=eq.${vendorId}`,
      onData: () => loadSlots(),
    })
  }, [vendorId, loadSlots])

  // Week navigation
  const prevWeek = () => setWeekStart((d) => addDays(d, -7))
  const nextWeek = () => setWeekStart((d) => addDays(d, 7))
  const goToday = () => setWeekStart(startOfWeek(new Date()))

  // Block slot
  const handleBlock = async (form: BlockForm) => {
    if (!vendorId) return
    setBlockSaving(true)
    setBlockError('')
    const start = new Date(blockTarget!.day)
    start.setHours(blockTarget!.hour, 0, 0, 0)
    const end = new Date(start.getTime() + Number(form.durationHours) * 60 * 60 * 1000)
    const { error } = await db.calendar.blockSlot({
      vendor_id: vendorId,
      listing_id: form.listingId,
      slot_type: 'blocked',
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      booking_id: null,
      recurrence_rule: null,
      notes: form.notes.trim() || null,
    })
    if (error) {
      setBlockError(error.message)
    } else {
      // Notify any booker whose confirmed booking overlaps the newly-blocked window.
      type ConflictRow = {
        id: string
        user_id: string
        listings: { title: string | null } | { title: string | null }[] | null
      }
      const { data: conflicts } = await supabase
        .from('bookings')
        .select('id, user_id, listings(title)')
        .eq('vendor_id', vendorId)
        .eq('listing_id', form.listingId)
        .eq('status', 'confirmed')
        .lt('start_time', end.toISOString())
        .gt('end_time', start.toISOString())
      let notified = 0
      for (const b of (conflicts ?? []) as ConflictRow[]) {
        const lst = Array.isArray(b.listings) ? b.listings[0] : b.listings
        await db.notifications.notify({
          userId: b.user_id,
          type: 'system',
          title: 'Vendor changed availability for your booking',
          body: `${lst?.title ?? 'Your booking'} slot was blocked. Vendor will reach out — please confirm or reschedule.`,
          linkUrl: `/bookings/${b.id}`,
        })
        notified += 1
      }
      if (notified > 0) {
        setPageNotice(
          `Time blocked. ${notified} confirmed booking${notified !== 1 ? 's were' : ' was'} affected — booker${notified !== 1 ? 's' : ''} notified.`,
        )
      } else {
        setPageNotice('Time blocked successfully.')
      }
      setBlockTarget(null)
      loadSlots()
    }
    setBlockSaving(false)
  }

  // Unblock slot
  const handleUnblock = async () => {
    if (!unblockSlot) return
    setUnblockSaving(true)
    await db.calendar.unblockSlot(unblockSlot.id)
    setUnblockSlot(null)
    setUnblockSaving(false)
    loadSlots()
  }

  const openBookedSlot = (slot: CalendarSlot) => {
    if (slot.booking_id) {
      navigate(`/vendor/booking-requests/${slot.booking_id}`)
      return
    }
    navigate('/vendor/booking-requests')
  }

  // Cell click handler — blocked → unblock; booked → booking request; empty → block
  const handleCellClick = (day: Date, hour: number) => {
    if (suppressNextClick) {
      setSuppressNextClick(false)
      return
    }
    const cellSlots = slotsForCell(slots, day, hour)
    const blocked = cellSlots.find((s) => s.slot_type === 'blocked')
    if (blocked) {
      setUnblockSlot(blocked)
      return
    }
    const booked = cellSlots.find((s) => s.slot_type === 'booked')
    if (booked) {
      openBookedSlot(booked)
      return
    }
    setBlockTarget({ day, hour, durationHours: 1 })
    setBlockError('')
  }

  // Drag-to-block: track mouse-down on an empty cell, mouse-enter extends
  // selection within same day, mouse-up commits a multi-hour blockTarget.
  const cellIsFree = (dayIdx: number, hour: number): boolean => {
    const cellSlots = slotsForCell(slots, weekDays[dayIdx], hour)
    return !cellSlots.some((s) => s.slot_type === 'blocked' || s.slot_type === 'booked')
  }

  const handleCellMouseDown = (dayIdx: number, hour: number, e: React.MouseEvent) => {
    if (e.button !== 0) return
    if (!cellIsFree(dayIdx, hour)) return // let click handler deal with blocked/booked
    setDragAnchor({ dayIdx, hour })
    setDragCurrent({ dayIdx, hour })
  }

  const handleCellMouseEnter = (dayIdx: number, hour: number) => {
    if (!dragAnchor) return
    // Restrict drag to the same day column.
    if (dayIdx !== dragAnchor.dayIdx) return
    setDragCurrent({ dayIdx, hour })
  }

  const handleDragEnd = useCallback(() => {
    if (!dragAnchor || !dragCurrent) {
      setDragAnchor(null)
      setDragCurrent(null)
      return
    }
    const dayIdx = dragAnchor.dayIdx
    const lo = Math.min(dragAnchor.hour, dragCurrent.hour)
    const hi = Math.max(dragAnchor.hour, dragCurrent.hour)
    const isMultiHourDrag = hi > lo
    // Skip the drag if it crossed a non-free cell along the way; user intent
    // is ambiguous so default to the anchor hour as a 1-hour single block.
    let blocked = false
    for (let h = lo; h <= hi; h += 1) {
      if (!cellIsFree(dayIdx, h)) {
        blocked = true
        break
      }
    }
    setDragAnchor(null)
    setDragCurrent(null)
    if (blocked) {
      // Let single-click handler open unblock modal / handle the booked cell.
      return
    }
    if (isMultiHourDrag) {
      setSuppressNextClick(true)
      setBlockTarget({ day: weekDays[dayIdx], hour: lo, durationHours: hi - lo + 1 })
      setBlockError('')
    }
    // Single-hour drag (no movement) falls through to onClick which will open
    // the 1-hour block modal — avoids opening twice.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragAnchor, dragCurrent, slots])

  // Listen for mouse-up anywhere so a drag ending outside the grid still commits.
  useEffect(() => {
    if (!dragAnchor) return
    const onUp = () => handleDragEnd()
    window.addEventListener('mouseup', onUp)
    return () => window.removeEventListener('mouseup', onUp)
  }, [dragAnchor, handleDragEnd])

  const isCellInDrag = (dayIdx: number, hour: number): boolean => {
    if (!dragAnchor || !dragCurrent) return false
    if (dayIdx !== dragAnchor.dayIdx) return false
    const lo = Math.min(dragAnchor.hour, dragCurrent.hour)
    const hi = Math.max(dragAnchor.hour, dragCurrent.hour)
    return hour >= lo && hour <= hi
  }

  // Listing title lookup
  const listingById = useMemo(
    () => Object.fromEntries(listings.map((l) => [l.id, l.title])),
    [listings],
  )

  // Sidebar: upcoming slots this week sorted by time
  const upcomingSlots = useMemo(
    () => [...slots].sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()),
    [slots],
  )

  const isToday = (d: Date) => {
    const t = new Date()
    return d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear()
  }

  return (
    <>
      <VendorAppShell activeNav="calendar" routeSource="vendor-calendar">
        <main className="min-h-full w-full bg-transparent">
          <section className="mx-auto w-full max-w-[1280px] px-5 md:px-8 lg:px-12 py-6">
            {/* Header */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-2xl font-semibold text-slate-900">Calendar</h1>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={goToday}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={prevWeek}
                  className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <span className="min-w-[140px] text-center text-sm font-medium text-slate-700">
                  {monthLabel(weekStart)}
                </span>
                <button
                  type="button"
                  onClick={nextWeek}
                  className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50"
                >
                  <ChevronRight className="size-4" />
                </button>
                <button
                  type="button"
                  disabled={listingsReady && listings.length === 0}
                  onClick={() => { setBlockTarget({ day: new Date(), hour: new Date().getHours() }); setBlockError('') }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#2563EB] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Plus className="size-4" />
                  Block time
                </button>
              </div>
            </div>

            {listingsReady && listings.length === 0 && (
              <MogzuLegacyDemoBanner
                className="mb-4"
                title="No listings yet"
                detail="Publish at least one listing before blocking calendar time. Blocks are tied to a listing."
              />
            )}

            {pageNotice && (
              <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                {pageNotice}
                <button
                  type="button"
                  onClick={() => setPageNotice('')}
                  className="ml-2 underline"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Legend */}
            <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="inline-block size-3 rounded-sm bg-rose-200 border border-rose-300" />
                Blocked
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block size-3 rounded-sm bg-blue-200 border border-blue-300" />
                Booked
              </span>
              <span className="text-slate-400">
                Drag across empty cells to block multiple hours · Click booked to open request · Click blocked to unblock
              </span>
            </div>

            {loadError && (
              <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                {loadError}{' '}
                <button type="button" onClick={loadSlots} className="underline">Retry</button>
              </div>
            )}

            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
              <div className="grid grid-cols-12">
                {/* Calendar grid */}
                <div className="col-span-9 border-r border-slate-200">
                  {/* Day headers */}
                  <div className="grid grid-cols-8 border-b border-slate-200 bg-slate-50">
                    <div className="h-12 border-r border-slate-200" />
                    {weekDays.map((day, i) => (
                      <div
                        key={i}
                        className={`h-12 border-r border-slate-200 px-2 py-1 last:border-r-0 ${
                          isToday(day) ? 'bg-blue-50' : ''
                        }`}
                      >
                        <p className="text-[10px] text-slate-400">{dayLabel(day).split(' ')[0]}</p>
                        <p className={`text-sm font-semibold ${isToday(day) ? 'text-[#2563EB]' : 'text-slate-700'}`}>
                          {dayLabel(day).split(' ')[1]}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Time grid */}
                  <div className="grid grid-cols-8">
                    {/* Hour labels */}
                    <div className="border-r border-slate-200 bg-white">
                      {HOURS.map((h) => (
                        <div key={h} className="h-14 border-b border-slate-100 px-2 pt-1 text-[10px] text-slate-400">
                          {formatHour(h)}
                        </div>
                      ))}
                    </div>

                    {/* Day columns */}
                    {weekDays.map((day, dayIdx) => (
                      <div
                        key={dayIdx}
                        className={`relative border-r border-slate-100 last:border-r-0 ${
                          isToday(day) ? 'bg-blue-50/30' : 'bg-white'
                        }`}
                      >
                        {HOURS.map((h) => {
                          const cellSlots = slotsForCell(slots, day, h)
                          const dominated = cellSlots[0]
                          const inDrag = isCellInDrag(dayIdx, h)
                          return (
                            <div
                              key={h}
                              onClick={() => handleCellClick(day, h)}
                              onMouseDown={(e) => handleCellMouseDown(dayIdx, h, e)}
                              onMouseEnter={() => handleCellMouseEnter(dayIdx, h)}
                              className={`relative h-14 border-b border-slate-100 cursor-pointer transition-colors select-none ${
                                inDrag
                                  ? 'bg-rose-100/70 ring-1 ring-inset ring-rose-300'
                                  : dominated
                                    ? ''
                                    : 'hover:bg-slate-50'
                              }`}
                            >
                              {dominated && (
                                <div
                                  role={dominated.slot_type === 'booked' ? 'button' : undefined}
                                  tabIndex={dominated.slot_type === 'booked' ? 0 : undefined}
                                  onKeyDown={
                                    dominated.slot_type === 'booked'
                                      ? (e) => {
                                          if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            openBookedSlot(dominated)
                                          }
                                        }
                                      : undefined
                                  }
                                  className={`absolute inset-0.5 rounded text-[9px] font-medium px-1 py-0.5 flex flex-col justify-start overflow-hidden ${slotStyle(dominated.slot_type)} ${
                                    dominated.slot_type === 'booked' ? 'cursor-pointer hover:brightness-95' : ''
                                  }`}
                                >
                                  <span className="truncate">
                                    {dominated.slot_type === 'blocked' ? '🔒 Blocked' : '📅 Booked'}
                                  </span>
                                  {dominated.slot_type === 'blocked' && dominated.notes && (
                                    <span className="truncate opacity-70">{dominated.notes}</span>
                                  )}
                                  {dominated.slot_type === 'booked' && (
                                    <span className="truncate opacity-70">
                                      {listingById[dominated.listing_id] ?? dominated.listing_id.slice(0, 8)}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sidebar */}
                <aside className="col-span-3 bg-white">
                  <div className="border-b border-slate-200 p-3">
                    <p className="text-xs font-semibold text-slate-700">
                      {monthLabel(weekStart)}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {isLoading ? 'Loading…' : `${slots.length} slot${slots.length !== 1 ? 's' : ''} this week`}
                    </p>
                  </div>

                  <div className="max-h-[616px] overflow-auto p-3">
                    {upcomingSlots.length === 0 && !isLoading ? (
                      <div className="flex flex-col items-center gap-2 py-8 text-center">
                        <CalendarDays className="size-6 text-slate-200" />
                        <p className="text-xs text-slate-400">No slots this week.</p>
                        <p className="text-[10px] text-slate-300">Click or drag across cells to block time.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {upcomingSlots.map((s) => (
                          <div
                            key={s.id}
                            role={s.slot_type === 'booked' ? 'button' : undefined}
                            tabIndex={s.slot_type === 'booked' ? 0 : undefined}
                            onClick={
                              s.slot_type === 'booked'
                                ? () => openBookedSlot(s)
                                : undefined
                            }
                            onKeyDown={
                              s.slot_type === 'booked'
                                ? (e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      e.preventDefault()
                                      openBookedSlot(s)
                                    }
                                  }
                                : undefined
                            }
                            className={`rounded-lg p-2 text-xs ${slotStyle(s.slot_type)} ${
                              s.slot_type === 'booked' ? 'cursor-pointer hover:brightness-95' : ''
                            }`}
                          >
                            <div className="font-medium flex items-center gap-1">
                              {s.slot_type === 'blocked' ? (
                                <><Lock className="size-3" /> Blocked</>
                              ) : (
                                <>📅 Booked</>
                              )}
                            </div>
                            <div className="mt-0.5 opacity-80">
                              {formatSlotTime(s.start_time)} – {formatSlotTime(s.end_time)}
                            </div>
                            {listingById[s.listing_id] && (
                              <div className="mt-0.5 truncate opacity-70">{listingById[s.listing_id]}</div>
                            )}
                            {s.notes && (
                              <div className="mt-0.5 truncate opacity-60 italic">{s.notes}</div>
                            )}
                            {s.slot_type === 'blocked' && (
                              <button
                                type="button"
                                onClick={() => setUnblockSlot(s)}
                                className="mt-1 text-[10px] underline opacity-70 hover:opacity-100"
                              >
                                Unblock
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </aside>
              </div>
            </div>
          </section>

          <section className="mx-auto mt-6 max-w-[1400px] px-4 pb-12 sm:px-6 lg:px-8">
            <AvailabilityRulesPanel vendorId={vendorId} listings={listings} />
          </section>
        </main>
      </VendorAppShell>

      {blockTarget && (
        <BlockSlotModal
          target={blockTarget}
          listings={listings}
          onClose={() => setBlockTarget(null)}
          onSave={handleBlock}
          saving={blockSaving}
          error={blockError}
        />
      )}

      {unblockSlot && (
        <UnblockModal
          slot={unblockSlot}
          listingTitle={listingById[unblockSlot.listing_id] ?? unblockSlot.listing_id}
          onClose={() => setUnblockSlot(null)}
          onConfirm={handleUnblock}
          saving={unblockSaving}
        />
      )}
    </>
  )
}

// ─── Availability Rules Panel ────────────────────────────────────────────────

function AvailabilityRulesPanel({
  vendorId,
  listings,
}: {
  vendorId: string | null
  listings: Listing[]
}) {
  const [rules, setRules] = useState<VendorAvailabilityRule[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const [draftDay, setDraftDay] = useState(1) // Mon
  const [draftStart, setDraftStart] = useState('09:00')
  const [draftEnd, setDraftEnd] = useState('18:00')
  const [draftListing, setDraftListing] = useState<string>('') // '' = all listings
  const [adding, setAdding] = useState(false)

  const load = useCallback(async () => {
    if (!vendorId) return
    setLoading(true)
    const { data, error: err } = await listRules(vendorId)
    setLoading(false)
    if (err) {
      setError(err)
      return
    }
    setRules(data)
  }, [vendorId])

  useEffect(() => {
    load()
  }, [load])

  const handleAdd = async () => {
    setError('')
    setNotice('')
    if (!vendorId) return
    const start = hhmmToMinutes(draftStart)
    const end = hhmmToMinutes(draftEnd)
    if (start >= end) {
      setError('Start must be before end.')
      return
    }
    setAdding(true)
    const { error: err } = await createRule(vendorId, {
      day_of_week: draftDay,
      start_minute: start,
      end_minute: end,
      listing_id: draftListing || null,
    })
    setAdding(false)
    if (err) {
      setError(err)
      return
    }
    setNotice('Rule added.')
    load()
  }

  const handleDelete = async (id: string) => {
    setError('')
    const { error: err } = await deleteRule(id)
    if (err) setError(err)
    else load()
  }

  const grouped = rules.reduce<Record<number, VendorAvailabilityRule[]>>((acc, r) => {
    (acc[r.day_of_week] ??= []).push(r)
    return acc
  }, {})

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Recurring availability</h2>
          <p className="mt-1 text-xs text-slate-500">
            Default working hours per day. Used to validate booking-time slots and surface "outside hours" warnings.
          </p>
        </div>
        {loading && <Loader2 className="size-4 animate-spin text-slate-400" />}
      </div>

      {error && (
        <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      )}
      {notice && (
        <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {notice}
        </p>
      )}

      <div className="mt-4 grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-5">
        <div>
          <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-500">
            Day
          </label>
          <select
            value={draftDay}
            onChange={(e) => setDraftDay(Number(e.target.value))}
            className="h-9 w-full rounded-md border border-slate-200 px-2 text-sm"
          >
            {DAY_LABELS.map((d, i) => (
              <option key={d} value={i}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-500">
            Start
          </label>
          <input
            type="time"
            value={draftStart}
            onChange={(e) => setDraftStart(e.target.value)}
            className="h-9 w-full rounded-md border border-slate-200 px-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-500">
            End
          </label>
          <input
            type="time"
            value={draftEnd}
            onChange={(e) => setDraftEnd(e.target.value)}
            className="h-9 w-full rounded-md border border-slate-200 px-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-500">
            Listing
          </label>
          <select
            value={draftListing}
            onChange={(e) => setDraftListing(e.target.value)}
            className="h-9 w-full rounded-md border border-slate-200 px-2 text-sm"
          >
            <option value="">All listings</option>
            {listings.map((l) => (
              <option key={l.id} value={l.id}>
                {l.title}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <button
            type="button"
            onClick={handleAdd}
            disabled={adding}
            className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-md bg-[#2563eb] px-3 text-sm font-semibold text-white hover:bg-[#1d4ed8] disabled:opacity-60"
          >
            <Plus className="size-4" />
            {adding ? 'Adding…' : 'Add rule'}
          </button>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {DAY_LABELS.map((day, idx) => {
          const dayRules = grouped[idx] ?? []
          if (dayRules.length === 0) return null
          return (
            <div key={day} className="rounded-lg border border-slate-200 bg-white p-3">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-600">{day}</p>
              <div className="flex flex-wrap gap-2">
                {dayRules.map((r) => {
                  const listingLabel = r.listing_id
                    ? listings.find((l) => l.id === r.listing_id)?.title ?? 'Specific listing'
                    : 'All listings'
                  return (
                    <span
                      key={r.id}
                      className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-800"
                    >
                      {minutesToHHMM(r.start_minute)}–{minutesToHHMM(r.end_minute)}
                      <span className="text-[10px] text-blue-600/70">· {listingLabel}</span>
                      <button
                        type="button"
                        onClick={() => handleDelete(r.id)}
                        className="ml-1 text-rose-500 hover:text-rose-700"
                        title="Remove"
                      >
                        <X className="size-3" />
                      </button>
                    </span>
                  )
                })}
              </div>
            </div>
          )
        })}
        {rules.length === 0 && !loading && (
          <p className="rounded-lg border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
            No recurring rules yet. Add one above to set default working hours.
          </p>
        )}
      </div>
    </div>
  )
}
