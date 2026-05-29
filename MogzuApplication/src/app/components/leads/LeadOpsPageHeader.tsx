import type { ReactNode } from 'react'
import { ADMIN_MODULE } from '@/app/components/admin/adminModuleStyles'
type LeadOpsPageHeaderProps = {
  eyebrow?: string
  title: string
  description: string
  demoHint?: string
  actions?: ReactNode
  footer?: ReactNode
}
export function LeadOpsPageHeader({
  eyebrow = 'Gifting & events',
  title,
  description,
  demoHint,
  actions,
  footer,
}: LeadOpsPageHeaderProps) {
  return (
    <header className={`${ADMIN_MODULE.hero} space-y-5`}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <span className={ADMIN_MODULE.eyebrow}>{eyebrow}</span>
          <h1 className={`mt-2 ${ADMIN_MODULE.title}`}>{title}</h1>
          <p className={`mt-2 max-w-2xl ${ADMIN_MODULE.subtitle}`}>{description}</p>
          {demoHint ? (
            <p className="mt-2 text-xs font-medium text-amber-700">{demoHint}</p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:flex-wrap lg:justify-end">
            {actions}
          </div>
        ) : null}
      </div>
      {footer ? <div className="border-t border-white/50 pt-4">{footer}</div> : null}
    </header>
  )
}
