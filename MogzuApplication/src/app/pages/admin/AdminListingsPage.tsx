import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { AdminPageTitleRow } from '@/app/components/admin/AdminPageChrome';
import AdminListingStatusBadge from '@/app/components/admin/AdminListingStatusBadge';
import { allAdminListingsRows } from '@/app/lib/adminListingResolve';
import type { MogzuDirectListing, PartnerListing } from '@/app/lib/mogzuDomain';

function rowTitle(r: { kind: 'partner' | 'mogzu_direct'; listing: PartnerListing | MogzuDirectListing }) {
  return r.listing.title;
}

function rowSource(r: { kind: 'partner' | 'mogzu_direct' }) {
  if (r.kind === 'mogzu_direct') return 'Mogzu Direct';
  return 'Partner';
}

export default function AdminListingsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'partner' | 'mogzu_direct'>('all');

  const rows = useMemo(() => {
    let list = allAdminListingsRows();
    if (sourceFilter === 'partner') list = list.filter((r) => r.kind === 'partner');
    if (sourceFilter === 'mogzu_direct') list = list.filter((r) => r.kind === 'mogzu_direct');
    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      list = list.filter((r) => rowTitle(r).toLowerCase().includes(q) || r.listing.category.toLowerCase().includes(q));
    }
    return list;
  }, [searchTerm, sourceFilter]);

  const total = allAdminListingsRows().length;

  return (
    <div className="space-y-4">
      <AdminPageTitleRow title="Listings" totalLabel={`${total} total`} />
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-4 py-3">
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search title or category"
            className="h-9 rounded-lg border border-slate-200 px-3 text-sm min-w-[200px]"
          />
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value as typeof sourceFilter)}
            className="h-9 rounded-lg border border-slate-200 px-3 text-sm"
          >
            <option value="all">All sources</option>
            <option value="partner">Partner</option>
            <option value="mogzu_direct">Mogzu Direct</option>
          </select>
        </div>
        {rows.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">No listings match your filters.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  <th className="py-3 pl-4 pr-3">Title</th>
                  <th className="py-3 pr-3">Source</th>
                  <th className="py-3 pr-3">Category</th>
                  <th className="py-3 pr-3">Status</th>
                  <th className="py-3 pr-4 text-right">Listing ID</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={`${r.kind}-${r.listing.id}`} className="border-b border-slate-100 hover:bg-slate-50/80">
                    <td className="py-3 pl-4 pr-3 font-medium">
                      <Link
                        to={`/admin/listings/${encodeURIComponent(r.listing.id)}`}
                        className="text-[#1D4ED8] hover:underline"
                      >
                        {rowTitle(r)}
                      </Link>
                    </td>
                    <td className="py-3 pr-3 text-slate-600">{rowSource(r)}</td>
                    <td className="py-3 pr-3 text-slate-600">{r.listing.category}</td>
                    <td className="py-3 pr-3">
                      <AdminListingStatusBadge status={r.listing.status} size="sm" />
                    </td>
                    <td className="py-3 pr-4 text-right text-xs text-slate-500 font-mono">{r.listing.id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <p className="text-xs text-slate-500">
        Tip: open a listing for the full admin preview, moderation tools, and action panel.
      </p>
    </div>
  );
}
