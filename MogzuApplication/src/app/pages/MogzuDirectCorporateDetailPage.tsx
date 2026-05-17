import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { SharedHeader } from '@/app/components/layouts/SharedHeader';
import { SharedSidebar } from '@/app/components/layouts/SharedSidebar';
import { formatBuyerPaymentSummary } from '@/app/lib/mogzuDomain';
import type { MogzuDirectListing, MogzuListingModule, MogzuOrder } from '@/app/lib/mogzuDomain';
import { loadMogzuDirectListings, loadMogzuOrders, saveMogzuOrders } from '@/app/lib/mogzuDomain';
import { refreshMogzuDirectCatalogueAsync } from '@/utils/mogzuDirectCatalogueAdmin';
import { getMergedCatalogue } from '@/utils/catalogueUtils';
import { resolveMogzuDirectDisplayListing } from '@/utils/catalogueDetailHelpers';
import { useDemoRole } from '@/app/lib/demoRole';
import { findAdminListingById } from '@/app/lib/adminListingResolve';
import AdminListingActionPanel from '@/app/pages/admin/AdminListingActionPanel';

function isModule(s: string | undefined): s is MogzuListingModule {
  return s === 'dspace' || s === 'gifting' || s === 'events';
}

function formatPrice(row: MogzuDirectListing): string {
  if (row.pricing_mode === 'on_request') return 'Price on request';
  if (row.pricing_mode === 'negotiable')
    return `From ₹${row.price.toLocaleString('en-IN')} / ${row.price_unit} · negotiable`;
  return `₹${row.price.toLocaleString('en-IN')} / ${row.price_unit}`;
}

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'amenities', label: 'Amenities' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'policies', label: 'T&C / Policies' },
  { id: 'payment', label: 'Payment' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function MogzuDirectCorporateDetailPage() {
  const navigate = useNavigate();
  const { module: moduleParam, id: idParam } = useParams<{ module: string; id: string }>();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedTab, setSelectedTab] = useState<TabId>('overview');
  const [bookingNotice, setBookingNotice] = useState('');
  // Phase 2 Feature 7 — refreshKey bumps after a Supabase refresh writes
  // the latest Mogzu Direct rows into the localStorage cache, so memos
  // that read from the cache re-run and pick them up.
  const [refreshKey, setRefreshKey] = useState(0);
  const { activeRole } = useDemoRole();

  const idDecoded = idParam ? decodeURIComponent(idParam) : '';

  const catalogueItem = useMemo(() => {
    if (!idDecoded) return null;
    return getMergedCatalogue().find((i) => i.id === idDecoded) ?? null;
  }, [idDecoded, refreshKey]);

  useEffect(() => {
    if (!idDecoded || !catalogueItem || catalogueItem.source_type !== 'vendor') return;
    navigate(`/browse/partner-listing/${encodeURIComponent(idDecoded)}`, { replace: true });
  }, [idDecoded, catalogueItem, navigate]);

  useEffect(() => {
    let cancelled = false;
    void refreshMogzuDirectCatalogueAsync().then(() => {
      if (!cancelled) setRefreshKey((k) => k + 1);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const domainListing = useMemo(() => {
    if (!idDecoded) return null;
    return loadMogzuDirectListings().find((r) => r.id === idDecoded) ?? null;
    // refreshKey forces a re-read once Supabase refresh completes.
  }, [idDecoded, refreshKey]);

  const listing = useMemo((): MogzuDirectListing | null => {
    if (!catalogueItem || catalogueItem.source_type !== 'mogzu_direct') return null;
    return resolveMogzuDirectDisplayListing(catalogueItem, domainListing);
  }, [catalogueItem, domainListing]);

  const moduleOk = isModule(moduleParam);

  const adminResolvedInitial = useMemo(() => (activeRole === 'admin' ? findAdminListingById(idDecoded) : null), [activeRole, idDecoded]);
  const [adminResolved, setAdminResolved] = useState(adminResolvedInitial);

  useEffect(() => {
    setAdminResolved(activeRole === 'admin' ? findAdminListingById(idDecoded) : null);
  }, [activeRole, idDecoded]);

  const submitBookingRequest = () => {
    if (!listing) return;
    const orders = loadMogzuOrders();
    const now = new Date().toISOString();
    const total =
      listing.pricing_mode === 'on_request' || listing.pricing_mode === 'negotiable'
        ? listing.price
        : listing.price;
    const order: MogzuOrder = {
      id: `ord-${Date.now()}`,
      enquiry_id: `direct-${listing.id}`,
      corporate_user_id: 'corporate-demo',
      listing_id: listing.id,
      listing_type: 'mogzu_direct',
      status: 'received',
      total_amount: total,
      event_date: '',
      requirements: `Mogzu Direct booking request: ${listing.title} (${listing.module})`,
      created_at: now,
      updated_at: now,
    };
    saveMogzuOrders([...orders, order]);
    setBookingNotice('Request submitted. Mogzu will confirm details and payment with you shortly.');
  };

  return (
    <div className="flex h-screen bg-[#f5f7fa] overflow-hidden">
      <SharedSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeNav="activity"
      />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <SharedHeader
          onMobileMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          searchPlaceholder="Search"
        />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-6 py-8">
            {!moduleOk || !idParam ? (
              <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
                Invalid listing URL.
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="mt-3 block text-sm font-semibold text-blue-600 hover:underline"
                >
                  Back to dashboard
                </button>
              </div>
            ) : !catalogueItem ? (
              <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
                This Mogzu listing could not be found or is no longer available.
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="mt-3 block text-sm font-semibold text-blue-600 hover:underline"
                >
                  Go back
                </button>
              </div>
            ) : catalogueItem.source_type === 'vendor' ? (
              <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
                Opening partner listing…
              </div>
            ) : !catalogueItem.is_available ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
                This listing is not currently published for corporate view.
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="mt-3 block text-sm font-semibold text-blue-600 hover:underline"
                >
                  Back to dashboard
                </button>
              </div>
            ) : !listing ? (
              <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
                This Mogzu listing could not be found or is no longer available.
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="mt-3 block text-sm font-semibold text-blue-600 hover:underline"
                >
                  Go back
                </button>
              </div>
            ) : (
              <div className={activeRole === 'admin' ? 'grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start' : ''}>
              <article className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                {listing.images[0] ? (
                  <div className="aspect-[21/9] w-full bg-slate-100">
                    <img src={listing.images[0]} alt="" className="h-full w-full object-cover" />
                  </div>
                ) : null}
                <div className="p-6 space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-800 border border-sky-100">
                      Mogzu Direct ·{' '}
                      {listing.module === 'dspace' ? 'DSpace' : listing.module === 'gifting' ? 'Gifting' : 'Events'}
                    </span>
                    <span className="text-xs text-slate-500">{listing.category}</span>
                  </div>
                  <h1 className="text-2xl font-bold text-slate-900">{listing.title}</h1>
                  <p className="text-lg font-semibold text-slate-900">{formatPrice(listing)}</p>

                  {catalogueItem.is_mogzu_direct ? (
                    <div className="flex items-center gap-2 p-4 bg-[#FFF0F6] rounded-xl border border-[#FFD6E7]">
                      <span className="text-[#D4206A] text-lg">✦</span>
                      <div>
                        <p className="font-[DM_Sans] text-sm font-semibold text-[#D4206A]">Mogzu Direct</p>
                        <p className="font-[DM_Sans] text-xs text-[#9898B0]">
                          Sourced, curated & fulfilled by Mogzu&apos;s team
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-4 bg-[#F4F4F8] rounded-xl border border-[#E2E2EE]">
                      <div className="w-8 h-8 rounded-full bg-[#E2E2EE]" />
                      <div>
                        <p className="font-[DM_Sans] text-sm font-semibold text-[#1A1A2E]">
                          {catalogueItem.vendor_name}
                        </p>
                        <p className="font-[DM_Sans] text-xs text-[#9898B0]">Independent vendor on Mogzu</p>
                      </div>
                    </div>
                  )}

                  <div
                    className="flex flex-wrap gap-1 border-b border-slate-200 pb-1"
                    role="tablist"
                    aria-label="Listing sections"
                  >
                    {TABS.map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={selectedTab === tab.id}
                        onClick={() => setSelectedTab(tab.id)}
                        className={`rounded-t-lg px-3 py-2 text-xs font-semibold transition-colors ${
                          selectedTab === tab.id
                            ? 'bg-slate-100 text-slate-900 border border-b-0 border-slate-200'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="min-h-[120px] pt-2" role="tabpanel">
                    {selectedTab === 'overview' && (
                      <div className="space-y-3 text-sm text-slate-600">
                        <p>{listing.description_short}</p>
                        <div>
                          <h2 className="text-sm font-semibold text-slate-800 mb-1">Details</h2>
                          <p className="whitespace-pre-wrap">{listing.description_long}</p>
                        </div>
                        {listing.videos && listing.videos.length > 0 ? (
                          <div>
                            <h2 className="text-sm font-semibold text-slate-800 mb-2">Videos</h2>
                            <ul className="space-y-1 text-sm">
                              {listing.videos.map((v) => (
                                <li key={v}>
                                  <a
                                    href={v}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 font-medium hover:underline break-all"
                                  >
                                    {v}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : null}
                        {listing.images.length > 1 ? (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
                            {listing.images.slice(1).map((src) => (
                              <img
                                key={src}
                                src={src}
                                alt=""
                                className="h-28 w-full rounded-lg object-cover border border-slate-100"
                              />
                            ))}
                          </div>
                        ) : null}
                      </div>
                    )}
                    {selectedTab === 'amenities' && (
                      <div>
                        <h2 className="text-sm font-semibold text-slate-800 mb-3">Amenities</h2>
                        {listing.buyer_detail.amenities.length ? (
                          <ul className="list-disc list-inside space-y-1 text-sm text-slate-600">
                            {listing.buyer_detail.amenities.map((a) => (
                              <li key={a}>{a}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-slate-500">Not specified.</p>
                        )}
                      </div>
                    )}
                    {selectedTab === 'portfolio' && (
                      <div>
                        <h2 className="text-sm font-semibold text-slate-800 mb-3">Portfolio</h2>
                        {listing.buyer_detail.portfolio_links.length ? (
                          <ul className="space-y-2 text-sm">
                            {listing.buyer_detail.portfolio_links.map((url, i) => (
                              <li key={url}>
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 font-medium hover:underline break-all"
                                >
                                  {listing.buyer_detail.portfolio_captions[i] || url}
                                </a>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-slate-500">Not specified.</p>
                        )}
                      </div>
                    )}
                    {selectedTab === 'policies' && (
                      <div>
                        <h2 className="text-sm font-semibold text-slate-800 mb-3">T&amp;C / Policies</h2>
                        {listing.buyer_detail.policies.length ? (
                          <ul className="list-disc list-inside space-y-1 text-sm text-slate-600">
                            {listing.buyer_detail.policies.map((p) => (
                              <li key={p}>{p}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-slate-500">Not specified.</p>
                        )}
                      </div>
                    )}
                    {selectedTab === 'payment' && (
                      <div className="space-y-3 text-sm text-slate-600">
                        <h2 className="text-sm font-semibold text-slate-800">Payment</h2>
                        {listing.buyer_detail.payment_methods.length ? (
                          <p>
                            <span className="font-medium text-slate-800">Accepted: </span>
                            {listing.buyer_detail.payment_methods.join(', ')}
                          </p>
                        ) : (
                          <p className="text-slate-500">No payment methods listed.</p>
                        )}
                        {listing.buyer_detail.payment_terms.trim() ? (
                          <p className="whitespace-pre-wrap">
                            <span className="font-medium text-slate-800">Terms: </span>
                            {listing.buyer_detail.payment_terms}
                          </p>
                        ) : (
                          <p className="text-slate-500">No payment terms listed.</p>
                        )}
                        {formatBuyerPaymentSummary(listing.buyer_detail) ? (
                          <p className="text-xs text-slate-500 border-t border-slate-100 pt-2">
                            Summary: {formatBuyerPaymentSummary(listing.buyer_detail)}
                          </p>
                        ) : null}
                      </div>
                    )}
                  </div>

                  {bookingNotice ? (
                    <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                      {bookingNotice}
                    </p>
                  ) : null}
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
                    {activeRole === 'corporate' ? (
                      <>
                        <button
                          type="button"
                          onClick={submitBookingRequest}
                          className="rounded-xl px-4 py-2 text-sm font-semibold text-white bg-slate-800 hover:bg-slate-900"
                        >
                          Submit booking request
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate('/assistance')}
                          className="rounded-xl px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700"
                        >
                          Enquire via Mogzu Assistance
                        </button>
                      </>
                    ) : activeRole === 'vendor' ? (
                      <div
                        className="w-full rounded-lg px-3 py-2 text-xs text-slate-800"
                        style={{ backgroundColor: 'var(--color-warning-highlight)' }}
                      >
                        You are previewing your listing as it appears to corporate clients.
                      </div>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => navigate(-1)}
                      className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Back
                    </button>
                  </div>
                </div>
              </article>
              {activeRole === 'admin' && adminResolved ? (
                <div className="lg:sticky lg:top-4 lg:self-start">
                  <AdminListingActionPanel resolved={adminResolved} onResolvedChange={setAdminResolved} />
                </div>
              ) : null}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
