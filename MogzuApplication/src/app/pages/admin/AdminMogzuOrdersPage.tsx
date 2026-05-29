import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router';
import { AdminPageTitleRow } from '@/app/components/admin/AdminPageChrome';
import { DevMockDataBanner } from '@/app/components/global/DevMockDataBanner';
import type { MogzuOrder } from '@/app/lib/mogzuDomain';
import { loadMogzuOrders } from '@/app/lib/mogzuDomain';
import { listLeads, type PublicLead } from '@/lib/publicLeads';

function statusClass(s: MogzuOrder['status']): string {
  if (s === 'completed') return 'bg-emerald-50 text-emerald-800 border border-emerald-100';
  if (s === 'cancelled') return 'bg-red-50 text-red-800 border border-red-100';
  if (s === 'confirmed' || s === 'in_progress') return 'bg-sky-50 text-sky-900 border border-sky-100';
  return 'bg-slate-100 text-slate-700 border border-slate-200';
}

function leadToOrder(lead: PublicLead): MogzuOrder {
  const listingType: MogzuOrder['listing_type'] =
    lead.source_slug === 'partner_listing' ? 'partner' : 'mogzu_direct';
  const status: MogzuOrder['status'] =
    lead.status === 'converted'
      ? 'completed'
      : lead.status === 'closed' || lead.status === 'spam'
        ? 'cancelled'
        : 'received';
  return {
    id: `lead-${lead.id}`,
    enquiry_id: lead.id,
    corporate_user_id: lead.client_email,
    listing_id: lead.listing_id ?? '—',
    listing_type: listingType,
    status,
    total_amount: 0,
    event_date: '',
    requirements: lead.requirement_summary ?? `${lead.client_name} enquiry`,
    created_at: lead.created_at,
    updated_at: lead.updated_at,
  };
}

export default function AdminMogzuOrdersPage() {
  const location = useLocation();
  const [liveLeads, setLiveLeads] = useState<PublicLead[]>([]);
  const [leadsLoaded, setLeadsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void listLeads().then(({ data }) => {
      if (cancelled) return;
      setLiveLeads(data ?? []);
      setLeadsLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [location.key]);

  const rows = useMemo(() => {
    const local = loadMogzuOrders();
    const fromLeads = liveLeads.map(leadToOrder);
    const seen = new Set<string>();
    const merged: MogzuOrder[] = [];
    for (const row of [...fromLeads, ...local]) {
      const key = row.enquiry_id || row.id;
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(row);
    }
    return merged.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }, [liveLeads, location.key]);

  const usingDemoOnly = leadsLoaded && liveLeads.length === 0;

  return (
    <div className="space-y-4">
      <AdminPageTitleRow title="Mogzu orders" totalLabel={`${rows.length} orders`} />
      {usingDemoOnly ? <DevMockDataBanner /> : null}
      {!leadsLoaded ? <p className="text-sm text-slate-500">Loading enquiries…</p> : null}

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        {rows.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">
            No orders yet. They appear when a corporate confirms a shortlist or submits a Mogzu Direct booking request.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  <th className="py-3 pl-4 pr-3">Order</th>
                  <th className="py-3 pr-3">Listing type</th>
                  <th className="py-3 pr-3">Listing ID</th>
                  <th className="py-3 pr-3">Partner</th>
                  <th className="py-3 pr-3">Total</th>
                  <th className="py-3 pr-3">Partner share</th>
                  <th className="py-3 pr-3">Mogzu margin</th>
                  <th className="py-3 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50/60">
                    <td className="py-3 pl-4 pr-3 font-mono text-xs text-slate-700">{row.id}</td>
                    <td className="py-3 pr-3 text-slate-800 font-medium">{row.listing_type}</td>
                    <td className="py-3 pr-3 font-mono text-xs text-slate-600">{row.listing_id}</td>
                    <td className="py-3 pr-3 text-slate-600">{row.partner_id ?? '—'}</td>
                    <td className="py-3 pr-3 text-slate-800 font-semibold">₹{row.total_amount.toLocaleString('en-IN')}</td>
                    <td className="py-3 pr-3 text-slate-700">
                      {row.partner_profit_share != null ? `₹${row.partner_profit_share.toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td className="py-3 pr-3 text-slate-600">{row.mogzu_margin != null ? `₹${row.mogzu_margin}` : '—'}</td>
                    <td className="py-3 pr-4">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusClass(row.status)}`}>
                        {row.status}
                      </span>
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
