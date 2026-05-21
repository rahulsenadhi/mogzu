import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Lock,
  CalendarDays,
  AlertTriangle,
} from 'lucide-react'
import { VendorAppShell } from './layouts/VendorAppShell'
import { useAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import { subscribeToTable } from '@/lib/realtime'
import type { CalendarSlot, Listing } from '@/lib/database.types'

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

type BlockTarget = { day: Date; hour: number }

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
    durationHours: '1',
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

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Block time slot</h2>
            <p className="text-xs text-slate-500">Starting {startLabel}</p>
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

  const [weekStart, setWeekStart] = useState<Date>(() => startOfWeek(new Date()))
  const [slots, setSlots] = useState<CalendarSlot[]>([])
  const [listings, setListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  // Block modal
  const [blockTarget, setBlockTarget] = useState<BlockTarget | null>(null)
  const [blockSaving, setBlockSaving] = useState(false)
  const [blockError, setBlockError] = useState('')

  // Unblock modal
  const [unblockSlot, setUnblockSlot] = useState<CalendarSlot | null>(null)
  const [unblockSaving, setUnblockSaving] = useState(false)

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
    db.listings.listByVendor(vendorId).then(({ data }) => {
      setListings(data ?? [])
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

  // Cell click handler
  const handleCellClick = (day: Date, hour: number) => {
    const cellSlots = slotsForCell(slots, day, hour)
    const blocked = cellSlots.find((s) => s.slot_type === 'blocked')
    if (blocked) {
      setUnblockSlot(blocked)
      return
    }
    const booked = cellSlots.find((s) => s.slot_type === 'booked')
    if (booked) return // booked — read-only
    setBlockTarget({ day, hour })
    setBlockError('')
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
                  onClick={() => { setBlockTarget({ day: new Date(), hour: new Date().getHours() }); setBlockError('') }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#2563EB] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#1D4ED8]"
                >
                  <Plus className="size-4" />
                  Block time
                </button>
              </div>
            </div>

            {/* Legend */}
            <div className="mb-3 flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="inline-block size-3 rounded-sm bg-rose-200 border border-rose-300" />
                Blocked
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block size-3 rounded-sm bg-blue-200 border border-blue-300" />
                Booked
              </span>
              <span className="text-slate-400">Click any empty cell to block it · Click blocked cell to unblock</span>
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
                          return (
                            <div
                              key={h}
                              onClick={() => handleCellClick(day, h)}
                              className={`relative h-14 border-b border-slate-100 cursor-pointer transition-colors ${
                                dominated
                                  ? ''
                                  : 'hover:bg-slate-50'
                              }`}
                            >
                              {dominated && (
                                <div
                                  className={`absolute inset-0.5 rounded text-[9px] font-medium px-1 py-0.5 flex flex-col justify-start overflow-hidden ${slotStyle(dominated.slot_type)}`}
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
                        <p className="text-[10px] text-slate-300">Click a cell to block time.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {upcomingSlots.map((s) => (
                          <div
                            key={s.id}
                            className={`rounded-lg p-2 text-xs ${slotStyle(s.slot_type)}`}
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
