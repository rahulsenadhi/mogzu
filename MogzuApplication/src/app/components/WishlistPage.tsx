import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Heart, Search } from 'lucide-react';
import svgPaths from '@/imports/svg-oytnjawqa3';
import { SharedHeader } from './layouts/SharedHeader';
import { SharedSidebar } from './layouts/SharedSidebar';
import { MogzuCorporateScrollSurface } from './layouts/MogzuCorporateScrollSurface';
import { getPricingBadgeConfig, getPricingCtaLabel, getPricingSummaryLine } from './ui/PriceBlock';
import type { ListingPricingType } from './ui/PriceBlock';
import {
  getCompareIds,
  getWishlistIds,
  getWishlistSavedAt,
  removeWishlistId,
  subscribeListingSession,
  toggleCompareId,
} from '@/app/lib/listingSessionState';
import { findCatalogueItemById, isServiceListingId } from '@/utils/listingResolve';
import type { CatalogueItem } from '@/utils/catalogueTypes';
import { CompareStickyBar } from './CompareStickyBar';
import { notifyUndo } from '@/app/lib/toast';

type FilterTab = 'all' | 'activities' | 'services';
type SortKey = 'date_saved' | 'name' | 'rating';

function mapPricingForCard(item: CatalogueItem): ListingPricingType {
  const pt = item.pricing_type;
  if (pt === 'transparent' || pt === 'offer_price' || pt === 'request_for_price') return pt;
  if (pt === 'fixed') return 'transparent';
  if (pt === 'negotiable' || pt === 'per_head' || pt === 'package') return 'offer_price';
  return 'request_for_price';
}

function listingMatchesFilter(item: CatalogueItem | undefined, tab: FilterTab): boolean {
  if (!item) return tab === 'all';
  if (tab === 'all') return true;
  const svc = isServiceListingId(item.id);
  if (tab === 'services') return svc;
  return !svc;
}

