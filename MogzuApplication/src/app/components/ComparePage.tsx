import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { SharedHeader } from './layouts/SharedHeader';
import { SharedSidebar } from './layouts/SharedSidebar';
import { MogzuCorporateScrollSurface } from './layouts/MogzuCorporateScrollSurface';
import { ChevronLeft, Check, Clock, Star, ShieldCheck, X } from 'lucide-react';
import { getPricingCtaLabel } from './ui/PriceBlock';
import type { ListingPricingType } from './ui/PriceBlock';
import { clearCompareIds, getCompareIds, removeCompareId, subscribeListingSession } from '@/app/lib/listingSessionState';
import { findCatalogueItemById, isServiceListingId } from '@/utils/listingResolve';
import type { CatalogueItem } from '@/utils/catalogueTypes';
import { CompareStickyBar } from './CompareStickyBar';

function mapPricing(item: CatalogueItem): ListingPricingType {
  const pt = item.pricing_type;
  if (pt === 'transparent' || pt === 'offer_price' || pt === 'request_for_price') return pt;
  if (pt === 'fixed') return 'transparent';
  return 'offer_price';
}

function numericPrice(item: CatalogueItem): number | null {
  if (item.pricing_type === 'request_for_price' || item.pricing_type === 'custom_quote') return null;
  if (item.base_price != null) return item.base_price;
  if (item.starting_price != null) return item.starting_price;
  return null;
}

function syntheticReviews(item: CatalogueItem): number {
  return Math.max(12, Math.round((item.rating ?? 4.2) * 24));
}

