import type { EnquiryVertical } from '@/lib/leadEnquiryVertical'
import { matchesLeadVertical } from '@/lib/leadEnquiryVertical'
import { matchesLeadSourceFilter, type LeadSourceFilter } from '@/lib/leadSources'
import { getLeadOwnerLabel } from '@/lib/leadFlow'
import type { PublicLead } from '@/lib/publicLeads'

export type LeadQuickFilter =
  | 'all'
  | 'today'
  | 'week'
  | 'high_budget'
  | 'unassigned'
  | 'callback'

export const LEAD_QUICK_FILTERS: { id: LeadQuickFilter; label: string }[] = [
  { id: 'all', label: 'All time' },
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This week' },
  { id: 'high_budget', label: 'High budget' },
  { id: 'unassigned', label: 'Unassigned' },
  { id: 'callback', label: 'Callbacks' },
]

const HIGH_BUDGET = new Set(['10L_50L', 'gt_50L'])

export function matchesLeadQuickFilter(lead: PublicLead, quickFilter: LeadQuickFilter): boolean {
  if (quickFilter === 'all') return true
  if (quickFilter === 'unassigned') return getLeadOwnerLabel(lead) === 'Unassigned'
  if (quickFilter === 'callback') return lead.metadata?.callback_requested === true
  if (quickFilter === 'high_budget') return !!lead.budget_band && HIGH_BUDGET.has(lead.budget_band)

  const created = new Date(lead.created_at).getTime()
  if (Number.isNaN(created)) return true

  const ageMs = Date.now() - created
  if (quickFilter === 'today') return ageMs <= 24 * 60 * 60 * 1000
  if (quickFilter === 'week') return ageMs <= 7 * 24 * 60 * 60 * 1000
  return true
}

export function filterLeadsBySearch(leads: PublicLead[], search: string): PublicLead[] {
  const q = search.trim().toLowerCase()
  if (!q) return leads

  return leads.filter((lead) => {
    const meta = lead.metadata ?? {}
    const referrer =
      typeof meta.referrer_name === 'string' ? meta.referrer_name : ''
    const referrerCo =
      typeof meta.referrer_company === 'string' ? meta.referrer_company : ''
    const internal =
      typeof meta.internal_notes === 'string' ? meta.internal_notes : ''

    return [
      lead.client_name,
      lead.client_company ?? '',
      lead.client_email,
      lead.client_phone ?? '',
      lead.requirement_summary ?? '',
      lead.source_slug ?? '',
      referrer,
      referrerCo,
      internal,
    ]
      .join(' ')
      .toLowerCase()
      .includes(q)
  })
}

export function triageLeads(
  leads: PublicLead[],
  search: string,
  quickFilter: LeadQuickFilter,
  vertical: EnquiryVertical = 'all',
  sourceFilter: LeadSourceFilter = 'all',
): PublicLead[] {
  return filterLeadsBySearch(leads, search)
    .filter((lead) => matchesLeadQuickFilter(lead, quickFilter))
    .filter((lead) => matchesLeadVertical(lead, vertical))
    .filter((lead) => matchesLeadSourceFilter(lead.source_slug, lead.metadata, sourceFilter))
}