export default function WishlistPage() {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [wishlistIds, setWishlistIds] = useState(() => getWishlistIds());
  const [savedAt, setSavedAt] = useState(() => getWishlistSavedAt());
  const [compareIds, setCompareIds] = useState<string[]>(() => getCompareIds());
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const [sortKey, setSortKey] = useState<SortKey>('date_saved');
  const [undoTimer, setUndoTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null);
  const [fadeOutId, setFadeOutId] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setWishlistIds(getWishlistIds());
    setSavedAt(getWishlistSavedAt());
  }, []);

  useEffect(() => {
    return subscribeListingSession(() => {
      refresh();
      setCompareIds(getCompareIds());
    });
  }, [refresh]);

  useEffect(() => () => {
    if (undoTimer) window.clearTimeout(undoTimer);
  }, [undoTimer]);

  const resolved = useMemo(() => {
    return wishlistIds
      .map((id) => ({ id, item: findCatalogueItemById(id) }))
      .filter((row) => listingMatchesFilter(row.item, filterTab));
  }, [wishlistIds, filterTab]);

  const sorted = useMemo(() => {
    const rows = [...resolved];
    rows.sort((a, b) => {
      if (sortKey === 'name') {
        const an = a.item?.name ?? a.id;
        const bn = b.item?.name ?? b.id;
        return an.localeCompare(bn);
      }
      if (sortKey === 'rating') {
        return (b.item?.rating ?? 0) - (a.item?.rating ?? 0);
      }
      const ad = savedAt[a.id] ?? 0;
      const bd = savedAt[b.id] ?? 0;
      return bd - ad;
    });
    return rows;
  }, [resolved, sortKey, savedAt]);

  const count = wishlistIds.length;
  const empty = count === 0;

  const commitRemove = (id: string) => {
    removeWishlistId(id);
    refresh();
    setFadeOutId(null);
    setPendingRemoveId(null);
  };

  const startRemove = (id: string) => {
    if (undoTimer) window.clearTimeout(undoTimer);
    setFadeOutId(id);
    setPendingRemoveId(id);
    const t = window.setTimeout(() => {
      commitRemove(id);
      setUndoTimer(null);
    }, 5000);
    setUndoTimer(t);
    notifyUndo('Removed from wishlist.', () => {
      undoRemove();
      refresh();
    });
  };

  const undoRemove = () => {
    if (undoTimer) window.clearTimeout(undoTimer);
    setUndoTimer(null);
    setFadeOutId(null);
    setPendingRemoveId(null);
  };

  const avatarFallback = (name: string) => {
    const initials = name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join('');
    const palette = ['bg-slate-500', 'bg-blue-500', 'bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500'];
    const hash = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return { initials: initials || 'L', colorClass: palette[hash % palette.length] };
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#FFFDF9] font-['Inter']">
      <SharedSidebar collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <SharedHeader onMobileMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} searchPlaceholder="Search events..." />
        <MogzuCorporateScrollSurface>
          <div className="mx-auto max-w-[1400px] px-6 py-8 pb-28">
            {empty ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-[#ececec] bg-white px-6 py-20 text-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-rose-50">
                  <Heart className="h-10 w-10 text-rose-400" strokeWidth={1.5} />
                </div>
                <h1 className="mb-2 text-xl font-bold text-[#0e1e3f]">Your wishlist is empty</h1>
                <p className="mb-6 max-w-md text-sm text-[#878e9e]">
                  Save activities and services you like — they&apos;ll appear here for quick access and booking.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/event-activity')}
                  className="rounded-full bg-[#2563eb] px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-blue-700"
                >
                  Browse listings
                </button>
              </div>
            ) : (
              <>
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-[#0e1e3f]">Wishlist</h1>
                    <p className="mt-1 text-sm text-[#878e9e]">
                      {count} {count === 1 ? 'item' : 'items'} saved
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {(['all', 'activities', 'services'] as const).map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setFilterTab(tab)}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${
                          filterTab === tab ? 'bg-[#2563eb] text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {tab === 'all' ? 'All' : tab === 'activities' ? 'Activities' : 'Services'}
                      </button>
                    ))}
                    <label className="flex items-center gap-2 text-xs text-slate-600">
                      <span className="font-medium">Sort</span>
                      <select
                        value={sortKey}
                        onChange={(e) => setSortKey(e.target.value as SortKey)}
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-800"
                      >
                        <option value="date_saved">Date saved</option>
                        <option value="name">Name</option>
                        <option value="rating">Rating</option>
                      </select>
                    </label>
                  </div>
                </div>

                {sorted.length === 0 ? (
                  <div className="rounded-xl border border-[#ececec] bg-white py-16 text-center text-sm text-[#878e9e]">
                    No items in this filter. Try another tab.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {sorted.map(({ id, item }) => {
                      const inCompare = compareIds.includes(id);
                      const pricingType = item ? mapPricingForCard(item) : 'request_for_price';
                      const pricingListing = item
                        ? {
                            pricing_type: pricingType,
                            price_type: item.price_type,
                            base_price: item.base_price,
                            starting_price: item.starting_price,
                          }
                        : { pricing_type: 'request_for_price' as const };
                      const badge = getPricingBadgeConfig(pricingType);
                      const img = item?.photos?.[0];
                      const fading = fadeOutId === id && pendingRemoveId === id;

                      return (
                        <div
                          key={id}
                          className={`group flex h-full cursor-pointer flex-col overflow-hidden rounded-lg bg-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${
                            fading ? 'pointer-events-none opacity-40' : 'opacity-100'
                          }`}
                          onClick={() => {
                            if (isServiceListingId(id)) navigate('/event-services');
                            else navigate(`/event-activity/${encodeURIComponent(id)}`);
                          }}
                        >
                          <div className="relative h-[160px] overflow-hidden">
                            {img ? (
                              <img src={img} alt="" className="h-full w-full object-cover transition-transform duration-[400ms] ease-out group-hover:scale-[1.04]" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-slate-100 text-xs text-slate-500">No image</div>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (pendingRemoveId === id) return;
                                startRemove(id);
                              }}
                              className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-white/80 hover:bg-white"
                              aria-label="Remove from wishlist"
                            >
                              <svg className="size-5" fill="none" viewBox="0 0 24 24">
                                <path d={svgPaths.p1ccd9300} fill="#ef4444" />
                              </svg>
                            </button>
                            {item?.rating != null ? (
                              <div className="absolute left-2 top-2 flex items-center gap-0.5 rounded-full bg-[#22c55e] px-2 py-0.5 text-white">
                                <span className="text-xs font-medium">{item.rating.toFixed(1)}</span>
                                <svg className="size-3" fill="white" viewBox="0 0 17.119 16.2812">
                                  <path d={svgPaths.p32db9e00} />
                                </svg>
                              </div>
                            ) : null}
                          </div>
                          <div className="flex flex-1 flex-col p-3">
                            <h3 className="mb-1 line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-tight text-[#0e1e3f]">
                              {item?.name ?? `Listing ${id}`}
                            </h3>
                            <p className="mb-2 line-clamp-2 min-h-[2rem] text-xs text-[#878e9e]">{item?.tagline ?? item?.description ?? '—'}</p>
                            <div className="mb-1.5 flex items-center gap-1.5">
                              <svg className="size-3.5" fill="none" viewBox="0 0 22 22">
                                <path d={svgPaths.p260456f0} fill="#878E9E" />
                              </svg>
                              <span className="text-xs text-[#475569]">{item?.city ?? 'Location on request'}</span>
                            </div>
                            <div className="mb-3 rounded bg-[#f8f9fa] p-2">
                              <div className="flex items-center gap-2">
                                {(() => {
                                  const vendorName = item?.is_mogzu_direct ? 'Mogzu' : item?.vendor_name ?? 'Vendor';
                                  const f = avatarFallback(vendorName);
                                  return (
                                    <div className={`grid size-7 place-items-center rounded-full text-[12px] font-semibold text-white ${f.colorClass}`}>
                                      {f.initials}
                                    </div>
                                  );
                                })()}
                                <div className="flex-1">
                                  <p className="text-xs leading-none">
                                    <span className="text-[#878e9e]">by:</span>
                                    <span className="text-[#475569]"> {item?.is_mogzu_direct ? 'Mogzu' : item?.vendor_name ?? 'Vendor'}</span>
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="mt-auto space-y-2">
                              <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${badge.className}`}>{badge.label}</span>
                              <div className="text-sm font-semibold text-[#0e1e3f]">{item ? getPricingSummaryLine(pricingListing as never) : '—'}</div>
                              <label className="inline-flex items-center gap-1.5 text-[11px] text-slate-600" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="checkbox"
                                  checked={inCompare}
                                  onChange={() => {
                                    const r = toggleCompareId(id, 3);
                                    setCompareIds(r.ids);
                                  }}
                                />
                                Compare
                              </label>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (isServiceListingId(id)) navigate('/event-services');
                                  else navigate(`/event-activity/${encodeURIComponent(id)}`);
                                }}
                                className={`w-full rounded-lg py-2 text-sm font-semibold transition-colors ${
                                  pricingType === 'transparent'
                                    ? 'bg-[#2563eb] text-white hover:bg-blue-700'
                                    : pricingType === 'offer_price'
                                      ? 'border border-[#2563eb] text-[#2563eb] hover:bg-blue-50'
                                      : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                {getPricingCtaLabel(pricingType)}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
          <CompareStickyBar />
        </MogzuCorporateScrollSurface>
      </div>
    </div>
  );
}
