import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2,
  PauseCircle,
  ShieldAlert,
  XCircle,
} from 'lucide-react'
import { VendorAppShell } from './layouts/VendorAppShell'
import { useAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import type { Payout, PayoutStatus } from '@/lib/database.types'

type PayoutRow = Payout & {
  bookings: {
    listings: { title: string | null } | null
    corporate_accounts: { name: string | null } | null
  } | null
}

const STATUS_META: Record<
  PayoutStatus,
  { label: string; className: string; Icon: typeof Clock }
> = {
  scheduled: { label: 'Upcoming', className: 'bg-amber-100 text-amber-800', Icon: Clock },
  processed: {
    label: 'Processed',
    className: 'bg-emerald-100 text-emerald-700',
    Icon: CheckCircle2,
  },
  held: { label: 'Held', className: 'bg-blue-100 text-blue-700', Icon: PauseCircle },
  failed: { label: 'Failed', className: 'bg-rose-100 text-rose-700', Icon: XCircle },
}

type TabKey = 'upcoming' | 'processed' | 'held'

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function tabFilter(tab: TabKey): PayoutStatus[] {
  if (tab === 'upcoming') return ['scheduled']
  if (tab === 'processed') return ['processed']
  return ['held', 'failed']
}

export default function VendorPayoutsPage() {
  const { vendorId, profile } = useAuth()
  const [payouts, setPayouts] = useState<PayoutRow[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [tab, setTab] = useState<TabKey>('upcoming')

  const load = useCallback(async () => {
    if (!vendorId) return
    setLoading(true)
    setLoadError('')
    const { data, error } = await db.payouts.listByVendor(vendorId)
    if (error) setLoadError(error.message)
    else setPayouts((data ?? []) as PayoutRow[])
    setLoading(false)
  }, [vendorId])

  useEffect(() => {
    load()
  }, [load])

  const byTab = useMemo(() => {
    return {
      upcoming: payouts.filter((p) => tabFilter('upcoming').includes(p.status)),
      processed: payouts.filter((p) => tabFilter('processed').includes(p.status)),
      held: payouts.filter((p) => tabFilter('held').includes(p.status)),
    }
  }, [payouts])

  const filtered = byTab[tab]

  const totals = useMemo(() => {
    const sum = (rows: PayoutRow[]) => rows.reduce((acc, r) => acc + r.net_amount, 0)
    return {
      upcoming: sum(byTab.upcoming),
      processed: sum(byTab.processed),
      held: sum(byTab.held),
    }
  }, [byTab])

  if (!vendorId) {
    return (
      <VendorAppShell activeNav="orders" routeSource="vendor-payouts">
        <main className="flex min-h-full items-center justify-center bg-transparent p-6">
          <div className="max-w-md rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
            <ShieldAlert className="mx-auto mb-2 size-8 text-amber-600" />
            <p className="text-sm text-amber-800">Vendor account required to view payouts.</p>
          </div>
        </main>
      </VendorAppShell>
    )
  }

  return (
    <VendorAppShell activeNav="orders" routeSource="vendor-payouts">
      <main className="min-h-full w-full bg-transparent">
        <section className="mx-auto w-full max-w-[1280px] px-5 md:px-8 lg:px-12 py-6">
          <div className="mb-4">
            <h1 className="text-2xl font-semibold text-slate-900">Payouts</h1>
            <p className="text-sm text-slate-500">
              Earnings transfer to your verified bank account 48 hours after each completed
              booking. Net = booking total − platform commission at the rate snapshotted on the
              booking.
            </p>
          </div>

          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Stat
              label="Upcoming (48h queue)"
              value={`₹ ${totals.upcoming.toLocaleString('en-IN')}`}
              count={byTab.upcoming.length}
            />
            <Stat
              label="Processed lifetime"
              value={`₹ ${totals.processed.toLocaleString('en-IN')}`}
              count={byTab.processed.length}
            />
            <Stat
              label="Held / Failed"
              value={`₹ ${totals.held.toLocaleString('en-IN')}`}
              count={byTab.held.length}
            />
          </div>

          <div className="mb-3 flex gap-2 border-b border-slate-200">
            {(['upcoming', 'processed', 'held'] as TabKey[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition ${
                  tab === t
                    ? 'border-[#2563EB] text-[#2563EB]'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {t === 'upcoming'
                  ? `Upcoming (${byTab.upcoming.length})`
                  : t === 'processed'
                    ? `Processed (${byTab.processed.length})`
                    : `Held / Failed (${byTab.held.length})`}
              </button>
            ))}
          </div>

          {profile && !profile.vendor_id && (
            <div className="mb-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <span>
                Bank account not verified yet. Upcoming payouts will be held until verification
                completes.
              </span>
            </div>
          )}

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
                No {tab} payouts.
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Booking</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Gross</th>
                    <th className="px-4 py-3">Commission</th>
                    <th className="px-4 py-3">Net</th>
                    <th className="px-4 py-3">Scheduled</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((p) => {
                    const meta = STATUS_META[p.status]
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-medium text-slate-900">
                          {p.bookings?.listings?.title ?? '—'}
                          <p className="text-[11px] font-mono text-slate-500">
                            {p.booking_id.slice(0, 8)}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {p.bookings?.corporate_accounts?.name ?? '—'}
                        </td>
                        <td className="px-4 py-3">
                          ₹ {p.gross_amount.toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3 text-rose-700">
                          − ₹ {p.commission_amount.toLocaleString('en-IN')}
                          {p.commission_rate != null && (
                            <span className="ml-1 text-[11px] text-slate-500">
                              ({(p.commission_rate * 100).toFixed(1)}%)
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-semibold text-emerald-700">
                          ₹ {p.net_amount.toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {formatDate(p.scheduled_for)}
                          {p.status === 'processed' && p.processed_at && (
                            <p className="text-[11px] text-emerald-700">
                              Sent {formatDate(p.processed_at)}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${meta.className}`}
                          >
                            <meta.Icon className="size-3" />
                            {meta.label}
                          </span>
                          {p.hold_reason && (
                            <p
                              className="mt-1 max-w-[180px] truncate text-[11px] text-slate-500"
                              title={p.hold_reason}
                            >
                              {p.hold_reason}
                            </p>
                          )}
                          {p.failure_reason && (
                            <p
                              className="mt-1 max-w-[180px] truncate text-[11px] text-rose-600"
                              title={p.failure_reason}
                            >
                              {p.failure_reason}
                            </p>
                          )}
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

function Stat({
  label,
  value,
  count,
}: {
  label: string
  value: string
  count: number
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>
      <p className="mt-0.5 text-[11px] text-slate-500">
        {count} booking{count !== 1 ? 's' : ''}
      </p>
    </div>
  )
}
