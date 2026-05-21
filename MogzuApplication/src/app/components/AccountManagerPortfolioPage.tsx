import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import {
  ArrowLeft,
  Briefcase,
  Loader2,
  ShieldAlert,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import { AdminPageTitleRow } from '@/app/components/admin/AdminPageChrome'
import { useAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import type { Booking, CorporateAccount, SupportTicket } from '@/lib/database.types'

type Health = {
  bookingsLast30: number
  bookingsPrev30: number
  spendLast30: number
  spendPrev30: number
  openTickets: number
  score: number
  label: 'Healthy' | 'Watch' | 'At risk'
  className: string
  trend: 'up' | 'down' | 'flat'
}

function classifyHealth(h: Omit<Health, 'score' | 'label' | 'className' | 'trend'>): Health {
  const trendVal =
    h.spendPrev30 === 0
      ? h.spendLast30 > 0
        ? 1
        : 0
      : (h.spendLast30 - h.spendPrev30) / h.spendPrev30
  const trend: Health['trend'] = trendVal > 0.05 ? 'up' : trendVal < -0.05 ? 'down' : 'flat'

  let score = 50
  if (h.bookingsLast30 >= 5) score += 20
  else if (h.bookingsLast30 >= 2) score += 10
  else if (h.bookingsLast30 === 0) score -= 20

  if (trend === 'up') score += 15
  if (trend === 'down') score -= 15

  if (h.openTickets >= 3) score -= 20
  else if (h.openTickets >= 1) score -= 5

  score = Math.max(0, Math.min(100, score))
  const label: Health['label'] =
    score >= 70 ? 'Healthy' : score >= 45 ? 'Watch' : 'At risk'
  const className =
    score >= 70
      ? 'bg-emerald-100 text-emerald-700'
      : score >= 45
        ? 'bg-amber-100 text-amber-800'
        : 'bg-rose-100 text-rose-700'

  return { ...h, score, label, className, trend }
}

export default function AccountManagerPortfolioPage() {
  const navigate = useNavigate()
  const { profile, role } = useAuth()
  const isAm = role === 'account_manager' || role === 'mogzu_admin'

  const [clients, setClients] = useState<CorporateAccount[]>([])
  const [healthByCorp, setHealthByCorp] = useState<Record<string, Health>>({})
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!profile) return
    setLoading(true)
    const { data: list } = await db.corporateAccounts.listByAccountManager(profile.id)
    const accounts = (list ?? []) as CorporateAccount[]
    setClients(accounts)

    const now = Date.now()
    const cutoff30 = now - 30 * 86_400_000
    const cutoff60 = now - 60 * 86_400_000

    const healthEntries = await Promise.all(
      accounts.map(async (acc) => {
        const [bRes, tRes] = await Promise.all([
          db.bookings.listByCorporate(acc.id),
          db.supportTickets.listQueue('corporate', 'open'),
        ])
        const bookings = (bRes.data ?? []) as Booking[]
        const last30 = bookings.filter(
          (b) => new Date(b.created_at).getTime() >= cutoff30,
        )
        const prev30 = bookings.filter((b) => {
          const ms = new Date(b.created_at).getTime()
          return ms >= cutoff60 && ms < cutoff30
        })
        const openTickets = ((tRes.data ?? []) as SupportTicket[]).filter(
          (t) => t.corporate_id === acc.id,
        ).length
        const sum = (rows: Booking[]) => rows.reduce((s, b) => s + (b.total_amount ?? 0), 0)
        const h = classifyHealth({
          bookingsLast30: last30.length,
          bookingsPrev30: prev30.length,
          spendLast30: sum(last30),
          spendPrev30: sum(prev30),
          openTickets,
        })
        return [acc.id, h] as const
      }),
    )
    setHealthByCorp(Object.fromEntries(healthEntries))
    setLoading(false)
  }, [profile])

  useEffect(() => {
    load()
  }, [load])

  if (!isAm) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FFFDF9]">
        <div className="max-w-md rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
          <ShieldAlert className="mx-auto mb-2 size-8 text-amber-600" />
          <p className="text-sm text-amber-800">Account Manager access required.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFFDF9]">
      <div className="mx-auto w-full max-w-[1280px] px-5 md:px-8 lg:px-12 py-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>
        <AdminPageTitleRow
          title="My portfolio"
          subtitle="Corporate accounts assigned to you. Health score blends recent booking activity, spend trend, and open support tickets."
        />

        {loading ? (
          <div className="flex items-center justify-center py-14">
            <Loader2 className="size-6 animate-spin text-slate-400" />
          </div>
        ) : clients.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <Briefcase className="mx-auto mb-2 size-10 text-slate-300" />
            <p className="text-sm font-medium text-slate-700">No clients assigned</p>
            <p className="mt-1 text-sm text-slate-500">
              Mogzu admin assigns clients via{' '}
              <code className="rounded bg-slate-100 px-1">corporate_accounts.account_manager_id</code>.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {clients.map((c) => {
              const h = healthByCorp[c.id]
              return (
                <li
                  key={c.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{c.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {c.plan} · {c.status}
                        {c.domain ? ` · ${c.domain}` : ''}
                      </p>
                    </div>
                    {h && (
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${h.className}`}
                      >
                        {h.label} · {h.score}/100
                      </span>
                    )}
                  </div>
                  {h && (
                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <Metric label="Bookings (30d)" value={String(h.bookingsLast30)} />
                      <Metric
                        label="Spend (30d)"
                        value={`₹ ${h.spendLast30.toLocaleString('en-IN')}`}
                        delta={
                          h.trend === 'up' ? (
                            <span className="inline-flex items-center gap-1 text-emerald-600">
                              <TrendingUp className="size-3" />
                              up
                            </span>
                          ) : h.trend === 'down' ? (
                            <span className="inline-flex items-center gap-1 text-rose-600">
                              <TrendingDown className="size-3" />
                              down
                            </span>
                          ) : (
                            <span className="text-slate-400">flat</span>
                          )
                        }
                      />
                      <Metric label="Bookings prev 30d" value={String(h.bookingsPrev30)} />
                      <Metric
                        label="Open tickets"
                        value={String(h.openTickets)}
                        delta={h.openTickets > 0 ? <span className="text-rose-600">active</span> : null}
                      />
                    </div>
                  )}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => navigate(`/admin/clients/${c.id}`)}
                      className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Client detail
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/corporate/spend-report?corporate=${c.id}`)
                      }
                      className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Spend report
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(`/admin/support?corporate=${c.id}`)}
                      className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Support queue
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}

        <p className="mt-4 rounded-xl bg-slate-100 px-4 py-3 text-xs text-slate-600">
          Shortlists + scheduled call actions deferred — surface lives on this page as
          contextual deep-links above. Full CRM-style shortlists ship in a follow-up sprint.
        </p>
      </div>
    </div>
  )
}

function Metric({
  label,
  value,
  delta,
}: {
  label: string
  value: string
  delta?: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
      <div className="mt-1 flex items-center gap-2">
        <p className="text-lg font-bold text-slate-900">{value}</p>
        {delta && <span className="text-[10px] font-medium">{delta}</span>}
      </div>
    </div>
  )
}
