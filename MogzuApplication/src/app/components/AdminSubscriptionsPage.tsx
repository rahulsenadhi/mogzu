// Phase 4 Feature 2 — admin subscriptions index.
//
// Shows every corporate's current plan + seats + status. Mogzu admin
// can change plan / seats / status inline. Stripe sync happens later
// (Sprint 32); for now this is the source of truth.

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Loader2, ShieldAlert } from 'lucide-react'
import { AdminPageTitleRow } from '@/app/components/admin/AdminPageChrome'
import { useAuth } from '@/lib/auth'
import { corporateAccounts } from '@/lib/db'
import {
  changePlan,
  listPlans,
  listSubscriptions,
  setSeats,
  setSubscriptionStatus,
  upsertSubscription,
  type Plan,
  type SubscriptionStatus,
  type SubscriptionWithPlan,
} from '@/lib/subscriptions'

const STATUSES: SubscriptionStatus[] = [
  'trialing',
  'active',
  'past_due',
  'cancelled',
  'paused',
]

type CorpRow = { id: string; name: string }

export default function AdminSubscriptionsPage() {
  const { role } = useAuth()
  const isAdmin = role === 'mogzu_admin' || role === 'account_manager'

  const [plans, setPlans] = useState<Plan[]>([])
  const [subs, setSubs] = useState<SubscriptionWithPlan[]>([])
  const [corps, setCorps] = useState<CorpRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const [{ data: p, error: e1 }, { data: s, error: e2 }, { data: c, error: e3 }] =
      await Promise.all([listPlans(), listSubscriptions(), corporateAccounts.list()])
    setPlans(p)
    setSubs(s)
    setCorps(
      ((c ?? []) as { id: string; name: string }[]).map((row) => ({
        id: row.id,
        name: row.name,
      })),
    )
    if (e1 || e2 || e3?.message) setError(e1 || e2 || e3?.message || '')
    setLoading(false)
  }, [])

  useEffect(() => {
    if (isAdmin) load()
  }, [isAdmin, load])

  const corpName = useMemo(() => {
    const m = new Map<string, string>()
    for (const c of corps) m.set(c.id, c.name)
    return m
  }, [corps])

  const orphans = useMemo(() => {
    const subbed = new Set(subs.map((s) => s.corporate_id))
    return corps.filter((c) => !subbed.has(c.id))
  }, [corps, subs])

  const guard = async (id: string, fn: () => Promise<{ error: string | null }>) => {
    setBusy(id)
    setError('')
    const { error: err } = await fn()
    setBusy(null)
    if (err) setError(err)
    else load()
  }

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
          title="Subscriptions"
          totalLabel={loading ? 'Loading…' : `${subs.length} active`}
        />

        {error && (
          <p className="mt-3 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        )}

        {loading ? (
          <div className="mt-10 flex items-center justify-center">
            <Loader2 className="size-6 animate-spin text-slate-400" />
          </div>
        ) : (
          <>
            <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-2">Corporate</th>
                    <th className="px-4 py-2">Plan</th>
                    <th className="px-4 py-2 text-right">Seats</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Period</th>
                  </tr>
                </thead>
                <tbody>
                  {subs.map((s) => (
                    <tr key={s.id} className="border-b border-slate-100">
                      <td className="px-4 py-2 font-medium text-slate-900">
                        {corpName.get(s.corporate_id) ?? s.corporate_id.slice(0, 8)}
                      </td>
                      <td className="px-4 py-2">
                        <select
                          disabled={busy === s.id}
                          value={s.plan_id}
                          onChange={(e) => guard(s.id, () => changePlan(s.id, e.target.value))}
                          className="rounded-md border border-slate-200 px-2 py-1 text-xs"
                        >
                          {plans.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-2 text-right">
                        <input
                          type="number"
                          min={1}
                          disabled={busy === s.id}
                          defaultValue={s.seat_count}
                          onBlur={(e) => {
                            const n = parseInt(e.target.value, 10)
                            if (Number.isFinite(n) && n !== s.seat_count) {
                              guard(s.id, () => setSeats(s.id, n))
                            }
                          }}
                          className="w-20 rounded-md border border-slate-200 px-2 py-1 text-right text-xs"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <select
                          disabled={busy === s.id}
                          value={s.status}
                          onChange={(e) =>
                            guard(s.id, () =>
                              setSubscriptionStatus(s.id, e.target.value as SubscriptionStatus),
                            )
                          }
                          className="rounded-md border border-slate-200 px-2 py-1 text-xs"
                        >
                          {STATUSES.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-2 text-xs text-slate-500">
                        {s.current_period_starts_on} → {s.current_period_ends_on}
                      </td>
                    </tr>
                  ))}
                  {subs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-xs text-slate-400">
                        No subscriptions yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>

            {orphans.length > 0 && (
              <section className="mt-6">
                <h2 className="text-sm font-semibold text-slate-900">
                  Corporates without a subscription ({orphans.length})
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Seed them onto the Free plan to unblock the feature-flag checks downstream.
                </p>
                <ul className="mt-3 divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
                  {orphans.map((c) => (
                    <li key={c.id} className="flex items-center justify-between px-4 py-2">
                      <span className="text-sm font-medium text-slate-900">{c.name}</span>
                      <button
                        type="button"
                        disabled={busy === c.id}
                        onClick={() =>
                          guard(c.id, () =>
                            upsertSubscription({
                              corporate_id: c.id,
                              plan_id: 'free',
                              seat_count: 1,
                              status: 'trialing',
                            }),
                          )
                        }
                        className="rounded-md border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Start Free trial
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  )
}
