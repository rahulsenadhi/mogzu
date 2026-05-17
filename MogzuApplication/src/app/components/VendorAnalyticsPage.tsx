import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  BarChart3,
  Loader2,
  ShieldAlert,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import { VendorAppShell } from './layouts/VendorAppShell'
import { useAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import type { Booking, Listing } from '@/lib/database.types'

type BookingRow = Booking & { listings: Listing | null }

function startOfWindow(days: number): number {
  return Date.now() - days * 86_400_000
}

export default function VendorAnalyticsPage() {
  const { vendorId } = useAuth()
  const [bookings, setBookings] = useState<BookingRow[]>([])
  const [loading, setLoading] = useState(true)
  const [windowDays, setWindowDays] = useState<30 | 90 | 180>(30)

  const load = useCallback(async () => {
    if (!vendorId) return
    setLoading(true)
    const { data } = await db.bookings.listByVendor(vendorId)
    setBookings((data ?? []) as BookingRow[])
    setLoading(false)
  }, [vendorId])

  useEffect(() => {
    load()
  }, [load])

  const stats = useMemo(() => {
    const since = startOfWindow(windowDays)
    const prevSince = startOfWindow(windowDays * 2)
    const inWindow = bookings.filter(
      (b) => new Date(b.created_at).getTime() >= since,
    )
    const prev = bookings.filter((b) => {
      const ms = new Date(b.created_at).getTime()
      return ms >= prevSince && ms < since
    })
    const confirmed = inWindow.filter((b) =>
      ['confirmed', 'completed'].includes(b.status),
    )
    const cancelled = inWindow.filter((b) => b.status === 'cancelled').length
    const revenue = confirmed.reduce((s, b) => s + (b.total_amount ?? 0), 0)
    const prevRevenue = prev
      .filter((b) => ['confirmed', 'completed'].includes(b.status))
      .reduce((s, b) => s + (b.total_amount ?? 0), 0)
    const aov = confirmed.length > 0 ? Math.round(revenue / confirmed.length) : 0
    const cxRate =
      inWindow.length > 0 ? Math.round((cancelled / inWindow.length) * 100) : 0
    const trend =
      prevRevenue === 0
        ? revenue > 0
          ? 100
          : 0
        : Math.round(((revenue - prevRevenue) / prevRevenue) * 100)

    // listing-level conversion = confirmed / total per listing
    const byListing = new Map<string, { title: string; total: number; confirmed: number; revenue: number }>()
    inWindow.forEach((b) => {
      const t = b.listings?.title ?? '—'
      const cur = byListing.get(t) ?? { title: t, total: 0, confirmed: 0, revenue: 0 }
      cur.total += 1
      if (['confirmed', 'completed'].includes(b.status)) {
        cur.confirmed += 1
        cur.revenue += b.total_amount ?? 0
      }
      byListing.set(t, cur)
    })

    return {
      bookings: inWindow.length,
      confirmedCount: confirmed.length,
      revenue,
      aov,
      cxRate,
      trend,
      byListing: Array.from(byListing.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 8),
    }
  }, [bookings, windowDays])

  // Sparkline: 30 buckets of week / day depending on window
  const chartBuckets = useMemo(() => {
    const buckets = 30
    const start = startOfWindow(windowDays)
    const totalMs = windowDays * 86_400_000
    const bucketMs = totalMs / buckets
    const arr = Array.from({ length: buckets }, () => 0)
    bookings.forEach((b) => {
      const ms = new Date(b.created_at).getTime()
      if (ms < start) return
      if (!['confirmed', 'completed'].includes(b.status)) return
      const idx = Math.min(buckets - 1, Math.floor((ms - start) / bucketMs))
      arr[idx] += b.total_amount ?? 0
    })
    const max = Math.max(...arr, 1)
    return arr.map((v) => Math.round((v / max) * 100))
  }, [bookings, windowDays])

  if (!vendorId) {
    return (
      <VendorAppShell activeNav="orders" routeSource="vendor-analytics">
        <main className="flex min-h-full items-center justify-center bg-transparent p-6">
          <div className="max-w-md rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
            <ShieldAlert className="mx-auto mb-2 size-8 text-amber-600" />
            <p className="text-sm text-amber-800">Vendor account required.</p>
          </div>
        </main>
      </VendorAppShell>
    )
  }

  return (
    <VendorAppShell activeNav="orders" routeSource="vendor-analytics">
      <main className="min-h-full w-full bg-transparent">
        <section className="p-4 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="flex items-center gap-2 text-2xl font-semibold text-slate-900">
                <BarChart3 className="size-5" />
                Performance
              </h1>
              <p className="text-sm text-slate-500">
                Live booking-derived analytics from Supabase. No seed data.
              </p>
            </div>
            <select
              value={windowDays}
              onChange={(e) => setWindowDays(Number(e.target.value) as 30 | 90 | 180)}
              className="h-9 rounded-md border border-slate-200 px-2 text-sm"
            >
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="180">Last 180 days</option>
            </select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-14">
              <Loader2 className="size-6 animate-spin text-slate-400" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Stat
                  label="Total bookings"
                  value={String(stats.bookings)}
                  sub={`${stats.confirmedCount} confirmed`}
                />
                <Stat
                  label="Revenue"
                  value={`₹ ${stats.revenue.toLocaleString('en-IN')}`}
                  sub={
                    <span className="inline-flex items-center gap-1">
                      {stats.trend >= 0 ? (
                        <TrendingUp className="size-3 text-emerald-600" />
                      ) : (
                        <TrendingDown className="size-3 text-rose-600" />
                      )}
                      {stats.trend > 0 ? '+' : ''}
                      {stats.trend}% vs prev
                    </span>
                  }
                />
                <Stat
                  label="Avg order value"
                  value={`₹ ${stats.aov.toLocaleString('en-IN')}`}
                />
                <Stat
                  label="Cancellation rate"
                  value={`${stats.cxRate}%`}
                  sub={stats.cxRate > 10 ? 'High' : 'Healthy'}
                />
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Revenue trend ({windowDays}d)
                </p>
                <div className="flex h-32 items-end gap-1">
                  {chartBuckets.map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t bg-[#2563eb]"
                      style={{ height: `${Math.max(2, h)}%`, opacity: 0.15 + (h / 100) * 0.85 }}
                    />
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-slate-400">
                  Each bar = ~{Math.round(windowDays / 30)}d window. Heights scaled to peak.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Listing-level conversion (top 8)
                </p>
                {stats.byListing.length === 0 ? (
                  <p className="text-sm text-slate-500">No data in window.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="text-left text-xs uppercase tracking-wider text-slate-500">
                      <tr>
                        <th className="py-2">Listing</th>
                        <th className="py-2">Bookings</th>
                        <th className="py-2">Confirmed</th>
                        <th className="py-2">Conversion</th>
                        <th className="py-2">Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {stats.byListing.map((l) => {
                        const conv = l.total > 0 ? Math.round((l.confirmed / l.total) * 100) : 0
                        return (
                          <tr key={l.title}>
                            <td className="py-2 font-medium text-slate-900">{l.title}</td>
                            <td className="py-2 text-slate-600">{l.total}</td>
                            <td className="py-2 text-slate-600">{l.confirmed}</td>
                            <td className="py-2">
                              <span
                                className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                                  conv >= 70
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : conv >= 40
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-rose-100 text-rose-700'
                                }`}
                              >
                                {conv}%
                              </span>
                            </td>
                            <td className="py-2 font-medium">
                              ₹ {l.revenue.toLocaleString('en-IN')}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </section>
      </main>
    </VendorAppShell>
  )
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string
  value: string
  sub?: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>
      {sub && <p className="mt-1 text-[11px] text-slate-500">{sub}</p>}
    </div>
  )
}
