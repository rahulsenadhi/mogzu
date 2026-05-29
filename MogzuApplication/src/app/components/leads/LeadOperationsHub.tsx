import { Inbox, Kanban, Share2 } from 'lucide-react'
import { useCallback } from 'react'
import { useSearchParams } from 'react-router'
import AdminLeadsPage from '@/app/components/AdminLeadsPage'
import AdminQuickSharePage from '@/app/pages/admin/AdminQuickSharePage'
import SalesPipelinePage from '@/app/components/SalesPipelinePage'
import { LeadOpsPageHeader } from '@/app/components/leads/LeadOpsPageHeader'
import { LEAD_OPS, leadOpsChipClass } from '@/app/components/leads/leadOpsStyles'
import type { LeadQuickSharePrefill } from '@/lib/leadEnquiryVertical'
import { stashLeadQuickSharePrefill } from '@/lib/leadOpsNavigation'
const TABS = [
  {
    id: 'inbox',
    label: 'Inbox',
    icon: Inbox,
    hint: 'Triage, assign owners, and log phone or referral enquiries.',
  },
  {
    id: 'pipeline',
    label: 'Pipeline',
    icon: Kanban,
    hint: 'Move leads by stage from New through Won.',
  },
  {
    id: 'catalogue',
    label: 'Quick Share',
    icon: Share2,
    hint: 'Build gifting or events catalogues and send client pick links.',
  },
] as const
export type LeadOpsTab = (typeof TABS)[number]['id']
export default function LeadOperationsHub() {
  const [params, setParams] = useSearchParams()
  const raw = params.get('tab') ?? 'inbox'
  const tab: LeadOpsTab =
    raw === 'pipeline' || raw === 'catalogue' ? raw : 'inbox'
  const setTab = (id: LeadOpsTab) => {
    setParams(id === 'inbox' ? {} : { tab: id }, { replace: true })
  }
  const goCatalogueFromLead = useCallback(
    (prefill: LeadQuickSharePrefill) => {
      stashLeadQuickSharePrefill(prefill)
      setParams({ tab: 'catalogue' }, { replace: true })
    },
    [setParams],
  )
  const activeTab = TABS.find((t) => t.id === tab) ?? TABS[0]
  return (
    <div className={LEAD_OPS.page}>
      <LeadOpsPageHeader
        eyebrow="Gifting & events"
        title="Lead operations"
        description="Single workspace for sales and support: capture enquiries, assign owners, run the pipeline, and share curated catalogues."
        footer={
          <div className="space-y-3">
            <nav
              className="flex flex-wrap gap-2"
              role="tablist"
              aria-label="Lead operations views"
            >
              {TABS.map((t) => {
                const Icon = t.icon
                const active = tab === t.id
                return (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    id={`lead-ops-tab-${t.id}`}
                    aria-selected={active}
                    aria-controls={`lead-ops-panel-${t.id}`}
                    onClick={() => setTab(t.id)}
                    className={`${leadOpsChipClass(active)} gap-2`}
                  >
                    <Icon className="size-4" aria-hidden />
                    {t.label}
                  </button>
                )
              })}
            </nav>
            <p className="text-sm text-slate-600">{activeTab.hint}</p>
          </div>
        }
      />
      <div
        id={`lead-ops-panel-${tab}`}
        role="tabpanel"
        aria-labelledby={`lead-ops-tab-${tab}`}
        className={LEAD_OPS.hubPanel}
      >
        {tab === 'inbox' ? (
          <AdminLeadsPage embedded onGoCatalogue={goCatalogueFromLead} />
        ) : null}
        {tab === 'pipeline' ? (
          <SalesPipelinePage embedded onGoCatalogue={goCatalogueFromLead} />
        ) : null}
        {tab === 'catalogue' ? <AdminQuickSharePage embedded /> : null}
      </div>
    </div>
  )
}
