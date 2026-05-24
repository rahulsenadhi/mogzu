// Phase 3 Feature 3 — admin lead inbox.

import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router'
import { Loader2, Mail, Phone, ShieldAlert, Sparkles, UserCircle2 } from 'lucide-react'
import { AdminPageTitleRow } from '@/app/components/admin/AdminPageChrome'
import { LeadTriageToolbar } from '@/app/components/leads/LeadTriageToolbar'
import {
  MOGZU_GLASS_HERO,
  MOGZU_GLASS_PANEL,
} from '@/app/components/ui/mogzuGlassStyles'
import { useAuth } from '@/lib/auth'
import { triageLeads, type LeadQuickFilter } from '@/lib/leadTriageUtils'
import {
  BUDGET_BANDS,
  TIMELINES,
  listLeads,
  updateLeadStatus,
  type LeadStatus,
  type PublicLead,
} from '@/lib/publicLeads'

const STATUS_FILTERS: { value: LeadStatus | 'all'; label: string; color: string }[] = [
  { value: 'all', label: 'All', color: 'bg-slate-900 text-white' },
  { value: 'new', label: 'New', color: 'bg-sky-600 text-white' },
  { value: 'assigned', label: 'Assigned', color: 'bg-indigo-600 text-white' },
  { value: 'qualified', label: 'Qualified', color: 'bg-amber-500 text-white' },
  { value: 'converted', label: 'Converted', color: 'bg-emerald-600 text-white' },
  { value: 'closed', label: 'Closed', color: 'bg-slate-500 text-white' },
  { value: 'spam', label: 'Spam', color: 'bg-rose-500 text-white' },
]

const STATUS_BADGE: Record<LeadStatus, string> = {
  new: 'bg-sky-100 text-sky-700 border-sky-200',
  assigned: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  qualified: 'bg-amber-100 text-amber-700 border-amber-200',
  converted: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  closed: 'bg-slate-100 text-slate-600 border-slate-200',
  spam: 'bg-rose-100 text-rose-700 border-rose-200',
}

