import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Eye, Pencil, Plus, Trash2, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '@/app/components/ui/switch';
import { AdminPageTitleRow } from '@/app/components/admin/AdminPageChrome';
import { CORP } from '@/app/lib/adminTheme';
import type { MogzuDirectListing, MogzuListingModule } from '@/app/lib/mogzuDomain';
import {
  loadMogzuDirectCatalogueForAdmin,
  saveMogzuDirectCatalogueForAdmin,
} from '@/utils/mogzuDirectCatalogueAdmin';
import { matchesPriceRange, matchesSourceFilter, parsePriceLike, type CatalogueSourceFilter } from '@/utils/filterContracts';

type ModuleTab = 'all' | MogzuListingModule;

const MODULE_TABS: Array<{ id: ModuleTab; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'dspace', label: 'DSpace' },
  { id: 'gifting', label: 'Gifting' },
  { id: 'events', label: 'Events' },
];

function moduleLabel(module: MogzuListingModule): string {
  if (module === 'dspace') return 'DSpace';
  if (module === 'gifting') return 'Gifting';
  return 'Events';
}

function statusChipClass(status: MogzuDirectListing['status']): string {
  if (status === 'active') return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
  if (status === 'paused') return 'bg-amber-50 text-amber-700 border border-amber-100';
  if (status === 'rejected') return 'bg-rose-50 text-rose-800 border border-rose-100';
  if (status === 'archived') return 'bg-slate-200 text-slate-700 border border-slate-300';
  return 'bg-slate-100 text-slate-700 border border-slate-200';
}

function formatPriceLabel(row: MogzuDirectListing): string {
  if (row.pricing_mode === 'on_request') return 'On request';
  if (row.pricing_mode === 'negotiable') return `From ₹${row.price} / ${row.price_unit} · negotiable`;
  return `₹${row.price} / ${row.price_unit}`;
}

