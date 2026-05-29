import { Phone, UserCheck, UserPlus, Zap } from 'lucide-react'
import { LEAD_OPS } from '@/app/components/leads/leadOpsStyles'
import type { PublicLead } from '@/lib/publicLeads'
import { getLeadOwnerLabel } from '@/lib/leadFlow'
import type { LeadQuickFilter } from '@/lib/leadTriageUtils'
export type LeadOpsStatKey = 'new' | 'unassigned' | 'callbacks' | 'this_week'
type LeadOpsStatsProps = {
  leads: PublicLead[]
  onStatClick?: (key: LeadOpsStatKey, quickFilter: LeadQuickFilter) => void
}
export function LeadOpsStats({ leads, onStatClick }: LeadOpsStatsProps) {
  const now = Date.now()
  const weekMs = 7 * 24 * 60 * 60 * 1000
  const newCount = leads.filter((l) => l.status === 'new').length
  const unassigned = leads.filter((l) => getLeadOwnerLabel(l) === 'Unassigned').length
  const callbacks = leads.filter((l) => l.metadata?.callback_requested === true).length
  const thisWeek = leads.filter((l) => now - new Date(l.created_at).getTime() <= weekMs).length
  const items: {
    key: LeadOpsStatKey
    label: string
    value: number
    icon: typeof Zap
    tone: string
    quickFilter: LeadQuickFilter
  }[] = [
    {
      key: 'new',
      label: 'New',
      value: newCount,
      icon: Zap,
      tone: 'text-sky-700 bg-sky-50 border-sky-100',
      quickFilter: 'all',
    },
    {
      key: 'unassigned',
      label: 'Unassigned',
      value: unassigned,
      icon: UserPlus,
      tone: 'text-amber-800 bg-amber-50 border-amber-100',
      quickFilter: 'unassigned',
    },
    {
      key: 'callbacks',
      label: 'Callbacks',
      value: callbacks,
      icon: Phone,
      tone: 'text-teal-800 bg-teal-50 border-teal-100',
      quickFilter: 'callback',
    },
    {
      key: 'this_week',
      label: 'This week',
      value: thisWeek,
      icon: UserCheck,
      tone: 'text-indigo-800 bg-indigo-50 border-indigo-100',
      quickFilter: 'week',
    },
  ]
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map((item) => {
        const clickable = Boolean(onStatClick)
        const Tag = clickable ? 'button' : 'div'
        return (
          <Tag
            key={item.key}
            type={clickable ? 'button' : undefined}
            onClick={clickable ? () => onStatClick?.(item.key, item.quickFilter) : undefined}
            className={`${LEAD_OPS.surfaceMuted} flex items-center gap-3 px-4 py-3 text-left transition ${
              clickable
                ? 'cursor-pointer hover:border-[#93c5fd] hover:shadow-[0_12px_28px_rgba(37,99,235,0.14)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#93c5fd]/50'
                : ''
            }`}
          >
            <span
              className={`flex size-10 shrink-0 items-center justify-center rounded-xl border ${item.tone}`}
            >
              <item.icon className="size-4" aria-hidden />
            </span>
            <div>
              <p className="text-2xl font-bold tabular-nums text-slate-900">{item.value}</p>
              <p className="text-xs font-medium text-slate-500">{item.label}</p>
            </div>
          </Tag>
        )
      })}
    </div>
  )
}