const DEMO_LEADS: PublicLead[] = [
  {
    id: 'demo-1',
    listing_id: null,
    source_slug: 'mogzu_direct_detail',
    client_name: 'Priya Mehta',
    client_company: 'Infosys Ltd',
    client_email: 'priya.mehta@infosys.com',
    client_phone: '+91 98765 43210',
    requirement_summary: 'Looking for a premium offsite venue for 120 employees in Bangalore. Need catering + AV. Budget is flexible for the right venue.',
    budget_band: '10L_50L',
    timeline: 'this_quarter',
    status: 'new',
    assigned_agent_id: null,
    assigned_at: null,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-2',
    listing_id: null,
    source_slug: 'partner_listing_detail',
    client_name: 'Rohan Sharma',
    client_company: 'Wipro Technologies',
    client_email: 'rohan.s@wipro.com',
    client_phone: '+91 91234 56789',
    requirement_summary: 'Corporate gifting for 300 employees, Diwali 2026. Mix of gift hampers and e-vouchers. Need GST invoice.',
    budget_band: '2L_10L',
    timeline: 'this_month',
    status: 'assigned',
    assigned_agent_id: 'a1b2c3d4-0000-0000-0000-000000000001',
    assigned_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-3',
    listing_id: null,
    source_slug: 'explore',
    client_name: 'Ananya Singh',
    client_company: 'TCS',
    client_email: 'ananya.singh@tcs.com',
    client_phone: null,
    requirement_summary: 'Team outing for 60 pax. Looking for activity-based venue with team-building workshops.',
    budget_band: '50k_2L',
    timeline: 'this_month',
    status: 'qualified',
    assigned_agent_id: 'a1b2c3d4-0000-0000-0000-000000000002',
    assigned_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-4',
    listing_id: null,
    source_slug: 'public_page',
    client_name: 'Kartik Nair',
    client_company: 'HDFC Bank',
    client_email: 'kartik.nair@hdfcbank.com',
    client_phone: '+91 88888 77777',
    requirement_summary: 'Annual day event for 500 pax in Mumbai. Need a full-service event management partner.',
    budget_band: 'gt_50L',
    timeline: 'this_quarter',
    status: 'converted',
    assigned_agent_id: 'a1b2c3d4-0000-0000-0000-000000000001',
    assigned_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-5',
    listing_id: null,
    source_slug: 'mogzu_direct_detail',
    client_name: 'Sneha Kapoor',
    client_company: null,
    client_email: 'sneha.k@startupxyz.io',
    client_phone: '+91 77777 66666',
    requirement_summary: 'Coworking space for 10-person startup, need flexible desks + 1 private cabin.',
    budget_band: 'lt_50k',
    timeline: 'asap',
    status: 'new',
    assigned_agent_id: null,
    assigned_at: null,
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
]

function fmtTime(iso: string): string {
  try {
    const d = new Date(iso)
    const diff = Date.now() - d.getTime()
    if (diff < 60 * 60 * 1000) return `${Math.round(diff / 60000)}m ago`
    if (diff < 24 * 60 * 60 * 1000) return `${Math.round(diff / 3600000)}h ago`
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  } catch {
    return iso
  }
}

export default function AdminLeadsPage() {
  const { role } = useAuth()
  const isStaff = role === 'mogzu_admin' || role === 'support' || role === 'sales_agent'

  const [rows, setRows] = useState<PublicLead[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<LeadStatus | 'all'>('all')
  const [search, setSearch] = useState('')
  const [quickFilter, setQuickFilter] = useState<LeadQuickFilter>('all')
  const [isDemo, setIsDemo] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error: err } = await listLeads(filter === 'all' ? undefined : filter)
    if (err) {
      setError(err)
      setRows(DEMO_LEADS)
      setIsDemo(true)
    } else if (data.length === 0) {
      setRows(DEMO_LEADS)
      setIsDemo(true)
    } else {
      setRows(data)
      setIsDemo(false)
    }
    setLoading(false)
  }, [filter])

  useEffect(() => {
    if (isStaff) load()
    else setLoading(false)
  }, [isStaff, load])

  const setStatus = async (lead: PublicLead, next: LeadStatus) => {
    if (isDemo) return
    setBusy(lead.id)
    const { error: err } = await updateLeadStatus(lead.id, next)
    setBusy(null)
    if (err) {
      setError(err)
      return
    }
    load()
  }

  const filteredRows = triageLeads(rows, search, quickFilter)

  const counts = STATUS_FILTERS.reduce<Record<string, number>>((acc, s) => {
    acc[s.value] = s.value === 'all' ? rows.length : rows.filter((r) => r.status === s.value).length
    return acc
  }, {})

  if (!isStaff) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-12 text-center">
        <ShieldAlert className="mb-3 size-10 text-amber-500" />
        <p className="text-base font-semibold text-amber-800">Access restricted</p>
        <p className="mt-1 text-sm text-slate-500">Sales agent, support, or admin role required.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-[1280px] space-y-5">
        {/* Hero header */}
        <div className={MOGZU_GLASS_HERO}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#CFE0FF] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-[#1E4DB7]">
                <Sparkles className="size-3.5" />
                Lead operations
              </span>
              <AdminPageTitleRow title="Lead inbox" totalLabel={`${filteredRows.length} visible · ${rows.length} total`} />
              {isDemo && (
                <p className="mt-1 text-xs text-slate-400 italic">Showing demo data — submit a lead from any listing page to populate this inbox.</p>
              )}
            </div>
          </div>

          {/* Status filter tabs */}
          <div className="mt-5 flex flex-wrap gap-2">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setFilter(s.value)}
                aria-pressed={filter === s.value}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#93c5fd]/60 ${
                  filter === s.value
                    ? `${s.color} shadow-sm`
                    : 'border border-slate-200 bg-white/80 text-slate-600 hover:border-slate-300 hover:bg-white'
                }`}
              >
                {s.label}
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${filter === s.value ? 'bg-white/25' : 'bg-slate-100 text-slate-500'}`}>
                  {counts[s.value] ?? 0}
                </span>
              </button>
            ))}
          </div>
        </div>

        {error && !isDemo && (
          <p className="mb-4 rounded-lg border border-rose-100 bg-rose-50 px-4 py-2.5 text-sm text-rose-700">
            {error}
          </p>
        )}

        {/* Lead list */}
        <div className={MOGZU_GLASS_PANEL}>
          <LeadTriageToolbar
            search={search}
            onSearchChange={setSearch}
            quickFilter={quickFilter}
            onQuickFilterChange={setQuickFilter}
            visibleCount={filteredRows.length}
            totalCount={rows.length}
            searchPlaceholder="Search admin leads…"
          />
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="size-6 animate-spin text-slate-400" />
            </div>
          ) : filteredRows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <UserCircle2 className="mb-3 size-10 text-slate-300" />
              <p className="text-sm font-medium text-slate-500">
                {search.trim() || quickFilter !== 'all'
                  ? 'No leads match your filters.'
                  : 'No leads in this status.'}
              </p>
              <p className="mt-1 text-xs text-slate-400">Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100/80">
              {filteredRows.map((l) => (
                <li key={l.id} className="group p-5 transition-colors hover:bg-white/60">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">

                      {/* Name + company + status badge */}
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-slate-900">
                          {l.client_name}
                          {l.client_company ? (
                            <span className="ml-1.5 font-normal text-slate-500">· {l.client_company}</span>
                          ) : null}
                        </p>
                        <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STATUS_BADGE[l.status]}`}>
                          {l.status}
                        </span>
                        <span className="text-[11px] text-slate-400">{fmtTime(l.created_at)}</span>
                      </div>

                      {/* Contact */}
                      <p className="mt-1 text-xs text-slate-500">
                        {l.client_email}
                        {l.client_phone ? ` · ${l.client_phone}` : ''}
                      </p>

                      {/* Requirement */}
                      {l.requirement_summary && (
                        <p className="mt-2.5 whitespace-pre-wrap rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3 text-sm leading-relaxed text-slate-700">
                          {l.requirement_summary}
                        </p>
                      )}

                      {/* Meta chips */}
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {l.budget_band && (
                          <span className="rounded-full border border-violet-100 bg-violet-50 px-2.5 py-0.5 text-[10px] font-medium text-violet-700">
                            {BUDGET_BANDS.find((b) => b.value === l.budget_band)?.label ?? 'Budget TBD'}
                          </span>
                        )}
                        {l.timeline && (
                          <span className="rounded-full border border-sky-100 bg-sky-50 px-2.5 py-0.5 text-[10px] font-medium text-sky-700">
                            {TIMELINES.find((t) => t.value === l.timeline)?.label ?? 'Timeline TBD'}
                          </span>
                        )}
                        {l.source_slug && (
                          <span className="rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-0.5 text-[10px] font-medium text-indigo-700">
                            {l.source_slug.replaceAll('_', ' ')}
                          </span>
                        )}
                        <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${l.assigned_agent_id ? 'border-emerald-100 bg-emerald-50 text-emerald-700' : 'border-amber-100 bg-amber-50 text-amber-700'}`}>
                          {l.assigned_agent_id ? `Assigned · ${l.assigned_agent_id.slice(0, 8)}` : 'Unassigned'}
                        </span>
                      </div>
                    </div>

                    {/* Action panel */}
                    <div className="flex flex-col items-end gap-2">
                      {/* Contact buttons */}
                      <div className="flex gap-1.5">
                        <a
                          href={`mailto:${l.client_email}`}
                          aria-label={`Email ${l.client_name}`}
                          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#93c5fd]/60 active:scale-[0.97]"
                        >
                          <Mail className="size-3.5" />
                          Email
                        </a>
                        {l.client_phone && (
                          <a
                            href={`tel:${l.client_phone}`}
                            aria-label={`Call ${l.client_name}`}
                            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#93c5fd]/60 active:scale-[0.97]"
                          >
                            <Phone className="size-3.5" />
                            Call
                          </a>
                        )}
                      </div>

                      {/* Status move buttons */}
                      {!isDemo && (
                        <div className="flex flex-wrap justify-end gap-1">
                          {(['assigned', 'qualified', 'converted', 'closed', 'spam'] as LeadStatus[]).map((s) => (
                            <button
                              key={s}
                              type="button"
                              disabled={busy === l.id || l.status === s}
                              onClick={() => setStatus(l, s)}
                              aria-label={`Move ${l.client_name} to ${s}`}
                              className="rounded-md border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-600 transition-all duration-200 hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#93c5fd]/60 active:scale-[0.97] disabled:cursor-default disabled:opacity-40"
                            >
                              → {s}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {filteredRows.length > 0 ? (
            <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-3 border-t border-white/60 bg-white/90 px-5 py-3 backdrop-blur-xl">
              <p className="text-xs text-slate-600">
                <span className="font-semibold text-slate-900">
                  {filteredRows.filter((l) => !l.assigned_agent_id).length}
                </span>{' '}
                unassigned in current view
              </p>
              <Link
                to="/sales/pipeline"
                className="rounded-lg border border-[#2563EB]/30 bg-[#EFF6FF] px-3 py-1.5 text-xs font-semibold text-[#1D4ED8] transition hover:bg-[#DBEAFE] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#93c5fd]/60"
              >
                Open pipeline board →
              </Link>
            </div>
          ) : null}
        </div>
    </div>
  )
}
