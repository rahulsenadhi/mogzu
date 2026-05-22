// Phase 4 Feature 2 — corporate self-serve billing at /account/billing.
//
// Shows current plan + seats + dunning state. Lets the corp upgrade their
// plan (changePlan) and adjust seat count. No payment collection happens
// here — the Stripe/Razorpay flow runs server-side off the row update
// (reconciliation cron). For the first cut the user sees: current plan,
// upgrade options, dunning preview when past_due, seat editor.

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { Loader2, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import {
  changePlan,
  getSubscriptionByCorporate,
  listPlans,
  setSeats,
  type Plan,
  type SubscriptionWithPlan,
} from '@/lib/subscriptions'

const DUNNING_RETRIES = 4
const DUNNING_WINDOW_DAYS = 14

function formatINR(n: number): string {
  return `₹${Math.round(n).toLocaleString('en-IN')}`
}

function planSummary(plan: Plan, seatCount: number): string {
  const monthly = plan.monthly_per_seat * seatCount
  return `${formatINR(monthly)}/mo · ${seatCount} seat${seatCount === 1 ? '' : 's'}`
}

export default function AccountBillingPage() {
  const navigate = useNavigate()
  const { corporateId } = useAuth()

  const [plans, setPlansState] = useState<Plan[]>([])
  const [sub, setSub] = useState<SubscriptionWithPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [seatDraft, setSeatDraft] = useState<number>(1)

  const load = useCallback(async () => {
    if (!corporateId) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError('')
    const [{ data: p, error: e1 }, { data: s, error: e2 }] = await Promise.all([
      listPlans(),
      getSubscriptionByCorporate(corporateId),
    ])
    setPlansState(p)
    setSub(s)
    if (s) setSeatDraft(s.seat_count)
    if (e1 || e2) setError(e1 || e2 || '')
    setLoading(false)
  }, [corporateId])

  useEffect(() => {
    void load()
  }, [load])

  const currentPlanId = sub?.plan_id ?? null

  const upgrade = useCallback(
    async (planId: string) => {
      if (!sub) return
      setBusy(true)
      setError('')
      const { error: err } = await changePlan(sub.id, planId)
      setBusy(false)
      if (err) setError(err)
      else void load()
    },
    [sub, load],
  )

  const saveSeats = useCallback(async () => {
    if (!sub) return
    if (seatDraft === sub.seat_count) return
    setBusy(true)
    setError('')
    const { error: err } = await setSeats(sub.id, seatDraft)
    setBusy(false)
    if (err) setError(err)
    else void load()
  }, [sub, seatDraft, load])

  const dunning = useMemo(() => {
    if (!sub) return null
    if (sub.status === 'active' || sub.status === 'trialing') return null
    if (sub.dunning_attempts === 0 && sub.status !== 'past_due') return null
    return {
      attempts: sub.dunning_attempts,
      lastError: sub.last_payment_error,
      lastAttemptAt: sub.last_payment_attempt_at,
      retriesLeft: Math.max(0, DUNNING_RETRIES - sub.dunning_attempts),
    }
  }, [sub])

  if (!corporateId) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-8 font-['Montserrat']">
        <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-sm text-slate-600">No corporate account associated with this profile.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-8 font-['Montserrat']">
      <div className="mx-auto max-w-5xl">
        <button
          onClick={() => navigate('/dashboard')}
          className="mb-6 flex items-center gap-2 font-medium text-[#2563eb] hover:underline"
        >
          &larr; Back to Dashboard
        </button>

        <div className="mb-6 rounded-2xl border border-[#ececec] bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h1 className="mb-1 text-3xl font-bold text-[#0e1e3f]">Billing & Plan</h1>
              <p className="font-['Inter'] text-slate-600">
                Manage your subscription, seat count, and view invoices.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/account/invoices')}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              View invoices <ChevronRight className="size-4" />
            </button>
          </div>

          {error && (
            <p className="mb-4 flex items-center gap-2 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              <AlertCircle className="size-4" />
              {error}
            </p>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="size-6 animate-spin text-slate-400" />
            </div>
          ) : !sub ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
              <p className="text-sm text-slate-500">
                You are not on a subscription yet. Contact sales to get started.
              </p>
            </div>
          ) : (
            <>
              {dunning && (
                <section className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-5">
                  <div className="mb-2 flex items-center gap-2">
                    <AlertCircle className="size-5 text-rose-600" />
                    <h2 className="text-base font-bold text-rose-900">
                      Payment failed — please update your method
                    </h2>
                  </div>
                  <p className="mb-3 text-sm text-rose-800">
                    Attempt {dunning.attempts} of {DUNNING_RETRIES}. Auto-retries continue for{' '}
                    {DUNNING_WINDOW_DAYS} days; after that your plan will downgrade to Free
                    automatically.
                  </p>
                  {dunning.lastError && (
                    <p className="mb-3 rounded-md border border-rose-100 bg-white px-3 py-2 text-xs text-rose-700">
                      Last error: {dunning.lastError}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-3">
                    {Array.from({ length: DUNNING_RETRIES }).map((_, i) => (
                      <span
                        key={i}
                        className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                          i < dunning.attempts
                            ? 'bg-rose-600 text-white'
                            : 'bg-white text-rose-600 border border-rose-200'
                        }`}
                      >
                        Retry {i + 1}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              <section className="mb-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wider text-slate-500">Current plan</p>
                  <p className="mt-1 text-xl font-bold text-[#0e1e3f]">
                    {sub.plan?.name ?? '—'}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {sub.plan ? planSummary(sub.plan, sub.seat_count) : ''}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wider text-slate-500">Status</p>
                  <p className="mt-1 text-xl font-bold capitalize text-[#0e1e3f]">{sub.status}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Period {sub.current_period_starts_on} → {sub.current_period_ends_on}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wider text-slate-500">Seats</p>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      value={seatDraft}
                      onChange={(e) => {
                        const n = parseInt(e.target.value, 10)
                        if (Number.isFinite(n)) setSeatDraft(n)
                      }}
                      className="w-20 rounded-md border border-slate-200 px-2 py-1 text-right text-lg font-bold"
                    />
                    <button
                      type="button"
                      disabled={busy || seatDraft === sub.seat_count}
                      onClick={() => void saveSeats()}
                      className="rounded-md bg-[#2563eb] px-3 py-1 text-xs font-semibold text-white disabled:opacity-40"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="mb-3 text-lg font-bold text-[#0e1e3f]">Upgrade plan</h2>
                <div className="grid gap-4 sm:grid-cols-3">
                  {plans.map((p) => {
                    const isCurrent = p.id === currentPlanId
                    const monthly = p.monthly_per_seat * (sub?.seat_count ?? 1)
                    return (
                      <div
                        key={p.id}
                        className={`rounded-xl border p-5 ${
                          isCurrent
                            ? 'border-[#2563eb] bg-blue-50'
                            : 'border-slate-200 bg-white'
                        }`}
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <h3 className="text-lg font-bold text-[#0e1e3f]">{p.name}</h3>
                          {isCurrent && (
                            <span className="rounded-full bg-[#2563eb] px-2 py-0.5 text-[10px] font-semibold text-white">
                              CURRENT
                            </span>
                          )}
                        </div>
                        <p className="mb-2 text-2xl font-bold text-[#0e1e3f]">
                          {formatINR(monthly)}
                          <span className="text-xs font-normal text-slate-500">/mo</span>
                        </p>
                        <ul className="mb-4 space-y-1 text-xs text-slate-600">
                          {p.feature_flags?.sso_enabled && (
                            <li className="flex items-center gap-1">
                              <CheckCircle2 className="size-3 text-emerald-500" /> SSO
                            </li>
                          )}
                          {p.feature_flags?.custom_contracts && (
                            <li className="flex items-center gap-1">
                              <CheckCircle2 className="size-3 text-emerald-500" /> Custom contracts
                            </li>
                          )}
                          {p.feature_flags?.audit_export && (
                            <li className="flex items-center gap-1">
                              <CheckCircle2 className="size-3 text-emerald-500" /> Audit export
                            </li>
                          )}
                          {(p.feature_flags?.ai_agents_count ?? 0) > 0 && (
                            <li className="flex items-center gap-1">
                              <CheckCircle2 className="size-3 text-emerald-500" />{' '}
                              {p.feature_flags.ai_agents_count} AI agent
                              {p.feature_flags.ai_agents_count === 1 ? '' : 's'}
                            </li>
                          )}
                        </ul>
                        <button
                          type="button"
                          disabled={busy || isCurrent}
                          onClick={() => void upgrade(p.id)}
                          className="w-full rounded-lg bg-[#2563eb] py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {isCurrent ? 'Active' : 'Switch to ' + p.name}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
