import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Pencil, Plus } from 'lucide-react';
import { AdminPageTitleRow } from '@/app/components/admin/AdminPageChrome';
import { CORP } from '@/app/lib/adminTheme';
import type { PartnerUser } from '@/app/lib/mogzuDomain';
import { loadPartnerUsers, savePartnerUsers } from '@/app/lib/mogzuDomain';

function statusClass(s: PartnerUser['status']): string {
  if (s === 'active') return 'bg-emerald-50 text-emerald-800 border border-emerald-100';
  if (s === 'suspended') return 'bg-slate-100 text-slate-700 border border-slate-200';
  return 'bg-amber-50 text-amber-900 border border-amber-100';
}

export default function AdminPartnersPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<PartnerUser[]>(() => loadPartnerUsers());

  const total = useMemo(() => rows.length, [rows]);

  const setStatus = (id: string, status: PartnerUser['status']) => {
    setRows((prev) => {
      const next = prev.map((r) => (r.id === id ? { ...r, status } : r));
      savePartnerUsers(next);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <AdminPageTitleRow title="Partners" totalLabel={`${total} partners`} />
        <Link
          to="/admin/partners/new"
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-95"
          style={{ backgroundColor: CORP.primary }}
        >
          <Plus className="size-4" />
          Add partner
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        {rows.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">No partners yet. Add a consultant profile to get started.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  <th className="py-3 pl-4 pr-3">Business</th>
                  <th className="py-3 pr-3">Contact</th>
                  <th className="py-3 pr-3">Profit %</th>
                  <th className="py-3 pr-3">Status</th>
                  <th className="py-3 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50/60">
                    <td className="py-3 pl-4 pr-3">
                      <p className="font-medium text-slate-900">{row.business_name || row.name}</p>
                      <p className="text-xs text-slate-500">{row.modules.join(', ') || '—'}</p>
                    </td>
                    <td className="py-3 pr-3 text-slate-600">
                      <p>{row.name}</p>
                      <p className="text-xs">{row.email}</p>
                    </td>
                    <td className="py-3 pr-3 text-slate-800 font-medium">{row.profit_share_percentage}%</td>
                    <td className="py-3 pr-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusClass(row.status)}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex justify-end flex-wrap gap-1">
                        {row.status === 'pending' ? (
                          <button
                            type="button"
                            onClick={() => setStatus(row.id, 'active')}
                            className="rounded-lg bg-emerald-600 px-2 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
                          >
                            Activate
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => navigate(`/admin/partners/edit/${row.id}`)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <Pencil className="size-3.5" />
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
