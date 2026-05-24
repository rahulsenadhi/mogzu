// Phase 5 Feature 6 — SOC2 access reviews admin console.

import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import { Camera, CheckCircle2, ChevronDown, ChevronUp, Loader2, ShieldAlert } from 'lucide-react'
import { AdminComplianceNavChips } from '@/app/components/admin/AdminComplianceNavChips'
import { AdminPageTitleRow } from '@/app/components/admin/AdminPageChrome'
import { MOGZU_GLASS_PANEL } from '@/app/components/ui/mogzuGlassStyles'
import {
  MOGZU_CTA_GRADIENT,
  MOGZU_FILTER_SIDEBAR,
  MOGZU_MODULE_CONTAINER,
  MOGZU_CHIP_ACTIVE_GRADIENT,
  MOGZU_NAV_SCROLLER,
  filterStatChipClass,
  moduleNavChipClass,
} from '@/app/components/ui/mogzuGiftingStyles'
import { useAuth } from '@/lib/auth'
import {
  completeReview,
  createReview,
  listReviews,
  snapshotReview,
  type AccessReview,
  type ReviewStatus,
} from '@/lib/accessReviews'

type SnapshotRow = {
  user_id?: string
  full_name?: string
  email?: string
  role?: string
  status?: string
}

const DEMO_REVIEWS: AccessReview[] = [
  {
    id: 'demo-review-1',
    scheduled_for: '2026-03-31',
    reviewed_by: null,
    reviewed_at: null,
    status: 'in_progress',
    notes: null,
    decisions: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    snapshot: [
      { user_id: 'u1', full_name: 'Priya Sharma', email: 'priya@mogzu.com', role: 'mogzu_admin', status: 'active' },
      { user_id: 'u2', full_name: 'Alex Chen', email: 'alex@mogzu.com', role: 'support', status: 'active' },
      { user_id: 'u3', full_name: 'Jordan Lee', email: 'jordan@acme.com', role: 'l3_admin', status: 'active' },
    ],
  },
  {
    id: 'demo-review-2',
    scheduled_for: '2025-12-31',
    reviewed_by: 'u1',
    reviewed_at: '2026-01-05T10:00:00Z',
    status: 'completed',
    notes: 'All roles verified. No orphaned permissions.',
    decisions: { u1: 'retain', u2: 'retain', u3: 'retain' },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    snapshot: [
      { user_id: 'u1', full_name: 'Priya Sharma', email: 'priya@mogzu.com', role: 'mogzu_admin', status: 'active' },
      { user_id: 'u2', full_name: 'Alex Chen', email: 'alex@mogzu.com', role: 'support', status: 'active' },
    ],
  },
]

function parseSnapshot(raw: unknown): SnapshotRow[] {
  if (!Array.isArray(raw)) return []
  return raw as SnapshotRow[]
}

