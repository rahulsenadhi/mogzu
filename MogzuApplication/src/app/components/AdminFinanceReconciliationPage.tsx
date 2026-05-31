// Phase 4 Feature 2 — admin Stripe/Razorpay reconciliation.

import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, Loader2, ShieldAlert } from 'lucide-react'
import { AdminFinanceNavChips } from '@/app/components/admin/AdminFinanceNavChips'
import { AdminPageTitleRow } from '@/app/components/admin/AdminPageChrome'
import { MOGZU_GLASS_PANEL } from '@/app/components/ui/mogzuGlassStyles'
import {
  MOGZU_CHIP_ACTIVE_GRADIENT,
  MOGZU_MODULE_CONTAINER,
  MOGZU_NAV_SCROLLER,
  filterStatChipClass,
  moduleNavChipClass,
} from '@/app/components/ui/mogzuGiftingStyles'
import { useAuth } from '@/lib/auth'
import { corporateAccounts } from '@/lib/db'
import { listSubscriptions, type SubscriptionWithPlan } from '@/lib/subscriptions'

type CorpRow = { id: string; name: string }

type Flag = {
  key: string
  label: string
  severity: 'warn' | 'error'
}

function flagsFor(sub: SubscriptionWithPlan): Flag[] {
  const out: Flag[] = []
  if (sub.status === 'past_due') {
    out.push({ key: 'past_due', label: 'Past due', severity: 'error' })
  }
  if (sub.dunning_attempts > 0) {
    out.push({
      key: 'dunning',
      label: `${sub.dunning_attempts} dunning attempt${sub.dunning_attempts === 1 ? '' : 's'}`,
      severity: sub.dunning_attempts >= 3 ? 'error' : 'warn',
    })
  }
  if (!sub.stripe_subscription_id && !sub.razorpay_subscription_id) {
    out.push({ key: 'no_external', label: 'No external subscription id', severity: 'warn' })
  }
  if (sub.last_payment_error) {
    out.push({ key: 'pay_err', label: 'Last payment errored', severity: 'warn' })
  }
  return out
}

