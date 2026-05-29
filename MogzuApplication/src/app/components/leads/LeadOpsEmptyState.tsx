import type { ReactNode } from 'react'
import { LEAD_OPS } from '@/app/components/leads/leadOpsStyles'
type LeadOpsEmptyStateProps = {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
}
export function LeadOpsEmptyState({ icon, title, description, action }: LeadOpsEmptyStateProps) {
  return (
    <div className={`${LEAD_OPS.surface} flex flex-col items-center px-6 py-16 text-center`}>
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl border border-white/70 bg-white/60 text-slate-300 shadow-sm">
        {icon}
      </div>
      <p className="text-base font-semibold text-slate-800">{title}</p>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  )
}
