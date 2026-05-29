import { useCallback, useEffect, useState, type MouseEvent } from 'react'
import { Bookmark, BookmarkPlus, X } from 'lucide-react'
import { LEAD_OPS, leadOpsChipClass } from '@/app/components/leads/leadOpsStyles'
import {
  deleteLeadSavedView,
  describeLeadSavedView,
  listLeadSavedViews,
  saveLeadSavedView,
  snapshotsEqual,
  suggestLeadSavedViewName,
  type LeadFilterSnapshot,
  type LeadSavedView,
} from '@/lib/leadSavedViews'

type LeadSavedViewsBarProps = {
  surface: 'inbox' | 'pipeline'
  current: LeadFilterSnapshot
  onApply: (snapshot: LeadFilterSnapshot) => void
}

export function LeadSavedViewsBar({ surface, current, onApply }: LeadSavedViewsBarProps) {
  const [views, setViews] = useState<LeadSavedView[]>([])
  const [saving, setSaving] = useState(false)
  const [draftName, setDraftName] = useState('')
  const [saveError, setSaveError] = useState('')

  const refresh = useCallback(() => {
    setViews(listLeadSavedViews(surface))
  }, [surface])

  useEffect(() => {
    refresh()
  }, [refresh])

  const activeViewId =
    views.find((v) => snapshotsEqual(v.snapshot, current))?.id ?? null

  const handleSave = () => {
    const name = draftName.trim() || suggestLeadSavedViewName(current)
    const created = saveLeadSavedView(name, current)
    if (!created) {
      setSaveError(`Maximum ${12} saved views — delete one to add another.`)
      return
    }
    setSaveError('')
    setSaving(false)
    setDraftName('')
    refresh()
  }

  const handleDelete = (id: string, e: MouseEvent) => {
    e.stopPropagation()
    deleteLeadSavedView(id)
    refresh()
  }

  if (views.length === 0 && !saving) {
    return (
      <div className={`${LEAD_OPS.surfaceMuted} flex flex-wrap items-center gap-2 px-4 py-3`}>
        <button
          type="button"
          onClick={() => {
            setDraftName(suggestLeadSavedViewName(current))
            setSaving(true)
            setSaveError('')
          }}
          className={`${LEAD_OPS.secondaryBtn} text-xs`}
        >
          <BookmarkPlus className="size-4" aria-hidden />
          Save view
        </button>
        <p className="text-xs text-slate-500">Store your current filters for one-click recall.</p>
        {saving ? (
          <SaveDraftRow
            draftName={draftName}
            onDraftChange={setDraftName}
            onSave={handleSave}
            onCancel={() => {
              setSaving(false)
              setSaveError('')
            }}
            error={saveError}
          />
        ) : null}
      </div>
    )
  }

  return (
    <div className={`${LEAD_OPS.surfaceMuted} space-y-2 px-4 py-3`} role="region" aria-label="Saved lead views">
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <Bookmark className="size-3.5" aria-hidden />
          Saved views
        </span>
        {views.map((view) => {
          const active = view.id === activeViewId
          return (
            <div
              key={view.id}
              className={`inline-flex items-stretch overflow-hidden rounded-full border ${
                active ? 'border-[#2563eb] bg-[#2563eb] text-white' : 'border-slate-200 bg-white'
              }`}
            >
              <button
                type="button"
                title={describeLeadSavedView(view)}
                onClick={() => onApply(view.snapshot)}
                className={`px-3 py-1.5 text-xs font-semibold ${
                  active ? 'text-white' : 'text-slate-700 hover:bg-slate-50'
                }`}
                aria-pressed={active}
              >
                {view.name}
              </button>
              <button
                type="button"
                aria-label={`Delete saved view ${view.name}`}
                className={`border-l px-1.5 ${
                  active
                    ? 'border-white/30 text-white/80 hover:bg-white/15'
                    : 'border-slate-200 text-slate-500 hover:bg-slate-100'
                }`}
                onClick={(e) => handleDelete(view.id, e)}
              >
                <X className="size-3" aria-hidden />
              </button>
            </div>
          )
        })}
        {!saving ? (
          <button
            type="button"
            onClick={() => {
              setDraftName(suggestLeadSavedViewName(current))
              setSaving(true)
              setSaveError('')
            }}
            className={`${LEAD_OPS.ghostBtn} text-xs`}
          >
            <BookmarkPlus className="size-4" aria-hidden />
            Save current
          </button>
        ) : null}
      </div>
      {saving ? (
        <SaveDraftRow
          draftName={draftName}
          onDraftChange={setDraftName}
          onSave={handleSave}
          onCancel={() => {
            setSaving(false)
            setSaveError('')
          }}
          error={saveError}
        />
      ) : null}
    </div>
  )
}

function SaveDraftRow({
  draftName,
  onDraftChange,
  onSave,
  onCancel,
  error,
}: {
  draftName: string
  onDraftChange: (v: string) => void
  onSave: () => void
  onCancel: () => void
  error: string
}) {
  return (
    <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
      <input
        type="text"
        value={draftName}
        onChange={(e) => onDraftChange(e.target.value)}
        placeholder="View name"
        aria-label="Saved view name"
        className={`${LEAD_OPS.input} min-h-[40px] flex-1 text-sm`}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            onSave()
          }
          if (e.key === 'Escape') onCancel()
        }}
      />
      <div className="flex gap-2">
        <button type="button" onClick={onSave} className={`${LEAD_OPS.primaryBtn} text-xs`}>
          Save
        </button>
        <button type="button" onClick={onCancel} className={`${LEAD_OPS.ghostBtn} text-xs`}>
          Cancel
        </button>
      </div>
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
    </div>
  )
}
