import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { CalendarCheck, Clock, Eye, Heart, Percent } from 'lucide-react';
import { VendorSideDrawer } from './VendorSideDrawer';
import {
  getPerformanceMock,
  responseTimeBadge,
  type DateRangeChip,
} from '@/app/lib/vendorListingPerformanceMock';

export type VendorPerformanceListing = {
  id: string;
  title: string;
  categoryLabel: string;
  coverUrl: string;
  status: 'Active' | 'Paused' | 'Draft' | 'Rejected';
  /** When false, show empty add-ons copy */
  hasAddOns?: boolean;
};

type VendorPerformanceStatsDrawerProps = {
  open: boolean;
  onClose: () => void;
  listing: VendorPerformanceListing | null;
  onEditListing: (listingId: string) => void;
  onToast?: (msg: string) => void;
};

function useCountUp(target: number, active: boolean, duration = 800): number {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!active) return;
    setV(0);
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - p) * (1 - p);
      setV(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active, duration]);
  return v;
}

function TrendPill({ value }: { value: number }) {
  if (value === 0) return <span className="text-xs text-slate-400">0% vs previous</span>;
  const pos = value > 0;
  return (
    <span className={`text-xs font-medium ${pos ? 'text-emerald-600' : 'text-red-600'}`}>
      {pos ? '↑' : '↓'} {Math.abs(value)}% vs previous period
    </span>
  );
}

const RANGE_LABEL: Record<DateRangeChip, string> = {
  '7d': '7D',
  '30d': '30D',
  '90d': '90D',
  all: 'All Time',
};

