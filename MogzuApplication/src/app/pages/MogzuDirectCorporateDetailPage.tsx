import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Clock3, ShieldCheck, Sparkles } from 'lucide-react';
import { SharedHeader } from '@/app/components/layouts/SharedHeader';
import { SharedSidebar } from '@/app/components/layouts/SharedSidebar';
import { MogzuCorporateScrollSurface } from '@/app/components/layouts/MogzuCorporateScrollSurface';
import { formatBuyerPaymentSummary } from '@/app/lib/mogzuDomain';
import type { MogzuDirectListing, MogzuListingModule, MogzuOrder } from '@/app/lib/mogzuDomain';
import { loadMogzuDirectListings, loadMogzuOrders, saveMogzuOrders } from '@/app/lib/mogzuDomain';
import { refreshMogzuDirectCatalogueAsync } from '@/utils/mogzuDirectCatalogueAdmin';
import { getMergedCatalogue } from '@/utils/catalogueUtils';
import { resolveMogzuDirectDisplayListing } from '@/utils/catalogueDetailHelpers';
import { useDemoRole } from '@/app/lib/demoRole';
import { findAdminListingById } from '@/app/lib/adminListingResolve';
import AdminListingActionPanel from '@/app/pages/admin/AdminListingActionPanel';
import { submitLead } from '@/lib/publicLeads';
import { getPublicListing } from '@/lib/publicCatalogue';
import { useAuth } from '@/lib/auth';
import type { CatalogueItem } from '@/utils/catalogueTypes';
import { storageService } from '@/lib/storage';
import PublicLeadForm from '@/app/components/PublicLeadForm';
import { useCurrency } from '@/lib/i18n/useCurrency';
import {
  MOGZU_GLASS_CARD,
  MOGZU_GLASS_CHIP,
  MOGZU_GLASS_PANEL,
  MOGZU_PRIMARY_BTN,
} from '@/app/components/ui/mogzuGlassStyles';

function isModule(s: string | undefined): s is MogzuListingModule {
  return s === 'dspace' || s === 'gifting' || s === 'events';
}

function formatPrice(
  row: MogzuDirectListing,
  formatCurrency: (value: number | null | undefined) => string,
): string {
  if (row.pricing_mode === 'on_request') return 'Price on request';
  if (row.pricing_mode === 'negotiable')
    return `From ${formatCurrency(row.price)} / ${row.price_unit} · negotiable`;
  return `${formatCurrency(row.price)} / ${row.price_unit}`;
}

function prettyModuleLabel(module: MogzuListingModule): string {
  if (module === 'dspace') return 'DSpace';
  if (module === 'gifting') return 'Gifting';
  return 'Events';
}

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'amenities', label: 'Amenities' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'policies', label: 'T&C / Policies' },
  { id: 'payment', label: 'Payment' },
] as const;

type TabId = (typeof TABS)[number]['id'];

