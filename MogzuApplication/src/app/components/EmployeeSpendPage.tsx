import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import {
  ArrowLeft,
  Loader2,
  ReceiptIndianRupee,
  ShieldAlert,
  TrendingUp,
} from 'lucide-react'
import { SharedHeader } from './layouts/SharedHeader'
import { SharedSidebar } from './layouts/SharedSidebar'
import { MogzuCorporateScrollSurface } from './layouts/MogzuCorporateScrollSurface'
import { useAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import { realtimeService } from '@/lib/realtime'
import type {
  Booking,
  BudgetRule,
  Listing,
  ModuleId,
  Vendor,
} from '@/lib/database.types'

type BookingRow = Booking & {
  listings: Listing | null
  vendors: Vendor | null
}

const MODULE_LABEL: Record<ModuleId, string> = {
  events: 'Events',
  gifting: 'Gifting',
  spacex_coworking: 'Coworking',
  spacex_stay: 'Stay',
}

const MODULE_TINT: Record<ModuleId, string> = {
  events: 'bg-blue-100 text-blue-700',
  gifting: 'bg-rose-100 text-rose-700',
  spacex_coworking: 'bg-emerald-100 text-emerald-700',
  spacex_stay: 'bg-amber-100 text-amber-700',
}

const CHARGED_STATUSES: Booking['status'][] = [
  'pending_approval',
  'pending_vendor',
  'confirmed',
  'completed',
]

function periodStart(period: 'monthly' | 'quarterly' | 'annual'): Date {
  const now = new Date()
  if (period === 'monthly') return new Date(now.getFullYear(), now.getMonth(), 1)
  if (period === 'quarterly') {
    const q = Math.floor(now.getMonth() / 3) * 3
    return new Date(now.getFullYear(), q, 1)
  }
  return new Date(now.getFullYear(), 0, 1)
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  })
}

