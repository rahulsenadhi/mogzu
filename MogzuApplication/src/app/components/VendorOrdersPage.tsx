import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import {
  Download,
  Eye,
  Loader2,
  Search,
} from 'lucide-react'
import { VendorAppShell } from './layouts/VendorAppShell'
import { useAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import { realtimeService } from '@/lib/realtime'
import type {
  Booking,
  CorporateAccount,
  Listing,
  ModuleId,
  UserProfile,
} from '@/lib/database.types'

type OrderRow = Booking & {
  listings: Listing | null
  user_profiles: UserProfile | null
  corporate_accounts: CorporateAccount | null
}

const MODULE_LABEL: Record<ModuleId, string> = {
  events: 'Events',
  gifting: 'Gifting',
  spacex_coworking: 'Coworking',
  spacex_stay: 'Stay',
}

const STATUS_LABEL: Record<Booking['status'], { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-slate-100 text-slate-600' },
  pending_approval: { label: 'Awaiting approval', className: 'bg-amber-100 text-amber-800' },
  pending_vendor: { label: 'Awaiting confirmation', className: 'bg-blue-100 text-blue-800' },
  confirmed: { label: 'Confirmed', className: 'bg-emerald-100 text-emerald-700' },
  cancelled: { label: 'Cancelled', className: 'bg-rose-100 text-rose-700' },
  completed: { label: 'Completed', className: 'bg-emerald-100 text-emerald-700' },
  disputed: { label: 'Disputed', className: 'bg-rose-100 text-rose-700' },
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  })
}

function csvCell(v: string | number | null | undefined): string {
  const s = v == null ? '' : String(v)
  return `"${s.replace(/"/g, '""')}"`
}