function buildListingJsonLd(listing: MogzuDirectListing) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: listing.title,
    description: listing.description_short || listing.description_long || '',
    serviceType: listing.module,
    provider: {
      '@type': 'Organization',
      name: 'Mogzu',
    },
    areaServed: 'IN',
    url: typeof window !== 'undefined' ? window.location.href : undefined,
  };
}

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
  const [heroImage, setHeroImage] = useState('');
  const [liveCatalogueItem, setLiveCatalogueItem] = useState<CatalogueItem | null>(null);
  const [liveLookupDone, setLiveLookupDone] = useState(false);
  const { activeRole } = useDemoRole();
  const { profile } = useAuth();
  const { formatCurrency } = useCurrency();

  const idDecoded = idParam ? decodeURIComponent(idParam) : '';

  const catalogueItem = useMemo(() => {
    if (!idDecoded) return null;
    if (liveCatalogueItem) return liveCatalogueItem;
    return getMergedCatalogue().find((i) => i.id === idDecoded) ?? null;
  }, [idDecoded, refreshKey, liveCatalogueItem]);

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

  useEffect(() => {
    let cancelled = false;
    if (!idDecoded) {
      setLiveLookupDone(true);
      setLiveCatalogueItem(null);
      return;
    }
    setLiveLookupDone(false);
    void getPublicListing(idDecoded).then(({ data }) => {
      if (cancelled) return;
      if (!data || !data.is_mogzu_direct) {
        setLiveCatalogueItem(null);
        setLiveLookupDone(true);
        return;
      }
      setLiveCatalogueItem({
        id: data.id,
        source_type: 'mogzu_direct',
        vendor_id: data.vendor_id,
        vendor_name: data.vendor_name ?? 'Mogzu',
        module: data.module,
        category: data.category_name ?? 'General',
        name: data.title,
        tagline: data.description ?? undefined,
        description: data.description,
        photos: data.cover_image_path ? [storageService.listingImages.getUrl(data.cover_image_path)] : [],
        videos: [],
        pricing_type:
          data.pricing_type === 'transparent' ||
          data.pricing_type === 'offer_price' ||
          data.pricing_type === 'request_for_price'
            ? data.pricing_type
            : 'request_for_price',
        base_price: data.base_price ?? undefined,
        price_label:
          data.base_price == null
            ? 'Price on request'
            : `₹${Number(data.base_price).toLocaleString('en-IN')}`,
        is_mogzu_direct: true,
        is_available: true,
        tags: [],
      });
      setLiveLookupDone(true);
    });
    return () => {
      cancelled = true;
    };
  }, [idDecoded]);

  const domainListing = useMemo(() => {
    if (!idDecoded) return null;
    return loadMogzuDirectListings().find((r) => r.id === idDecoded) ?? null;
    // refreshKey forces a re-read once Supabase refresh completes.
  }, [idDecoded, refreshKey]);

  const listing = useMemo((): MogzuDirectListing | null => {
    if (!catalogueItem || catalogueItem.source_type !== 'mogzu_direct') return null;
    return resolveMogzuDirectDisplayListing(catalogueItem, domainListing);
  }, [catalogueItem, domainListing]);

  const listingJsonLd = useMemo(() => {
    if (!listing) return null;
    return buildListingJsonLd(listing);
  }, [listing]);

  const moduleOk = isModule(moduleParam);
  const galleryImages = listing?.images ?? [];

  useEffect(() => {
    setHeroImage(galleryImages[0] ?? '');
  }, [idDecoded, galleryImages]);

  const adminResolvedInitial = useMemo(() => (activeRole === 'admin' ? findAdminListingById(idDecoded) : null), [activeRole, idDecoded]);
  const [adminResolved, setAdminResolved] = useState(adminResolvedInitial);

  useEffect(() => {
    setAdminResolved(activeRole === 'admin' ? findAdminListingById(idDecoded) : null);
  }, [activeRole, idDecoded]);

  const submitBookingRequest = async () => {
    if (!listing) return;
    setBookingNotice('Submitting…');

    // Real-data path: drop the enquiry into public_leads so it joins
    // the sales-agent queue (Phase 3 Feature 3). Falls back to the
    // localStorage MogzuOrder log on failure so the existing demo
    // surfaces still show the request.
    const summary = `Mogzu Direct enquiry: ${listing.title} (${listing.module})`;
    const { id: leadId, error } = await submitLead({
      listing_id: listing.id,
      source_slug: 'mogzu_direct',
      client_name: profile?.full_name ?? 'Corporate user',
      client_email: profile?.email ?? 'unknown@mogzu',
      client_phone: profile?.phone ?? null,
      requirement_summary: summary,
      metadata: {
        listing_id: listing.id,
        module: listing.module,
        pricing_mode: listing.pricing_mode,
        quoted_price: listing.price,
      },
    });

    const now = new Date().toISOString();
    const order: MogzuOrder = {
      id: leadId ? `lead-${leadId}` : `ord-${Date.now()}`,
      enquiry_id: leadId ?? `direct-${listing.id}`,
      corporate_user_id: profile?.id ?? 'corporate-demo',
      listing_id: listing.id,
      listing_type: 'mogzu_direct',
      status: 'received',
      total_amount: listing.price,
      event_date: '',
      requirements: summary,
      created_at: now,
      updated_at: now,
    };
    saveMogzuOrders([...loadMogzuOrders(), order]);

    setBookingNotice(
      error
        ? `Request queued locally — could not reach Mogzu sales pipeline (${error}).`
        : 'Request submitted. Mogzu will confirm details and payment with you shortly.',
    );
  };

  return (
    <div className="flex h-screen min-h-screen overflow-hidden mogzu-module-shell-bg">
      <SharedSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeNav="activity"
      />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden min-w-0">
        <SharedHeader
          variant="blended"
          onMobileMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          searchPlaceholder="Search Mogzu Direct"
        />
        <MogzuCorporateScrollSurface>
          <div className="mx-auto w-full max-w-[1280px] px-5 md:px-8 lg:px-12 py-6 md:py-8">
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
            ) : !liveLookupDone ? (
              <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
                Checking latest listing visibility…
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
              <div
                className={`grid grid-cols-1 gap-6 items-start ${
                  activeRole === 'admin' ? 'lg:grid-cols-[1fr_380px]' : 'lg:grid-cols-[1fr_320px]'
                }`}
              >
              {listingJsonLd ? (
                <script
                  type="application/ld+json"
                  dangerouslySetInnerHTML={{ __html: JSON.stringify(listingJsonLd) }}
                />
              ) : null}
              <article className={`overflow-hidden ${MOGZU_GLASS_PANEL}`}>
                <div className="border-b border-white/60 bg-gradient-to-r from-[#EEF4FF]/90 via-white/90 to-[#FFF1F7]/90 px-6 py-4 backdrop-blur-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={MOGZU_GLASS_CHIP}>
                      <Sparkles className="size-3.5" /> Curated by Mogzu
                    </span>
                    <span className="text-xs text-slate-500">
                      Direct fulfilment, vetted operators, managed delivery
                    </span>
                  </div>
                </div>
                {heroImage ? (
                  <div className="relative aspect-[21/9] w-full bg-slate-100">
                    <img src={heroImage} alt={listing.title} className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/35 via-slate-900/5 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-end justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/85">
                          Mogzu Direct
                        </p>
                        <h2 className="text-xl font-bold text-white drop-shadow-sm">{listing.title}</h2>
                      </div>
                      <span className="rounded-full border border-white/40 bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                        {prettyModuleLabel(listing.module)}
                      </span>
                    </div>
                  </div>
                ) : null}
                <div className="p-6 space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-800 border border-sky-100">
                      Mogzu Direct ·{' '}
                      {prettyModuleLabel(listing.module)}
                    </span>
                    <span className="text-xs text-slate-500">{listing.category}</span>
                  </div>
                  <h1 className="text-[30px] font-extrabold leading-tight tracking-[-0.02em] text-slate-900 sm:text-[34px]">
                    {listing.title}
                  </h1>
                  <p className="text-[22px] font-bold tracking-[-0.01em] text-slate-900">
                    {formatPrice(listing, formatCurrency)}
                  </p>
                  <div className="grid gap-2 sm:grid-cols-3">
                    <div className="rounded-xl border border-white/70 bg-white/55 px-3 py-2 backdrop-blur-sm">
                      <p className="text-[11px] uppercase tracking-wide text-slate-500">Category</p>
                      <p className="text-sm font-bold text-slate-900">{listing.category}</p>
                    </div>
                    <div className="rounded-xl border border-white/70 bg-white/55 px-3 py-2 backdrop-blur-sm">
                      <p className="text-[11px] uppercase tracking-wide text-slate-500">Pricing mode</p>
                      <p className="text-sm font-bold text-slate-900">
                        {listing.pricing_mode === 'on_request'
                          ? 'On request'
                          : listing.pricing_mode === 'negotiable'
                            ? 'Negotiable'
                            : 'Fixed'}
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/70 bg-white/55 px-3 py-2 backdrop-blur-sm">
                      <p className="text-[11px] uppercase tracking-wide text-slate-500">Response target</p>
                      <p className="text-sm font-bold text-slate-900">Within 4 business hours</p>
                    </div>
                  </div>

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

                  {galleryImages.length > 1 ? (
                    <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                      {galleryImages.map((src) => (
                        <button
                          key={src}
                          type="button"
                          onClick={() => setHeroImage(src)}
                        className={`overflow-hidden rounded-lg border transition-all duration-200 ${
                            heroImage === src
                              ? 'border-[#2563EB] ring-2 ring-[#2563EB]/20'
                            : 'border-slate-200 hover:border-[#93c5fd]'
                          }`}
                        >
                          <img src={src} alt="" className="h-14 w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  ) : null}

                  <div
                    className="flex flex-wrap gap-1 rounded-xl border border-white/70 bg-white/55 p-1 backdrop-blur-sm"
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
                        className={`rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#93c5fd]/50 ${
                          selectedTab === tab.id
                            ? 'bg-white text-slate-900 border border-slate-200 shadow-sm'
                            : 'text-slate-600 hover:bg-white/70 active:scale-[0.98]'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="min-h-[120px] pt-2" role="tabpanel">
                    {selectedTab === 'overview' && (
                      <div className="space-y-3 text-sm text-slate-600">
                        <p className="leading-7 text-slate-700">{listing.description_short}</p>
                        <div>
                          <h2 className="mb-1 text-sm font-bold uppercase tracking-wide text-slate-800">Details</h2>
                          <p className="whitespace-pre-wrap leading-7">{listing.description_long}</p>
                        </div>
                        {listing.videos && listing.videos.length > 0 ? (
                          <div>
                            <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-800">Videos</h2>
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
                        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-800">Amenities</h2>
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
                        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-800">Portfolio</h2>
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
                        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-800">T&amp;C / Policies</h2>
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
                        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-800">Payment</h2>
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
                    <p className="rounded-xl border border-emerald-200/70 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-900 backdrop-blur-sm">
                      {bookingNotice}
                    </p>
                  ) : (
                    <div className="rounded-xl border border-white/70 bg-white/55 px-4 py-3 text-xs text-slate-600 backdrop-blur-sm">
                      <p className="inline-flex items-center gap-1.5 font-medium text-slate-800">
                        <Clock3 className="size-3.5 text-slate-500" />
                        Typical response: within 4 business hours
                      </p>
                      <p className="mt-1 inline-flex items-center gap-1.5">
                        <ShieldCheck className="size-3.5 text-emerald-600" />
                        Managed by Mogzu operations with standardized QA and fulfilment checks.
                      </p>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
                    {activeRole === 'corporate' ? (
                      <>
                        <button
                          type="button"
                          onClick={submitBookingRequest}
                          className={MOGZU_PRIMARY_BTN}
                        >
                          Submit booking request
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate('/assistance')}
                          className="rounded-xl border border-white/40 bg-white/20 px-4 py-2 text-sm font-semibold text-[#1E3A8A] backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/35 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#93c5fd]/50 active:scale-[0.98]"
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
                      className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#93c5fd]/50 active:scale-[0.98]"
                    >
                      Back
                    </button>
                  </div>
                  {activeRole === 'corporate' ? (
                    <section className="mt-4 rounded-xl border border-white/70 bg-white/55 p-4 backdrop-blur-sm">
                      <h2 className="text-sm font-semibold text-slate-900">Need a custom proposal?</h2>
                      <p className="mt-1 text-xs text-slate-500">
                        Share scope, budget and timeline to get a tailored quote.
                      </p>
                      <div className="mt-3">
                        <PublicLeadForm
                          listingId={listing.id}
                          sourceSlug="mogzu_direct_detail"
                          compact
                        />
                      </div>
                    </section>
                  ) : null}
                </div>
              </article>
              {activeRole !== 'admin' ? (
                <aside className="space-y-4 lg:sticky lg:top-4">
                  <div className={MOGZU_GLASS_CARD + ' p-4'}>
                    <h3 className="text-sm font-bold text-slate-900">Why teams choose Mogzu Direct</h3>
                    <ul className="mt-3 space-y-2 text-xs text-slate-600">
                      <li className="rounded-lg border border-white/70 bg-white/55 px-3 py-2 backdrop-blur-sm">
                        Curated vendors and standardized execution checklists
                      </li>
                      <li className="rounded-lg border border-white/70 bg-white/55 px-3 py-2 backdrop-blur-sm">
                        Faster quoting with managed coordination by Mogzu ops
                      </li>
                      <li className="rounded-lg border border-white/70 bg-white/55 px-3 py-2 backdrop-blur-sm">
                        Cleaner escalation path for changes and support
                      </li>
                    </ul>
                  </div>
                  <div className="rounded-2xl border border-white/60 bg-gradient-to-br from-[#EFF6FF]/85 to-[#F8FBFF]/85 p-4 shadow-[0_10px_30px_rgba(37,99,235,0.14)] backdrop-blur-md">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#1E4DB7]">
                      Quick action
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      Want custom scope and pricing?
                    </p>
                    <p className="mt-1 text-xs text-slate-600">
                      Share requirements and we will come back with a managed proposal.
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate('/assistance')}
                      className="mt-3 w-full rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#1D4ED8] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#93c5fd]/60 active:scale-[0.98]"
                    >
                      Talk to Mogzu Assistance
                    </button>
                  </div>
                </aside>
              ) : null}
              {activeRole === 'admin' && adminResolved ? (
                <div className="lg:sticky lg:top-4 lg:self-start">
                  <AdminListingActionPanel resolved={adminResolved} onResolvedChange={setAdminResolved} />
                </div>
              ) : null}
              </div>
            )}
          </div>
        </MogzuCorporateScrollSurface>
      </div>
    </div>
  );
}
