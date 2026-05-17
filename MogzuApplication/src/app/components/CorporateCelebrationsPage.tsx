import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import {
  ArrowLeft,
  Cake,
  Calendar as CalIcon,
  CheckCircle2,
  Loader2,
  PauseCircle,
  ShieldAlert,
  Sparkles,
  XCircle,
} from 'lucide-react'
import { SharedHeader } from './layouts/SharedHeader'
import { SharedSidebar } from './layouts/SharedSidebar'
import { MogzuCorporateScrollSurface } from './layouts/MogzuCorporateScrollSurface'
import { useAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import type { CelebrationEvent, CelebrationStatus } from '@/lib/database.types'

type Row = CelebrationEvent & {
  employees: {
    full_name: string | null
    email: string | null
    department: string | null
    dob: string | null
    join_date: string | null
  } | null
  listings: { title: string | null } | null
}

const STATUS_META: Record<
  CelebrationStatus,
  { label: string; className: string; Icon: typeof CalIcon }
> = {
  scheduled: { label: 'Scheduled', className: 'bg-blue-100 text-blue-800', Icon: CalIcon },
  personalised: {
    label: 'Personalised',
    className: 'bg-emerald-100 text-emerald-700',
    Icon: Sparkles,
  },
  suppressed: {
    label: 'Suppressed',
    className: 'bg-slate-100 text-slate-600',
    Icon: PauseCircle,
  },
  fired: { label: 'Sent', className: 'bg-emerald-100 text-emerald-700', Icon: CheckCircle2 },
  failed: { label: 'Failed', className: 'bg-rose-100 text-rose-700', Icon: XCircle },
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  })
}

export default function CorporateCelebrationsPage() {
  const navigate = useNavigate()
  const { corporateId, role } = useAuth()
  const canManage = role === 'l3_admin' || role === 'mogzu_admin'

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'upcoming' | 'all'>('upcoming')

  const load = useCallback(async () => {
    if (!corporateId) return
    setLoading(true)
    const { data } = await db.celebrations.listByCorporate(corporateId)
    setRows((data ?? []) as Row[])
    setLoading(false)
  }, [corporateId])

  useEffect(() => {
    load()
  }, [load])

  const filtered = useMemo(() => {
    if (filter === 'all') return rows
    const todayIso = new Date().toISOString().slice(0, 10)
    return rows.filter((r) => r.trigger_date >= todayIso)
  }, [rows, filter])

  const stats = useMemo(() => {
    return {
      scheduled: rows.filter((r) => r.status === 'scheduled').length,
      personalised: rows.filter((r) => r.status === 'personalised').length,
      fired: rows.filter((r) => r.status === 'fired').length,
      suppressed: rows.filter((r) => r.status === 'suppressed').length,
    }
  }, [rows])

  if (!canManage) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FFFDF9]">
        <div className="max-w-md rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
          <ShieldAlert className="mx-auto mb-2 size-8 text-amber-600" />
          <p className="text-sm text-amber-800">L3 Admin access required.</p>
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
          <div className="mx-auto max-w-5xl px-8">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800"
            >
              <ArrowLeft className="size-4" />
              Back
            </button>

            <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="flex items-center gap-2 text-2xl font-bold text-[#0e1e3f]">
                  <Cake className="size-5" />
                  Celebration schedule
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Automated milestone gifting. Events are generated daily by the N8N celebration
                  cron from <code className="rounded bg-slate-100 px-1">employees.dob</code> /{' '}
                  <code className="rounded bg-slate-100 px-1">employees.join_date</code> and your
                  active gifting rules. Managers receive a 48h heads-up to personalise.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/corporate/gifting-programme')}
                className="rounded-md border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Manage rules
              </button>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Scheduled" value={stats.scheduled} className="text-blue-700" />
              <Stat label="Personalised" value={stats.personalised} className="text-emerald-700" />
              <Stat label="Sent" value={stats.fired} className="text-emerald-700" />
              <Stat label="Suppressed" value={stats.suppressed} className="text-slate-600" />
            </div>

            <div className="mb-3 flex gap-2 border-b border-slate-200">
              {(['upcoming', 'all'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition ${
                    filter === f
                      ? 'border-[#2563EB] text-[#2563EB]'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {f === 'upcoming' ? 'Upcoming' : 'All'}
                </button>
              ))}
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              {loading ? (
                <div className="flex items-center justify-center py-14">
                  <Loader2 className="size-6 animate-spin text-slate-400" />
                </div>
              ) : filtered.length === 0 ? (
                <p className="p-12 text-center text-sm text-slate-500">
                  No celebration events. Run the N8N seeding cron (or wait for it) to populate.
                </p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Employee</th>
                      <th className="px-4 py-3">Occasion</th>
                      <th className="px-4 py-3">Gift</th>
                      <th className="px-4 py-3">Manager</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map((r) => {
                      const meta = STATUS_META[r.status]
                      return (
                        <tr key={r.id} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 font-medium text-slate-900">
                            {formatDate(r.trigger_date)}
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-slate-900">
                              {r.employees?.full_name ?? '—'}
                            </p>
                            {r.employees?.department && (
                              <p className="text-[11px] text-slate-500">
                                {r.employees.department}
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-3 text-slate-700">{r.occasion_name}</td>
                          <td className="px-4 py-3 text-slate-700">
                            {r.listings?.title ?? '—'}
                            {r.budget_override != null && (
                              <p className="text-[11px] text-emerald-700">
                                Budget override ₹{r.budget_override.toLocaleString('en-IN')}
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {r.manager_id ? r.manager_id.slice(0, 8) : 'Unassigned'}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${meta.className}`}
                            >
                              <meta.Icon className="size-3" />
                              {meta.label}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </MogzuCorporateScrollSurface>
      </div>
    </div>
  )
}

function Stat({
  label,
  value,
  className = '',
}: {
  label: string
  value: number
  className?: string
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 text-xl font-bold ${className || 'text-slate-900'}`}>{value}</p>
    </div>
  )
}
