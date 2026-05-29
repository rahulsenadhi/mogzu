import { useCallback, useEffect, useMemo, useState, type ComponentType } from 'react'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { GripVertical, Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import { AdminPageTitleRow } from '@/app/components/admin/AdminPageChrome'
import { DevMockDataBanner } from '@/app/components/global/DevMockDataBanner'
import { useAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import type { ListingCategory, ModuleId } from '@/lib/database.types'

const MODULES: ModuleId[] = ['events', 'gifting', 'spacex_coworking', 'spacex_stay']

const ICON_PICKER_KEYS = [
  'GraduationCap',
  'Palette',
  'Gamepad2',
  'HeartPulse',
  'Mic2',
  'PartyPopper',
  'HandHeart',
  'Utensils',
  'Monitor',
  'Paintbrush',
  'Shield',
  'Car',
  'Cpu',
  'FileBadge2',
  'Star',
  'Building2',
  'Briefcase',
  'Mountain',
  'BedDouble',
  'Sparkles',
] as const

const ICON_REGISTRY = LucideIcons as unknown as Record<string, ComponentType<{ className?: string }>>

const inputClass =
  'h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'

type FormState = {
  module: ModuleId
  name: string
  description: string
  icon: string
  parent_id: string | null
}

type PendingCategoryAction = {
  mode: 'disable' | 'delete'
  row: ListingCategory
  activeCount: number
}

const EMPTY_FORM: FormState = {
  module: 'events',
  name: '',
  description: '',
  icon: 'Sparkles',
  parent_id: null,
}

export default function AdminCategoryManagementPage() {
  const { profile, role } = useAuth()
  const isAdmin = role === 'mogzu_admin'
  const [rows, setRows] = useState<ListingCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [filterModule, setFilterModule] = useState<ModuleId>('events')
  const [pendingAction, setPendingAction] = useState<PendingCategoryAction | null>(null)
  const [confirmBusy, setConfirmBusy] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error: e } = await db.categories.listAllForAdmin()
    if (e) setError(e.message)
    else setRows((data ?? []) as ListingCategory[])
    setLoading(false)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const byModule = useMemo(
    () =>
      rows
        .filter((r) => r.module === filterModule)
        .sort((a, b) => a.display_order - b.display_order),
    [rows, filterModule],
  )
  const parentsForModule = useMemo(
    () => byModule.filter((r) => r.parent_id == null),
    [byModule],
  )

  const startCreate = () => {
    setEditingId('new')
    setForm({ ...EMPTY_FORM, module: filterModule })
  }

  const startEdit = (row: ListingCategory) => {
    setEditingId(row.id)
    setForm({
      module: row.module,
      name: row.name,
      description: row.description ?? '',
      icon: row.icon ?? 'Sparkles',
      parent_id: row.parent_id,
    })
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAdmin || !profile) return
    if (!form.name.trim()) {
      setError('Name is required.')
      return
    }
    setSaving(true)
    setError('')

    if (editingId === 'new') {
      const sameModule = rows.filter((r) => r.module === form.module)
      const nextOrder = sameModule.reduce((m, r) => Math.max(m, r.display_order), -1) + 1
      const { error: insertError } = await db.categories.create({
        module: form.module,
        name: form.name.trim(),
        description: form.description.trim() || null,
        icon: form.icon || null,
        parent_id: form.parent_id,
        display_order: nextOrder,
        is_active: true,
      })
      if (insertError) setError(insertError.message)
      else {
        await db.userActivity.log(profile.id, 'category.created', 'listing_categories', null, {
          name: form.name,
          module: form.module,
        })
      }
    } else if (editingId) {
      const { error: updateError } = await db.categories.update(editingId, {
        module: form.module,
        name: form.name.trim(),
        description: form.description.trim() || null,
        icon: form.icon || null,
        parent_id: form.parent_id,
      })
      if (updateError) setError(updateError.message)
      else {
        await db.userActivity.log(
          profile.id,
          'category.updated',
          'listing_categories',
          editingId,
          { name: form.name },
        )
      }
    }

    setSaving(false)
    setEditingId(null)
    await load()
  }

  const handleToggle = async (row: ListingCategory) => {
    if (!isAdmin || !profile) return
    if (!row.is_active) {
      const { error: e } = await db.categories.toggle(row.id, true)
      if (e) setError(e.message)
      else {
        await db.userActivity.log(profile.id, 'category.enabled', 'listing_categories', row.id)
        await load()
      }
      return
    }
    const { data: count } = await db.categories.countActiveListings(row.id)
    setPendingAction({
      mode: 'disable',
      row,
      activeCount: typeof count === 'number' ? count : 0,
    })
  }

  const handleSoftDelete = async (row: ListingCategory) => {
    if (!isAdmin || !profile) return
    const { data: count } = await db.categories.countActiveListings(row.id)
    setPendingAction({
      mode: 'delete',
      row,
      activeCount: typeof count === 'number' ? count : 0,
    })
  }

  const handleConfirmAction = async () => {
    if (!pendingAction || !profile) return
    setConfirmBusy(true)
    const { row, mode } = pendingAction
    const { error: e } = await db.categories.toggle(row.id, false)
    setConfirmBusy(false)
    if (e) setError(e.message)
    else {
      await db.userActivity.log(
        profile.id,
        mode === 'delete' ? 'category.soft_deleted' : 'category.disabled',
        'listing_categories',
        row.id,
      )
      setPendingAction(null)
      await load()
    }
  }

  const handleReorder = async (sorted: ListingCategory[]) => {
    if (!isAdmin) return
    setRows((prev) => {
      const others = prev.filter((r) => r.module !== filterModule)
      return [...others, ...sorted.map((r, i) => ({ ...r, display_order: i }))]
    })
    const { error: e } = await db.categories.reorder(
      sorted.map((r, i) => ({ id: r.id, display_order: i })),
    )
    if (e) setError(e.message)
    else if (profile) {
      await db.userActivity.log(profile.id, 'category.reordered', 'listing_categories', null, {
        module: filterModule,
      })
    }
  }

  if (!isAdmin) {
    return (
      <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        Category management is restricted to mogzu_admin.
      </div>
    )
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <AdminPageTitleRow
            title="Categories"
            totalLabel={`${rows.length} total · ${rows.filter((r) => r.is_active).length} active`}
          />
          <button
            type="button"
            onClick={startCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
          >
            <Plus className="size-4" /> New category
          </button>
        </div>

        {!loading && rows.length === 0 ? <DevMockDataBanner /> : null}

        {error && (
          <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
            {error}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {MODULES.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setFilterModule(m)}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                filterModule === m
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-600'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {editingId && (
          <form
            onSubmit={handleSave}
            className="space-y-3 rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4 shadow-sm"
          >
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="block space-y-1">
                <span className="text-xs font-medium text-slate-700">Module</span>
                <select
                  className={inputClass}
                  value={form.module}
                  onChange={(e) => setForm((p) => ({ ...p, module: e.target.value as ModuleId }))}
                >
                  {MODULES.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block space-y-1 sm:col-span-2">
                <span className="text-xs font-medium text-slate-700">Name *</span>
                <input
                  className={inputClass}
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  required
                />
              </label>
              <label className="block space-y-1 sm:col-span-2">
                <span className="text-xs font-medium text-slate-700">Description</span>
                <input
                  className={inputClass}
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-medium text-slate-700">Parent</span>
                <select
                  className={inputClass}
                  value={form.parent_id ?? ''}
                  onChange={(e) => setForm((p) => ({ ...p, parent_id: e.target.value || null }))}
                >
                  <option value="">— Top-level —</option>
                  {parentsForModule
                    .filter((p) => p.id !== editingId)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                </select>
              </label>
            </div>

            <div>
              <p className="mb-1 text-xs font-medium text-slate-700">Icon</p>
              <div className="flex flex-wrap gap-1">
                {ICON_PICKER_KEYS.map((key) => {
                  const Icon = ICON_REGISTRY[key]
                  const on = form.icon === key
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, icon: key }))}
                      className={`flex size-9 items-center justify-center rounded-md border ${
                        on
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-slate-200 bg-white text-slate-500'
                      }`}
                      aria-label={key}
                    >
                      {Icon ? <Icon className="size-4" /> : key.slice(0, 2)}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingId(null)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-700 hover:bg-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving && <Loader2 className="size-3 animate-spin" />}
                {editingId === 'new' ? 'Create' : 'Save changes'}
              </button>
            </div>
          </form>
        )}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center p-8 text-sm text-slate-500">
              <Loader2 className="mr-2 size-4 animate-spin" /> Loading categories...
            </div>
          ) : byModule.length === 0 ? (
            <p className="p-6 text-center text-xs text-slate-500">
              No categories in {filterModule}. Create one above.
            </p>
          ) : (
            <CategoryRowList
              rows={byModule}
              onEdit={startEdit}
              onToggle={handleToggle}
              onDelete={handleSoftDelete}
              onReorder={handleReorder}
            />
          )}
        </div>
      </div>
      {pendingAction && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/45 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">
              {pendingAction.mode === 'delete' ? 'Soft-delete category?' : 'Disable category?'}
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              <span className="font-semibold text-slate-900">{pendingAction.row.name}</span>{' '}
              currently has{' '}
              <span className="font-semibold text-slate-900">{pendingAction.activeCount}</span>{' '}
              active listing(s).
            </p>
            <p className="mt-1 text-sm text-slate-600">
              {pendingAction.mode === 'delete'
                ? 'This keeps booking history intact but removes category visibility in the catalogue.'
                : 'Disabling hides listings in this category from the catalogue until re-enabled.'}
            </p>
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
              Action affects buyer-facing discoverability immediately.
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPendingAction(null)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                disabled={confirmBusy}
                className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
              >
                {confirmBusy && <Loader2 className="size-3 animate-spin" />}
                {pendingAction.mode === 'delete' ? 'Confirm soft-delete' : 'Confirm disable'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DndProvider>
  )
}

function CategoryRowList({
  rows,
  onEdit,
  onToggle,
  onDelete,
  onReorder,
}: {
  rows: ListingCategory[]
  onEdit: (r: ListingCategory) => void
  onToggle: (r: ListingCategory) => void
  onDelete: (r: ListingCategory) => void
  onReorder: (sorted: ListingCategory[]) => void
}) {
  const [ordered, setOrdered] = useState(rows)
  useEffect(() => {
    setOrdered(rows)
  }, [rows])

  const move = (from: number, to: number) => {
    setOrdered((prev) => {
      const next = [...prev]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return next
    })
  }

  const commit = () => onReorder(ordered)

  return (
    <ul className="divide-y divide-slate-100 text-sm">
      {ordered.map((row, idx) => (
        <CategoryRow
          key={row.id}
          row={row}
          index={idx}
          onMove={move}
          onDrop={commit}
          onEdit={onEdit}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </ul>
  )
}

function CategoryRow({
  row,
  index,
  onMove,
  onDrop,
  onEdit,
  onToggle,
  onDelete,
}: {
  row: ListingCategory
  index: number
  onMove: (from: number, to: number) => void
  onDrop: () => void
  onEdit: (r: ListingCategory) => void
  onToggle: (r: ListingCategory) => void
  onDelete: (r: ListingCategory) => void
}) {
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: 'CATEGORY',
      item: { index },
      end: () => onDrop(),
      collect: (m) => ({ isDragging: m.isDragging() }),
    }),
    [index, onDrop],
  )

  const [, drop] = useDrop(
    () => ({
      accept: 'CATEGORY',
      hover: (item: { index: number }) => {
        if (item.index !== index) {
          onMove(item.index, index)
          item.index = index
        }
      },
    }),
    [index, onMove],
  )

  const Icon = row.icon ? ICON_REGISTRY[row.icon] : null

  return (
    <li
      ref={(node) => {
        drop(drag(node))
      }}
      className={`flex flex-wrap items-center gap-3 p-3 ${
        isDragging ? 'opacity-40' : ''
      } ${!row.is_active ? 'bg-slate-50' : ''}`}
    >
      <GripVertical className="size-4 cursor-grab text-slate-400" />
      {Icon && <Icon className="size-4 text-slate-600" />}
      <div className="min-w-0 flex-1">
        <p className="font-medium text-slate-900">{row.name}</p>
        <p className="text-[11px] text-slate-500">
          {row.parent_id ? '↳ subcategory' : 'parent'} · {row.description ?? ''}
        </p>
      </div>
      <span
        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
          row.is_active
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
            : 'bg-slate-100 text-slate-600 border border-slate-200'
        }`}
      >
        {row.is_active ? 'Active' : 'Disabled'}
      </span>
      <button
        type="button"
        onClick={() => onToggle(row)}
        className="rounded-md border border-slate-200 px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-50"
      >
        {row.is_active ? 'Disable' : 'Enable'}
      </button>
      <button
        type="button"
        onClick={() => onEdit(row)}
        className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-50"
      >
        <Pencil className="size-3" /> Edit
      </button>
      <button
        type="button"
        onClick={() => onDelete(row)}
        className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-white px-2 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-50"
      >
        <Trash2 className="size-3" /> Remove
      </button>
    </li>
  )
}
