import { Loader2, UserPlus, X } from 'lucide-react'
import { LEAD_OPS } from '@/app/components/leads/leadOpsStyles'
import type { UserProfile } from '@/lib/database.types'

type AssigneeRow = UserProfile & { email?: string | null }

type LeadBulkAssignBarProps = {
  selectedCount: number
  visibleCount: number
  assignees: AssigneeRow[]
  assigneeId: string
  onAssigneeChange: (id: string) => void
  onAssign: () => void
  onSelectAllVisible: () => void
  onClear: () => void
  onExitBulkMode: () => void
  busy: boolean
}

export function LeadBulkAssignBar({
  selectedCount,
  visibleCount,
  assignees,
  assigneeId,
  onAssigneeChange,
  onAssign,
  onSelectAllVisible,
  onClear,
  onExitBulkMode,
  busy,
}: LeadBulkAssignBarProps) {
  if (selectedCount === 0) return null

  return (
    <div
      className={`${LEAD_OPS.surfaceMuted} flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between`}
      role="region"
      aria-label="Bulk assign leads"
    >
      <p className="text-sm font-medium text-slate-800">
        {selectedCount} lead{selectedCount !== 1 ? 's' : ''} selected
        {visibleCount > selectedCount ? (
          <button
            type="button"
            onClick={onSelectAllVisible}
            className="ml-2 text-xs font-semibold text-[#2563eb] hover:underline"
          >
            Select all {visibleCount} visible
          </button>
        ) : null}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={assigneeId}
          onChange={(e) => onAssigneeChange(e.target.value)}
          disabled={busy || assignees.length === 0}
          className={`${LEAD_OPS.input} min-h-[40px] min-w-[180px] text-xs`}
          aria-label="Assign selected leads to"
        >
          <option value="">Choose owner…</option>
          {assignees.map((o) => (
            <option key={o.id} value={o.id}>
              {o.full_name ?? o.email ?? o.id.slice(0, 8)}
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={busy || !assigneeId}
          onClick={onAssign}
          className={`${LEAD_OPS.primaryBtn} text-xs`}
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
          Assign selected
        </button>
        <button type="button" onClick={onClear} className={`${LEAD_OPS.ghostBtn} text-xs`}>
          Clear
        </button>
        <button
          type="button"
          onClick={onExitBulkMode}
          className={`${LEAD_OPS.ghostBtn} text-xs`}
          aria-label="Exit bulk selection"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  )
}
