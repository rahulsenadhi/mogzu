import type { PublicLead } from '@/lib/publicLeads'

export type LeadQuickFilter = 'all' | 'today' | 'week' | 'high_budget' | 'unassigned'

export const LEAD_QUICK_FILTERS: { id: LeadQuickFilter; label: string }[] = [
  { id: 'all', label: 'All time' },
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This week' },
  { id: 'high_budget', label: 'High budget' },
  { id: 'unassigned', label: 'Unassigned' },
]

const HIGH_BUDGET = new Set(['10L_50L', 'gt_50L'])

export function matchesLeadQuickFilter(lead: PublicLead, quickFilter: LeadQuickFilter): boolean {
  if (quickFilter === 'all') return true
  if (quickFilter === 'unassigned') return !lead.assigned_agent_id
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

  return leads.filter((lead) =>
    [
      lead.client_name,
      lead.client_company ?? '',
      lead.client_email,
      lead.client_phone ?? '',
      lead.requirement_summary ?? '',
      lead.source_slug ?? '',
    ]
      .join(' ')
      .toLowerCase()
      .includes(q),
  )
}

export function triageLeads(
  leads: PublicLead[],
  search: string,
  quickFilter: LeadQuickFilter,
): PublicLead[] {
  return filterLeadsBySearch(leads, search).filter((lead) => matchesLeadQuickFilter(lead, quickFilter))
}
