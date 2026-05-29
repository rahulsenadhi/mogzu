import { Search } from 'lucide-react'
import { ADMIN_MODULE } from '@/app/components/admin/adminModuleStyles'
import { leadOpsChipClass } from '@/app/components/leads/leadOpsStyles'
import { LEAD_QUICK_FILTERS, type LeadQuickFilter } from '@/lib/leadTriageUtils'
type LeadTriageToolbarProps = {
  search: string
  onSearchChange: (value: string) => void
  quickFilter: LeadQuickFilter
  onQuickFilterChange: (value: LeadQuickFilter) => void
  visibleCount: number
  totalCount: number
  searchPlaceholder?: string
  sticky?: boolean
}
export function LeadTriageToolbar({
  search,
  onSearchChange,
  quickFilter,
  onQuickFilterChange,
  visibleCount,
  totalCount,
  searchPlaceholder = 'Name, company, email…',
  sticky = true,
}: LeadTriageToolbarProps) {
  return (
    <div
      className={`${ADMIN_MODULE.card} space-y-4 p-4 sm:p-5 ${sticky ? 'sticky top-0 z-10' : ''}`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label="Search leads"
            className={`${ADMIN_MODULE.input} pl-10`}
          />
        </div>
        <p className="shrink-0 text-sm text-slate-500">
          <span className="font-semibold text-slate-900">{visibleCount}</span> of{' '}
          <span className="font-semibold text-slate-900">{totalCount}</span> leads
        </p>
      </div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Quick lead filters">
        {LEAD_QUICK_FILTERS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => onQuickFilterChange(preset.id)}
            aria-pressed={quickFilter === preset.id}
            className={leadOpsChipClass(quickFilter === preset.id)}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  )
}