export default function ComparePage() {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [ids, setIds] = useState<string[]>(() => getCompareIds());
  const [swipeHint, setSwipeHint] = useState(() =>
    typeof sessionStorage !== 'undefined' ? !sessionStorage.getItem('mogzu_compare_swipe_hint_seen') : true,
  );

  useEffect(() => subscribeListingSession(() => setIds([...getCompareIds()])), []);

  useEffect(() => {
    if (!swipeHint) return;
    const t = window.setTimeout(() => {
      setSwipeHint(false);
      try {
        sessionStorage.setItem('mogzu_compare_swipe_hint_seen', '1');
      } catch {
        /* ignore */
      }
    }, 4500);
    return () => window.clearTimeout(t);
  }, [swipeHint]);

  const items = useMemo(() => ids.map((id) => ({ id, item: findCatalogueItemById(id) })), [ids]);

  const bestPriceId = useMemo(() => {
    const priced = items
      .map((x) => ({ id: x.id, n: x.item ? numericPrice(x.item) : null }))
      .filter((x): x is { id: string; n: number } => x.n != null);
    if (priced.length < 2) return null;
    const min = Math.min(...priced.map((p) => p.n));
    const match = priced.find((p) => p.n === min);
    return match?.id ?? null;
  }, [items]);

  const bestRatingId = useMemo(() => {
    if (!items.length) return null;
    const max = Math.max(...items.map((x) => x.item?.rating ?? 0));
    const m = items.find((x) => (x.item?.rating ?? 0) === max);
    return m?.id ?? null;
  }, [items]);

  const bestReviewsId = useMemo(() => {
    if (!items.length) return null;
    const scores = items.map((x) => ({ id: x.id, r: x.item ? syntheticReviews(x.item) : 0 }));
    const max = Math.max(...scores.map((s) => s.r));
    return scores.find((s) => s.r === max)?.id ?? null;
  }, [items]);

  const openListing = (id: string, item?: CatalogueItem) => {
    if (item && isServiceListingId(id)) navigate('/events', { state: { tab: 'event-service' } });
    else navigate(`/event-activity/${encodeURIComponent(id)}`);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#FFFDF9] font-['Inter']">
      <SharedSidebar collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <SharedHeader onMobileMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} searchPlaceholder="Search events..." />
        <MogzuCorporateScrollSurface>
          <div className="mx-auto max-w-[1400px] px-6 py-8 pb-28">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              <ChevronLeft className="h-5 w-5" />
              Back to discovery
            </button>

            <div className="mb-6">
              <h1 className="text-3xl font-bold text-slate-900">Compare listings</h1>
              <p className="mt-2 text-sm text-slate-500">Side-by-side view for up to three shortlist picks.</p>
            </div>

            {ids.length < 2 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                <p className="text-lg font-semibold text-slate-900">Add at least two listings to compare</p>
                <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
                  Use the compare checkbox on activity or service cards, then return here when you&apos;re ready.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                    onClick={() => navigate('/event-activity')}
                  >
                    Browse activities
                  </button>
                  <button
                    type="button"
                    className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                    onClick={() => {
                      clearCompareIds();
                      setIds([]);
                    }}
                  >
                    Clear selection
                  </button>
                </div>
              </div>
            ) : (
              <>
                {swipeHint ? (
                  <p className="mb-3 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800 md:hidden">
                    Swipe horizontally to see all columns →
                  </p>
                ) : null}
                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                  <table className="w-full min-w-[720px] border-collapse text-left">
                    <thead>
                      <tr>
                        <th className="sticky left-0 z-20 w-48 border-b border-r border-slate-200 bg-slate-50 p-4 align-bottom text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Details
                        </th>
                        {items.map(({ id, item }) => (
                          <th key={id} className="min-w-[260px] border-b border-r border-slate-200 bg-white p-4 align-top">
                            <div className="relative">
                              {item?.photos?.[0] ? (
                                <img src={item.photos[0]} alt="" className="mb-3 h-32 w-full rounded-lg object-cover" />
                              ) : (
                                <div className="mb-3 flex h-32 w-full items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-500">
                                  No image
                                </div>
                              )}
                              {item?.is_mogzu_direct ? (
                                <div className="absolute right-2 top-2 rounded bg-blue-600 p-1 text-white shadow-sm">
                                  <ShieldCheck className="h-4 w-4" />
                                </div>
                              ) : null}
                              <div className="flex items-start justify-between gap-2">
                                <h3 className="line-clamp-2 text-base font-bold text-slate-900">{item?.name ?? `Listing ${id}`}</h3>
                                <button
                                  type="button"
                                  className="shrink-0 rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50"
                                  aria-label="Remove from compare"
                                  onClick={() => setIds(removeCompareId(id))}
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                              <div className="mt-2 flex items-center gap-2 text-sm text-slate-700">
                                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                <span className="font-medium">{item?.rating?.toFixed(1) ?? '—'}</span>
                                <span className="text-slate-300">•</span>
                                <span className="text-slate-500">{item ? syntheticReviews(item) : '—'} reviews</span>
                              </div>
                              <button
                                type="button"
                                className="mt-4 w-full rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                                onClick={() => openListing(id, item)}
                              >
                                {item ? getPricingCtaLabel(mapPricing(item)) : 'View'}
                              </button>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      <tr>
                        <td className="sticky left-0 z-10 border-b border-r border-slate-200 bg-slate-50 p-4 font-medium text-slate-700">
                          Price signal
                        </td>
                        {items.map(({ id, item }) => {
                          const highlight = Boolean(item && id === bestPriceId && numericPrice(item) != null);
                          return (
                            <td
                              key={id}
                              className={`border-b border-r border-slate-200 p-4 font-semibold text-slate-900 ${highlight ? 'bg-emerald-50' : ''}`}
                            >
                              {item ? (item.price_label ?? '—') : '—'}
                              {highlight ? <span className="ml-2 text-[10px] font-bold uppercase text-emerald-700">Best value</span> : null}
                            </td>
                          );
                        })}
                      </tr>
                      <tr>
                        <td className="sticky left-0 z-10 border-b border-r border-slate-200 bg-slate-50 p-4 font-medium text-slate-700">
                          Rating
                        </td>
                        {items.map(({ id, item }) => (
                          <td
                            key={id}
                            className={`border-b border-r border-slate-200 p-4 ${id === bestRatingId ? 'bg-emerald-50 font-semibold' : ''}`}
                          >
                            {item?.rating?.toFixed(1) ?? '—'}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="sticky left-0 z-10 border-b border-r border-slate-200 bg-slate-50 p-4 font-medium text-slate-700">
                          Reviews
                        </td>
                        {items.map(({ id, item }) => (
                          <td
                            key={id}
                            className={`border-b border-r border-slate-200 p-4 ${id === bestReviewsId ? 'bg-emerald-50 font-semibold' : ''}`}
                          >
                            {item ? syntheticReviews(item) : '—'}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="sticky left-0 z-10 border-b border-r border-slate-200 bg-slate-50 p-4 font-medium text-slate-700">
                          City
                        </td>
                        {items.map(({ id, item }) => (
                          <td key={id} className="border-b border-r border-slate-200 p-4 text-slate-800">
                            {item?.city ?? '—'}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="sticky left-0 z-10 border-b border-r border-slate-200 bg-slate-50 p-4 font-medium text-slate-700">
                          Category
                        </td>
                        {items.map(({ id, item }) => (
                          <td key={id} className="border-b border-r border-slate-200 p-4 text-slate-800">
                            {item?.category ?? '—'}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="sticky left-0 z-10 border-b border-r border-slate-200 bg-slate-50 p-4 font-medium text-slate-700">
                          Response
                        </td>
                        {items.map(({ id, item }) => (
                          <td key={id} className="border-b border-r border-slate-200 p-4 text-slate-600">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-slate-400" />
                              {item?.response_time_hours != null ? `Within ${item.response_time_hours}h` : '< 24 hours'}
                            </div>
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="sticky left-0 z-10 border-b border-r border-slate-200 bg-slate-50 p-4 align-top font-medium text-slate-700">
                          Highlights
                        </td>
                        {items.map(({ id, item }) => (
                          <td key={id} className="border-b border-r border-slate-200 p-4 align-top">
                            <ul className="flex flex-col gap-2 text-slate-600">
                              {(item?.tags?.length ? item.tags : [item?.category ?? 'Corporate event']).slice(0, 5).map((t) => (
                                <li key={t} className="flex items-start gap-2">
                                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                                  <span>{t}</span>
                                </li>
                              ))}
                            </ul>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
          <CompareStickyBar />
        </MogzuCorporateScrollSurface>
      </div>
    </div>
  );
}