export default function MogzuDirectPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ModuleTab>('all');
  const [rows, setRows] = useState<MogzuDirectListing[]>(() => loadMogzuDirectCatalogueForAdmin());
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState<CatalogueSourceFilter>('all');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [availabilityDate, setAvailabilityDate] = useState('');
  const [capacityFilter, setCapacityFilter] = useState('');
  const [occasionFilter, setOccasionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused' | 'draft' | 'archived'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const kpis = useMemo(() => {
    const total = rows.length;
    const active = rows.filter((r) => r.status === 'active').length;
    const paused = rows.filter((r) => r.status === 'paused').length;
    const draft = rows.filter((r) => r.status === 'draft').length;
    return { total, active, paused, draft };
  }, [rows]);

  const filtered = useMemo(() => {
    let list = activeTab === 'all' ? rows : rows.filter((row) => row.module === activeTab);
    if (categoryFilter !== 'all') {
      list = list.filter((row) => `${row.category} ${row.title} ${row.description_short}`.toLowerCase().includes(categoryFilter.toLowerCase()));
    }
    list = list.filter((row) =>
      matchesSourceFilter(sourceFilter, (row as unknown as { is_mogzu_direct?: boolean }).is_mogzu_direct !== false),
    );
    list = list.filter((row) =>
      matchesPriceRange(
        parsePriceLike((row as unknown as { price?: unknown }).price ?? null),
        budgetMin ? Number(budgetMin) : undefined,
        budgetMax ? Number(budgetMax) : undefined,
      ),
    );
    if (cityFilter.trim()) {
      list = list.filter((row) =>
        `${(row as unknown as { city?: string }).city ?? ''} ${(row as unknown as { location?: string }).location ?? ''}`
          .toLowerCase()
          .includes(cityFilter.toLowerCase()),
      );
    }
    if (availabilityDate.trim()) {
      list = list.filter((row) => row.status === 'active');
    }
    if (capacityFilter.trim()) {
      list = list.filter((row) =>
        `${(row as unknown as { capacity?: string | number }).capacity ?? ''}`.toLowerCase().includes(capacityFilter.toLowerCase()),
      );
    }
    if (occasionFilter !== 'all') {
      list = list.filter((row) =>
        `${row.category} ${row.title} ${row.description_short}`.toLowerCase().includes(occasionFilter.toLowerCase()),
      );
    }
    if (statusFilter !== 'all') list = list.filter((row) => row.status === statusFilter);
    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      list = list.filter((row) => `${row.title} ${row.category} ${(row as unknown as { vendor_name?: string }).vendor_name ?? ''}`.toLowerCase().includes(q));
    }
    return list;
  }, [activeTab, availabilityDate, budgetMax, budgetMin, capacityFilter, categoryFilter, cityFilter, occasionFilter, rows, sourceFilter, statusFilter, searchTerm]);

  const toggleStatus = (id: string) => {
    setRows((prev) => {
      const next = prev.map((row) => {
        if (row.id !== id) return row;
        const status =
          row.status === 'active' ? 'paused' : row.status === 'paused' ? 'active' : 'active';
        return { ...row, status, updated_at: new Date().toISOString() };
      });
      saveMogzuDirectCatalogueForAdmin(next);
      return next;
    });
  };

  const toggleFeatured = (id: string) => {
    setRows((prev) => {
      const next = prev.map((row) =>
        row.id === id ? { ...row, featured: !row.featured, updated_at: new Date().toISOString() } : row,
      );
      saveMogzuDirectCatalogueForAdmin(next);
      return next;
    });
    toast.success('Featured status updated.');
  };

  const deleteRow = (id: string) => {
    setRows((prev) => {
      const next = prev.filter((r) => r.id !== id);
      saveMogzuDirectCatalogueForAdmin(next);
      return next;
    });
    setConfirmDeleteId(null);
    toast.success('Listing removed.');
  };

  const viewCorporatePath = (row: MogzuDirectListing) =>
    `/browse/mogzu-direct/${row.module}/${encodeURIComponent(row.id)}`;

  const exportCsv = () => {
    const header = ['ID', 'Title', 'Vendor Name', 'Category', 'Status', 'Pricing Type', 'Price', 'Rating', 'Created Date'];
    const lines = filtered.map((row) => {
      const pricing = (row as unknown as { pricing_type?: string }).pricing_type ?? row.pricing_mode ?? 'transparent';
      const price = (row as unknown as { base_price?: number; starting_price?: number }).base_price
        ?? (row as unknown as { starting_price?: number }).starting_price
        ?? ((row as unknown as { pricing_type?: string }).pricing_type === 'request_for_price' ? 'On Request' : row.price);
      const rating = (row as unknown as { vendor_rating?: number }).vendor_rating ?? '';
      return [row.id, row.title, (row as unknown as { vendor_name?: string }).vendor_name ?? 'Mogzu Direct', row.category, row.status, pricing, price, rating, row.created_at].join(',');
    });
    const blob = new Blob([[header.join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mogzu-listings-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <AdminPageTitleRow title="Mogzu Direct" totalLabel="Manage listings published directly by Mogzu — no vendor required." />
        </div>
        <Link
          to="/admin/mogzu-direct/new"
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-95"
          style={{ backgroundColor: CORP.primary }}
        >
          <Plus className="size-4" />
          Create Mogzu Direct Listing
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Total MD Listings</p>
          <p className="text-2xl font-bold text-slate-900">{kpis.total}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Active</p>
          <span className="inline-flex mt-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100 px-2.5 py-0.5 text-sm font-bold">
            {kpis.active}
          </span>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Paused</p>
          <span className="inline-flex mt-1 rounded-full bg-amber-50 text-amber-900 border border-amber-100 px-2.5 py-0.5 text-sm font-bold">
            {kpis.paused}
          </span>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Draft</p>
          <span className="inline-flex mt-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 text-sm font-bold">
            {kpis.draft}
          </span>
        </div>
      </div>

      <div className="flex border-b border-slate-200 gap-8" role="tablist" aria-label="Mogzu direct module tabs">
        {MODULE_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
              activeTab === tab.id
                ? 'text-blue-600 border-blue-600'
                : 'text-slate-500 border-transparent hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by title/vendor" className="h-10 rounded-xl border border-slate-200 px-3 text-sm" />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)} className="h-10 rounded-xl border border-slate-200 px-3 text-sm">
          <option value="all">Status: All</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
        <button type="button" onClick={exportCsv} className="h-10 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Export CSV</button>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="h-10 rounded-xl border border-slate-200 px-3 text-sm">
          <option value="all">Category: All</option>
          <option value="Live Music & Bands">Live Music & Bands</option>
          <option value="DJ & Electronic">DJ & Electronic</option>
          <option value="Premium Gift Hampers">Premium Gift Hampers</option>
          <option value="Branded Merchandise / Swag">Branded Merchandise / Swag</option>
          <option value="Conference & Boardroom">Conference & Boardroom</option>
          <option value="Event Hall & Banquet">Event Hall & Banquet</option>
        </select>
        <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value as CatalogueSourceFilter)} className="h-10 rounded-xl border border-slate-200 px-3 text-sm">
          <option value="all">Source: All</option>
          <option value="mogzu">Source: ✦ By Mogzu</option>
          <option value="vendor">Source: Vendor Partners</option>
        </select>
        <button
          type="button"
          onClick={() => {
            setCategoryFilter('all');
            setSourceFilter('all');
            setBudgetMin('');
            setBudgetMax('');
            setCityFilter('');
            setAvailabilityDate('');
            setCapacityFilter('');
            setOccasionFilter('all');
          }}
          className="h-10 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Clear all filters
        </button>
        <input type="number" min={0} value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} placeholder="Budget min (₹)" className="h-10 rounded-xl border border-slate-200 px-3 text-sm" />
        <input type="number" min={0} value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} placeholder="Budget max (₹)" className="h-10 rounded-xl border border-slate-200 px-3 text-sm" />
        <input value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} placeholder="City / location" className="h-10 rounded-xl border border-slate-200 px-3 text-sm" />
        <input type="date" value={availabilityDate} onChange={(e) => setAvailabilityDate(e.target.value)} className="h-10 rounded-xl border border-slate-200 px-3 text-sm" />
        <input value={capacityFilter} onChange={(e) => setCapacityFilter(e.target.value)} placeholder="Capacity / headcount" className="h-10 rounded-xl border border-slate-200 px-3 text-sm" />
        <select value={occasionFilter} onChange={(e) => setOccasionFilter(e.target.value)} className="h-10 rounded-xl border border-slate-200 px-3 text-sm">
          <option value="all">Occasion: All</option>
          <option value="Employee Onboarding">Employee Onboarding</option>
          <option value="Festive Gifting">Festive Gifting</option>
          <option value="Milestone Rewards">Milestone Rewards</option>
          <option value="Client Appreciation">Client Appreciation</option>
          <option value="Event Giveaways">Event Giveaways</option>
        </select>
      </div>
      <p className="text-xs text-slate-500">Showing {filtered.length} result{filtered.length === 1 ? '' : 's'}</p>

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <h2 className="text-lg font-semibold" style={{ color: CORP.titleNavy }}>
              No Mogzu Direct listings yet
            </h2>
            <p className="mt-1 text-sm text-slate-500">Create your first Mogzu-managed listing.</p>
            <Link
              to="/admin/mogzu-direct/new"
              className="mt-5 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-95"
              style={{ backgroundColor: CORP.primary }}
            >
              <Plus className="size-4" />
              Create Mogzu Direct Listing
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-sm">
              <thead className="sticky top-0 z-10 bg-white shadow-sm">
                <tr className="border-b border-slate-100 text-left text-xs font-semibold text-slate-500 uppercase">
                  <th className="py-3 pl-4">
                    <input
                      type="checkbox"
                      checked={filtered.length > 0 && filtered.every((x) => selectedIds.includes(x.id))}
                      onChange={() =>
                        setSelectedIds(
                          filtered.every((x) => selectedIds.includes(x.id)) ? [] : filtered.map((x) => x.id),
                        )
                      }
                    />
                  </th>
                  <th className="py-3 pr-2">Cover</th>
                  <th className="py-3 pr-3">Alias</th>
                  <th className="py-3 pr-3">Category</th>
                  <th className="py-3 pr-3">Pricing</th>
                  <th className="py-3 pr-3">Status</th>
                  <th className="py-3 pr-3">Featured</th>
                  <th className="py-3 pr-3">Views</th>
                  <th className="py-3 pr-3">Bookings</th>
                  <th className="py-3 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => {
                  const thumb = row.images[0];
                  const alias = row.mogzu_direct_alias ?? row.title;
                  const hash = row.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
                  const views = 100 + (hash % 5000);
                  const bookings = 5 + (hash % 200);
                  const pt = (row as { pricing_type?: string }).pricing_type ?? row.pricing_mode;
                  return (
                    <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 pl-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(row.id)}
                          onChange={() =>
                            setSelectedIds((prev) =>
                              prev.includes(row.id) ? prev.filter((x) => x !== row.id) : [...prev, row.id],
                            )
                          }
                        />
                      </td>
                      <td className="py-3 pr-2">
                        <div className="size-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                          {thumb ? (
                            <img src={thumb} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-[10px] text-slate-400">—</div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 pr-3 font-medium text-slate-900 max-w-[180px] truncate">{alias}</td>
                      <td className="py-3 pr-3 text-slate-600">
                        <span className="inline-flex items-center gap-1">
                          <GraduationCap className="size-4 text-[#2563EB] shrink-0" />
                          {row.category}
                        </span>
                      </td>
                      <td className="py-3 pr-3">
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-800">
                          {String(pt)}
                        </span>
                      </td>
                      <td className="py-3 pr-3">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${statusChipClass(row.status)}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="py-3 pr-3">
                        <Switch
                          checked={Boolean(row.featured)}
                          onCheckedChange={() => toggleFeatured(row.id)}
                          aria-label="Featured"
                        />
                      </td>
                      <td className="py-3 pr-3 text-slate-600">{views}</td>
                      <td className="py-3 pr-3 text-slate-600">{bookings}</td>
                      <td className="py-3 pr-4">
                        <div className="flex justify-end flex-wrap gap-1">
                          <button
                            type="button"
                            className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-50"
                            onClick={() => navigate(`/admin/mogzu-direct/${encodeURIComponent(row.id)}/edit`)}
                            aria-label="Edit"
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button
                            type="button"
                            className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-50"
                            onClick={() => window.open(viewCorporatePath(row), '_blank', 'noopener,noreferrer')}
                            aria-label="View corporate"
                          >
                            <Eye className="size-4" />
                          </button>
                          <button
                            type="button"
                            className="rounded-lg border border-slate-200 px-2 py-1 text-xs"
                            onClick={() => toggleStatus(row.id)}
                          >
                            {row.status === 'active' ? 'Pause' : 'Activate'}
                          </button>
                          <button
                            type="button"
                            className="rounded-lg border border-rose-200 p-1.5 text-rose-600 hover:bg-rose-50"
                            onClick={() => setConfirmDeleteId(row.id)}
                            aria-label="Delete"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {confirmDeleteId ? (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl space-y-3">
            <h3 className="text-lg font-semibold text-slate-900">Delete this listing?</h3>
            <p className="text-sm text-slate-600">This will remove it from the Mogzu Direct catalogue.</p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
                onClick={() => setConfirmDeleteId(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white"
                onClick={() => confirmDeleteId && deleteRow(confirmDeleteId)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {selectedIds.length > 0 ? (
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white px-4 py-3 shadow-lg">
          <div className="mx-auto max-w-[1200px] flex items-center gap-2">
            <p className="mr-auto text-sm text-slate-700">{selectedIds.length} listing(s) selected</p>
            <button type="button" onClick={() => selectedIds.forEach((id) => toggleStatus(id))} className="rounded-full border border-slate-200 px-4 py-2 text-sm">Toggle Status</button>
            <button type="button" onClick={() => setSelectedIds([])} className="rounded-full px-4 py-2 text-sm text-slate-600">Clear Selection</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