function exportCsv(rows: OrderRow[]) {
  const header = [
    'booking_id',
    'created_at',
    'module',
    'status',
    'corporate',
    'requested_by',
    'department',
    'listing',
    'group_size',
    'start_time',
    'total_amount',
    'payment_status',
    'payment_method',
    'purpose_note',
  ]
  const lines = rows.map((r) =>
    [
      r.id,
      r.created_at,
      r.module,
      r.status,
      r.corporate_accounts?.name ?? '',
      r.user_profiles?.full_name ?? '',
      r.user_profiles?.department ?? '',
      r.listings?.title ?? '',
      r.group_size ?? '',
      r.start_time ?? '',
      r.total_amount ?? '',
      r.payment_status,
      r.payment_method ?? '',
      r.purpose_note ?? '',
    ]
      .map(csvCell)
      .join(','),
  )
  const csv = [header.join(','), ...lines].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `vendor-orders-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function VendorOrdersPage() {
  const navigate = useNavigate()
  const { vendorId } = useAuth()

  const [orders, setOrders] = useState<OrderRow[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [search, setSearch] = useState('')
  const [moduleFilter, setModuleFilter] = useState<'all' | ModuleId>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | Booking['status']>('all')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  const load = useCallback(async () => {
    if (!vendorId) return
    setLoading(true)
    setLoadError('')
    const { data, error } = await db.bookings.listByVendor(vendorId)
    if (error) setLoadError(error.message)
    else setOrders((data ?? []) as OrderRow[])
    setLoading(false)
  }, [vendorId])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (!vendorId) return
    return realtimeService.watchVendorBookings<Booking>(vendorId, () => load())
  }, [vendorId, load])

  const filtered = useMemo(() => {
    let list = orders
    if (moduleFilter !== 'all') list = list.filter((o) => o.module === moduleFilter)
    if (statusFilter !== 'all') list = list.filter((o) => o.status === statusFilter)
    if (fromDate) {
      const ms = new Date(fromDate).getTime()
      list = list.filter((o) => new Date(o.created_at).getTime() >= ms)
    }
    if (toDate) {
      const ms = new Date(toDate).getTime() + 86_400_000
      list = list.filter((o) => new Date(o.created_at).getTime() <= ms)
    }
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          (o.listings?.title ?? '').toLowerCase().includes(q) ||
          (o.corporate_accounts?.name ?? '').toLowerCase().includes(q) ||
          (o.user_profiles?.full_name ?? '').toLowerCase().includes(q),
      )
    }
    // Sort by status priority (pending_vendor first) then by created_at desc
    const statusOrder: Record<Booking['status'], number> = {
      pending_vendor: 0,
      pending_approval: 1,
      confirmed: 2,
      draft: 3,
      completed: 4,
      cancelled: 5,
      disputed: 6,
    }
    return [...list].sort((a, b) => {
      const so = statusOrder[a.status] - statusOrder[b.status]
      if (so !== 0) return so
      return b.created_at.localeCompare(a.created_at)
    })
  }, [orders, moduleFilter, statusFilter, fromDate, toDate, search])

  const counts = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter((o) => o.status === 'pending_vendor').length,
      confirmed: orders.filter((o) =>
        ['confirmed', 'completed'].includes(o.status),
      ).length,
      revenue: orders
        .filter((o) => ['confirmed', 'completed'].includes(o.status))
        .reduce((acc, o) => acc + (o.total_amount ?? 0), 0),
    }
  }, [orders])

  return (
    <VendorAppShell activeNav="orders" routeSource="vendor-orders">
      <main className="min-h-full w-full bg-transparent">
        <section className="mx-auto w-full max-w-[1280px] px-5 md:px-8 lg:px-12 py-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Orders</h1>
              <p className="text-sm text-slate-500">
                All incoming bookings across modules in one view.
              </p>
            </div>
            <button
              type="button"
              onClick={() => exportCsv(filtered)}
              disabled={filtered.length === 0}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <Download className="size-4" />
              Export CSV ({filtered.length})
            </button>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Total" value={String(counts.total)} />
            <Stat label="Awaiting confirmation" value={String(counts.pending)} />
            <Stat label="Confirmed / completed" value={String(counts.confirmed)} />
            <Stat
              label="Confirmed revenue"
              value={`₹ ${counts.revenue.toLocaleString('en-IN')}`}
            />
          </div>

          <div className="mb-3 flex flex-wrap gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ID, customer, listing"
                className="h-9 w-72 rounded-md border border-slate-200 bg-slate-50/80 pl-9 pr-3 text-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value as 'all' | ModuleId)}
              className="h-9 rounded-md border border-slate-200 px-2 text-sm"
            >
              <option value="all">Module: All</option>
              {(Object.keys(MODULE_LABEL) as ModuleId[]).map((m) => (
                <option key={m} value={m}>
                  {MODULE_LABEL[m]}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | Booking['status'])}
              className="h-9 rounded-md border border-slate-200 px-2 text-sm"
            >
              <option value="all">Status: All</option>
              {(Object.keys(STATUS_LABEL) as Booking['status'][]).map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s].label}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="h-9 rounded-md border border-slate-200 px-2 text-sm"
              title="From"
            />
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="h-9 rounded-md border border-slate-200 px-2 text-sm"
              title="To"
            />
            <button
              type="button"
              onClick={() => {
                setSearch('')
                setModuleFilter('all')
                setStatusFilter('all')
                setFromDate('')
                setToDate('')
              }}
              className="h-9 rounded-md border border-slate-200 px-3 text-sm text-slate-600 hover:bg-slate-50"
            >
              Reset
            </button>
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

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {loading ? (
              <div className="flex items-center justify-center py-14">
                <Loader2 className="size-6 animate-spin text-slate-400" />
              </div>
            ) : filtered.length === 0 ? (
              <p className="p-12 text-center text-sm text-slate-500">
                No orders match these filters.
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
                    <th className="px-4 py-3">Order</th>
                    <th className="px-4 py-3">Module</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Listing</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Payment</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((o) => {
                    const sb = STATUS_LABEL[o.status]
                    return (
                      <tr key={o.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-mono text-xs text-[#2563eb]">
                          {o.id.slice(0, 8)}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {MODULE_LABEL[o.module]}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-900">
                            {o.corporate_accounts?.name ?? '—'}
                          </p>
                          <p className="text-xs text-slate-500">
                            {o.user_profiles?.full_name ?? '—'}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {o.listings?.title ?? '—'}
                          {o.purpose_note && (
                            <p
                              className="mt-0.5 truncate text-xs text-slate-500"
                              title={o.purpose_note}
                            >
                              {o.purpose_note.split('\n')[0]}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {formatDate(o.start_time ?? o.created_at)}
                        </td>
                        <td className="px-4 py-3 font-medium">
                          ₹ {(o.total_amount ?? 0).toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded px-2 py-0.5 text-xs ${
                              o.payment_status === 'paid'
                                ? 'bg-emerald-50 text-emerald-700'
                                : o.payment_status === 'failed'
                                  ? 'bg-rose-50 text-rose-700'
                                  : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {o.payment_status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${sb.className}`}
                          >
                            {sb.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => navigate(`/vendor/booking-requests/${o.id}`)}
                            className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            <Eye className="size-4" />
                            View
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>
    </VendorAppShell>
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
