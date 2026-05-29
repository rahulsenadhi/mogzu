import type { PublicLead } from '@/lib/publicLeads'

export type LeadFlowStepId =
  | 'captured'
  | 'assigned'
  | 'qualified'
  | 'catalogue_sent'
  | 'converted'

export type LeadFlowStep = {
  id: LeadFlowStepId
  label: string
  hint: string
  done: boolean
  current: boolean
}

export function getLeadOwnerLabel(lead: PublicLead): string {
  const name = lead.metadata?.owner_display_name
  if (typeof name === 'string' && name.trim()) return name.trim()
  if (lead.assigned_agent_id) return 'AI sales agent'
  return 'Unassigned'
}

export function buildLeadFlowSteps(lead: PublicLead): LeadFlowStep[] {
  const ownerAssigned =
    Boolean(lead.metadata?.owner_user_id) ||
    Boolean(lead.assigned_agent_id) ||
    lead.status !== 'new'
  const qualified = ['qualified', 'converted', 'closed'].includes(lead.status)
  const catalogueSent = Boolean(
    lead.metadata?.quick_share_sent_at || lead.metadata?.quick_share_id,
  )
  const converted = lead.status === 'converted'

  const steps: Omit<LeadFlowStep, 'current'>[] = [
    {
      id: 'captured',
      label: 'Captured',
      hint: 'Enquiry logged in inbox',
      done: true,
    },
    {
      id: 'assigned',
      label: 'Assigned',
      hint: 'Owner or AI agent owns follow-up',
      done: ownerAssigned,
    },
    {
      id: 'qualified',
      label: 'Qualified',
      hint: 'Budget and need confirmed',
      done: qualified,
    },
    {
      id: 'catalogue_sent',
      label: 'Catalogue sent',
      hint: 'Quick Share link shared with client',
      done: catalogueSent,
    },
    {
      id: 'converted',
      label: 'Converted',
      hint: 'Won — track in Mogzu orders',
      done: converted,
    },
  ]

  const firstOpen = steps.findIndex((s) => !s.done)
  return steps.map((s, idx) => ({
    ...s,
    current: idx === firstOpen,
  }))
}

export function nextRecommendedAction(lead: PublicLead): string {
  const steps = buildLeadFlowSteps(lead)
  const current = steps.find((s) => s.current)
  if (!current) return 'Review closed or spam leads periodically.'
  switch (current.id) {
    case 'captured':
      return 'Assign an owner (or move to Assigned).'
    case 'assigned':
      return 'Call the client, confirm scope, then mark Qualified.'
    case 'qualified':
      return 'Send a Gifting or Events Quick Share catalogue.'
    case 'catalogue_sent':
      return 'Follow up on selections; mark Converted when order is placed.'
    case 'converted':
      return 'Open Mogzu orders for fulfilment.'
    default:
      return ''
  }
}