export function VendorPerformanceStatsDrawer({
  open,
  onClose,
  listing,
  onEditListing,
}: VendorPerformanceStatsDrawerProps) {
  const navigate = useNavigate();
  const [range, setRange] = useState<DateRangeChip>('30d');
  const [barPhase, setBarPhase] = useState(0);

  const data = useMemo(() => (listing ? getPerformanceMock(listing.id, range) : null), [listing, range]);

  const vViews = useCountUp(data?.views ?? 0, open && Boolean(data));
  const vWish = useCountUp(data?.wishlisted ?? 0, open && Boolean(data));
  const vReq = useCountUp(data?.bookingRequests ?? 0, open && Boolean(data));
  const vConv = useCountUp(data?.conversionPct ?? 0, open && Boolean(data));

  useEffect(() => {
    if (!open || !listing) return;
    setBarPhase(0);
    const t = window.setTimeout(() => setBarPhase(1), 80);
    return () => window.clearTimeout(t);
  }, [open, listing?.id, range]);

  if (!open || !listing || !data) return null;

  const bd = data.breakdown;
  const sum = bd.transparent + bd.offer + bd.request || 1;
  const pct = (n: number) => Math.round((n / sum) * 100);
  const rt = responseTimeBadge(data.responseHours);
  const hasAddOns = listing.hasAddOns !== false;

  const handleViewListing = () => {
    onClose();
    navigate(`/browse/partner-listing/${encodeURIComponent(listing.id)}`);
  };

  const handleViewReviews = () => {
    onClose();
    navigate(`/event-activity/${encodeURIComponent('1')}`, { state: { scrollToReviews: true } });
  };

  return (
    <VendorSideDrawer
      open={open}
      onClose={onClose}
      desktopWidthPx={520}
      panelId="vendor-performance-drawer"
      title={`${listing.title} — Performance`}
      subtitle="Last updated: Today"
      headerRight={
        <div className="hidden flex-wrap justify-end gap-1 sm:flex">
          {(Object.keys(RANGE_LABEL) as DateRangeChip[]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setRange(k)}
              className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
                range === k ? 'bg-[#2563eb] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {RANGE_LABEL[k]}
            </button>
          ))}
        </div>
      }
      footer={
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => {
              onEditListing(listing.id);
              onClose();
            }}
            className="rounded-lg bg-[#2563eb] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            Edit Listing
          </button>
          <button
            type="button"
            onClick={handleViewListing}
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            View Listing
          </button>
        </div>
      }
    >
      <div className="space-y-0 px-4 pb-4 sm:px-5">
        <div className="flex flex-wrap gap-1 pb-3 sm:hidden">
          {(Object.keys(RANGE_LABEL) as DateRangeChip[]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setRange(k)}
              className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
                range === k ? 'bg-[#2563eb] text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {RANGE_LABEL[k]}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <img src={listing.coverUrl} alt="" className="h-14 w-14 shrink-0 rounded-[10px] object-cover" width={56} height={56} />
          <div className="min-w-0">
            <p className="font-semibold text-slate-900">{listing.title}</p>
            <span className="mt-1 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
              {listing.categoryLabel}
            </span>
            <div className="mt-1">
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                  listing.status === 'Active'
                    ? 'bg-emerald-50 text-emerald-800'
                    : listing.status === 'Paused'
                      ? 'bg-amber-50 text-amber-900'
                      : listing.status === 'Rejected'
                        ? 'bg-red-50 text-red-800'
                        : 'bg-slate-100 text-slate-700'
                }`}
              >
                {listing.status}
              </span>
            </div>
          </div>
        </div>

        <hr className="my-4 border-slate-200" />

        <div className="grid grid-cols-2 gap-3">
          <div className="relative rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm">
            <Eye className="absolute right-3 top-3 h-5 w-5 text-[#2563eb]" />
            <p className="text-2xl font-semibold text-slate-900">{vViews.toLocaleString()}</p>
            <p className="text-xs text-slate-500">Total Views</p>
            <div className="mt-2">
              <TrendPill value={data.viewsTrend} />
            </div>
          </div>
          <div className="relative rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm">
            <Heart className="absolute right-3 top-3 h-5 w-5 text-[#2563eb]" />
            <p className="text-2xl font-semibold text-slate-900">{vWish.toLocaleString()}</p>
            <p className="text-xs text-slate-500">Times Saved</p>
            <div className="mt-2">
              <TrendPill value={data.wishTrend} />
            </div>
          </div>
          <div className="relative rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm">
            <CalendarCheck className="absolute right-3 top-3 h-5 w-5 text-[#2563eb]" />
            <p className="text-2xl font-semibold text-slate-900">{vReq.toLocaleString()}</p>
            <p className="text-xs text-slate-500">Requests Received</p>
            <div className="mt-2">
              <TrendPill value={data.reqTrend} />
            </div>
          </div>
          <div className="relative rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm">
            <Percent className="absolute right-3 top-3 h-5 w-5 text-[#2563eb]" />
            <p className="text-2xl font-semibold text-slate-900">{vConv}%</p>
            <p className="text-xs text-slate-500">View → Request Rate</p>
            <div className="mt-2">
              <TrendPill value={data.convTrend} />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-[12px] font-semibold uppercase tracking-[0.5px] text-slate-500">Views Over Time</p>
          <div className="mt-2 h-[160px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.chart} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                  formatter={(val: number) => [val, 'Views']}
                />
                <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            📈 Peak: {data.peakLabel} — {data.peakCount.toLocaleString()} views
          </p>
        </div>

        <div className="mt-6">
          <p className="text-[12px] font-semibold uppercase tracking-[0.5px] text-slate-500">Booking Requests Breakdown</p>
          <div className="mt-3 space-y-3">
            {[
              { key: 'transparent', label: 'Transparent (Book Now)', n: bd.transparent, color: 'bg-emerald-500' },
              { key: 'offer', label: 'Offer Price', n: bd.offer, color: 'bg-amber-400' },
              { key: 'request', label: 'Price Request', n: bd.request, color: 'bg-blue-500' },
            ].map((row) => (
              <div key={row.key}>
                <div className="mb-1 flex justify-between text-xs text-slate-700">
                  <span>{row.label}</span>
                  <span>
                    {row.n} requests · {pct(row.n)}%
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className={`h-full rounded-full ${row.color} transition-[width] duration-[600ms] ease-out`}
                    style={{ width: `${barPhase * pct(row.n)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
          <p className="text-[12px] font-semibold uppercase tracking-[0.5px] text-slate-500">Average Response Time</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <Clock className="h-6 w-6 text-[#2563eb]" />
            <div>
              <p className="text-2xl font-semibold text-slate-900">{data.responseHours} hours</p>
              <p className="text-xs text-slate-500">Average time to respond to requests</p>
            </div>
            <span className={`ml-auto rounded-full px-2.5 py-1 text-[11px] font-semibold ${rt.className}`}>{rt.label}</span>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-[12px] font-semibold uppercase tracking-[0.5px] text-slate-500">Most Requested Add-ons</p>
          {hasAddOns ? (
            <div className="mt-3 space-y-3">
              {data.addOns.map((a, i) => (
                <div key={a.name}>
                  <div className="mb-1 flex justify-between text-xs text-slate-700">
                    <span>
                      #{i + 1} {a.name} — {a.count} times
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-[#2563eb] transition-[width] duration-[600ms] ease-out"
                      style={{ width: `${barPhase * a.pct * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-500">
              No add-ons configured. Add add-ons to your listing to track their demand.
            </p>
          )}
        </div>

        <div className="mt-6">
          <p className="text-[12px] font-semibold uppercase tracking-[0.5px] text-slate-500">Recent Reviews</p>
          <div className="mt-3 space-y-4">
            {data.reviews.map((r) => (
              <div key={r.name + r.date} className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-900">
                    {r.name}{' '}
                    <span className="font-normal text-slate-500">· {r.company}</span>
                  </p>
                  <span className="text-xs text-slate-400">{r.date}</span>
                </div>
                <div className="mt-1 flex gap-0.5 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i}>{i < r.stars ? '★' : '☆'}</span>
                  ))}
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  {r.text.length > 120 ? `${r.text.slice(0, 120)}…` : r.text}
                </p>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={handleViewReviews}
            className="mt-3 text-sm font-semibold text-[#2563eb] hover:underline"
          >
            View all reviews →
          </button>
        </div>
      </div>
    </VendorSideDrawer>
  );
}
