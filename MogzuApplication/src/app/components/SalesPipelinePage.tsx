// Plan Batch 10 — AI Sales Agent pipeline.

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { stashLeadQuickSharePrefill } from '@/lib/leadOpsNavigation'
import { Loader2, ShieldAlert, TrendingUp } from 'lucide-react'
import { ADMIN_MODULE } from '@/app/components/admin/adminModuleStyles'
import { LeadDetailDrawer } from '@/app/components/leads/LeadDetailDrawer'
import { LeadOpsBanner } from '@/app/components/leads/LeadOpsBanner'
import { LeadOpsPageHeader } from '@/app/components/leads/LeadOpsPageHeader'
import { LeadOpsStats, type LeadOpsStatKey } from '@/app/components/leads/LeadOpsStats'
import { LeadPipelineKanban } from '@/app/components/leads/LeadPipelineKanban'
import { LeadSavedViewsBar } from '@/app/components/leads/LeadSavedViewsBar'
import { LeadTriageToolbar } from '@/app/components/leads/LeadTriageToolbar'
import { LEAD_OPS } from '@/app/components/leads/leadOpsStyles'
import { useAuth } from '@/lib/auth'
import { applyLeadDemoPatch, patchLeadListDemo } from '@/lib/leadDemoPatch'
import type { LeadQuickSharePrefill } from '@/lib/leadEnquiryVertical'
import { triageLeads, type LeadQuickFilter } from '@/lib/leadTriageUtils'
import type { LeadPipelineFilterSnapshot } from '@/lib/leadSavedViews'
import {
  listLeads,
  updateLeadStatus,
  type LeadStatus,
  type PublicLead,
} from '@/lib/publicLeads'

