import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Clock3, ShieldCheck, Sparkles } from 'lucide-react';
import { SharedHeader } from '@/app/components/layouts/SharedHeader';
import { SharedSidebar } from '@/app/components/layouts/SharedSidebar';
import { MogzuCorporateScrollSurface } from '@/app/components/layouts/MogzuCorporateScrollSurface';
import { formatBuyerPaymentSummary } from '@/app/lib/mogzuDomain';
import type { MogzuOrder, PartnerListing } from '@/app/lib/mogzuDomain';
import { loadMogzuOrders, loadPartnerListings, saveMogzuOrders } from '@/app/lib/mogzuDomain';
import { getMergedCatalogue } from '@/utils/catalogueUtils';
import { resolvePartnerDisplayListing } from '@/utils/catalogueDetailHelpers';
import { useDemoRole } from '@/app/lib/demoRole';
import { findAdminListingById } from '@/app/lib/adminListingResolve';
import AdminListingActionPanel from '@/app/pages/admin/AdminListingActionPanel';
import { submitLead } from '@/lib/publicLeads';
import { useAuth } from '@/lib/auth';
import PublicLeadForm from '@/app/components/PublicLeadForm';
import { useCurrency } from '@/lib/i18n/useCurrency';
import {
  MOGZU_GLASS_CARD,
  MOGZU_GLASS_CHIP,
  MOGZU_GLASS_PANEL,
  MOGZU_PRIMARY_BTN,
} from '@/app/components/ui/mogzuGlassStyles';

function formatPrice(row: PartnerListing, formatCurrency: (value: number | null | undefined) => string): string {
  if (row.pricing_mode === 'on_request') return 'Price on request';
  if (row.pricing_mode === 'negotiable')
    return `From ${formatCurrency(row.price)} / ${row.price_unit} · negotiable`;
  return `${formatCurrency(row.price)} / ${row.price_unit}`;
}

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'amenities', label: 'Amenities' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'policies', label: 'T&C / Policies' },
  { id: 'payment', label: 'Payment' },
] as const;

type TabId = (typeof TABS)[number]['id'];

function buildListingJsonLd(listing: PartnerListing, providerName: string | null) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: listing.title,
    description: listing.description_short || listing.description_long || '',
    serviceType: listing.module,
    provider: {
      '@type': 'Organization',
      name: providerName || 'Mogzu Partner',
    },
    areaServed: 'IN',
    url: typeof window !== 'undefined' ? window.location.href : undefined,
  };
}

