import { useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { SharedHeader } from '@/app/components/layouts/SharedHeader'
import { SharedSidebar } from '@/app/components/layouts/SharedSidebar'
import { MogzuCorporateScrollSurface } from '@/app/components/layouts/MogzuCorporateScrollSurface'
import {
  MOGZU_BREADCRUMB_CURRENT,
  MOGZU_BREADCRUMB_LINK,
  MOGZU_BREADCRUMB_PILL,
  MOGZU_CHIP_ACTIVE_GRADIENT,
  MOGZU_MODULE_CONTAINER,
  MOGZU_NAV_SCROLLER,
  MOGZU_PAGE_SUBTITLE,
  MOGZU_PAGE_TITLE,
  moduleNavChipClass,
} from '@/app/components/ui/mogzuGiftingStyles'

export type ModuleNavChip = {
  id: string
  label: string
  icon?: ReactNode
  active?: boolean
  onClick: () => void
}

export type ModuleBreadcrumb = {
  label: string
  onClick?: () => void
}

type CorporateModuleShellProps = {
  title: string
  subtitle?: string
  breadcrumbs: ModuleBreadcrumb[]
  navChips?: ModuleNavChip[]
  activeNav?: string
  searchPlaceholder?: string
  children: ReactNode
}

export function CorporateModuleShell({
  title,
  subtitle,
  breadcrumbs,
  navChips = [],
  activeNav = 'settings',
  searchPlaceholder = 'Search account',
  children,
}: CorporateModuleShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="flex h-screen min-h-screen overflow-hidden mogzu-module-shell-bg">
      <SharedSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeNav={activeNav}
      />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <SharedHeader
          variant="blended"
          onMobileMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          searchPlaceholder={searchPlaceholder}
        />
        <MogzuCorporateScrollSurface>
          <div className="border-b border-slate-300/[0.1] bg-transparent">
            <div className={`${MOGZU_MODULE_CONTAINER} space-y-2 py-2`}>
              <nav className={MOGZU_BREADCRUMB_PILL} aria-label="Breadcrumb">
                {breadcrumbs.map((crumb, index) => (
                  <span key={`${crumb.label}-${index}`} className="inline-flex items-center gap-2">
                    {index > 0 ? (
                      <ChevronDown className="size-4 rotate-[-90deg] text-[#a0aec0]" aria-hidden />
                    ) : null}
                    {crumb.onClick ? (
                      <button type="button" onClick={crumb.onClick} className={MOGZU_BREADCRUMB_LINK}>
                        {crumb.label}
                      </button>
                    ) : (
                      <span className={MOGZU_BREADCRUMB_CURRENT}>{crumb.label}</span>
                    )}
                  </span>
                ))}
              </nav>
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h1 className={MOGZU_PAGE_TITLE}>{title}</h1>
                  {subtitle ? <p className={`mt-1 ${MOGZU_PAGE_SUBTITLE}`}>{subtitle}</p> : null}
                </div>
                {navChips.length > 0 ? (
                  <div className={MOGZU_NAV_SCROLLER}>
                    {navChips.map((chip) => (
                      <button
                        key={chip.id}
                        type="button"
                        onClick={chip.onClick}
                        className={moduleNavChipClass(!!chip.active)}
                        style={chip.active ? MOGZU_CHIP_ACTIVE_GRADIENT : undefined}
                        aria-current={chip.active ? 'page' : undefined}
                      >
                        {chip.icon}
                        <span>{chip.label}</span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          <div className={`${MOGZU_MODULE_CONTAINER} py-6`}>{children}</div>
        </MogzuCorporateScrollSurface>
      </div>
    </div>
  )
}
