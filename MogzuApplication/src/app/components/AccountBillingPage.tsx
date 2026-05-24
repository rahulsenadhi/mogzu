// Phase 4 Feature 2 — corporate self-serve billing at /account/billing.

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { AlertCircle, CheckCircle2, CreditCard, Loader2, Receipt, Sparkles } from 'lucide-react'
import { CorporateModuleShell } from '@/app/components/layouts/CorporateModuleShell'
import { MOGZU_GLASS_PANEL } from '@/app/components/ui/mogzuGlassStyles'
import {
  MOGZU_CTA_GRADIENT,
  MOGZU_HERO_BANNER,
  MOGZU_PRODUCT_CARD,
} from '@/app/components/ui/mogzuGiftingStyles'
import { useAuth } from '@/lib/auth'
import { useCurrency } from '@/lib/i18n/useCurrency'
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

const DEMO_PLANS: Plan[] = [
  {
    id: 'demo-free', name: 'Free', tier: 'free', monthly_per_seat: 0, annual_per_seat: null, currency: 'INR',
    feature_flags: { sso_enabled: false, ai_agents_count: 0, custom_contracts: false, audit_export: false },
    is_active: true, display_order: 1, created_at: new Date().toISOString(),
  },
  {
    id: 'demo-growth', name: 'Growth', tier: 'growth', monthly_per_seat: 999, annual_per_seat: 9990, currency: 'INR',
    feature_flags: { sso_enabled: false, ai_agents_count: 1, custom_contracts: false, audit_export: true },
    is_active: true, display_order: 2, created_at: new Date().toISOString(),
  },
  {
    id: 'demo-enterprise', name: 'Enterprise', tier: 'enterprise', monthly_per_seat: 2499, annual_per_seat: 24990, currency: 'INR',
    feature_flags: { sso_enabled: true, ai_agents_count: 5, custom_contracts: true, audit_export: true },
    is_active: true, display_order: 3, created_at: new Date().toISOString(),
  },
]

const DEMO_SUB: SubscriptionWithPlan = {
  id: 'demo-sub-1',
  corporate_id: 'demo-corp',
  plan_id: 'demo-growth',
  status: 'active',
  seat_count: 25,
  current_period_starts_on: '2026-05-01',
  current_period_ends_on: '2026-06-01',
  stripe_customer_id: null,
  stripe_subscription_id: 'sub_demo_stripe',
  razorpay_subscription_id: null,
  dunning_attempts: 0,
  last_payment_attempt_at: null,
  last_payment_error: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  plan: DEMO_PLANS[1],
}

