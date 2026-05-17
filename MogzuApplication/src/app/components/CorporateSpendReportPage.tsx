import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import {
  ArrowLeft,
  Calendar as CalIcon,
  Download,
  FileText,
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
  Listing,
  ModuleId,
  UserProfile,
  Vendor,
} from '@/lib/database.types'

type BookingRow = Booking & {
  listings: Listing | null
  vendors: Vendor | null
  user_profiles?: UserProfile | null
}

const MODULE_LABEL: Record<ModuleId, string> = {
  events: 'Events',
  gifting: 'Gifting',
  spacex_coworking: 'Coworking',
  spacex_stay: 'Stay',
}

const CHARGED_STATUSES: Booking['status'][] = [
  'pending_approval',
  'pending_vendor',
  'confirmed',
  'completed',
]

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

function thirtyDaysAgoIso(): string {
  const d = new Date()
  d.setDate(d.getDate() - 30)
  return d.toISOString().slice(0, 10)
}

function csvCell(v: string | number | null | undefined): string {
  const s = v == null ? '' : String(v)
  return `"${s.replace(/"/g, '""')}"`
}

export default function CorporateSpendReportPage() {
  const navigate = useNavigate()
  const { profile, corporateId, role } = useAuth()
  const canView = role === 'l3_admin' || role === 'mogzu_admin'

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [bookings, setBookings] = useState<BookingRow[]>([])
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [fromDate, setFromDate] = useState<string>(thirtyDaysAgoIso())
  const [toDate, setToDate] = useState<string>(todayIso())
  const [departmentFilter, setDepartmentFilter] = useState<'all' | string>('all')
  const [moduleFilter, setModuleFilter] = useState<'all' | ModuleId>('all')

  const load = useCallback(async () => {
    if (!corporateId) return
    setLoading(true)
    setLoadError('')
    const [bRes, uRes] = await Promise.all([
      db.bookings.listByCorporate(corporateId),
      db.userProfiles.listByCorporate(corporateId),
    ])
    if (bRes.error) setLoadError(bRes.error.message)
    else setBookings((bRes.data ?? []) as BookingRow[])
    setUsers((uRes.data ?? []) as UserProfile[])
    setLoading(false)
  }, [corporateId])

  useEffect(() => {
    load()
  }, [load])

  const userById = useMemo(
    () => Object.fromEntries(users.map((u) => [u.id, u])),
    [users],
  )

  const departments = useMemo(() => {
    const set = new Set<string>()
    users.forEach((u) => {
      if (u.department) set.add(u.department)
    })
    return Array.from(set).sort()
  }, [users])

  const filtered = useMemo(() => {
    const fromMs = new Date(fromDate).getTime()
    const toMs = new Date(toDate).getTime() + 86_400_000
    return bookings.filter((b) => {
      if (!CHARGED_STATUSES.includes(b.status)) return false
      const ms = new Date(b.created_at).getTime()
      if (ms < fromMs || ms > toMs) return false
      if (moduleFilter !== 'all' && b.module !== moduleFilter) return false
      if (departmentFilter !== 'all') {
        const u = userById[b.user_id]
        if (!u || u.department !== departmentFilter) return false
      }
      return true
    })
  }, [bookings, fromDate, toDate, moduleFilter, departmentFilter, userById])

  const totals = useMemo(() => {
    const total = filtered.reduce((s, b) => s + (b.total_amount ?? 0), 0)
    const byModule = new Map<ModuleId, number>()
    const byDept = new Map<string, number>()
    filtered.forEach((b) => {
      byModule.set(b.module, (byModule.get(b.module) ?? 0) + (b.total_amount ?? 0))
      const dept = userById[b.user_id]?.department ?? '—'
      byDept.set(dept, (byDept.get(dept) ?? 0) + (b.total_amount ?? 0))
    })
    return {
      total,
      count: filtered.length,
      byModule: Array.from(byModule.entries()).sort((a, b) => b[1] - a[1]),
      byDept: Array.from(byDept.entries()).sort((a, b) => b[1] - a[1]),
    }
  }, [filtered, userById])

  const handleExportCsv = () => {
    const header = [
      'booking_id',
      'created_at',
      'module',
      'status',
      'employee',
      'department',
      'listing',
      'vendor',
      'total_amount',
      'payment_status',
    ]
    const lines = filtered.map((b) => {
      const u = userById[b.user_id]
      return [
        b.id,
        b.created_at,
        b.module,
        b.status,
        u?.full_name ?? '',
        u?.department ?? '',
        b.listings?.title ?? '',
        b.vendors?.business_name ?? '',
        b.total_amount ?? '',
        b.payment_status,
      ]
        .map(csvCell)
        .join(',')
    })
    const csv = [header.join(','), ...lines].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mogzu-spend-${fromDate}_to_${toDate}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!canView) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FFFDF9]">
        <div className="max-w-md rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
          <ShieldAlert className="mx-auto mb-2 size-8 text-amber-600" />
          <p className="text-sm text-amber-800">L3 Admin access required.</p>
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
        <MogzuCorporateScrollSurface className="py-8">
          <div className="mx-auto max-w-5xl px-8">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800"
            >
              <ArrowLeft className="size-4" />
              Back
            </button>

            <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="flex items-center gap-2 text-2xl font-bold text-[#0e1e3f]">
                  <FileText className="size-5" />
                  Spend report
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Build a date-range, department, and module-filtered view of your
                  organisation's spend. Export CSV for offline analysis.
                </p>
              </div>
              <button
                type="button"
                onClick={handleExportCsv}
                disabled={filtered.length === 0}
                className="inline-flex items-center gap-1.5 rounded-md bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                <Download className="size-4" />
                Export CSV ({filtered.length})
              </button>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-4">
              <div>
                <label className="mb-1 flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-slate-500">
                  <CalIcon className="size-3" /> From
                </label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="h-9 w-full rounded-md border border-slate-200 px-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-slate-500">
                  <CalIcon className="size-3" /> To
                </label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="h-9 w-full rounded-md border border-slate-200 px-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-500">
                  Department
                </label>
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="h-9 w-full rounded-md border border-slate-200 px-2 text-sm"
                >
                  <option value="all">All departments</option>
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-500">
                  Module
                </label>
                <select
                  value={moduleFilter}
                  onChange={(e) => setModuleFilter(e.target.value as 'all' | ModuleId)}
                  className="h-9 w-full rounded-md border border-slate-200 px-2 text-sm"
                >
                  <option value="all">All modules</option>
                  {(Object.keys(MODULE_LABEL) as ModuleId[]).map((m) => (
                    <option key={m} value={m}>
                      {MODULE_LABEL[m]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {loadError && (
              <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="text-sm text-red-700">{loadError}</p>
                <button
                  type="button"
                  onClick={load}
                  className="mt-2 rounded-md bg-[#2563eb] px-3 py-1.5 text-xs font-medium text-white"
                >
                  Retry
                </button>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-14">
                <Loader2 className="size-6 animate-spin text-slate-400" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <Stat label="Total spend" value={`₹ ${totals.total.toLocaleString('en-IN')}`} />
                  <Stat label="Bookings" value={String(totals.count)} />
                  <Stat
                    label="Top module"
                    value={
                      totals.byModule[0]
                        ? `${MODULE_LABEL[totals.byModule[0][0]]} ₹${totals.byModule[0][1].toLocaleString('en-IN')}`
                        : '—'
                    }
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <Breakdown title="By module" rows={totals.byModule.map(([k, v]) => [MODULE_LABEL[k], v])} total={totals.total} />
                  <Breakdown title="By department" rows={totals.byDept} total={totals.total} />
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  <div className="border-b border-slate-100 p-4">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                      Bookings ({filtered.length})
                    </h2>
                  </div>
                  {filtered.length === 0 ? (
                    <p className="p-10 text-center text-sm text-slate-500">
                      No spend in this slice. Try widening the date range.
                    </p>
                  ) : (
                    <div className="max-h-[420px] overflow-auto">
                      <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                          <tr>
                            <th className="px-4 py-2">Date</th>
                            <th className="px-4 py-2">Employee</th>
                            <th className="px-4 py-2">Department</th>
                            <th className="px-4 py-2">Module</th>
                            <th className="px-4 py-2">Listing</th>
                            <th className="px-4 py-2">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filtered.slice(0, 200).map((b) => {
                            const u = userById[b.user_id]
                            return (
                              <tr key={b.id} className="hover:bg-slate-50/50">
                                <td className="px-4 py-2 text-slate-600">
                                  {new Date(b.created_at).toLocaleDateString('en-IN')}
                                </td>
                                <td className="px-4 py-2 font-medium text-slate-900">
                                  {u?.full_name ?? '—'}
                                </td>
                                <td className="px-4 py-2 text-slate-600">
                                  {u?.department ?? '—'}
                                </td>
                                <td className="px-4 py-2 text-slate-600">
                                  {MODULE_LABEL[b.module]}
                                </td>
                                <td className="px-4 py-2 text-slate-700">
                                  {b.listings?.title ?? '—'}
                                </td>
                                <td className="px-4 py-2 font-medium">
                                  ₹ {(b.total_amount ?? 0).toLocaleString('en-IN')}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                      {filtered.length > 200 && (
                        <p className="border-t border-slate-100 p-2 text-center text-xs text-slate-500">
                          Showing first 200 of {filtered.length}. CSV export includes all rows.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <p className="rounded-xl bg-slate-100 px-4 py-3 text-xs text-slate-600">
                  PDF export + scheduled weekly/monthly distribution lists deferred — handled by
                  the N8N spend-report workflow (sprint 10 task 7.3 backend wiring).
                </p>
              </div>
            )}
          </div>
        </MogzuCorporateScrollSurface>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>
    </div>
  )
}

function Breakdown({
  title,
  rows,
  total,
}: {
  title: string
  rows: [string, number][]
  total: number
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </h3>
      {rows.length === 0 ? (
        <p className="text-sm text-slate-500">No data.</p>
      ) : (
        <ul className="space-y-2">
          {rows.map(([k, v]) => {
            const pct = total > 0 ? (v / total) * 100 : 0
            return (
              <li key={k}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-slate-700">{k}</span>
                  <span className="font-medium">₹ {v.toLocaleString('en-IN')}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-[#2563eb]"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
