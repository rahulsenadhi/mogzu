import { useEffect, useState, type ReactNode } from 'react'
import { Filter, Search, X } from 'lucide-react'
import { LEAD_OPS, leadOpsChipClass } from '@/app/components/leads/leadOpsStyles'
import { ENQUIRY_VERTICALS, type EnquiryVertical } from '@/lib/leadEnquiryVertical'
import { LEAD_SOURCE_FILTERS, type LeadSourceFilter } from '@/lib/leadSources'
import { LEAD_QUICK_FILTERS, type LeadQuickFilter } from '@/lib/leadTriageUtils'
import type { LeadStatus } from '@/lib/publicLeads'

export type StatusFilterValue = LeadStatus | 'all'

const STATUS_TABS: { value: StatusFilterValue; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'converted', label: 'Won' },
  { value: 'closed', label: 'Closed' },
  { value: 'spam', label: 'Spam' },
]

type LeadFilterBarProps = {
  search: string
  onSearchChange: (v: string) => void
  statusFilter: StatusFilterValue
  onStatusFilterChange: (v: StatusFilterValue) => void
  statusCounts: Record<string, number>
  vertical: EnquiryVertical
  onVerticalChange: (v: EnquiryVertical) => void
  sourceFilter: LeadSourceFilter
  onSourceFilterChange: (v: LeadSourceFilter) => void
  quickFilter: LeadQuickFilter
  onQuickFilterChange: (v: LeadQuickFilter) => void
  visibleCount: number
  totalCount: number
  trailing?: ReactNode
}

export function LeadFilterBar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  statusCounts,
  vertical,
  onVerticalChange,
  sourceFilter,
  onSourceFilterChange,
  quickFilter,
  onQuickFilterChange,
  visibleCount,
  totalCount,
  trailing,
}: LeadFilterBarProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const hasAdvanced =
    vertical !== 'all' ||
    sourceFilter !== 'all' ||
    quickFilter !== 'all' ||
    statusFilter !== 'all' ||
    search.trim().length > 0

  useEffect(() => {
    if (quickFilter !== 'all' || vertical !== 'all' || sourceFilter !== 'all') {
      setShowAdvanced(true)
    }
  }, [quickFilter, vertical, sourceFilter])

  const handleClear = () => {
    onSearchChange('')
    onStatusFilterChange('all')
    onVerticalChange('all')
    onSourceFilterChange('all')
    onQuickFilterChange('all')
  }

  const statusLabel = STATUS_TABS.find((t) => t.value === statusFilter)?.label
  const quickLabel = LEAD_QUICK_FILTERS.find((p) => p.id === quickFilter)?.label
  const verticalLabel = ENQUIRY_VERTICALS.find((v) => v.id === vertical)?.label
  const sourceLabel = LEAD_SOURCE_FILTERS.find((s) => s.id === sourceFilter)?.label

  return (
    <div className={`${LEAD_OPS.surface} space-y-4 p-4 sm:p-5`}>
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
            placeholder="Search name, company, phone, notes…"
            aria-label="Search leads"
            className={`${LEAD_OPS.input} pl-10`}
          />
        </div>
        <p className="shrink-0 text-sm text-slate-500">
          <span className="font-semibold text-slate-900">{visibleCount}</span> of{' '}
          <span className="font-semibold text-slate-900">{totalCount}</span> leads
        </p>
        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          aria-expanded={showAdvanced}
          className={`${LEAD_OPS.secondaryBtn} min-h-[44px] shrink-0`}
        >
          <Filter className="size-4" />
          Filters
          {hasAdvanced ? (
            <span className="rounded-full bg-[#2563EB] px-1.5 py-0.5 text-[10px] text-white">
              on
            </span>
          ) : null}
        </button>
        {hasAdvanced ? (
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex min-h-[44px] items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            <X className="size-3.5" />
            Clear all
          </button>
        ) : null}
        {trailing}
      </div>

      {hasAdvanced ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-500">Active:</span>
          {statusFilter !== 'all' && statusLabel ? (
            <button
              type="button"
              onClick={() => onStatusFilterChange('all')}
              className={leadOpsChipClass(true)}
            >
              Status: {statusLabel} ×
            </button>
          ) : null}
          {quickFilter !== 'all' && quickLabel ? (
            <button
              type="button"
              onClick={() => onQuickFilterChange('all')}
              className={leadOpsChipClass(true)}
            >
              {quickLabel} ×
            </button>
          ) : null}
          {vertical !== 'all' && verticalLabel ? (
            <button
              type="button"
              onClick={() => onVerticalChange('all')}
              className={leadOpsChipClass(true)}
            >
              {verticalLabel} ×
            </button>
          ) : null}
          {sourceFilter !== 'all' && sourceLabel ? (
            <button
              type="button"
              onClick={() => onSourceFilterChange('all')}
              className={leadOpsChipClass(true)}
            >
              {sourceLabel} ×
            </button>
          ) : null}
        </div>
      ) : null}

      <div
        className="flex gap-1 overflow-x-auto pb-0.5 scrollbar-thin"
        role="tablist"
        aria-label="Lead status"
      >
        {STATUS_TABS.map((tab) => {
          const active = statusFilter === tab.value
          const count = statusCounts[tab.value] ?? 0
          return (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onStatusFilterChange(tab.value)}
              className={`${leadOpsChipClass(active)} shrink-0 gap-1.5`}
            >
              {tab.label}
              <span
                className={`rounded-md px-1.5 py-0.5 text-[10px] tabular-nums ${
                  active ? 'bg-white/25 text-white' : 'bg-white/80 text-slate-600'
                }`}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {showAdvanced ? (
        <div className="space-y-3 border-t border-slate-100 pt-3">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Product line
            </p>
            <div className="flex flex-wrap gap-2">
              {ENQUIRY_VERTICALS.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => onVerticalChange(v.id)}
                  aria-pressed={vertical === v.id}
                  className={leadOpsChipClass(vertical === v.id)}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Source
            </p>
            <div className="flex flex-wrap gap-2">
              {LEAD_SOURCE_FILTERS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onSourceFilterChange(s.id)}
                  aria-pressed={sourceFilter === s.id}
                  className={leadOpsChipClass(sourceFilter === s.id)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Quick filters
            </p>
            <div className="flex flex-wrap gap-2">
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
        </div>
      ) : null}
    </div>
  )
}