export default function AccountBillingPage() {
  const navigate = useNavigate()
  const { corporateId } = useAuth()
  const { formatCurrency } = useCurrency()

  const [plans, setPlansState] = useState<Plan[]>([])
  const [sub, setSub] = useState<SubscriptionWithPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [seatDraft, setSeatDraft] = useState<number>(1)
  const [isDemo, setIsDemo] = useState(false)

  const load = useCallback(async () => {
    if (!corporateId) {
      setPlansState(DEMO_PLANS)
      setSub(DEMO_SUB)
      setSeatDraft(DEMO_SUB.seat_count)
      setIsDemo(true)
      setLoading(false)
      return
    }
    setLoading(true)
    setError('')
    const [{ data: p, error: e1 }, { data: s, error: e2 }] = await Promise.all([
      listPlans(),
      getSubscriptionByCorporate(corporateId),
    ])
    if ((!p.length || !s) && !e1 && !e2) {
      setPlansState(DEMO_PLANS)
      setSub(DEMO_SUB)
      setSeatDraft(DEMO_SUB.seat_count)
      setIsDemo(true)
    } else {
      setPlansState(p.length ? p : DEMO_PLANS)
      setSub(s)
      if (s) setSeatDraft(s.seat_count)
      setIsDemo(!s)
    }
    if (e1 || e2) setError(e1 || e2 || '')
    setLoading(false)
  }, [corporateId])

  useEffect(() => {
    void load()
  }, [load])

  const currentPlanId = sub?.plan_id ?? null

  const upgrade = useCallback(
    async (planId: string) => {
      if (!sub || isDemo) return
      setBusy(true)
      setError('')
      const { error: err } = await changePlan(sub.id, planId)
      setBusy(false)
      if (err) setError(err)
      else void load()
    },
    [sub, isDemo, load],
  )

  const saveSeats = useCallback(async () => {
    if (!sub || isDemo) return
    if (seatDraft === sub.seat_count) return
    setBusy(true)
    setError('')
    const { error: err } = await setSeats(sub.id, seatDraft)
    setBusy(false)
    if (err) setError(err)
    else void load()
  }, [sub, seatDraft, isDemo, load])

  const dunning = useMemo(() => {
    if (!sub) return null
    if (sub.status === 'active' || sub.status === 'trialing') return null
    if (sub.dunning_attempts === 0 && sub.status !== 'past_due') return null
    return {
      attempts: sub.dunning_attempts,
      lastError: sub.last_payment_error,
      retriesLeft: Math.max(0, DUNNING_RETRIES - sub.dunning_attempts),
    }
  }, [sub])

  const accountNav = [
    { id: 'invoices', label: 'Invoices', icon: <Receipt className="size-4 text-[#2563eb]" />, active: false, onClick: () => navigate('/account/invoices') },
    { id: 'billing', label: 'Billing & Plan', icon: <CreditCard className="size-4 text-[#4f46e5]" />, active: true, onClick: () => navigate('/account/billing') },
  ]

  return (
    <CorporateModuleShell
      title="Billing & Plan"
      subtitle={
        isDemo
          ? 'Manage subscription, seats, and payment retries · demo data'
          : 'Manage your subscription, seat count, and view invoices.'
      }
      breadcrumbs={[
        { label: 'Dashboard', onClick: () => navigate('/dashboard') },
        { label: 'Account' },
        { label: 'Billing & Plan' },
      ]}
      navChips={accountNav}
      searchPlaceholder="Search billing"
    >
      <div className={MOGZU_HERO_BANNER}>
        <div className="absolute inset-0 bg-[linear-gradient(120deg,#ebf1ff_0%,#f5f8ff_45%,#e9efff_100%)]" />
        <div className="relative flex h-full flex-col justify-center px-8">
          <span className="mb-2 inline-flex w-fit items-center gap-1.5 rounded-full bg-[#ebf1ff] px-2.5 py-1 text-[12px] font-medium text-[#475569]">
            <Sparkles className="size-3.5 text-[#2563eb]" />
            SaaS subscription
          </span>
          <h2 className="text-[24px] font-bold leading-tight text-[#0e1e3f]">
            {sub?.plan?.name ?? 'Your plan'}
          </h2>
          <p className="mt-1 text-[14px] text-[#64748b]">
            {sub
              ? `${sub.seat_count} seat${sub.seat_count === 1 ? '' : 's'} · ${sub.status.replace('_', ' ')}`
              : 'Choose a plan to unlock enterprise features.'}
          </p>
          <button
            type="button"
            onClick={() => navigate('/account/invoices')}
            className="mt-4 h-11 w-fit rounded-full border border-white/60 bg-white/70 px-6 text-[14px] font-semibold text-[#0e1e3f] shadow-sm transition-all hover:-translate-y-0.5"
          >
            View invoices
          </button>
        </div>
      </div>

      {error && (
        <p className="mb-4 flex items-center gap-2 rounded-xl border border-rose-100 bg-rose-50/80 px-4 py-2.5 text-sm text-rose-700">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-6 animate-spin text-slate-400" />
        </div>
      ) : !sub ? (
        <div className={`${MOGZU_GLASS_PANEL} p-8 text-center text-sm text-slate-500`}>
          You are not on a subscription yet. Contact sales to get started.
        </div>
      ) : (
        <>
          {dunning && (
            <section className="mb-6 rounded-2xl border border-rose-200/80 bg-[linear-gradient(90deg,rgba(254,226,226,0.9),rgba(255,255,255,0.85))] p-5 shadow-[0_10px_24px_rgba(244,63,94,0.12)]">
              <div className="mb-2 flex items-center gap-2">
                <AlertCircle className="size-5 text-rose-600" />
                <h2 className="text-base font-bold text-rose-900">Payment failed — update your method</h2>
              </div>
              <p className="mb-3 text-sm text-rose-800">
                Attempt {dunning.attempts} of {DUNNING_RETRIES}. Auto-retries continue for {DUNNING_WINDOW_DAYS} days;
                after that your plan downgrades to Free.
              </p>
              {dunning.lastError && (
                <p className="mb-3 rounded-xl border border-rose-100 bg-white/80 px-3 py-2 text-xs text-rose-700">
                  Last error: {dunning.lastError}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: DUNNING_RETRIES }).map((_, i) => (
                  <span
                    key={i}
                    className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                      i < dunning.attempts
                        ? 'bg-rose-600 text-white'
                        : 'border border-rose-200 bg-white text-rose-600'
                    }`}
                  >
                    Retry {i + 1}
                  </span>
                ))}
              </div>
            </section>
          )}

          <section className="mb-8 grid gap-4 sm:grid-cols-3">
            {[
              { label: 'Current plan', value: sub.plan?.name ?? '—', meta: sub.plan ? `${formatCurrency(sub.plan.monthly_per_seat * sub.seat_count)}/mo` : '' },
              { label: 'Status', value: sub.status.replace('_', ' '), meta: `${sub.current_period_starts_on} → ${sub.current_period_ends_on}` },
              { label: 'Seats', value: String(seatDraft), meta: 'Adjust team size' },
            ].map((stat) => (
              <div key={stat.label} className={`${MOGZU_PRODUCT_CARD} p-4`}>
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#64748b]">{stat.label}</p>
                <p className="mt-1 text-[22px] font-extrabold tracking-tight text-[#0e1e3f]">{stat.value}</p>
                <p className="mt-1 text-xs text-[#878e9e]">{stat.meta}</p>
              </div>
            ))}
          </section>

          <div className="mb-8 flex flex-wrap items-end gap-3 rounded-2xl border border-white/60 bg-white/55 p-4 backdrop-blur-xl">
            <label className="text-sm font-medium text-[#0e1e3f]" htmlFor="seat-count">
              Seat count
            </label>
            <input
              id="seat-count"
              type="number"
              min={1}
              value={seatDraft}
              onChange={(e) => {
                const n = parseInt(e.target.value, 10)
                if (Number.isFinite(n)) setSeatDraft(n)
              }}
              className="h-10 w-24 rounded-xl border border-[#e5e7eb] bg-white px-3 text-right text-lg font-bold text-[#0e1e3f] focus:outline-none focus:ring-2 focus:ring-[#4379ee]/20"
            />
            <button
              type="button"
              disabled={busy || seatDraft === sub.seat_count || isDemo}
              onClick={() => void saveSeats()}
              className={`${MOGZU_CTA_GRADIENT} disabled:cursor-not-allowed disabled:opacity-40`}
            >
              Save seats
            </button>
            {isDemo && <p className="text-xs italic text-slate-400">Demo mode — changes are read-only.</p>}
          </div>

          <section>
            <h2 className="mb-3 text-[16px] font-semibold text-[#0e1e3f] border-l-4 border-[#2563eb] pl-3">
              Upgrade plan
            </h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {plans.map((p) => {
                const isCurrent = p.id === currentPlanId
                const monthly = p.monthly_per_seat * (sub?.seat_count ?? 1)
                return (
                  <div key={p.id} className={`${MOGZU_PRODUCT_CARD} ${isCurrent ? 'border-[#2563eb]/50 ring-2 ring-[#2563eb]/15' : ''}`}>
                    <div className="flex flex-1 flex-col bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(239,246,255,0.72))] p-5">
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-[#0e1e3f]">{p.name}</h3>
                        {isCurrent && (
                          <span className="rounded-full bg-[#2563eb] px-2 py-0.5 text-[10px] font-semibold text-white">
                            CURRENT
                          </span>
                        )}
                      </div>
                      <p className="text-[22px] font-extrabold tracking-tight text-[#0e1e3f]">
                        {formatCurrency(monthly)}
                        <span className="text-xs font-normal text-slate-500">/mo</span>
                      </p>
                      <ul className="mb-4 mt-3 space-y-1.5 text-xs text-slate-600">
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
                            <CheckCircle2 className="size-3 text-emerald-500" />
                            {p.feature_flags.ai_agents_count} AI agent{p.feature_flags.ai_agents_count === 1 ? '' : 's'}
                          </li>
                        )}
                      </ul>
                      <button
                        type="button"
                        disabled={busy || isCurrent || isDemo}
                        onClick={() => void upgrade(p.id)}
                        className={`${MOGZU_CTA_GRADIENT} mt-auto w-full disabled:cursor-not-allowed disabled:opacity-40`}
                      >
                        {isCurrent ? 'Active' : `Switch to ${p.name}`}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        </>
      )}
    </CorporateModuleShell>
  )
}
