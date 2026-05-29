import type { LeadQuickSharePrefill } from '@/lib/leadEnquiryVertical'

export const LEAD_QS_PREFILL_KEY = 'mogzu_lead_qs_prefill'

export function stashLeadQuickSharePrefill(prefill: LeadQuickSharePrefill): void {
  try {
    sessionStorage.setItem(LEAD_QS_PREFILL_KEY, JSON.stringify(prefill))
  } catch {
    /* ignore quota / private mode */
  }
}

export function consumeLeadQuickSharePrefill(): LeadQuickSharePrefill | null {
  try {
    const raw = sessionStorage.getItem(LEAD_QS_PREFILL_KEY)
    if (!raw) return null
    sessionStorage.removeItem(LEAD_QS_PREFILL_KEY)
    return JSON.parse(raw) as LeadQuickSharePrefill
  } catch {
    return null
  }
}