const COLUMNS: { status: LeadStatus; label: string; dot: string }[] = [
  { status: 'new', label: 'New', dot: 'bg-sky-400' },
  { status: 'assigned', label: 'Assigned', dot: 'bg-indigo-500' },
  { status: 'qualified', label: 'Qualified', dot: 'bg-amber-400' },
  { status: 'converted', label: 'Converted', dot: 'bg-emerald-500' },
  { status: 'closed', label: 'Closed', dot: 'bg-slate-400' },
  { status: 'spam', label: 'Spam', dot: 'bg-rose-400' },
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

type SalesPipelinePageProps = {
  embedded?: boolean
  onGoCatalogue?: (prefill: LeadQuickSharePrefill) => void
}

export default function SalesPipelinePage({
  embedded = false,
  onGoCatalogue,
}: SalesPipelinePageProps = {}) {
  const navigate = useNavigate()
  const { role, profile } = useAuth()
  const canManage = role === 'sales_agent' || role === 'mogzu_admin' || role === 'account_manager' || role === 'support'

  const [leads, setLeads] = useState<PublicLead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [quickFilter, setQuickFilter] = useState<LeadQuickFilter>('all')
  const [selectedLead, setSelectedLead] = useState<PublicLead | null>(null)
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
    if (next === lead.status) return
    if (isDemo) {
      setLeads((prev) => patchLeadListDemo(prev, lead.id, { status: next }))
      setSelectedLead((prev) =>
        prev?.id === lead.id ? applyLeadDemoPatch(lead, { status: next }) : prev,
      )
      return
    }
    setBusyId(lead.id)
    const { error: err } = await updateLeadStatus(lead.id, next, lead)
    setBusyId(null)
    if (err) setError(err)
    else void load()
  }

  const patchDemoLead = (leadId: string, patch: Partial<PublicLead>) => {
    setLeads((prev) => patchLeadListDemo(prev, leadId, patch))
    setSelectedLead((prev) => {
      if (!prev || prev.id !== leadId) return prev
      return applyLeadDemoPatch(prev, patch)
    })
  }

  const handleStatClick = (_key: LeadOpsStatKey, quickFilter: LeadQuickFilter) => {
    setQuickFilter(quickFilter)
    if (_key === 'new') {
      setSelectedLead(null)
    }
  }

  const pipelineFilterSnapshot: LeadPipelineFilterSnapshot = {
    kind: 'pipeline',
    search,
    quickFilter,
  }

  const applyPipelineSavedView = (snapshot: LeadPipelineFilterSnapshot) => {
    setSearch(snapshot.search)
    setQuickFilter(snapshot.quickFilter)
  }

  const openQuickShare = (lead: PublicLead, preferredModule: 'gifting' | 'events') => {
    const prefill: LeadQuickSharePrefill = {
      id: lead.id,
      client_name: lead.client_name,
      client_company: lead.client_company,
      client_email: lead.client_email,
      client_phone: lead.client_phone,
      requirement_summary: lead.requirement_summary,
      budget_band: lead.budget_band,
      timeline: lead.timeline,
      source_slug: lead.source_slug,
      listing_id: lead.listing_id,
      preferredModule,
    }
    setSelectedLead(null)
    if (embedded || onGoCatalogue) {
      if (onGoCatalogue) onGoCatalogue(prefill)
      else {
        stashLeadQuickSharePrefill(prefill)
        navigate('/admin/leads?tab=catalogue')
      }
      return
    }
    navigate('/admin/quick-share', { state: { fromLead: prefill } })
  }

  useEffect(() => {
    if (!selectedLead) return
    const fresh = leads.find((l) => l.id === selectedLead.id)
    if (fresh) setSelectedLead(fresh)
  }, [leads, selectedLead?.id])

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

  const shellClass = embedded ? 'space-y-5' : LEAD_OPS.page

  return (
    <div className={shellClass}>
      {!embedded ? (
        <LeadOpsPageHeader
          eyebrow="Sales operations"
          title="Sales pipeline"
          description="Drag leads through stages, open details to assign owners and send Quick Share catalogues."
          demoHint={isDemo ? 'Demo data — connect Supabase for live leads.' : undefined}
          footer={
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <LeadOpsStats leads={leads} onStatClick={handleStatClick} />
              <div className={`${LEAD_OPS.surfaceMuted} flex items-center gap-3 px-4 py-3`}>
                <TrendingUp className="size-5 text-emerald-600" aria-hidden />
                <div>
                  <p className="text-xs text-slate-500">Conversion rate</p>
                  <p className="text-xl font-bold tabular-nums text-slate-900">{conversionRate}%</p>
                </div>
                <p className="text-xs text-slate-500">
                  {totalConverted} won / {leads.length} total
                </p>
              </div>
            </div>
          }
        />
      ) : (
        <div className="space-y-4">
          {isDemo ? (
            <LeadOpsBanner variant="demo" title="Demo pipeline">
              Kanban uses sample leads until Supabase is connected.
            </LeadOpsBanner>
          ) : null}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <LeadOpsStats leads={leads} />
            <div className={`${LEAD_OPS.surfaceMuted} flex items-center gap-3 px-4 py-3`}>
              <TrendingUp className="size-5 text-emerald-600" aria-hidden />
              <div>
                <p className="text-xs text-slate-500">Conversion rate</p>
                <p className="text-xl font-bold tabular-nums text-slate-900">{conversionRate}%</p>
              </div>
              <p className="text-xs text-slate-500">
                {totalConverted} won / {leads.length} total
              </p>
            </div>
          </div>
        </div>
      )}

      <LeadTriageToolbar
        search={search}
        onSearchChange={setSearch}
        quickFilter={quickFilter}
        onQuickFilterChange={setQuickFilter}
        visibleCount={filteredLeads.length}
        totalCount={leads.length}
        searchPlaceholder="Search pipeline leads…"
        sticky={false}
      />

      <LeadSavedViewsBar
        surface="pipeline"
        current={pipelineFilterSnapshot}
        onApply={(snapshot) => {
          if (snapshot.kind !== 'pipeline') return
          applyPipelineSavedView(snapshot)
        }}
      />

      {error && !isDemo ? (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </p>
      ) : null}

      {selectedLead ? (
        <LeadDetailDrawer
          lead={selectedLead}
          allLeads={leads}
          isDemo={isDemo}
          busy={busyId === selectedLead.id}
          layout="overlay"
          currentUserId={profile?.id ?? null}
          currentUserName={profile?.full_name ?? profile?.email ?? null}
          onClose={() => setSelectedLead(null)}
          onUpdated={() => void load()}
          onBusyChange={setBusyId}
          onOpenLead={setSelectedLead}
          onQuickShare={openQuickShare}
          onDemoPatch={isDemo ? patchDemoLead : undefined}
        />
      ) : null}

      {loading ? (
        <div className={`${ADMIN_MODULE.card} flex justify-center py-20`}>
          <Loader2 className="size-8 animate-spin text-slate-400" aria-label="Loading pipeline" />
        </div>
      ) : (
        <LeadPipelineKanban
          columns={COLUMNS}
          transitions={TRANSITIONS}
          grouped={grouped}
          allLeads={filteredLeads}
          busyId={busyId}
          emptyHint={search.trim() || quickFilter !== 'all' ? 'No matches' : 'No leads'}
          onOpenLead={setSelectedLead}
          onMove={(lead, next) => void move(lead, next)}
        />
      )}
    </div>
  )
}
