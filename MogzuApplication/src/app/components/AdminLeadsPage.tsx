// Phase 3 Feature 3 — admin lead inbox.

import { useCallback, useEffect, useState } from 'react'
import { Loader2, ShieldAlert } from 'lucide-react'
import { AdminPageTitleRow } from '@/app/components/admin/AdminPageChrome'
import { useAuth } from '@/lib/auth'
import {
  BUDGET_BANDS,
  TIMELINES,
  listLeads,
  updateLeadStatus,
  type LeadStatus,
  type PublicLead,
} from '@/lib/publicLeads'

const STATUS_FILTERS: { value: LeadStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'converted', label: 'Converted' },
  { value: 'closed', label: 'Closed' },
  { value: 'spam', label: 'Spam' },
]

export default function AdminLeadsPage() {
  const { role } = useAuth()
  const isStaff = role === 'mogzu_admin' || role === 'support' || role === 'sales_agent'

  const [rows, setRows] = useState<PublicLead[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<LeadStatus | 'all'>('all')

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error: err } = await listLeads(filter === 'all' ? undefined : filter)
    if (err) setError(err)
    setRows(data)
    setLoading(false)
  }, [filter])

  useEffect(() => {
    if (isStaff) load()
  }, [isStaff, load])

  const setStatus = async (lead: PublicLead, next: LeadStatus) => {
    setBusy(lead.id)
    const { error: err } = await updateLeadStatus(lead.id, next)
    setBusy(null)
    if (err) {
      setError(err)
      return
    }
    load()
  }

  if (!isStaff) {
    return (
      <div className="p-12 text-center">
        <ShieldAlert className="mx-auto mb-2 size-8 text-amber-500" />
        <p className="text-sm text-amber-800">Sales / support / admin role required.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFFDF9]">
      <div className="mx-auto max-w-6xl px-6 py-6">
        <AdminPageTitleRow title="Lead inbox" totalLabel={`${rows.length} matching`} />

        {error && (
          <p className="mt-3 mb-3 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        )}

        <div className="mt-3 mb-3 flex flex-wrap gap-2">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setFilter(s.value)}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                filter === s.value
                  ? 'bg-slate-900 text-white'
                  : 'border border-slate-200 bg-white text-slate-700'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {loading ? (
            <div className="flex items-center justify-center py-14">
              <Loader2 className="size-6 animate-spin text-slate-400" />
            </div>
          ) : rows.length === 0 ? (
            <p className="p-12 text-center text-sm text-slate-500">No leads.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {rows.map((l) => (
                <li key={l.id} className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-900">
                        {l.client_name}
                        {l.client_company ? ` · ${l.client_company}` : ''}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {l.client_email}
                        {l.client_phone ? ` · ${l.client_phone}` : ''}
                        {' · '}
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                          {l.status}
                        </span>
                        {' · '}
                        {new Date(l.created_at).toLocaleString('en-IN')}
                      </p>
                      {l.requirement_summary && (
                        <p className="mt-2 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                          {l.requirement_summary}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-slate-500">
                        budget: {BUDGET_BANDS.find((b) => b.value === l.budget_band)?.label ?? '—'} ·
                        timeline: {TIMELINES.find((t) => t.value === l.timeline)?.label ?? '—'}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {(['assigned', 'qualified', 'converted', 'closed', 'spam'] as LeadStatus[]).map(
                        (s) => (
                          <button
                            key={s}
                            type="button"
                            disabled={busy === l.id || l.status === s}
                            onClick={() => setStatus(l, s)}
                            className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                          >
                            {s}
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