export default function PartnerListingCorporateDetailPage() {
  const navigate = useNavigate();
  const { id: idParam } = useParams<{ id: string }>();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedTab, setSelectedTab] = useState<TabId>('overview');
  const [bookingNotice, setBookingNotice] = useState('');
  const { activeRole } = useDemoRole();
  const { profile } = useAuth();
  const { formatCurrency } = useCurrency();

  const idDecoded = idParam ? decodeURIComponent(idParam) : '';

  const catalogueItem = useMemo(() => {
    if (!idDecoded) return null;
    return getMergedCatalogue().find((i) => i.id === idDecoded) ?? null;
  }, [idDecoded]);

  useEffect(() => {
    if (!idDecoded || !catalogueItem || catalogueItem.source_type !== 'mogzu_direct') return;
    navigate(
      `/browse/mogzu-direct/${catalogueItem.module}/${encodeURIComponent(idDecoded)}`,
      { replace: true },
    );
  }, [idDecoded, catalogueItem, navigate]);

  const domainListing = useMemo(() => {
    if (!idDecoded) return null;
    return loadPartnerListings().find((r) => r.id === idDecoded) ?? null;
  }, [idDecoded]);

  const listing = useMemo((): PartnerListing | null => {
    if (!catalogueItem || catalogueItem.source_type !== 'vendor') return null;
    return resolvePartnerDisplayListing(catalogueItem, domainListing);
  }, [catalogueItem, domainListing]);

  const listingJsonLd = useMemo(() => {
    if (!listing) return null;
    return buildListingJsonLd(listing, catalogueItem?.vendor_name ?? null);
  }, [listing, catalogueItem?.vendor_name]);

  const portfolioAll = useMemo(() => {
    if (!listing) return [];
    const bd = listing.buyer_detail;
    const merged = [...new Set([...listing.portfolio_links, ...bd.portfolio_links])];
    return merged;
  }, [listing]);

  const submitEnquiry = async () => {
    if (!listing) return;
    setBookingNotice('Submitting…');

    const summary = `Partner listing enquiry: ${listing.title} (${listing.module})`;
    const { id: leadId, error } = await submitLead({
      listing_id: listing.id,
      source_slug: 'partner_listing',
      client_name: profile?.full_name ?? 'Corporate user',
      client_email: profile?.email ?? 'unknown@mogzu',
      client_phone: profile?.phone ?? null,
      requirement_summary: summary,
      metadata: {
        listing_id: listing.id,
        module: listing.module,
        partner_id: listing.partner_id,
        pricing_mode: listing.pricing_mode,
        quoted_price: listing.price,
      },
    });

    const orders = loadMogzuOrders();
    const now = new Date().toISOString();
    const total = listing.pricing_mode === 'on_request' ? listing.price || 0 : listing.price;
    const partner_profit_share =
      total > 0 ? Math.round(((total * listing.profit_share_percentage) / 100) * 100) / 100 : undefined;
    const order: MogzuOrder = {
      id: leadId ? `lead-${leadId}` : `ord-${Date.now()}`,
      enquiry_id: leadId ?? `partner-${listing.id}`,
      corporate_user_id: profile?.id ?? 'corporate-demo',
      listing_id: listing.id,
      listing_type: 'partner',
      partner_id: listing.partner_id,
      status: 'received',
      total_amount: total,
      partner_profit_share,
      mogzu_margin: undefined,
      event_date: '',
      requirements: `Partner listing enquiry: ${listing.title} (${listing.module})`,
      created_at: now,
      updated_at: now,
    };
    saveMogzuOrders([...orders, order]);
    setBookingNotice(
      error
        ? `Enquiry queued locally — could not reach Mogzu sales pipeline (${error}).`
        : 'Enquiry submitted. Mogzu and the partner will follow up shortly.',
    );
  };

  const adminResolvedInitial = useMemo(() => (activeRole === 'admin' ? findAdminListingById(idDecoded) : null), [activeRole, idDecoded]);
  const [adminResolved, setAdminResolved] = useState(adminResolvedInitial);

  useEffect(() => {
    setAdminResolved(activeRole === 'admin' ? findAdminListingById(idDecoded) : null);
  }, [activeRole, idDecoded]);

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
          searchPlaceholder="Search partner listings"
        />
        <MogzuCorporateScrollSurface>
          <div className="mx-auto w-full max-w-[1280px] px-5 md:px-8 lg:px-12 py-6 md:py-8">
            {!idParam ? (
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
                This partner listing could not be found.
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="mt-3 block text-sm font-semibold text-blue-600 hover:underline"
                >
                  Go back
                </button>
              </div>
            ) : catalogueItem.source_type === 'mogzu_direct' ? (
              <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
                Opening Mogzu Direct listing…
              </div>
            ) : !catalogueItem.is_available ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
                This listing is not available for corporate view.
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
                This partner listing could not be found.
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="mt-3 block text-sm font-semibold text-blue-600 hover:underline"
                >
                  Go back
                </button>
              </div>
            ) : (
              <div className={activeRole === 'admin' ? 'grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start' : 'grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px] items-start'}>
              {listingJsonLd ? (
                <script
                  type="application/ld+json"
                  dangerouslySetInnerHTML={{ __html: JSON.stringify(listingJsonLd) }}
                />
              ) : null}
              <article className={`overflow-hidden ${MOGZU_GLASS_PANEL}`}>
                <div className="border-b border-white/60 bg-gradient-to-r from-[#F5F0FF]/90 via-white/90 to-[#EFF6FF]/90 px-6 py-4 backdrop-blur-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={MOGZU_GLASS_CHIP}>
                      <Sparkles className="size-3.5" /> Partner listing
                    </span>
                    <span className="text-xs text-slate-500">
                      Vetted partner · Mogzu-managed coordination
                    </span>
                  </div>
                </div>
                {listing.images[0] ? (
                  <div className="relative aspect-[21/9] w-full bg-slate-100">
                    <img src={listing.images[0]} alt={listing.title} className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/35 via-slate-900/5 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-end justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/85">
                          Partner
                        </p>
                        <h2 className="text-xl font-bold text-white drop-shadow-sm">{listing.title}</h2>
                      </div>
                      <span className="rounded-full border border-white/40 bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                        {listing.module === 'dspace' ? 'DSpace' : listing.module === 'gifting' ? 'Gifting' : 'Events'}
                      </span>
                    </div>
                  </div>
                ) : null}
                <div className="p-6 space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-900 border border-violet-100">
                      Partner ·{' '}
                      {listing.module === 'dspace' ? 'DSpace' : listing.module === 'gifting' ? 'Gifting' : 'Events'}
                    </span>
                    {listing.status === 'pending_review' ? (
                      <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-900 border border-amber-100">
                        Under review
                      </span>
                    ) : null}
                    <span className="text-xs text-slate-500">{listing.category}</span>
                  </div>
                  <h1 className="text-[30px] font-extrabold leading-tight tracking-[-0.02em] text-slate-900 sm:text-[34px]">
                    {listing.title}
                  </h1>
                  <p className="text-[22px] font-bold tracking-[-0.01em] text-slate-900">{formatPrice(listing, formatCurrency)}</p>
                  <div className="grid gap-2 sm:grid-cols-3">
                    <div className="rounded-xl border border-white/70 bg-white/55 px-3 py-2 backdrop-blur-sm">
                      <p className="text-[11px] uppercase tracking-wide text-slate-500">Category</p>
                      <p className="text-sm font-bold text-slate-900">{listing.category}</p>
                    </div>
                    <div className="rounded-xl border border-white/70 bg-white/55 px-3 py-2 backdrop-blur-sm">
                      <p className="text-[11px] uppercase tracking-wide text-slate-500">Pricing mode</p>
                      <p className="text-sm font-bold text-slate-900">
                        {listing.pricing_mode === 'on_request' ? 'On request' : listing.pricing_mode === 'negotiable' ? 'Negotiable' : 'Fixed'}
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
                        <p>{listing.description_short}</p>
                        <div>
                          <h2 className="text-sm font-semibold text-slate-800 mb-1">Details</h2>
                          <p className="whitespace-pre-wrap">{listing.description_long}</p>
                        </div>
                        {listing.videos.length > 0 ? (
                          <div>
                            <h2 className="text-sm font-semibold text-slate-800 mb-2">Videos</h2>
                            <ul className="space-y-1 text-sm">
                              {listing.videos.map((v) => (
                                <li key={v}>
                                  <a href={v} className="text-blue-600 hover:underline break-all" target="_blank" rel="noreferrer">
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
                        {portfolioAll.length ? (
                          <ul className="space-y-2 text-sm">
                            {portfolioAll.map((url, i) => (
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
                        Partner fulfilment with Mogzu coordination and support escalation.
                      </p>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
                    {activeRole === 'corporate' ? (
                      <>
                        <button
                          type="button"
                          onClick={submitEnquiry}
                          className={MOGZU_PRIMARY_BTN}
                        >
                          Submit enquiry
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate('/assistance')}
                          className="rounded-xl border border-white/40 bg-white/20 px-4 py-2 text-sm font-semibold text-[#1E3A8A] backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/35 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#93c5fd]/50 active:scale-[0.98]"
                        >
                          Mogzu Assistance
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
                      <h2 className="text-sm font-semibold text-slate-900">Need a detailed quote?</h2>
                      <p className="mt-1 text-xs text-slate-500">
                        Share your requirements and the sales team will follow up.
                      </p>
                      <div className="mt-3">
                        <PublicLeadForm
                          listingId={listing.id}
                          sourceSlug="partner_listing_detail"
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
                    <h3 className="text-sm font-bold text-slate-900">Why book via Mogzu partners</h3>
                    <ul className="mt-3 space-y-2 text-xs text-slate-600">
                      <li className="rounded-lg border border-white/70 bg-white/55 px-3 py-2 backdrop-blur-sm">
                        Verified partner operators with Mogzu oversight
                      </li>
                      <li className="rounded-lg border border-white/70 bg-white/55 px-3 py-2 backdrop-blur-sm">
                        Unified invoicing and corporate approval workflows
                      </li>
                      <li className="rounded-lg border border-white/70 bg-white/55 px-3 py-2 backdrop-blur-sm">
                        Dedicated support if delivery needs escalation
                      </li>
                    </ul>
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
