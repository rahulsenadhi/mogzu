import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Archive, CheckCircle2, Eye, Pencil, Plus, XCircle } from 'lucide-react';
import { AdminPageTitleRow } from '@/app/components/admin/AdminPageChrome';
import { CORP } from '@/app/lib/adminTheme';
import type { PartnerListing } from '@/app/lib/mogzuDomain';
import { loadPartnerListings, loadPartnerUsers, savePartnerListings } from '@/app/lib/mogzuDomain';
import { GhostCTAButton, IconOnlyButtonWithTooltip, SecondaryCTAButton, DestructiveCTAButton } from '@/app/components/ui/ListingButtons';

function partnerLabel(partnerId: string, map: Map<string, string>): string {
  return map.get(partnerId) || partnerId || '—';
}

function statusClass(s: PartnerListing['status']): string {
  if (s === 'active') return 'bg-emerald-50 text-emerald-800 border border-emerald-100';
  if (s === 'pending_review') return 'bg-amber-50 text-amber-900 border border-amber-100';
  if (s === 'paused') return 'bg-blue-50 text-blue-800 border border-blue-100';
  return 'bg-slate-100 text-slate-700 border border-slate-200';
}

function statusDotClass(s: PartnerListing['status']): string {
  if (s === 'active') return 'bg-emerald-600';
  if (s === 'pending_review') return 'bg-amber-500';
  if (s === 'paused') return 'bg-blue-500';
  return 'bg-slate-400';
}

export default function AdminPartnerListingsPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<PartnerListing[]>(() => loadPartnerListings());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | PartnerListing['status']>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const nameById = useMemo(() => {
    const m = new Map<string, string>();
    for (const p of loadPartnerUsers()) {
      m.set(p.id, p.business_name || p.name);
    }
    return m;
  }, []);

  const approve = (id: string) => {
    setRows((prev) => {
      const next = prev.map((r) => (r.id === id ? { ...r, status: 'active' as const, updated_at: new Date().toISOString() } : r));
      savePartnerListings(next);
      return next;
    });
  };

  const reject = (id: string) => {
    setRows((prev) => {
      const next = prev.map((r) =>
        r.id === id ? { ...r, status: 'paused' as const, updated_at: new Date().toISOString() } : r,
      );
      savePartnerListings(next);
      return next;
    });
  };

  const archive = (id: string) => {
    setRows((prev) => {
      const next = prev.filter((r) => r.id !== id);
      savePartnerListings(next);
      return next;
    });
    setSelectedIds((prev) => prev.filter((x) => x !== id));
    setConfirmDeleteId(null);
  };

  const toggleSelected = (id: string) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const allSelected = rows.length > 0 && rows.every((r) => selectedIds.includes(r.id));
  const toggleAll = () => setSelectedIds(allSelected ? [] : rows.map((r) => r.id));
  const filteredRows = rows.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      return `${r.title} ${partnerLabel(r.partner_id, nameById)}`.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <AdminPageTitleRow title="Partner listings" totalLabel={`${rows.length} listings`} />
        <Link
          to="/admin/partner-listings/new"
          className="inline-flex items-center gap-2 rounded-full px-6 h-12 text-[15px] font-semibold tracking-[0.3px] text-white shadow-sm hover:scale-[1.02] transition-all"
          style={{ backgroundColor: CORP.primary }}
        >
          <Plus className="size-4" />
          Add listing
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-4 py-3">
          <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by title/vendor" className="h-9 rounded-lg border border-slate-200 px-3 text-sm" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)} className="h-9 rounded-lg border border-slate-200 px-3 text-sm">
            <option value="all">All</option>
            <option value="pending_review">Pending</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
          </select>
        </div>
        {filteredRows.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">No partner listings yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide sticky top-0 z-10 shadow-sm">
                  <th className="py-3 pl-4 pr-2">
                    <input type="checkbox" checked={filteredRows.length > 0 && filteredRows.every((r) => selectedIds.includes(r.id))} onChange={() => setSelectedIds(filteredRows.every((r) => selectedIds.includes(r.id)) ? [] : filteredRows.map((r) => r.id))} aria-label="Select all listings" />
                  </th>
                  <th className="py-3 pl-4 pr-3">Title</th>
                  <th className="py-3 pr-3">Partner</th>
                  <th className="py-3 pr-3">Module</th>
                  <th className="py-3 pr-3">Profit %</th>
                  <th className="py-3 pr-3">Status</th>
                  <th className="py-3 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-100/70 transition-colors duration-150">
                    <td className="py-3 pl-4 pr-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(row.id)}
                        onChange={() => toggleSelected(row.id)}
                        aria-label={`Select ${row.title}`}
                      />
                    </td>
                    <td className="py-3 pl-4 pr-3 font-medium text-slate-900">
                      <Link
                        to={`/admin/listings/${encodeURIComponent(row.id)}`}
                        className="text-[#1D4ED8] hover:underline"
                      >
                        {row.title}
                      </Link>
                    </td>
                    <td className="py-3 pr-3 text-slate-600">{partnerLabel(row.partner_id, nameById)}</td>
                    <td className="py-3 pr-3 text-slate-600">{row.module}</td>
                    <td className="py-3 pr-3">{row.profit_share_percentage}%</td>
                    <td className="py-3 pr-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusClass(row.status)}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${statusDotClass(row.status)}`} />
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex justify-end flex-wrap gap-1">
                        {row.status === 'pending_review' ? (
                          <IconOnlyButtonWithTooltip label="Approve" icon={<CheckCircle2 className="size-4" />} tone="green" onClick={() => approve(row.id)} />
                        ) : null}
                        <IconOnlyButtonWithTooltip label="View" icon={<Eye className="size-4" />} onClick={() => navigate(`/browse/partner-listing/${encodeURIComponent(row.id)}`)} />
                        <IconOnlyButtonWithTooltip label="Edit" icon={<Pencil className="size-4" />} onClick={() => navigate(`/admin/partner-listings/edit/${row.id}`)} />
                        <IconOnlyButtonWithTooltip label="Reject" icon={<XCircle className="size-4" />} tone="red" onClick={() => reject(row.id)} />
                        <IconOnlyButtonWithTooltip label="Archive" icon={<Archive className="size-4" />} onClick={() => setConfirmDeleteId(row.id)} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div
        className={`fixed bottom-0 left-0 right-0 z-20 border-t border-slate-200 bg-white px-4 py-3 shadow-lg transition-transform duration-250 ${
          selectedIds.length > 0 ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="mx-auto max-w-[1100px] flex flex-wrap items-center gap-2">
          <p className="mr-auto text-sm text-slate-700">{selectedIds.length} listing(s) selected</p>
          <SecondaryCTAButton onClick={() => selectedIds.forEach((id) => approve(id))}>Approve Selected</SecondaryCTAButton>
          <DestructiveCTAButton onClick={() => selectedIds.forEach((id) => reject(id))}>Reject Selected</DestructiveCTAButton>
          <GhostCTAButton onClick={() => setSelectedIds([])}>Clear Selection</GhostCTAButton>
        </div>
      </div>

      {confirmDeleteId ? (
        <div className="fixed inset-0 z-30 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">Are you sure?</h3>
            <p className="mt-2 text-sm text-slate-600">This will archive the listing and remove it from the table.</p>
            <div className="mt-4 flex items-center justify-end gap-2">
              <GhostCTAButton onClick={() => setConfirmDeleteId(null)}>Cancel</GhostCTAButton>
              <DestructiveCTAButton onClick={() => archive(confirmDeleteId)}>Confirm</DestructiveCTAButton>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