export default function AdminAccessReviewsPage() {
  const { role } = useAuth()
  const isAdmin = role === 'mogzu_admin'

  const [rows, setRows] = useState<AccessReview[]>([])
  const [usingDemo, setUsingDemo] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [scheduledFor, setScheduledFor] = useState(() => new Date().toISOString().slice(0, 10))
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | 'all'>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error: err } = await listReviews()
    if (data.length === 0 && !err) {
      setRows(DEMO_REVIEWS)
      setUsingDemo(true)
    } else {
      setRows(data)
      setUsingDemo(false)
    }
    if (err) setError(err)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (isAdmin) void load()
  }, [isAdmin, load])

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return rows
    return rows.filter((r) => r.status === statusFilter)
  }, [rows, statusFilter])

  const counts = useMemo(() => {
    const pending = rows.filter((r) => r.status === 'pending').length
    const inProgress = rows.filter((r) => r.status === 'in_progress').length
    const completed = rows.filter((r) => r.status === 'completed').length
    return { total: rows.length, pending, inProgress, completed }
  }, [rows])

  const onCreate = async () => {
    if (usingDemo) {
      setRows((prev) => [
        {
          id: `demo-${Date.now()}`,
          scheduled_for: scheduledFor,
          reviewed_by: null,
          reviewed_at: null,
          status: 'pending',
          notes: null,
          decisions: {},
          snapshot: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        ...prev,
      ])
      return
    }
    const { error: err } = await createReview(scheduledFor)
    if (err) setError(err)
    else void load()
  }

  const onSnapshot = async (id: string) => {
    if (usingDemo) {
      setRows((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                status: 'in_progress' as const,
                snapshot: DEMO_REVIEWS[0].snapshot,
              }
            : r,
        ),
      )
      setExpandedId(id)
      return
    }
    const { error: err } = await snapshotReview(id)
    if (err) setError(err)
    else {
      setExpandedId(id)
      void load()
    }
  }

  const onComplete = async (id: string) => {
    const notes = window.prompt('Closing notes (optional)') ?? undefined
    if (usingDemo) {
      setRows((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                status: 'completed' as const,
                reviewed_at: new Date().toISOString(),
                notes: notes ?? 'Signed off',
              }
            : r,
        ),
      )
      return
    }
    const { error: err } = await completeReview(id, {}, notes)
    if (err) setError(err)
    else void load()
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-12 text-center">
        <ShieldAlert className="mb-3 size-10 text-amber-500" />
        <p className="text-base font-semibold text-amber-800">Access restricted</p>
        <p className="mt-1 text-sm text-slate-500">mogzu_admin role required.</p>
      </div>
    )
  }

  return (
    <div className={`${MOGZU_MODULE_CONTAINER} mx-auto w-full space-y-5 py-2`}>
      <div className="rounded-2xl border border-white/60 bg-white/55 p-5 backdrop-blur-xl shadow-[0_16px_36px_rgba(37,99,235,0.12)]">
        <AdminPageTitleRow
          title="Access reviews"
          totalLabel={loading ? 'Loading…' : `${counts.total} reviews on record`}
        />
        <p className="mt-1 text-[14px] text-[#64748b]">
          Quarterly SOC2 sign-off — snapshot active roles, then complete with auditor notes.
        </p>
        <div className="mt-4">
          <AdminComplianceNavChips active="access-review" />
        </div>
        <div className={`mt-3 ${MOGZU_NAV_SCROLLER}`}>
          {(
            [
              { id: 'all', label: 'All', count: counts.total },
              { id: 'pending', label: 'Pending', count: counts.pending },
              { id: 'in_progress', label: 'In progress', count: counts.inProgress },
              { id: 'completed', label: 'Completed', count: counts.completed },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setStatusFilter(item.id)}
              className={moduleNavChipClass(statusFilter === item.id)}
              style={statusFilter === item.id ? MOGZU_CHIP_ACTIVE_GRADIENT : undefined}
            >
              {item.label}
              <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                {item.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {usingDemo && (
        <p className="rounded-xl border border-amber-200/80 bg-amber-50/90 px-4 py-2.5 text-sm text-amber-800">
          Showing demo access reviews — connect Supabase to persist sign-offs.
        </p>
      )}

      {error && (
        <p className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-2.5 text-sm text-rose-700">{error}</p>
      )}

      <section className="grid gap-3 sm:grid-cols-4">
        <div className={filterStatChipClass(statusFilter === 'all', 'blue')}>
          <p className="text-xs uppercase tracking-wider text-slate-500">Total</p>
          <p className="text-2xl font-bold text-[#0e1e3f]">{counts.total}</p>
        </div>
        <div className={filterStatChipClass(statusFilter === 'pending', 'blue')}>
          <p className="text-xs uppercase tracking-wider text-slate-500">Pending</p>
          <p className="text-2xl font-bold text-[#0e1e3f]">{counts.pending}</p>
        </div>
        <div className={filterStatChipClass(statusFilter === 'in_progress', 'blue')}>
          <p className="text-xs uppercase tracking-wider text-slate-500">In progress</p>
          <p className="text-2xl font-bold text-[#0e1e3f]">{counts.inProgress}</p>
        </div>
        <div className={filterStatChipClass(statusFilter === 'completed', 'emerald')}>
          <p className="text-xs uppercase tracking-wider text-emerald-700">Completed</p>
          <p className="text-2xl font-bold text-emerald-700">{counts.completed}</p>
        </div>
      </section>

      <section className={`${MOGZU_FILTER_SIDEBAR} flex flex-wrap items-end gap-3`}>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-[#0e1e3f]">Schedule new review for</span>
          <input
            type="date"
            value={scheduledFor}
            onChange={(e) => setScheduledFor(e.target.value)}
            className="rounded-xl border border-white/70 bg-white/60 px-3 py-2 text-sm backdrop-blur-sm"
          />
        </label>
        <button type="button" onClick={() => void onCreate()} className={MOGZU_CTA_GRADIENT}>
          Schedule review
        </button>
      </section>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-6 animate-spin text-slate-400" />
        </div>
      ) : (
        <section className={`${MOGZU_GLASS_PANEL} overflow-hidden`}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/60 bg-white/40 text-left text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                <th className="px-4 py-3 w-8" />
                <th className="px-4 py-3">Scheduled</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Snapshot rows</th>
                <th className="px-4 py-3">Notes</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const snapshot = parseSnapshot(r.snapshot)
                const expanded = expandedId === r.id
                return (
                  <Fragment key={r.id}>
                    <tr className="border-b border-slate-100/80 hover:bg-white/50">
                      <td className="px-4 py-3">
                        {snapshot.length > 0 ? (
                          <button
                            type="button"
                            onClick={() => setExpandedId(expanded ? null : r.id)}
                            className="rounded-md p-1 text-slate-500 hover:bg-white/80"
                            aria-label={expanded ? 'Collapse sign-off table' : 'Expand sign-off table'}
                          >
                            {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                          </button>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-xs font-medium text-[#0e1e3f]">{r.scheduled_for}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${
                            r.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-700'
                              : r.status === 'in_progress'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {r.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-slate-600">{snapshot.length}</td>
                      <td className="max-w-xs truncate px-4 py-3 text-xs text-slate-500">{r.notes ?? '—'}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          {r.status !== 'completed' && (
                            <button
                              type="button"
                              onClick={() => void onSnapshot(r.id)}
                              className="inline-flex items-center gap-1 rounded-lg border border-white/70 bg-white/60 px-2 py-1 text-xs text-slate-700 backdrop-blur-sm hover:border-[#93c5fd]"
                            >
                              <Camera className="size-3" /> Snapshot
                            </button>
                          )}
                          {r.status !== 'completed' && (
                            <button
                              type="button"
                              onClick={() => void onComplete(r.id)}
                              className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50/90 px-2 py-1 text-xs text-emerald-700 hover:bg-emerald-100"
                            >
                              <CheckCircle2 className="size-3" /> Sign off
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {expanded && snapshot.length > 0 && (
                      <tr className="border-b border-slate-100/80 bg-white/30">
                        <td colSpan={6} className="px-4 py-4">
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Sign-off roster
                          </p>
                          <table className="w-full rounded-xl border border-white/60 bg-white/50 text-xs">
                            <thead>
                              <tr className="border-b border-white/60 text-left text-[10px] uppercase tracking-wider text-slate-500">
                                <th className="px-3 py-2">Name</th>
                                <th className="px-3 py-2">Email</th>
                                <th className="px-3 py-2">Role</th>
                                <th className="px-3 py-2">Status</th>
                                <th className="px-3 py-2 text-right">Decision</th>
                              </tr>
                            </thead>
                            <tbody>
                              {snapshot.map((s) => (
                                <tr key={s.user_id ?? s.email} className="border-b border-slate-100/60 last:border-0">
                                  <td className="px-3 py-2 font-medium text-[#0e1e3f]">{s.full_name ?? '—'}</td>
                                  <td className="px-3 py-2 text-slate-600">{s.email ?? '—'}</td>
                                  <td className="px-3 py-2 capitalize text-slate-600">{s.role?.replace('_', ' ') ?? '—'}</td>
                                  <td className="px-3 py-2 capitalize text-slate-600">{s.status ?? '—'}</td>
                                  <td className="px-3 py-2 text-right">
                                    {r.status === 'completed' ? (
                                      <span className="text-emerald-700">Retained</span>
                                    ) : (
                                      <span className="text-slate-400">Pending sign-off</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-xs text-slate-400">
                    No reviews match this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      )}
    </div>
  )
}
