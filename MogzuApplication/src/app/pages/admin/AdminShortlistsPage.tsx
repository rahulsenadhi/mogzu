import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Copy, Pencil, Plus } from 'lucide-react';
import { AdminPageTitleRow } from '@/app/components/admin/AdminPageChrome';
import { CORP } from '@/app/lib/adminTheme';
import { shortlistPublicUrl } from '@/app/lib/mogzuShortlistHelpers';
import type { ShortlistProposal } from '@/app/lib/mogzuDomain';
import { loadShortlistProposals } from '@/app/lib/mogzuDomain';

function statusClass(s: ShortlistProposal['status']): string {
  if (s === 'draft') return 'bg-slate-100 text-slate-700 border border-slate-200';
  if (s === 'sent') return 'bg-sky-50 text-sky-900 border border-sky-100';
  if (s === 'viewed') return 'bg-violet-50 text-violet-900 border border-violet-100';
  return 'bg-emerald-50 text-emerald-800 border border-emerald-100';
}

export default function AdminShortlistsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const rows = useMemo(() => loadShortlistProposals(), [location.key]);
  const [notice, setNotice] = useState('');

  const total = rows.length;

  const copyLink = (token: string) => {
    const url = shortlistPublicUrl(token);
    void navigator.clipboard.writeText(url).then(
      () => {
        setNotice('Link copied to clipboard.');
        setTimeout(() => setNotice(''), 2500);
      },
      () => setNotice('Could not copy — copy manually from the editor.')
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <AdminPageTitleRow title="Shortlist proposals" totalLabel={`${total} proposals`} />
        <Link
          to="/admin/shortlists/new"
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-95"
          style={{ backgroundColor: CORP.primary }}
        >
          <Plus className="size-4" />
          New shortlist
        </Link>
      </div>

      {notice ? (
        <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">{notice}</p>
      ) : null}

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        {rows.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">No proposals yet. Create one to send options to a corporate client.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  <th className="py-3 pl-4 pr-3">Title</th>
                  <th className="py-3 pr-3">Client</th>
                  <th className="py-3 pr-3">Options</th>
                  <th className="py-3 pr-3">Status</th>
                  <th className="py-3 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50/60">
                    <td className="py-3 pl-4 pr-3 font-medium text-slate-900">{row.title}</td>
                    <td className="py-3 pr-3 text-slate-600">
                      <p>{row.corporate_email || '—'}</p>
                      {row.corporate_whatsapp ? <p className="text-xs text-slate-500">{row.corporate_whatsapp}</p> : null}
                    </td>
                    <td className="py-3 pr-3 text-slate-700">{row.shortlisted_options.length}</td>
                    <td className="py-3 pr-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusClass(row.status)}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex justify-end flex-wrap gap-1">
                        <button
                          type="button"
                          onClick={() => copyLink(row.proposal_token)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <Copy className="size-3.5" />
                          Copy link
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate(`/admin/shortlists/${row.id}`)}
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
