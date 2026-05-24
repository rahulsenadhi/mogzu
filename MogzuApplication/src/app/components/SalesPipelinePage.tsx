// Plan Batch 10 — AI Sales Agent pipeline.

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Loader2, Mail, Phone, ShieldAlert, Sparkles, TrendingUp } from 'lucide-react'
import { LeadTriageToolbar } from '@/app/components/leads/LeadTriageToolbar'
import { useAuth } from '@/lib/auth'
import { MOGZU_GLASS_HERO } from '@/app/components/ui/mogzuGlassStyles'
import { triageLeads, type LeadQuickFilter } from '@/lib/leadTriageUtils'
import {
  BUDGET_BANDS,
  TIMELINES,
  listLeads,
  updateLeadStatus,
  type LeadStatus,
  type PublicLead,
} from '@/lib/publicLeads'

const COLUMNS: { status: LeadStatus; label: string; tone: string; dot: string }[] = [
  { status: 'new',       label: 'New',       tone: 'border-sky-200/80 bg-sky-50/40',      dot: 'bg-sky-400' },
  { status: 'assigned',  label: 'Assigned',  tone: 'border-indigo-200/80 bg-indigo-50/40', dot: 'bg-indigo-500' },
  { status: 'qualified', label: 'Qualified', tone: 'border-amber-200/80 bg-amber-50/40',  dot: 'bg-amber-400' },
  { status: 'converted', label: 'Converted', tone: 'border-emerald-200/80 bg-emerald-50/40', dot: 'bg-emerald-500' },
  { status: 'closed',    label: 'Closed',    tone: 'border-slate-200/80 bg-slate-50/40',  dot: 'bg-slate-400' },
  { status: 'spam',      label: 'Spam',      tone: 'border-rose-200/80 bg-rose-50/40',    dot: 'bg-rose-400' },
]

const TRANSITIONS: LeadStatus[] = ['new', 'assigned', 'qualified', 'converted', 'closed', 'spam']

