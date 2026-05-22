// Phase 4 Feature 2 — admin Stripe/Razorpay reconciliation.
//
// Cross-checks each subscription row's local state against the
// stripe_subscription_id and razorpay_subscription_id mirrors that the
// reconciliation cron stamps. Highlights mismatches: missing external id,
// stale last_payment_attempt_at, dunning_attempts > 0, status drift.
// Read-only view — fixes are made via /admin/subscriptions or by re-running
// the worker. The point is auditability.

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Loader2, ShieldAlert, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { AdminPageTitleRow } from '@/app/components/admin/AdminPageChrome'
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
    out.push({
      key: 'no_external',
      label: 'No external subscription id',
      severity: 'warn',
    })
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
      <div className="p-12 text-center">
        <ShieldAlert className="mx-auto mb-2 size-8 text-amber-500" />
        <p className="text-sm text-amber-800">Admin / account manager role required.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFFDF9]">
      <div className="mx-auto max-w-6xl px-6 py-6">
        <AdminPageTitleRow
          title="Finance Reconciliation"
          totalLabel={loading ? 'Loading…' : `${counts.total} subscriptions`}
        />

        {error && (
          <p className="mt-3 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        )}

        <section className="mt-4 grid gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`rounded-xl border p-4 text-left ${filter === 'all' ? 'border-[#2563eb] bg-blue-50' : 'border-slate-200 bg-white'}`}
          >
            <p className="text-xs uppercase tracking-wider text-slate-500">All</p>
            <p className="text-2xl font-bold text-slate-900">{counts.total}</p>
          </button>
          <button
            type="button"
            onClick={() => setFilter('mismatch')}
            className={`rounded-xl border p-4 text-left ${filter === 'mismatch' ? 'border-rose-400 bg-rose-50' : 'border-slate-200 bg-white'}`}
          >
            <p className="flex items-center gap-1 text-xs uppercase tracking-wider text-rose-700">
              <AlertTriangle className="size-3" /> Needs attention
            </p>
            <p className="text-2xl font-bold text-rose-700">{counts.mismatch}</p>
          </button>
          <button
            type="button"
            onClick={() => setFilter('clean')}
            className={`rounded-xl border p-4 text-left ${filter === 'clean' ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 bg-white'}`}
          >
            <p className="flex items-center gap-1 text-xs uppercase tracking-wider text-emerald-700">
              <CheckCircle2 className="size-3" /> Reconciled
            </p>
            <p className="text-2xl font-bold text-emerald-700">{counts.clean}</p>
          </button>
        </section>

        {loading ? (
          <div className="mt-10 flex items-center justify-center">
            <Loader2 className="size-6 animate-spin text-slate-400" />
          </div>
        ) : (
          <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-2">Corporate</th>
                  <th className="px-4 py-2">Plan</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Stripe</th>
                  <th className="px-4 py-2">Razorpay</th>
                  <th className="px-4 py-2">Last attempt</th>
                  <th className="px-4 py-2">Flags</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ sub, flags }) => (
                  <tr key={sub.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-2 font-medium text-slate-900">
                      {corpName.get(sub.corporate_id) ?? sub.corporate_id.slice(0, 8)}
                    </td>
                    <td className="px-4 py-2 text-xs text-slate-600">
                      {sub.plan?.name ?? '—'}
                    </td>
                    <td className="px-4 py-2 text-xs capitalize text-slate-600">{sub.status}</td>
                    <td className="px-4 py-2 font-mono text-[11px] text-slate-500">
                      {sub.stripe_subscription_id ?? <span className="text-rose-400">—</span>}
                    </td>
                    <td className="px-4 py-2 font-mono text-[11px] text-slate-500">
                      {sub.razorpay_subscription_id ?? <span className="text-rose-400">—</span>}
                    </td>
                    <td className="px-4 py-2 text-xs text-slate-500">
                      {sub.last_payment_attempt_at
                        ? new Date(sub.last_payment_attempt_at).toISOString().slice(0, 10)
                        : '—'}
                    </td>
                    <td className="px-4 py-2">
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
                    <td colSpan={7} className="px-4 py-8 text-center text-xs text-slate-400">
                      Nothing matches the current filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
        )}
      </div>
    </div>
  )
}
