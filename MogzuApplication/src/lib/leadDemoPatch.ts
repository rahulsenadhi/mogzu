import type { LeadStatus, PublicLead } from '@/lib/publicLeads'

/** In-memory lead update for demo / offline inbox (keeps status_history for drawer timeline). */
export function applyLeadDemoPatch(lead: PublicLead, patch: Partial<PublicLead>): PublicLead {
  const metadata: Record<string, unknown> = { ...(lead.metadata ?? {}) }
  if (patch.metadata) {
    for (const [key, val] of Object.entries(patch.metadata)) {
      if (val === undefined) delete metadata[key]
      else metadata[key] = val
    }
  }

  let next: PublicLead = { ...lead, ...patch, metadata }

  if (patch.status && patch.status !== lead.status) {
    const history = Array.isArray(metadata.status_history)
      ? [...(metadata.status_history as Record<string, unknown>[])]
      : []
    history.push({
      from: lead.status,
      to: patch.status,
      at: new Date().toISOString(),
    })
    next = {
      ...next,
      metadata: { ...next.metadata, status_history: history.slice(-30) },
    }
    if (patch.status === 'assigned' && !next.assigned_at) {
      next.assigned_at = new Date().toISOString()
    }
  }

  return next
}

export function patchLeadListDemo(
  leads: PublicLead[],
  leadId: string,
  patch: Partial<PublicLead>,
): PublicLead[] {
  return leads.map((l) => (l.id === leadId ? applyLeadDemoPatch(l, patch) : l))
}
