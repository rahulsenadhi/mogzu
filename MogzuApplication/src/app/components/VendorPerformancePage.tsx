import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import {
  BarChart3,
  Download,
  Printer,
  Star,
  TrendingUp,
  Heart,
  CalendarCheck,
  Eye,
  Loader2,
} from 'lucide-react'
import { VendorAppShell } from './layouts/VendorAppShell'
import { useAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import { supabase } from '@/lib/supabase'
import type { Booking, Listing, Review } from '@/lib/database.types'
import {
  VendorPerformanceStatsDrawer,
  type VendorPerformanceListing,
} from './vendor/VendorPerformanceStatsDrawer'

type Range = '7d' | '30d' | '90d' | 'all'

const RANGE_LABEL: Record<Range, string> = {
  '7d': '7D',
  '30d': '30D',
  '90d': '90D',
  all: 'All',
}

const CHARGED_STATUSES: Booking['status'][] = ['pending_approval', 'pending_vendor', 'confirmed', 'completed']

function rangeFromDate(range: Range): Date | null {
  if (range === 'all') return null
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90
  const d = new Date()
  d.setDate(d.getDate() - days)
  d.setHours(0, 0, 0, 0)
  return d
}

function fmtInr(n: number): string {
  return `₹${Math.round(n).toLocaleString('en-IN')}`
}

function csvCell(v: string | number | null | undefined): string {
  const s = v == null ? '' : String(v)
  return `"${s.replace(/"/g, '""')}"`
}

type ListingRow = {
  listing: Listing
  bookings: number
  revenue: number
  saves: number
  reviewCount: number
  avgRating: number | null
}

export default function VendorPerformancePage() {
  const navigate = useNavigate()
  const { vendorId } = useAuth()
  const [range, setRange] = useState<Range>('30d')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [listings, setListings] = useState<Listing[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [savesByListing, setSavesByListing] = useState<Record<string, number>>({})

  const [drawerListing, setDrawerListing] = useState<VendorPerformanceListing | null>(null)

  const load = useCallback(async () => {
    if (!vendorId) {
      setLoading(false)
      return
    }
    setLoading(true)
    setLoadError('')
    const [listingsRes, bookingsRes, reviewsRes] = await Promise.all([
      db.listings.listByVendor(vendorId),
      db.bookings.listByVendor(vendorId),
      db.reviews.listByVendor(vendorId),
    ])
    if (listingsRes.error) {
      setLoadError(listingsRes.error.message)
      setLoading(false)
      return
    }
    const ls = (listingsRes.data ?? []) as Listing[]
    setListings(ls)
    setBookings((bookingsRes.data ?? []) as Booking[])
    setReviews((reviewsRes.data ?? []) as Review[])

    // Saves per-listing via head count
    if (ls.length > 0) {
      const ids = ls.map((l) => l.id)
      const { data } = await supabase
        .from('wishlists')
        .select('listing_id')
        .in('listing_id', ids)
      const counts: Record<string, number> = {}
      for (const w of (data ?? []) as { listing_id: string }[]) {
        counts[w.listing_id] = (counts[w.listing_id] ?? 0) + 1
      }
      setSavesByListing(counts)
    } else {
      setSavesByListing({})
    }
    setLoading(false)
  }, [vendorId])

  useEffect(() => {
    load()
  }, [load])

  const fromDate = useMemo(() => rangeFromDate(range), [range])
  const inRange = (iso: string): boolean => {
    if (!fromDate) return true
    return new Date(iso).getTime() >= fromDate.getTime()
  }

  const rows: ListingRow[] = useMemo(() => {
    return listings.map((listing) => {
      const lb = bookings.filter((b) => b.listing_id === listing.id && inRange(b.created_at))
      const charged = lb.filter((b) => CHARGED_STATUSES.includes(b.status))
      const revenue = charged.reduce((s, b) => s + (b.total_amount ?? 0), 0)
      const lr = reviews.filter((r) => r.listing_id === listing.id && r.status === 'approved')
      const avg =
        lr.length > 0
          ? lr.reduce((s, r) => s + (r.rating ?? 0), 0) / lr.length
          : null
      return {
        listing,
        bookings: lb.length,
        revenue,
        saves: savesByListing[listing.id] ?? 0,
        reviewCount: lr.length,
        avgRating: avg,
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listings, bookings, reviews, savesByListing, range])

  const totals = useMemo(() => {
    const tot = {
      bookings: 0,
      revenue: 0,
      saves: 0,
      reviews: 0,
      ratingSum: 0,
      ratingCount: 0,
    }
    for (const r of rows) {
      tot.bookings += r.bookings
      tot.revenue += r.revenue
      tot.saves += r.saves
      tot.reviews += r.reviewCount
      if (r.avgRating != null) {
        tot.ratingSum += r.avgRating * r.reviewCount
        tot.ratingCount += r.reviewCount
      }
    }
    return {
      bookings: tot.bookings,
      revenue: tot.revenue,
      saves: tot.saves,
      reviews: tot.reviews,
      avgRating: tot.ratingCount > 0 ? tot.ratingSum / tot.ratingCount : null,
    }
  }, [rows])

  const handlePrint = () => {
    window.print()
  }

  const handleExportCsv = () => {
    const header = ['listing_id', 'title', 'status', 'bookings', 'revenue_inr', 'saves', 'reviews', 'avg_rating']
    const lines = rows.map((r) =>
      [r.listing.id, r.listing.title, r.listing.status, r.bookings, r.revenue, r.saves, r.reviewCount, r.avgRating ?? '']
        .map(csvCell)
        .join(','),
    )
    const csv = [header.join(','), ...lines].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `vendor-performance-${range}-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const openDrawer = (l: Listing) => {
    setDrawerListing({
      id: l.id,
      title: l.title,
      categoryLabel: l.module.replace(/_/g, ' '),
      coverUrl: '',
      status:
        l.status === 'active'
          ? 'Active'
          : l.status === 'paused'
            ? 'Paused'
            : l.status === 'rejected'
              ? 'Rejected'
              : 'Draft',
      hasAddOns: false,
    })
  }

  return (
    <VendorAppShell activeNav="dashboard" routeSource="vendor-performance">
      <main className="flex-1 overflow-auto bg-slate-50">
        <div className="mx-auto w-full max-w-[1280px] px-5 md:px-8 lg:px-12 py-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="flex items-center gap-2 text-2xl font-semibold text-slate-900">
                <BarChart3 className="size-6" />
                Performance
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Per-listing KPIs across bookings, revenue, saves, and reviews. Click a row for the drill-down drawer.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 print:hidden">
              <div className="flex flex-wrap gap-1">
                {(Object.keys(RANGE_LABEL) as Range[]).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setRange(k)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      range === k
                        ? 'bg-[#2563eb] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {RANGE_LABEL[k]}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={handleExportCsv}
                disabled={rows.length === 0}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                <Download className="size-3.5" />
                CSV
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 rounded-md bg-[#2563eb] px-3 py-2 text-xs font-semibold text-white hover:bg-[#1d4ed8]"
              >
                <Printer className="size-3.5" />
                Print / PDF
              </button>
            </div>
          </div>

          {loadError && (
            <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {loadError}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="size-6 animate-spin text-slate-400" />
            </div>
          ) : (
            <>
              <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
                <Kpi icon={<CalendarCheck className="size-4 text-blue-600" />} label="Bookings" value={String(totals.bookings)} />
                <Kpi icon={<TrendingUp className="size-4 text-emerald-600" />} label="Revenue" value={fmtInr(totals.revenue)} />
                <Kpi
                  icon={<Star className="size-4 text-amber-500" />}
                  label="Avg rating"
                  value={totals.avgRating != null ? `${totals.avgRating.toFixed(1)} (${totals.reviews})` : '— (0)'}
                />
                <Kpi icon={<Heart className="size-4 text-rose-500" />} label="Saves" value={String(totals.saves)} />
              </div>

              <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-6 py-3">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                    Listings ({rows.length})
                  </h2>
                </div>
                {rows.length === 0 ? (
                  <p className="px-6 py-12 text-center text-sm text-slate-500">
                    No listings yet. Create one to start tracking performance.
                  </p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                        <th className="px-6 py-2.5 font-medium">Title</th>
                        <th className="px-6 py-2.5 font-medium">Status</th>
                        <th className="px-6 py-2.5 font-medium text-right">Bookings</th>
                        <th className="px-6 py-2.5 font-medium text-right">Revenue</th>
                        <th className="px-6 py-2.5 font-medium text-right">Saves</th>
                        <th className="px-6 py-2.5 font-medium text-right">Reviews</th>
                        <th className="px-6 py-2.5 font-medium text-right">Rating</th>
                        <th className="px-6 py-2.5 font-medium text-right print:hidden"> </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {rows.map((r) => (
                        <tr key={r.listing.id} className="hover:bg-slate-50/50">
                          <td className="px-6 py-3 font-medium text-slate-800">{r.listing.title}</td>
                          <td className="px-6 py-3 text-slate-600 capitalize">{r.listing.status.replace(/_/g, ' ')}</td>
                          <td className="px-6 py-3 text-right font-medium text-slate-900">{r.bookings}</td>
                          <td className="px-6 py-3 text-right font-medium text-slate-900">{fmtInr(r.revenue)}</td>
                          <td className="px-6 py-3 text-right text-slate-700">{r.saves}</td>
                          <td className="px-6 py-3 text-right text-slate-700">{r.reviewCount}</td>
                          <td className="px-6 py-3 text-right text-slate-700">
                            {r.avgRating != null ? r.avgRating.toFixed(1) : '—'}
                          </td>
                          <td className="px-6 py-3 text-right print:hidden">
                            <button
                              type="button"
                              onClick={() => openDrawer(r.listing)}
                              className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-200"
                            >
                              <Eye className="size-3" />
                              Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <p className="mt-4 text-[11px] text-slate-400 print:mt-2">
                Range: {RANGE_LABEL[range]} · Generated {new Date().toLocaleString('en-IN')}
              </p>
            </>
          )}
        </div>

        <VendorPerformanceStatsDrawer
          open={drawerListing !== null}
          onClose={() => setDrawerListing(null)}
          listing={drawerListing}
          onEditListing={(id) => navigate(`/vendor/products/${id}`)}
        />
      </main>
    </VendorAppShell>
  )
}

function Kpi({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        {icon}
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      </div>
      <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>
    </div>
  )
}
