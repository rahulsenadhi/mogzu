import { useMemo, useState } from 'react';
import { Calendar, Plus, Search, X } from 'lucide-react';
import { VendorAppShell } from './layouts/VendorAppShell';

type EventType = 'order' | 'meeting' | 'birthday';
type CalendarView = 'day' | 'week' | 'month' | 'year';
type CalendarEvent = {
  id: string;
  title: string;
  dayIndex: number; // 0..6 in week view
  hour: number; // 7..17
  minute: number;
  type: EventType;
  subtitle?: string;
};

const dayHeaders = [
  { short: 'SUN', num: 21 },
  { short: 'MON', num: 22 },
  { short: 'TUE', num: 23 },
  { short: 'WED', num: 24 },
  { short: 'THU', num: 25 },
  { short: 'FRI', num: 26 },
  { short: 'SAT', num: 27 },
];

const initialEvents: CalendarEvent[] = [
  { id: 'e1', title: 'Rohit Gupta Birthday', dayIndex: 5, hour: 8, minute: 40, type: 'birthday' },
  { id: 'e2', title: 'Order#1240909 deliver today', dayIndex: 5, hour: 11, minute: 0, type: 'order' },
  { id: 'e3', title: 'Meeting with Kapil Devi', dayIndex: 3, hour: 12, minute: 0, type: 'meeting' },
];

function eventStyle(type: EventType) {
  if (type === 'order') return 'bg-[#DDEBFF] text-[#1D4ED8] border border-[#BFDBFE]';
  if (type === 'meeting') return 'bg-[#DCFCE7] text-[#0F766E] border border-[#BBF7D0]';
  return 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]';
}

function formatTime(hour: number, minute: number) {
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const m = String(minute).padStart(2, '0');
  return `${h12}:${m} ${suffix}`;
}

