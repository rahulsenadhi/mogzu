// Phase 3 — admin lead inbox (gifting + events enquiry operations).

import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { stashLeadQuickSharePrefill } from '@/lib/leadOpsNavigation'
import {
  Inbox,
  Loader2,
  PenLine,
  PhoneCall,
  ShieldAlert,
  ShoppingBag,
  Users,
} from 'lucide-react'
import { LeadBulkAssignBar } from '@/app/components/leads/LeadBulkAssignBar'
import { LeadSavedViewsBar } from '@/app/components/leads/LeadSavedViewsBar'
import { LeadDetailDrawer } from '@/app/components/leads/LeadDetailDrawer'
import { LeadFilterBar, type StatusFilterValue } from '@/app/components/leads/LeadFilterBar'
import { LeadInboxCard } from '@/app/components/leads/LeadInboxCard'
import { LeadIntakeModal } from '@/app/components/leads/LeadIntakeModal'
import { LeadOpsBanner } from '@/app/components/leads/LeadOpsBanner'
import { LeadOpsEmptyState } from '@/app/components/leads/LeadOpsEmptyState'
import { LeadOpsPageHeader } from '@/app/components/leads/LeadOpsPageHeader'
import { LeadOpsStats, type LeadOpsStatKey } from '@/app/components/leads/LeadOpsStats'
import { LEAD_OPS } from '@/app/components/leads/leadOpsStyles'
import { findDuplicateLeads } from '@/lib/leadDuplicates'
import type { LeadQuickSharePrefill } from '@/lib/leadEnquiryVertical'
import type { LeadIntakeChannel } from '@/lib/leadSources'
import { applyLeadDemoPatch, patchLeadListDemo } from '@/lib/leadDemoPatch'
import { triageLeads, type LeadQuickFilter } from '@/lib/leadTriageUtils'
import type { EnquiryVertical } from '@/lib/leadEnquiryVertical'
import type { LeadSourceFilter } from '@/lib/leadSources'
import type { LeadInboxFilterSnapshot } from '@/lib/leadSavedViews'
import { useAuth } from '@/lib/auth'
import { listLeadAssigneesForPicker } from '@/lib/leadAssignees'
import type { UserProfile } from '@/lib/database.types'
import {
  assignLeadOwner,
  listLeads,
  updateLeadStatus,
  type LeadStatus,
  type PublicLead,
} from '@/lib/publicLeads'