const DEMO_LEADS: PublicLead[] = [
  {
    id: 'demo-1', listing_id: null, source_slug: 'mogzu_direct_detail',
    client_name: 'Priya Mehta', client_company: 'Infosys Ltd',
    client_email: 'priya.mehta@infosys.com', client_phone: '+91 98765 43210',
    requirement_summary: 'Offsite venue for 120 employees, Bangalore. Need catering + AV setup.',
    budget_band: '10L_50L', timeline: 'this_quarter', status: 'new',
    assigned_agent_id: null, assigned_at: null,
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 'demo-2', listing_id: null, source_slug: 'partner_listing_detail',
    client_name: 'Rohan Sharma', client_company: 'Wipro Technologies',
    client_email: 'rohan.s@wipro.com', client_phone: '+91 91234 56789',
    requirement_summary: 'Corporate Diwali gifting for 300 employees — hampers + e-vouchers. GST invoice required.',
    budget_band: '2L_10L', timeline: 'this_month', status: 'assigned',
    assigned_agent_id: 'a1b2c3d4-0001', assigned_at: new Date(Date.now() - 5 * 3600000).toISOString(),
    created_at: new Date(Date.now() - 8 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 3600000).toISOString(),
  },
  {
    id: 'demo-3', listing_id: null, source_slug: 'explore',
    client_name: 'Ananya Singh', client_company: 'TCS',
    client_email: 'ananya.singh@tcs.com', client_phone: null,
    requirement_summary: 'Team outing for 60 pax. Activity-based venue with workshops.',
    budget_band: '50k_2L', timeline: 'this_month', status: 'qualified',
    assigned_agent_id: 'a1b2c3d4-0002', assigned_at: new Date(Date.now() - 86400000).toISOString(),
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'demo-4', listing_id: null, source_slug: 'public_page',
    client_name: 'Kartik Nair', client_company: 'HDFC Bank',
    client_email: 'kartik.nair@hdfcbank.com', client_phone: '+91 88888 77777',
    requirement_summary: 'Annual Day for 500 pax in Mumbai. Full-service event management.',
    budget_band: 'gt_50L', timeline: 'this_quarter', status: 'converted',
    assigned_agent_id: 'a1b2c3d4-0001', assigned_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'demo-5', listing_id: null, source_slug: 'mogzu_direct_detail',
    client_name: 'Sneha Kapoor', client_company: null,
    client_email: 'sneha.k@startupxyz.io', client_phone: '+91 77777 66666',
    requirement_summary: 'Coworking for 10-person startup. Flexible desks + 1 cabin.',
    budget_band: 'lt_50k', timeline: 'asap', status: 'new',
    assigned_agent_id: null, assigned_at: null,
    created_at: new Date(Date.now() - 30 * 60000).toISOString(),
    updated_at: new Date(Date.now() - 30 * 60000).toISOString(),
  },
  {
    id: 'demo-6', listing_id: null, source_slug: 'explore',
    client_name: 'Vikram Bose', client_company: 'Bajaj Auto',
    client_email: 'v.bose@bajajfinserv.com', client_phone: null,
    requirement_summary: 'Leadership offsite for 30 senior leaders in Pune. Premium resort preferred.',
    budget_band: '10L_50L', timeline: 'this_quarter', status: 'closed',
    assigned_agent_id: 'a1b2c3d4-0002', assigned_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
]

function fmtTime(iso: string): string {
  try {
    const d = new Date(iso)
    const diff = Date.now() - d.getTime()
    if (diff < 3600000) return `${Math.round(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.round(diff / 3600000)}h ago`
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  } catch { return iso }
}

function budgetLabel(v: PublicLead['budget_band']) { return BUDGET_BANDS.find((b) => b.value === v)?.label ?? '—' }
function timelineLabel(v: PublicLead['timeline']) { return TIMELINES.find((t) => t.value === v)?.label ?? '—' }
function sourceLabel(lead: PublicLead) {
  if (!lead.source_slug) return 'Public page'
  return lead.source_slug.replaceAll('_', ' ')
}

export default function SalesPipelinePage() {
  const { role } = useAuth()
  const canManage = role === 'sales_agent' || role === 'mogzu_admin' || role === 'account_manager' || role === 'support'

  const [leads, setLeads] = useState<PublicLead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [quickFilter, setQuickFilter] = useState<LeadQuickFilter>('all')
  const [isDemo, setIsDemo] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error: err } = await listLeads()
    if (err || data.length === 0) {
      setLeads(DEMO_LEADS)
      setIsDemo(true)
      if (err) setError(err)
    } else {
      setLeads(data)
      setIsDemo(false)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (canManage) void load()
    else setLoading(false)
  }, [canManage, load])

  const filteredLeads = useMemo(
    () => triageLeads(leads, search, quickFilter),
    [leads, search, quickFilter],
  )

  const grouped = useMemo(() => {
    const out = Object.fromEntries(COLUMNS.map((c) => [c.status, [] as PublicLead[]])) as Record<LeadStatus, PublicLead[]>
    for (const l of filteredLeads) out[l.status]?.push(l)
    return out
  }, [filteredLeads])

  const move = async (lead: PublicLead, next: LeadStatus) => {
    if (next === lead.status || isDemo) return
    setBusyId(lead.id)
    const { error: err } = await updateLeadStatus(lead.id, next)
    setBusyId(null)
    if (err) setError(err)
    else load()
  }

  const totalConverted = leads.filter((l) => l.status === 'converted').length
  const conversionRate = leads.length > 0 ? Math.round((totalConverted / leads.length) * 100) : 0

  if (!canManage) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-12 text-center">
        <ShieldAlert className="mb-3 size-10 text-amber-500" />
        <p className="text-base font-semibold text-amber-800">Access restricted</p>
        <p className="mt-1 text-sm text-slate-500">Sales / account manager / admin / support role required.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-5">
        {/* Header */}
        <div className={MOGZU_GLASS_HERO}>
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#CFE0FF] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-[#1E4DB7]">
                <Sparkles className="size-3.5" />
                Sales operations
              </span>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">Sales pipeline</h1>
              <p className="mt-1 text-sm text-slate-500">
                {filteredLeads.length} visible · {leads.length} total
                {isDemo && <span className="ml-2 italic text-slate-400">· demo data</span>}
              </p>
            </div>

            {/* Stats strip */}
            <div className="flex flex-wrap gap-3">
              {[
                { label: 'Total leads', value: leads.length, icon: '📋' },
                { label: 'Converted', value: totalConverted, icon: '✅' },
                { label: 'Conv. rate', value: `${conversionRate}%`, icon: <TrendingUp className="size-4 text-emerald-600" /> },
              ].map((stat) => (
                <div key={stat.label} className="flex min-w-[96px] flex-col items-center rounded-xl border border-white/80 bg-white/80 px-4 py-3 text-center shadow-sm backdrop-blur-sm">
                  <span className="text-lg">{stat.icon}</span>
                  <span className="text-xl font-bold text-slate-900">{stat.value}</span>
                  <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <LeadTriageToolbar
          search={search}
          onSearchChange={setSearch}
          quickFilter={quickFilter}
          onQuickFilterChange={setQuickFilter}
          visibleCount={filteredLeads.length}
          totalCount={leads.length}
          searchPlaceholder="Search pipeline leads…"
        />

        {error && !isDemo && (
          <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-800">{error}</div>
        )}

        {/* Kanban board */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-6 animate-spin text-slate-400" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            {COLUMNS.map((col) => (
              <div
                key={col.status}
                className={`flex flex-col rounded-2xl border p-3 shadow-[0_6px_20px_rgba(37,99,235,0.09)] backdrop-blur-md ${col.tone}`}
              >
                {/* Column header */}
                <div className="mb-3 flex items-center gap-2">
                  <span className={`size-2 rounded-full ${col.dot}`} />
                  <h2 className="flex-1 text-sm font-semibold text-slate-800">{col.label}</h2>
                  <span className="rounded-full border border-white/80 bg-white/80 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                    {grouped[col.status].length}
                  </span>
                </div>

                {/* Cards */}
                <ul className="flex flex-1 flex-col gap-2">
                  {grouped[col.status].map((lead) => (
                    <li
                      key={lead.id}
                      className="group rounded-xl border border-white/80 bg-white/90 p-3 text-xs shadow-sm transition-shadow hover:shadow-md"
                    >
                      <p className="font-semibold text-slate-900 leading-tight">{lead.client_name}</p>
                      {lead.client_company && (
                        <p className="text-[11px] text-slate-500">{lead.client_company}</p>
                      )}
                      <p className="mt-1 font-mono text-[10px] text-slate-400 truncate">{lead.client_email}</p>

                      {lead.requirement_summary && (
                        <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-slate-600">
                          {lead.requirement_summary}
                        </p>
                      )}

                      {/* Meta chips */}
                      <div className="mt-2 flex flex-wrap gap-1">
                        <span className="rounded-full border border-violet-100 bg-violet-50 px-2 py-0.5 text-[10px] font-medium text-violet-700">
                          {budgetLabel(lead.budget_band)}
                        </span>
                        <span className="rounded-full border border-sky-100 bg-sky-50 px-2 py-0.5 text-[10px] font-medium text-sky-700">
                          {timelineLabel(lead.timeline)}
                        </span>
                        <span className="rounded-full border border-indigo-100 bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-700">
                          {sourceLabel(lead)}
                        </span>
                      </div>

                      {/* Footer: time + assignment + actions */}
                      <div className="mt-2.5 flex items-center justify-between gap-1">
                        <span className="text-[10px] text-slate-400">{fmtTime(lead.created_at)}</span>
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${lead.assigned_agent_id ? 'border-emerald-100 bg-emerald-50 text-emerald-700' : 'border-amber-100 bg-amber-50 text-amber-700'}`}>
                          {lead.assigned_agent_id ? `·${lead.assigned_agent_id.slice(0, 6)}` : 'unassigned'}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center gap-1.5">
                        <a
                          href={`mailto:${lead.client_email}`}
                          aria-label={`Email ${lead.client_name}`}
                          className="flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-medium text-slate-700 transition-all hover:-translate-y-0.5 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#93c5fd]/60 active:scale-[0.97]"
                        >
                          <Mail className="size-3" /> Email
                        </a>
                        {lead.client_phone && (
                          <a
                            href={`tel:${lead.client_phone}`}
                            aria-label={`Call ${lead.client_name}`}
                            className="flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-medium text-slate-700 transition-all hover:-translate-y-0.5 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#93c5fd]/60 active:scale-[0.97]"
                          >
                            <Phone className="size-3" /> Call
                          </a>
                        )}
                        {!isDemo && (
                          <select
                            value={lead.status}
                            disabled={busyId === lead.id}
                            onChange={(e) => move(lead, e.target.value as LeadStatus)}
                            aria-label={`Update status for ${lead.client_name}`}
                            className="ml-auto rounded-md border border-slate-200 px-2 py-1 text-[10px] text-slate-700 transition hover:border-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#93c5fd]/60"
                          >
                            {TRANSITIONS.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        )}
                      </div>
                    </li>
                  ))}

                  {grouped[col.status].length === 0 && (
                    <li className="flex-1 rounded-xl border border-dashed border-slate-200/80 bg-white/30 p-4 text-center text-[11px] text-slate-400">
                      {search.trim() || quickFilter !== 'all' ? 'No matches' : 'No leads'}
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        )}
    </div>
  )
}