export default function AdminFinanceReconciliationPage() {
  const { role } = useAuth()
  const isAdmin = role === 'mogzu_admin' || role === 'account_manager'

  const [subs, setSubs] = useState<SubscriptionWithPlan[]>([])
  const [corps, setCorps] = useState<CorpRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'mismatch' | 'clean'>('all')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    const [{ data: s, error: e1 }, { data: c, error: e2 }] = await Promise.all([
      listSubscriptions(),
      corporateAccounts.list(),
    ])
    setSubs(s)
    setCorps(
      ((c ?? []) as { id: string; name: string }[]).map((row) => ({
        id: row.id,
        name: row.name,
      })),
    )
    if (e1 || e2?.message) setError(e1 || e2?.message || '')
    setLoading(false)
  }, [])

  useEffect(() => {
    if (isAdmin) void load()
  }, [isAdmin, load])

  const corpName = useMemo(() => {
    const m = new Map<string, string>()
    for (const c of corps) m.set(c.id, c.name)
    return m
  }, [corps])

  const rows = useMemo(() => {
    const annotated = subs.map((s) => ({ sub: s, flags: flagsFor(s) }))
    if (filter === 'mismatch') return annotated.filter((r) => r.flags.length > 0)
    if (filter === 'clean') return annotated.filter((r) => r.flags.length === 0)
    return annotated
  }, [subs, filter])

  const counts = useMemo(() => {
    let mismatch = 0
    let clean = 0
    for (const s of subs) {
      if (flagsFor(s).length > 0) mismatch += 1
      else clean += 1
    }
    return { mismatch, clean, total: subs.length }
  }, [subs])

  if (!isAdmin) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-12 text-center">
        <ShieldAlert className="mb-3 size-10 text-amber-500" />
        <p className="text-base font-semibold text-amber-800">Access restricted</p>
        <p className="mt-1 text-sm text-slate-500">Admin / account manager role required.</p>
      </div>
    )
  }

  return (
    <div className={`${MOGZU_MODULE_CONTAINER} mx-auto w-full space-y-5 py-2`}>
      <div className="rounded-2xl border border-white/60 bg-white/55 p-5 backdrop-blur-xl shadow-[0_16px_36px_rgba(37,99,235,0.12)]">
        <AdminPageTitleRow
          title="Finance reconciliation"
          totalLabel={loading ? 'Loading…' : `${counts.total} subscriptions`}
        />
        <p className="mt-1 text-[14px] text-[#64748b]">
          Cross-check Stripe and Razorpay mirrors against local subscription state.
        </p>
        <div className="mt-4 space-y-3">
          <AdminFinanceNavChips active="reconciliation" />
          <div className={MOGZU_NAV_SCROLLER}>
          {(
            [
              { id: 'all', label: 'All subscriptions', count: counts.total },
              { id: 'mismatch', label: 'Needs attention', count: counts.mismatch },
              { id: 'clean', label: 'Reconciled', count: counts.clean },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={moduleNavChipClass(filter === item.id)}
              style={filter === item.id ? MOGZU_CHIP_ACTIVE_GRADIENT : undefined}
            >
              {item.label}
              <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                {item.count}
              </span>
            </button>
          ))}
          </div>
        </div>
      </div>

      {error && (
        <p className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-2.5 text-sm text-rose-700">{error}</p>
      )}

      <section className="grid gap-3 sm:grid-cols-3">
        <button type="button" onClick={() => setFilter('all')} className={filterStatChipClass(filter === 'all', 'blue')}>
          <p className="text-xs uppercase tracking-wider text-slate-500">All</p>
          <p className="text-2xl font-bold text-[#0e1e3f]">{counts.total}</p>
        </button>
        <button type="button" onClick={() => setFilter('mismatch')} className={filterStatChipClass(filter === 'mismatch', 'rose')}>
          <p className="flex items-center gap-1 text-xs uppercase tracking-wider text-rose-700">
            <AlertTriangle className="size-3" /> Needs attention
          </p>
          <p className="text-2xl font-bold text-rose-700">{counts.mismatch}</p>
        </button>
        <button type="button" onClick={() => setFilter('clean')} className={filterStatChipClass(filter === 'clean', 'emerald')}>
          <p className="flex items-center gap-1 text-xs uppercase tracking-wider text-emerald-700">
            <CheckCircle2 className="size-3" /> Reconciled
          </p>
          <p className="text-2xl font-bold text-emerald-700">{counts.clean}</p>
        </button>
      </section>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-6 animate-spin text-slate-400" />
        </div>
      ) : (
        <section className={`${MOGZU_GLASS_PANEL} overflow-hidden`}>
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/60 bg-white/40 text-left text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                <th className="px-4 py-3">Corporate</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Stripe</th>
                <th className="px-4 py-3">Razorpay</th>
                <th className="px-4 py-3">Last attempt</th>
                <th className="px-4 py-3">Flags</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ sub, flags }) => (
                <tr key={sub.id} className="border-b border-slate-100/80 last:border-0 hover:bg-white/50">
                  <td className="px-4 py-3 font-semibold text-[#0e1e3f]">
                    {corpName.get(sub.corporate_id) ?? sub.corporate_id.slice(0, 8)}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">{sub.plan?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-xs capitalize text-slate-600">{sub.status}</td>
                  <td className="px-4 py-3 font-mono text-[11px] tabular-nums text-slate-500">
                    {sub.stripe_subscription_id ?? <span className="text-rose-400">—</span>}
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] tabular-nums text-slate-500">
                    {sub.razorpay_subscription_id ?? <span className="text-rose-400">—</span>}
                  </td>
                  <td className="px-4 py-3 text-xs tabular-nums text-slate-500">
                    {sub.last_payment_attempt_at
                      ? new Date(sub.last_payment_attempt_at).toISOString().slice(0, 10)
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {flags.length === 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-700">
                        <CheckCircle2 className="size-3" /> OK
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {flags.map((f) => (
                          <span
                            key={f.key}
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              f.severity === 'error'
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {f.label}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-xs text-slate-400">
                    Nothing matches the current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </section>
      )}
    </div>
  )
}