export default function EmployeeSpendPage() {
  const navigate = useNavigate()
  const { profile, corporateId } = useAuth()

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [bookings, setBookings] = useState<BookingRow[]>([])
  const [budgets, setBudgets] = useState<BudgetRule[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const load = useCallback(async () => {
    if (!profile || !corporateId) return
    setLoading(true)
    setLoadError('')
    const [bRes, budRes] = await Promise.all([
      db.bookings.listByUser(profile.id),
      db.budgets.listByCorporate(corporateId),
    ])
    if (bRes.error) setLoadError(bRes.error.message)
    else setBookings((bRes.data ?? []) as BookingRow[])
    setBudgets((budRes.data ?? []) as BudgetRule[])
    setLoading(false)
  }, [profile, corporateId])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (!corporateId) return
    return realtimeService.watchCorporateBookings<Booking>(corporateId, () => load())
  }, [corporateId, load])

  // Pick the most relevant budget rule for this user.
  const myBudget = useMemo(() => {
    if (!profile) return null
    const individual = budgets.find(
      (b) => b.scope === 'individual' && b.scope_value === profile.id,
    )
    if (individual) return individual
    const dept = budgets.find(
      (b) =>
        b.scope === 'department' &&
        profile.department &&
        b.scope_value === profile.department,
    )
    if (dept) return dept
    return budgets.find((b) => b.scope === 'company') ?? null
  }, [budgets, profile])

  // Bookings inside the active budget period.
  const periodStartDate = useMemo(
    () => (myBudget ? periodStart(myBudget.period) : periodStart('annual')),
    [myBudget],
  )

  const inPeriod = useMemo(
    () =>
      bookings.filter(
        (b) =>
          CHARGED_STATUSES.includes(b.status) &&
          new Date(b.created_at) >= periodStartDate,
      ),
    [bookings, periodStartDate],
  )

  const totalSpend = inPeriod.reduce((s, b) => s + (b.total_amount ?? 0), 0)

  const byModule = useMemo(() => {
    const map = new Map<ModuleId, number>()
    inPeriod.forEach((b) => {
      map.set(b.module, (map.get(b.module) ?? 0) + (b.total_amount ?? 0))
    })
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1])
  }, [inPeriod])

  const recent = bookings.slice(0, 5)

  const allowance = myBudget?.amount ?? 0
  const usedPct = allowance > 0 ? Math.min(100, Math.round((totalSpend / allowance) * 100)) : 0
  const remaining = Math.max(0, allowance - totalSpend)
  const alertActive =
    myBudget && allowance > 0 && usedPct >= myBudget.alert_threshold_pct

  if (!profile || !corporateId) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FFFDF9]">
        <div className="max-w-md rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
          <ShieldAlert className="mx-auto mb-2 size-8 text-amber-600" />
          <p className="text-sm text-amber-800">Corporate account required.</p>
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
          <div className="mx-auto max-w-4xl px-8">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800"
            >
              <ArrowLeft className="size-4" />
              Back
            </button>

            <div className="mb-6">
              <h1 className="flex items-center gap-2 text-2xl font-bold text-[#0e1e3f]">
                <TrendingUp className="size-5" />
                My spend
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {myBudget
                  ? `Year-to-${myBudget.period === 'monthly' ? 'month' : myBudget.period === 'quarterly' ? 'quarter' : 'date'} spend against your ${myBudget.scope} budget.`
                  : 'No budget rules set yet. Spend totals still tracked from your bookings.'}
              </p>
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
              <div className="space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                      {myBudget
                        ? `${myBudget.period[0].toUpperCase()}${myBudget.period.slice(1)} allowance`
                        : 'Spend (no budget set)'}
                    </h2>
                    {myBudget && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          alertActive ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {usedPct}% used
                        {alertActive
                          ? ` — past ${myBudget.alert_threshold_pct}% threshold`
                          : ''}
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex items-baseline gap-3">
                    <p className="text-3xl font-black text-[#0e1e3f]">
                      ₹ {totalSpend.toLocaleString('en-IN')}
                    </p>
                    {myBudget && (
                      <p className="text-sm text-slate-500">
                        / ₹ {allowance.toLocaleString('en-IN')}
                      </p>
                    )}
                  </div>
                  {myBudget && (
                    <>
                      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full ${
                            alertActive ? 'bg-rose-500' : 'bg-[#2563eb]'
                          }`}
                          style={{ width: `${usedPct}%` }}
                        />
                      </div>
                      <p className="mt-2 text-xs text-slate-500">
                        Remaining ₹ {remaining.toLocaleString('en-IN')} · Period from{' '}
                        {formatDate(periodStartDate.toISOString())}
                      </p>
                    </>
                  )}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                    By module
                  </h2>
                  {byModule.length === 0 ? (
                    <p className="text-sm text-slate-500">No bookings this period.</p>
                  ) : (
                    <ul className="space-y-3">
                      {byModule.map(([m, amt]) => {
                        const pct = totalSpend > 0 ? (amt / totalSpend) * 100 : 0
                        return (
                          <li key={m}>
                            <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                              <span
                                className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${MODULE_TINT[m]}`}
                              >
                                {MODULE_LABEL[m]}
                              </span>
                              <span className="font-medium">
                                ₹ {amt.toLocaleString('en-IN')}
                              </span>
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

                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-100 p-5">
                    <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                      <ReceiptIndianRupee className="size-4" />
                      Last 5 transactions
                    </h2>
                  </div>
                  {recent.length === 0 ? (
                    <p className="p-6 text-center text-sm text-slate-500">
                      No bookings yet.
                    </p>
                  ) : (
                    <ul className="divide-y divide-slate-100">
                      {recent.map((b) => (
                        <li
                          key={b.id}
                          className="flex items-center justify-between gap-3 px-5 py-3"
                        >
                          <div className="min-w-0">
                            <p className="truncate font-medium text-slate-900">
                              {b.listings?.title ?? '—'}
                            </p>
                            <p className="text-xs text-slate-500">
                              {b.vendors?.business_name ?? '—'} ·{' '}
                              {formatDate(b.created_at)} ·{' '}
                              <span
                                className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${MODULE_TINT[b.module]}`}
                              >
                                {MODULE_LABEL[b.module]}
                              </span>
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-slate-900">
                              ₹ {(b.total_amount ?? 0).toLocaleString('en-IN')}
                            </p>
                            <p className="text-[11px] text-slate-500">{b.status}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>
        </MogzuCorporateScrollSurface>
      </div>
    </div>
  )
}