const DEMO_LEADS: PublicLead[] = [
  {
    id: 'demo-1',
    listing_id: null,
    source_slug: 'mogzu_direct_detail',
    client_name: 'Priya Mehta',
    client_company: 'Infosys Ltd',
    client_email: 'priya.mehta@infosys.com',
    client_phone: '+91 98765 43210',
    requirement_summary:
      'Premium offsite venue for 120 employees in Bangalore. Catering + AV required.',
    budget_band: '10L_50L',
    timeline: 'this_quarter',
    status: 'new',
    assigned_agent_id: null,
    assigned_at: null,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-phone',
    listing_id: null,
    source_slug: 'staff_inbound_phone',
    client_name: 'Rahul Verma',
    client_company: 'TCS',
    client_email: 'lead+919876543210@intake.mogzu.local',
    client_phone: '+91 98765 43210',
    requirement_summary:
      '[Vertical: Gifting]\n300 Diwali hampers with custom branding, delivery by 15 Oct.',
    budget_band: '2L_10L',
    timeline: 'this_quarter',
    status: 'new',
    assigned_agent_id: null,
    assigned_at: null,
    metadata: {
      intake_channel: 'inbound_phone',
      intake_vertical: 'gifting',
      staff_logged: true,
      callback_requested: true,
    },
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-referral',
    listing_id: null,
    source_slug: 'staff_referral',
    client_name: 'Anita Desai',
    client_company: 'HDFC Bank',
    client_email: 'anita.desai@hdfcbank.com',
    client_phone: '+91 99887 76655',
    requirement_summary:
      '[Vertical: Events]\nLeadership offsite, 120 pax, Goa, Jan 2027 — referred by Vikram Shah.',
    budget_band: '10L_50L',
    timeline: 'this_year',
    status: 'assigned',
    assigned_agent_id: null,
    assigned_at: null,
    metadata: {
      intake_channel: 'referral',
      intake_vertical: 'events',
      referrer_name: 'Vikram Shah',
      referrer_company: 'HDFC Bank',
      staff_logged: true,
    },
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-2',
    listing_id: null,
    source_slug: 'partner_listing_detail',
    client_name: 'Rohan Sharma',
    client_company: 'Wipro Technologies',
    client_email: 'rohan.s@wipro.com',
    client_phone: '+91 91234 56789',
    requirement_summary: 'Corporate Diwali gifting for 300 employees — hampers + e-vouchers.',
    budget_band: '2L_10L',
    timeline: 'this_month',
    status: 'qualified',
    assigned_agent_id: null,
    assigned_at: null,
    metadata: { owner_display_name: 'Sales Team', intake_vertical: 'gifting' },
    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
]

function LeadWorkstationEmpty() {
  return (
    <div
      className={`${LEAD_OPS.surface} ${LEAD_OPS.drawerPanelInline} hidden flex-col items-center justify-center gap-3 p-10 text-center lg:flex`}
    >
      <div className="flex size-14 items-center justify-center rounded-2xl border border-white/70 bg-white/60 text-slate-300">
        <Inbox className="size-7" aria-hidden />
      </div>
      <p className="text-base font-semibold text-slate-800">Select a lead</p>
      <p className="max-w-xs text-sm leading-relaxed text-slate-500">
        Assign an owner, send a Quick Share catalogue, and move the enquiry through to Won.
      </p>
    </div>
  )
}

type AdminLeadsPageProps = {
  embedded?: boolean
  onGoCatalogue?: (prefill: LeadQuickSharePrefill) => void
}

export default function AdminLeadsPage({ embedded = false, onGoCatalogue }: AdminLeadsPageProps = {}) {
  const navigate = useNavigate()
  const { role, profile } = useAuth()
  const isStaff =
    role === 'mogzu_admin' ||
    role === 'support' ||
    role === 'sales_agent' ||
    role === 'account_manager'

  const [rows, setRows] = useState<PublicLead[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>('all')
  const [search, setSearch] = useState('')
  const [quickFilter, setQuickFilter] = useState<LeadQuickFilter>('all')
  const [vertical, setVertical] = useState<EnquiryVertical>('all')
  const [sourceFilter, setSourceFilter] = useState<LeadSourceFilter>('all')
  const [intakeOpen, setIntakeOpen] = useState(false)
  const [intakeChannel, setIntakeChannel] = useState<LeadIntakeChannel>('inbound_phone')
  const [selectedLead, setSelectedLead] = useState<PublicLead | null>(null)
  const [isDemo, setIsDemo] = useState(false)
  const [bulkMode, setBulkMode] = useState(false)
  const [bulkSelectedIds, setBulkSelectedIds] = useState<Set<string>>(new Set())
  const [bulkAssigneeId, setBulkAssigneeId] = useState('')
  const [bulkBusy, setBulkBusy] = useState(false)
  const [assignees, setAssignees] = useState<(UserProfile & { email?: string | null })[]>([])

  const load = useCallback(async () => {
    setLoading(true)
    const status = statusFilter === 'all' ? undefined : statusFilter
    const { data, error: err } = await listLeads(status)
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
  }, [statusFilter])

  useEffect(() => {
    if (isStaff) void load()
    else setLoading(false)
  }, [isStaff, load])

  useEffect(() => {
    if (!isStaff) return
    void listLeadAssigneesForPicker(profile ?? null, isDemo).then((res) => {
      setAssignees(res.data)
    })
  }, [isStaff, profile, isDemo])

  useEffect(() => {
    setBulkSelectedIds(new Set())
  }, [search, quickFilter, vertical, sourceFilter, statusFilter])

  useEffect(() => {
    setSelectedLead((prev) => {
      if (!prev) return null
      return rows.find((r) => r.id === prev.id) ?? prev
    })
  }, [rows])

  const filteredRows = triageLeads(rows, search, quickFilter, vertical, sourceFilter)

  useEffect(() => {
    setSelectedLead((prev) => {
      if (filteredRows.length === 0) return null
      if (prev && filteredRows.some((r) => r.id === prev.id)) return prev
      return filteredRows[0]
    })
  }, [search, quickFilter, vertical, sourceFilter, statusFilter, rows])

  const statusCounts = {
    all: rows.length,
    new: rows.filter((r) => r.status === 'new').length,
    assigned: rows.filter((r) => r.status === 'assigned').length,
    qualified: rows.filter((r) => r.status === 'qualified').length,
    converted: rows.filter((r) => r.status === 'converted').length,
    closed: rows.filter((r) => r.status === 'closed').length,
    spam: rows.filter((r) => r.status === 'spam').length,
  }

  const openIntake = (channel: LeadIntakeChannel) => {
    setIntakeChannel(channel)
    setIntakeOpen(true)
    setSuccess('')
  }

  const handleLeadCreated = () => {
    setIntakeOpen(false)
    setSuccess('Enquiry saved — it appears at the top of your inbox.')
    void load()
  }

  const setStatus = async (lead: PublicLead, next: LeadStatus) => {
    if (next === lead.status) return
    if (isDemo) {
      setRows((prev) => patchLeadListDemo(prev, lead.id, { status: next }))
      setSelectedLead((prev) =>
        prev?.id === lead.id ? applyLeadDemoPatch(lead, { status: next }) : prev,
      )
      return
    }
    setBusy(lead.id)
    const { error: err } = await updateLeadStatus(lead.id, next, lead)
    setBusy(null)
    if (err) setError(err)
    else void load()
  }

  const patchDemoLead = (leadId: string, patch: Partial<PublicLead>) => {
    setRows((prev) => patchLeadListDemo(prev, leadId, patch))
    setSelectedLead((prev) => {
      if (!prev || prev.id !== leadId) return prev
      return applyLeadDemoPatch(prev, patch)
    })
  }

  const handleStatClick = (_key: LeadOpsStatKey, quickFilter: LeadQuickFilter) => {
    setQuickFilter(quickFilter)
    if (_key === 'new') setStatusFilter('new')
  }

  const inboxFilterSnapshot: LeadInboxFilterSnapshot = {
    kind: 'inbox',
    search,
    statusFilter,
    vertical,
    sourceFilter,
    quickFilter,
  }

  const applyInboxSavedView = (snapshot: LeadInboxFilterSnapshot) => {
    setSearch(snapshot.search)
    setStatusFilter(snapshot.statusFilter)
    setVertical(snapshot.vertical)
    setSourceFilter(snapshot.sourceFilter)
    setQuickFilter(snapshot.quickFilter)
  }

  const toggleBulkLead = (leadId: string) => {
    setBulkSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(leadId)) next.delete(leadId)
      else next.add(leadId)
      return next
    })
  }

  const handleBulkAssign = async () => {
    if (!bulkAssigneeId || bulkSelectedIds.size === 0) return
    const assignee = assignees.find((a) => a.id === bulkAssigneeId)
    if (!assignee) return
    const display = assignee.full_name ?? assignee.email ?? 'Staff'
    setBulkBusy(true)
    setError('')
    let ok = 0
    let fail = 0
    for (const id of bulkSelectedIds) {
      const lead = rows.find((r) => r.id === id)
      if (!lead) continue
      if (isDemo) {
        const nextStatus: LeadStatus =
          lead.status === 'new' || lead.status === 'assigned' ? 'assigned' : lead.status
        patchDemoLead(id, {
          status: nextStatus,
          assigned_at: new Date().toISOString(),
          metadata: {
            ...lead.metadata,
            owner_user_id: bulkAssigneeId,
            owner_display_name: display,
            owner_assigned_at: new Date().toISOString(),
          },
        })
        ok += 1
        continue
      }
      const { error: err } = await assignLeadOwner(
        id,
        { user_id: bulkAssigneeId, display_name: display },
        lead,
      )
      if (err) fail += 1
      else ok += 1
    }
    setBulkBusy(false)
    setBulkSelectedIds(new Set())
    setBulkMode(false)
    setBulkAssigneeId('')
    if (fail === 0) {
      setSuccess(`Assigned ${ok} lead${ok !== 1 ? 's' : ''} to ${display}.`)
    } else {
      setError(`Assigned ${ok} / ${ok + fail}. ${fail} failed.`)
    }
    if (!isDemo) void load()
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
    const goHub = () => {
      if (onGoCatalogue) {
        onGoCatalogue(prefill)
        return
      }
      stashLeadQuickSharePrefill(prefill)
      navigate('/admin/leads?tab=catalogue')
    }
    const goStandalone = () =>
      navigate('/admin/quick-share', { state: { fromLead: prefill } })
    const go = embedded || onGoCatalogue ? goHub : goStandalone
    if (isDemo) {
      go()
      return
    }
    if (lead.status === 'new') {
      void setStatus(lead, 'assigned').finally(go)
    } else {
      go()
    }
  }

  if (!isStaff) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-12 text-center">
        <ShieldAlert className="mb-3 size-10 text-amber-500" />
        <p className="text-base font-semibold text-amber-800">Access restricted</p>
        <p className="mt-1 text-sm text-slate-500">Sales, support, or admin role required.</p>
      </div>
    )
  }

  const shellClass = embedded ? 'space-y-5' : LEAD_OPS.page

  return (
    <div className={shellClass}>
      {!embedded ? (
        <LeadOpsPageHeader
          title="Lead inbox"
          description="Log enquiries from calls and referrals, qualify in one workstation, and send curated Quick Share catalogues to clients."
          demoHint={isDemo ? 'Showing demo data — connect Supabase for live leads.' : undefined}
          actions={
            <>
              <button type="button" onClick={() => openIntake('inbound_phone')} className={LEAD_OPS.primaryBtn}>
                <PhoneCall className="size-4" />
                Log phone call
              </button>
              <button type="button" onClick={() => openIntake('referral')} className={LEAD_OPS.secondaryBtn}>
                <PenLine className="size-4" />
                Log enquiry
              </button>
            </>
          }
          footer={
            <>
              <LeadOpsStats leads={rows} onStatClick={handleStatClick} />
              <nav className="mt-4 flex flex-wrap gap-2" aria-label="Related tools">
                <Link to="/admin/mogzu-orders" className={LEAD_OPS.secondaryBtn}>
                  <ShoppingBag className="size-4" />
                  Orders
                </Link>
              </nav>
            </>
          }
        />
      ) : (
        <div className="space-y-4">
          {isDemo ? (
            <LeadOpsBanner variant="demo" title="Demo inbox">
              Sample enquiries for layout review. Connect Supabase and apply lead migrations for live
              assignment and persistence.
            </LeadOpsBanner>
          ) : null}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <LeadOpsStats leads={rows} onStatClick={handleStatClick} />
            <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => openIntake('inbound_phone')} className={LEAD_OPS.primaryBtn}>
              <PhoneCall className="size-4" />
              Log phone call
            </button>
            <button type="button" onClick={() => openIntake('referral')} className={LEAD_OPS.secondaryBtn}>
              <PenLine className="size-4" />
              Log enquiry
            </button>
            </div>
          </div>
        </div>
      )}

      {error && !isDemo ? (
        <LeadOpsBanner variant="error">{error}</LeadOpsBanner>
      ) : null}

      {success ? <LeadOpsBanner variant="success">{success}</LeadOpsBanner> : null}

      <LeadFilterBar
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        statusCounts={statusCounts}
        vertical={vertical}
        onVerticalChange={setVertical}
        sourceFilter={sourceFilter}
        onSourceFilterChange={setSourceFilter}
        quickFilter={quickFilter}
        onQuickFilterChange={setQuickFilter}
        visibleCount={filteredRows.length}
        totalCount={rows.length}
        trailing={
          <button
            type="button"
            onClick={() => {
              setBulkMode((v) => {
                if (v) setBulkSelectedIds(new Set())
                return !v
              })
            }}
            className={
              bulkMode
                ? `${LEAD_OPS.chip} border-[#2563eb] bg-[#2563eb]/10 text-[#2563eb]`
                : `${LEAD_OPS.chip} border-slate-200 bg-white text-slate-700 hover:border-slate-300`
            }
            aria-pressed={bulkMode}
          >
            <Users className="size-3.5" aria-hidden />
            {bulkMode ? 'Done selecting' : 'Bulk assign'}
          </button>
        }
      />

      <LeadSavedViewsBar
        surface="inbox"
        current={inboxFilterSnapshot}
        onApply={(snapshot) => {
          if (snapshot.kind !== 'inbox') return
          applyInboxSavedView(snapshot)
        }}
      />

      <LeadBulkAssignBar
        selectedCount={bulkSelectedIds.size}
        visibleCount={filteredRows.length}
        assignees={assignees}
        assigneeId={bulkAssigneeId}
        onAssigneeChange={setBulkAssigneeId}
        onAssign={() => void handleBulkAssign()}
        onSelectAllVisible={() => setBulkSelectedIds(new Set(filteredRows.map((r) => r.id)))}
        onClear={() => setBulkSelectedIds(new Set())}
        onExitBulkMode={() => {
          setBulkMode(false)
          setBulkSelectedIds(new Set())
        }}
        busy={bulkBusy}
      />

      <div className={LEAD_OPS.workspaceGrid}>
        <div className={LEAD_OPS.listColumn}>
          {loading ? (
            <div className={`${LEAD_OPS.surface} flex justify-center py-24`}>
              <Loader2 className="size-8 animate-spin text-slate-400" />
            </div>
          ) : filteredRows.length === 0 ? (
            <LeadOpsEmptyState
              icon={<Inbox className="size-8" aria-hidden />}
              title="No leads match your filters"
              description="Clear filters or log a new phone or referral enquiry to start triage."
              action={
                <button
                  type="button"
                  onClick={() => openIntake('inbound_phone')}
                  className={LEAD_OPS.primaryBtn}
                >
                  <PhoneCall className="size-4" />
                  Log phone call
                </button>
              }
            />
          ) : (
            filteredRows.map((l) => (
              <LeadInboxCard
                key={l.id}
                lead={l}
                selected={selectedLead?.id === l.id}
                bulkMode={bulkMode}
                bulkChecked={bulkSelectedIds.has(l.id)}
                onBulkToggle={() => toggleBulkLead(l.id)}
                hasDuplicate={
                  findDuplicateLeads(rows, l.client_phone, l.client_email, l.id).length > 0
                }
                onSelect={() => setSelectedLead(l)}
              />
            ))
          )}
        </div>

        <div className="hidden lg:block">
          {selectedLead ? (
            <LeadDetailDrawer
              lead={selectedLead}
              allLeads={rows}
              isDemo={isDemo}
              busy={busy === selectedLead.id}
              layout="inline"
              currentUserId={profile?.id ?? null}
              currentUserName={profile?.full_name ?? profile?.email ?? null}
              onClose={() => setSelectedLead(null)}
              onUpdated={() => void load()}
              onBusyChange={setBusy}
              onOpenLead={setSelectedLead}
              onQuickShare={openQuickShare}
              onDemoPatch={isDemo ? patchDemoLead : undefined}
            />
          ) : (
            <LeadWorkstationEmpty />
          )}
        </div>
      </div>

      {selectedLead ? (
        <div className="lg:hidden">
          <LeadDetailDrawer
            lead={selectedLead}
            allLeads={rows}
            isDemo={isDemo}
            busy={busy === selectedLead.id}
            layout="overlay"
            currentUserId={profile?.id ?? null}
            currentUserName={profile?.full_name ?? profile?.email ?? null}
            onClose={() => setSelectedLead(null)}
            onUpdated={() => void load()}
            onBusyChange={setBusy}
            onOpenLead={setSelectedLead}
            onQuickShare={openQuickShare}
            onDemoPatch={isDemo ? patchDemoLead : undefined}
          />
        </div>
      ) : null}

      <LeadIntakeModal
        open={intakeOpen}
        initialChannel={intakeChannel}
        existingLeads={rows}
        loggedByUserId={profile?.id ?? null}
        loggedByDisplayName={profile?.full_name ?? profile?.email ?? null}
        onClose={() => setIntakeOpen(false)}
        onCreated={handleLeadCreated}
      />
    </div>
  )
}
