import type { LeadStatus } from '@/lib/publicLeads'

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'New',
  assigned: 'Assigned',
  qualified: 'Qualified',
  converted: 'Won',
  closed: 'Closed',
  spam: 'Spam',
}

export const LEAD_STATUS_BADGE_CLASS: Record<LeadStatus, string> = {
  new: 'bg-sky-100 text-sky-800 border-sky-200/80',
  assigned: 'bg-indigo-100 text-indigo-800 border-indigo-200/80',
  qualified: 'bg-amber-100 text-amber-900 border-amber-200/80',
  converted: 'bg-emerald-100 text-emerald-800 border-emerald-200/80',
  closed: 'bg-slate-100 text-slate-600 border-slate-200/80',
  spam: 'bg-rose-100 text-rose-800 border-rose-200/80',
}

export function leadStatusLabel(status: LeadStatus): string {
  return LEAD_STATUS_LABELS[status] ?? status
}

export function leadStatusBadgeClass(status: LeadStatus): string {
  return LEAD_STATUS_BADGE_CLASS[status] ?? LEAD_STATUS_BADGE_CLASS.new
}
