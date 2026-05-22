// Plan Batch 10 — AI Sales Agent pipeline.
//
// Reads public_leads (Phase 3 Feature 3) grouped by status. Sales /
// account_manager / mogzu_admin can re-stage a lead via the dropdown;
// the existing trg_assign_lead_to_sales_agent handles new-row routing.

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Loader2, ShieldAlert } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import {
  listLeads,
  updateLeadStatus,
  type LeadStatus,
  type PublicLead,
} from '@/lib/publicLeads'

const COLUMNS: { status: LeadStatus; label: string; tone: string }[] = [
  { status: 'new', label: 'New', tone: 'border-sky-200 bg-sky-50/50' },
  { status: 'assigned', label: 'Assigned', tone: 'border-indigo-200 bg-indigo-50/50' },
  { status: 'qualified', label: 'Qualified', tone: 'border-amber-200 bg-amber-50/50' },
  { status: 'converted', label: 'Converted', tone: 'border-emerald-200 bg-emerald-50/50' },
  { status: 'closed', label: 'Closed', tone: 'border-slate-200 bg-slate-50/50' },
  { status: 'spam', label: 'Spam', tone: 'border-rose-200 bg-rose-50/50' },
]

const TRANSITIONS: LeadStatus[] = ['new', 'assigned', 'qualified', 'converted', 'closed', 'spam']

function fmtTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

export default function SalesPipelinePage() {
  const { role } = useAuth()
  const canManage = role === 'sales_agent' || role === 'mogzu_admin' || role === 'account_manager' || role === 'support'

  const [leads, setLeads] = useState<PublicLead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error: err } = await listLeads()
    if (err) setError(err)
    setLeads(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (canManage) void load()
  }, [canManage, load])

  const grouped = useMemo(() => {
    const out: Record<LeadStatus, PublicLead[]> = {
      new: [],
      assigned: [],
      qualified: [],
      converted: [],
      closed: [],
      spam: [],
    }
    for (const l of leads) out[l.status]?.push(l)
    return out
  }, [leads])

  const move = async (lead: PublicLead, next: LeadStatus) => {
    if (next === lead.status) return
    setBusyId(lead.id)
    const { error: err } = await updateLeadStatus(lead.id, next)
    setBusyId(null)
    if (err) setError(err)
    else load()
  }

  if (!canManage) {
    return (
      <div className="mx-auto max-w-md p-12 text-center">
        <ShieldAlert className="mx-auto mb-2 size-8 text-amber-500" />
        <p className="text-sm text-amber-800">
          Sales pipeline is restricted to sales / account manager / admin / support.
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFFDF9] p-6">
      <header className="mx-auto max-w-7xl">
        <h1 className="text-2xl font-bold text-[#0e1e3f]">Sales pipeline</h1>
        <p className="mt-1 text-sm text-slate-600">
          {leads.length} leads · sourced from /p/:slug + listing detail public lead forms
        </p>
      </header>

      {error && (
        <div className="mx-auto mt-3 max-w-7xl rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
          {error}
        </div>
      )}

      {loading ? (
        <div className="mt-12 flex items-center justify-center">
          <Loader2 className="size-6 animate-spin text-slate-400" />
        </div>
      ) : (
        <section className="mx-auto mt-6 grid max-w-7xl grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-6">
          {COLUMNS.map((col) => (
            <div key={col.status} className={`rounded-2xl border p-3 ${col.tone}`}>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-900">{col.label}</h2>
                <span className="text-xs text-slate-600">{grouped[col.status].length}</span>
              </div>
              <ul className="space-y-2">
                {grouped[col.status].map((lead) => (
                  <li
                    key={lead.id}
                    className="rounded-xl border border-white/80 bg-white p-3 text-xs shadow-sm"
                  >
                    <p className="font-medium text-slate-900">{lead.client_name}</p>
                    <p className="text-slate-500">{lead.client_company ?? '—'}</p>
                    <p className="mt-1 font-mono text-[10px] text-slate-500">{lead.client_email}</p>
                    {lead.requirement_summary && (
                      <p className="mt-2 line-clamp-2 text-[11px] text-slate-700">
                        {lead.requirement_summary}
                      </p>
                    )}
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="text-[10px] text-slate-500">{fmtTime(lead.created_at)}</span>
                      <select
                        value={lead.status}
                        disabled={busyId === lead.id}
                        onChange={(e) => move(lead, e.target.value as LeadStatus)}
                        className="rounded-md border border-slate-200 px-2 py-0.5 text-[11px]"
                      >
                        {TRANSITIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </li>
                ))}
                {grouped[col.status].length === 0 && (
                  <li className="rounded-xl border border-dashed border-slate-200 bg-white/40 p-3 text-center text-[11px] text-slate-400">
                    No leads
                  </li>
                )}
              </ul>
            </div>
          ))}
        </section>
      )}
    </div>
  )
}
