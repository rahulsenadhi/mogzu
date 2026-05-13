import { useCallback, useMemo, useState, type ComponentType } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useDrag, useDrop } from 'react-dnd';
import { GripVertical, Pencil, Trash2 } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { toast } from 'sonner';
import { AdminPageTitleRow } from '@/app/components/admin/AdminPageChrome';
import { SecondaryCTAButton, GhostCTAButton } from '@/app/components/ui/ListingButtons';
import {
  countListingsForCategoryName,
  loadAdminCategories,
  saveAdminCategories,
  type AdminCategoryKind,
  type AdminCategoryRow,
} from '@/utils/adminCategoriesStorage';

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
  'Sparkles',
  'Music',
  'Camera',
  'Users',
  'Building2',
  'Plane',
  'Coffee',
  'Gift',
  'Calendar',
] as const;

function iconFor(key: string) {
  const I = (LucideIcons as Record<string, ComponentType<{ className?: string }>>)[key];
  return I ?? LucideIcons.Circle;
}

const DND_TYPE = 'ADMIN_CATEGORY';

function CategoryRow({
  row,
  index,
  moveRow,
  listingCount,
  onEdit,
  onDelete,
  onToggleActive,
}: {
  row: AdminCategoryRow;
  index: number;
  moveRow: (from: number, to: number, kind: AdminCategoryKind) => void;
  listingCount: number;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
}) {
  const [{ isDragging }, dragRef] = useDrag({
    type: DND_TYPE,
    item: { index, kind: row.kind },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  const [, dropRef] = useDrop({
    accept: DND_TYPE,
    drop: (item: { index: number; kind: AdminCategoryKind }) => {
      if (item.kind !== row.kind) return;
      if (item.index === index) return;
      moveRow(item.index, index, row.kind);
    },
  });

  const Icon = iconFor(row.iconKey);
  const ref = useCallback(
    (node: HTMLDivElement | null) => {
      dragRef(dropRef(node));
    },
    [dragRef, dropRef],
  );

  return (
    <div
      ref={ref}
      className={`flex items-center gap-2 border border-slate-100 rounded-lg px-2 py-2 bg-white ${
        isDragging ? 'opacity-90 scale-[1.02] ring-2 ring-[#2563EB]' : ''
      }`}
    >
      <span className="text-slate-400 cursor-grab active:cursor-grabbing" title="Drag">
        <GripVertical className="size-4" />
      </span>
      <Icon className="size-4 text-[#2563EB] shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-900 truncate">{row.name}</p>
        <p className="text-xs text-slate-500">{listingCount} listings</p>
      </div>
      <label className="flex items-center gap-1 text-xs text-slate-600">
        <input
          type="checkbox"
          checked={row.active}
          onChange={onToggleActive}
          className="rounded border-slate-300"
        />
        Active
      </label>
      <button
        type="button"
        className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
        onClick={onEdit}
        aria-label="Edit"
        title="Edit"
      >
        <Pencil className="size-4" />
      </button>
      <button
        type="button"
        className="p-2 rounded-lg hover:bg-rose-50 text-rose-600 disabled:opacity-40"
        disabled={listingCount > 0}
        onClick={onDelete}
        aria-label="Delete"
        title={listingCount > 0 ? `Cannot delete — ${listingCount} listings exist.` : 'Delete'}
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}

export default function AdminCategoryManagementPage() {
  const [rows, setRows] = useState<AdminCategoryRow[]>(() => loadAdminCategories());
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<AdminCategoryRow | null>(null);
  const [form, setForm] = useState<Partial<AdminCategoryRow>>({});
  const [confirmHide, setConfirmHide] = useState<AdminCategoryRow | null>(null);

  const activities = useMemo(
    () => [...rows.filter((r) => r.kind === 'activities')].sort((a, b) => a.display_order - b.display_order),
    [rows],
  );
  const services = useMemo(
    () => [...rows.filter((r) => r.kind === 'services')].sort((a, b) => a.display_order - b.display_order),
    [rows],
  );

  const persist = (next: AdminCategoryRow[]) => {
    saveAdminCategories(next);
    setRows(next);
  };

  const moveRow = (from: number, to: number, kind: AdminCategoryKind) => {
    setRows((prev) => {
      const list = prev.filter((r) => r.kind === kind).sort((a, b) => a.display_order - b.display_order);
      const item = list[from];
      if (!item) return prev;
      const nextList = [...list];
      nextList.splice(from, 1);
      nextList.splice(to, 0, item);
      const reordered = nextList.map((r, i) => ({ ...r, display_order: i }));
      const rest = prev.filter((r) => r.kind !== kind);
      const next = [...rest, ...reordered];
      saveAdminCategories(next);
      toast.success('Category order saved.');
      return next;
    });
  };

  const openAdd = (kind: AdminCategoryKind) => {
    setEditing(null);
    setForm({
      name: '',
      kind,
      iconKey: 'Star',
      description: '',
      active: true,
    });
    setModal(true);
  };

  const openEdit = (row: AdminCategoryRow) => {
    setEditing(row);
    setForm({ ...row });
    setModal(true);
  };

  const saveModal = () => {
    const name = (form.name ?? '').trim();
    if (!name) {
      toast.error('Name is required');
      return;
    }
    const kind = (form.kind ?? 'activities') as AdminCategoryKind;
    if (editing) {
      const next = rows.map((r) =>
        r.id === editing.id
          ? {
              ...r,
              name,
              kind,
              iconKey: form.iconKey ?? 'Star',
              description: (form.description ?? '').trim(),
              active: form.active !== false,
            }
          : r,
      );
      persist(next);
      toast.success('Category updated.');
    } else {
      const id = `cat-${Date.now()}`;
      const order = rows.filter((r) => r.kind === kind).length;
      const row: AdminCategoryRow = {
        id,
        name,
        kind,
        iconKey: form.iconKey ?? 'Star',
        description: (form.description ?? '').trim(),
        active: form.active !== false,
        display_order: order,
      };
      persist([...rows, row]);
      toast.success('Category created.');
    }
    setModal(false);
  };

  const handleToggleActive = (row: AdminCategoryRow) => {
    const c = countListingsForCategoryName(row.name);
    if (row.active && c > 0) {
      setConfirmHide(row);
      return;
    }
    persist(rows.map((r) => (r.id === row.id ? { ...r, active: !r.active } : r)));
  };

  const confirmHideAction = () => {
    if (!confirmHide) return;
    persist(rows.map((r) => (r.id === confirmHide.id ? { ...r, active: false } : r)));
    setConfirmHide(null);
    toast.success('Category hidden.');
  };

  const handleDelete = (row: AdminCategoryRow) => {
    const c = countListingsForCategoryName(row.name);
    if (c > 0) return;
    persist(rows.filter((r) => r.id !== row.id));
    toast.success('Category removed.');
  };

  const renderPanel = (kind: AdminCategoryKind, list: AdminCategoryRow[]) => (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{kind === 'activities' ? 'Activities' : 'Services'}</h2>
          <p className="text-sm text-slate-500">{list.length} categories</p>
        </div>
        <SecondaryCTAButton className="!h-10 !min-h-0 text-sm" onClick={() => openAdd(kind)}>
          Add Category
        </SecondaryCTAButton>
      </div>
      <div className="space-y-2">
        {list.map((row, index) => (
          <CategoryRow
            key={row.id}
            row={row}
            index={index}
            moveRow={moveRow}
            listingCount={countListingsForCategoryName(row.name)}
            onEdit={() => openEdit(row)}
            onDelete={() => handleDelete(row)}
            onToggleActive={() => handleToggleActive(row)}
          />
        ))}
      </div>
      <p className="text-xs text-slate-500 flex items-center gap-1">
        <GripVertical className="size-3.5" /> Drag rows to reorder category display
      </p>
    </div>
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-6">
        <AdminPageTitleRow
          title="Category Management"
          totalLabel="Manage listing categories, icons, and display order."
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {renderPanel('activities', activities)}
          {renderPanel('services', services)}
        </div>

        {modal ? (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-xl bg-white p-5 shadow-xl space-y-3 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold">{editing ? 'Edit Category' : 'Add New Category'}</h3>
              <label className="block text-sm font-medium">Name</label>
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.name ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
              <label className="block text-sm font-medium">Type</label>
              <select
                className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.kind ?? 'activities'}
                onChange={(e) => setForm((f) => ({ ...f, kind: e.target.value as AdminCategoryKind }))}
              >
                <option value="activities">Activities</option>
                <option value="services">Services</option>
              </select>
              <p className="text-sm font-medium">Icon</p>
              <div className="grid grid-cols-12 gap-2">
                {ICON_PICKER_KEYS.map((k) => {
                  const Icon = iconFor(k);
                  const sel = form.iconKey === k;
                  return (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, iconKey: k }))}
                      className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-[10px] ${
                        sel ? 'border-[#2563EB] bg-blue-50' : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="size-6 text-[#2563EB]" />
                      <span className="text-[10px] text-slate-500 truncate w-full text-center">{k}</span>
                    </button>
                  );
                })}
              </div>
              <label className="block text-sm font-medium">Description</label>
              <textarea
                rows={2}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.description ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.active !== false}
                  onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                />
                Active
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <GhostCTAButton onClick={() => setModal(false)}>Cancel</GhostCTAButton>
                <SecondaryCTAButton onClick={saveModal}>{editing ? 'Update Category' : 'Create Category'}</SecondaryCTAButton>
              </div>
            </div>
          </div>
        ) : null}

        {confirmHide ? (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl space-y-3">
              <div className="text-sm text-slate-700">
                This category has {countListingsForCategoryName(confirmHide.name)} active listings. Hiding it will remove them from search.
                Are you sure?
              </div>
              <div className="flex justify-end gap-2">
                <GhostCTAButton onClick={() => setConfirmHide(null)}>Cancel</GhostCTAButton>
                <SecondaryCTAButton onClick={confirmHideAction}>Confirm</SecondaryCTAButton>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </DndProvider>
  );
}