export default function VendorCalendarPage() {
  const [search, setSearch] = useState('');
  const [view, setView] = useState<CalendarView>('week');
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDayIndex, setNewDayIndex] = useState(5);
  const [newHour, setNewHour] = useState(10);
  const [newMinute, setNewMinute] = useState(0);
  const [newType, setNewType] = useState<EventType>('order');
  const [uiNotice, setUiNotice] = useState<string | null>(null);

  const upcomingEvents = useMemo(() => {
    const q = search.trim().toLowerCase();
    const sorted = [...events].sort((a, b) => {
      if (a.dayIndex !== b.dayIndex) return a.dayIndex - b.dayIndex;
      if (a.hour !== b.hour) return a.hour - b.hour;
      return a.minute - b.minute;
    });
    if (!q) return sorted;
    return sorted.filter((e) => e.title.toLowerCase().includes(q) || e.type.includes(q));
  }, [events, search]);

  const handleAddEvent = () => {
    const title = newTitle.trim();
    if (!title) return;
    const event: CalendarEvent = {
      id: `evt-${Date.now()}`,
      title,
      dayIndex: newDayIndex,
      hour: newHour,
      minute: newMinute,
      type: newType,
    };
    setEvents((prev) => [...prev, event]);
    setNewTitle('');
    setNewDayIndex(5);
    setNewHour(10);
    setNewMinute(0);
    setNewType('order');
    setShowAddEvent(false);
  };

  return (
    <>
      <VendorAppShell
        activeNav="calendar"
        routeSource="vendor-calendar"
        onNavNotice={(msg) => setUiNotice(msg)}
        headerSearch={
          <>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search events…"
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/80 py-2 pl-9 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </>
        }
      >
        <main className="min-h-full w-full bg-transparent">
          {uiNotice ? (
            <p
              className="border-b border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700 sm:px-6"
              role="status"
            >
              {uiNotice}
            </p>
          ) : null}

          <section className="p-4 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h1 className="text-2xl font-semibold text-slate-900">Calendar</h1>
              <button
                type="button"
                onClick={() => setShowAddEvent(true)}
                className="inline-flex items-center gap-2 rounded-full bg-[#2563EB] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#1D4ED8]"
              >
                <Plus className="h-4 w-4" />
                Add event
              </button>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>Today</span>
                </div>
                <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1">
                  {(['day', 'week', 'month', 'year'] as CalendarView[]).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setView(v)}
                      className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                        view === v ? 'bg-[#2563EB] text-white' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-12 gap-0 overflow-hidden rounded-xl border border-slate-200">
                <div className="col-span-9 border-r border-slate-200">
                  <div className="grid grid-cols-8 border-b border-slate-200 bg-slate-50">
                    <div className="h-12 border-r border-slate-200" />
                    {dayHeaders.map((d) => (
                      <div key={d.short} className="h-12 border-r border-slate-200 px-2 py-1 last:border-r-0">
                        <p className="text-[10px] text-slate-400">{d.short}</p>
                        <p className="text-sm font-medium text-slate-700">{d.num}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-8">
                    <div className="border-r border-slate-200 bg-white">
                      {Array.from({ length: 11 }).map((_, i) => (
                        <div key={i} className="h-16 border-b border-slate-100 px-2 pt-1 text-[10px] text-slate-400">
                          {i + 7}:00
                        </div>
                      ))}
                    </div>

                    {Array.from({ length: 7 }).map((dayIdx) => (
                      <div
                        key={dayIdx}
                        className={`relative border-r border-slate-100 last:border-r-0 ${dayIdx === 4 ? 'bg-[#EFF6FF]' : 'bg-white'}`}
                      >
                        {Array.from({ length: 11 }).map((_, i) => (
                          <div key={i} className="h-16 border-b border-slate-100" />
                        ))}
                        {events
                          .filter((e) => e.dayIndex === dayIdx)
                          .map((e) => (
                            <div
                              key={e.id}
                              className={`absolute left-1 right-1 rounded p-1 text-[10px] font-medium ${eventStyle(e.type)}`}
                              style={{ top: `${(e.hour - 7) * 64 + (e.minute / 60) * 64}px` }}
                            >
                              <p>{formatTime(e.hour, e.minute)}</p>
                              <p className="truncate">{e.title}</p>
                            </div>
                          ))}
                      </div>
                    ))}
                  </div>
                </div>

                <aside className="col-span-3 bg-white">
                  <div className="border-b border-slate-200 p-3">
                    <p className="text-xs font-semibold text-slate-700">May 2019</p>
                    <p className="mt-1 text-[11px] text-slate-500">Upcoming events</p>
                  </div>
                  <div className="max-h-[680px] overflow-auto p-3">
                    <div className="space-y-3">
                      {upcomingEvents.map((e) => (
                        <div key={e.id} className="border-b border-slate-100 pb-2">
                          <p className="text-sm font-medium text-slate-800">{e.title}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {dayHeaders[e.dayIndex].num} Jul 2024 {formatTime(e.hour, e.minute)}
                          </p>
                        </div>
                      ))}
                      {upcomingEvents.length === 0 && (
                        <p className="text-xs text-slate-500">No matching upcoming events.</p>
                      )}
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          </section>
        </main>
      </VendorAppShell>

      {showAddEvent && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Add event</h2>
              <button type="button" onClick={() => setShowAddEvent(false)} className="rounded p-1 text-slate-500 hover:bg-slate-100">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-600">Title</span>
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Order#1240910 dispatch"
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-slate-600">Type</span>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as EventType)}
                    className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                  >
                    <option value="order">Order</option>
                    <option value="meeting">Meeting</option>
                    <option value="birthday">Birthday</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-slate-600">Day</span>
                  <select
                    value={newDayIndex}
                    onChange={(e) => setNewDayIndex(Number(e.target.value))}
                    className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                  >
                    {dayHeaders.map((d, idx) => (
                      <option key={d.short} value={idx}>
                        {d.short} {d.num}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-slate-600">Hour</span>
                  <input
                    type="number"
                    min={7}
                    max={17}
                    value={newHour}
                    onChange={(e) => setNewHour(Number(e.target.value))}
                    className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-slate-600">Minute</span>
                  <input
                    type="number"
                    min={0}
                    max={59}
                    value={newMinute}
                    onChange={(e) => setNewMinute(Number(e.target.value))}
                    className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                  />
                </label>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddEvent(false)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddEvent}
                className="rounded-lg bg-[#2563EB] px-3 py-2 text-sm font-medium text-white hover:bg-[#1D4ED8]"
              >
                Save event
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

