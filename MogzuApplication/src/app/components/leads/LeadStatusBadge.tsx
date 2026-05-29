import { leadStatusBadgeClass, leadStatusLabel } from '@/lib/leadStatusUi'
import type { LeadStatus } from '@/lib/publicLeads'
type LeadStatusBadgeProps = {
  status: LeadStatus
  size?: 'sm' | 'md'
}
export function LeadStatusBadge({ status, size = 'sm' }: LeadStatusBadgeProps) {
  const sizeClass =
    size === 'md'
      ? 'px-2.5 py-1 text-[11px]'
      : 'px-2 py-0.5 text-[10px]'
  return (
    <span
      className={`inline-flex items-center rounded-md border font-bold uppercase tracking-wide ${sizeClass} ${leadStatusBadgeClass(status)}`}
    >
      {leadStatusLabel(status)}
    </span>
  )
}
