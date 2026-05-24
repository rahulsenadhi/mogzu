import { Search } from 'lucide-react'
import { MOGZU_GLASS_INPUT } from '@/app/components/ui/mogzuGlassStyles'
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
      className={`${sticky ? 'sticky top-0 z-10' : ''} -mx-1 space-y-3 border-b border-white/60 bg-white/80 px-1 py-3 backdrop-blur-xl`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-medium text-slate-500">
          Showing <span className="font-semibold text-slate-800">{visibleCount}</span> of{' '}
          <span className="font-semibold text-slate-800">{totalCount}</span> leads
        </p>
        <div className={`w-full max-w-sm ${MOGZU_GLASS_INPUT}`}>
          <Search className="size-4 shrink-0 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label="Search leads"
            className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Quick lead filters">
        {LEAD_QUICK_FILTERS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => onQuickFilterChange(preset.id)}
            aria-pressed={quickFilter === preset.id}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#93c5fd]/60 ${
              quickFilter === preset.id
                ? 'bg-[#2563EB] text-white shadow-sm'
                : 'border border-slate-200 bg-white/90 text-slate-600 hover:border-slate-300 hover:bg-white'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  )
}
