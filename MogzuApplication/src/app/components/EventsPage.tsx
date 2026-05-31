import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { SharedHeader } from './layouts/SharedHeader';
import { SharedSidebar } from './layouts/SharedSidebar';
import { MogzuCorporateScrollSurface } from './layouts/MogzuCorporateScrollSurface';
import { Search, ChevronDown, AlertCircle, Home, PlayCircle, X, Check } from 'lucide-react';
import svgPaths from '@/imports/svg-oytnjawqa3';
import { QA_IMAGES } from '../lib/qaImagery';
import EventServiceContent from './EventServiceContent';
import { CompareStickyBar } from './CompareStickyBar';
import { DevMockDataBanner } from './global/DevMockDataBanner';
import { WishlistHeart } from './global/WishlistHeart';
import { RatingBadge } from './global/RatingBadge';
import { getMergedCatalogue } from '@/utils/catalogueUtils';
import type { CatalogueItem } from '@/utils/catalogueTypes';
import { formatInr, matchesPriceRange, matchesSourceFilter, type CatalogueSourceFilter } from '@/utils/filterContracts';
import { getPricingBadgeConfig, getPricingCtaLabel, getPricingSummaryLine } from './ui/PriceBlock';
import { getCompareIds, toggleCompareId } from '@/app/lib/listingSessionState';
import { useDemoRole } from '@/app/lib/demoRole';
import { getEventActivityCategoryConfigs, getEventIconByCategoryText, getEventServiceCategoryIconConfig } from '@/app/lib/eventsIconMapping';
import { db } from '@/lib/db';
import { storageService } from '@/lib/storage';
import { listingToEventsCatalogueItem as listingToCatalogueItem } from '@/utils/eventsListingCatalogue';
import { isListingUuid } from '@/app/lib/activityListingResolver';
import svgPathsSpaceX from '@/imports/svg-5pj2l0pukf';
import { Utensils } from 'lucide-react';
const imgImage25026 = QA_IMAGES.category.tabActive;
const imgImage25027 = QA_IMAGES.category.tabInactive;
const imgImage24995 = QA_IMAGES.eventsHero;
const imgImage25005 = QA_IMAGES.eventCard[0];
const imgImage25006 = QA_IMAGES.eventCard[1];
const imgImage25007 = QA_IMAGES.eventCard[2];
const imgImage25008 = QA_IMAGES.eventCard[3];
const imgImage25009 = QA_IMAGES.eventCard[4];
const imgImage25010 = QA_IMAGES.category.art;
const imgImage25011 = QA_IMAGES.category.games;
const imgImage25012 = QA_IMAGES.category.wellness;
const imgImage25013 = QA_IMAGES.category.party;
const imgImage25014 = QA_IMAGES.category.csr;
const imgImage25015 = QA_IMAGES.category.entertainment;
const imgImage25028 = QA_IMAGES.category.workshop;
const imgEllipse3376 = QA_IMAGES.category.ellipseBadge;

function eventDetailRoute(
  id: string,
  pricingType: 'transparent' | 'offer_price' | 'request_for_price',
) {
  const routeId = String(id);
  return {
    pathname: `/event-activity/${encodeURIComponent(routeId)}`,
    state: {
      source_listing_id: isListingUuid(routeId) ? routeId : undefined,
      pricing_type: pricingType,
    },
  };
}

export default function EventsPage() {
  const { activeRole } = useDemoRole();

  const avatarFallback = (name: string) => {
    const initials = name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join('');
    const palette = ['bg-slate-500', 'bg-blue-500', 'bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500'];
    const hash = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return { initials: initials || 'V', colorClass: palette[hash % palette.length] };
  };
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('events');
  const [selectedEventCategories, setSelectedEventCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [isError, setIsError] = useState(false);
  const [searchLocation, setSearchLocation] = useState('');
  const [searchGuests, setSearchGuests] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [sourceFilter, setSourceFilter] = useState<CatalogueSourceFilter>('all');
  const [budgetMin, setBudgetMin] = useState('');
  const [priceMax, setPriceMax] = useState(50000);
  const [eventModuleFilter, setEventModuleFilter] = useState<'events' | 'all'>('events');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [sectionCollapsed, setSectionCollapsed] = useState<Record<string, boolean>>({
    module: false,
    category: false,
    source: false,
    price: false,
  });
  const [compareIds, setCompareIds] = useState<string[]>(() => getCompareIds());
  const [toast, setToast] = useState('');
  const [pricingTooltip, setPricingTooltip] = useState<{ id: string; text: string } | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [gridAnimatingOut, setGridAnimatingOut] = useState(false);
  const firstFilterRunRef = useRef(true);
  useEffect(() => {
    const st = location.state as { tab?: string } | null;
    if (st?.tab === 'event-service') {
      navigate('/event-services', { replace: true, state: null });
      return;
    }
    if (st?.tab === 'event-activity') {
      navigate('/event-activity', { replace: true, state: null });
    }
  }, [location.state, navigate]);
  useEffect(() => {
    const id = window.setTimeout(() => setInitialLoading(false), 800);
    return () => window.clearTimeout(id);
  }, []);
  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(''), 2200);
    return () => window.clearTimeout(id);
  }, [toast]);
  useEffect(() => {
    if (firstFilterRunRef.current) {
      firstFilterRunRef.current = false;
      return;
    }
    setGridAnimatingOut(true);
    const outId = window.setTimeout(() => setGridAnimatingOut(false), 250);
    return () => window.clearTimeout(outId);
  }, [searchLocation, searchGuests, searchDate, searchKeyword, sourceFilter, budgetMin, priceMax, eventModuleFilter, selectedEventCategories, selectedCategory, activeTab]);

  const EVENT_CATEGORY_OPTIONS = [
    'Live Music & Bands',
    'DJ & Electronic',
    'Comedy & Stand-up',
    'Cultural Performances',
    'Emcee & Anchoring',
    'Team Building Activities',
    'Corporate Workshops',
    'Outdoor Adventures',
    'Magic & Illusion',
    'Catering & F&B',
    'Photography & Videography',
    'Décor & Ambience',
    'AV & Technical Production',
  ];

  const toggleEventCategory = (filter: string) => {
    setSelectedEventCategories((prev) =>
      prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
    );
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'p2ab88b80', path: '/dashboard' },
    { id: 'activity', label: 'Activity Suite', icon: 'p414b380', path: '/activitysuite' },
    { id: 'shop', label: 'Shop', icon: 'paf72c00', path: '/shop' },
    { id: 'spacex', label: 'D Space', icon: 'p27070280', path: '/spacex' },
    { id: 'celebrations', label: 'Celebrations', icon: 'p29193540', path: '/celebrations' },
    { id: 'users', label: 'Users', icon: 'p1f81a280', path: '/user-management' },
    { id: 'notification', label: 'Notification', icon: 'p3e2aee80' },
    { id: 'help', label: 'Help & Support', icon: 'p319d300' },
    { id: 'profile', label: 'Profile', icon: 'p1f81a280' },
    { id: 'favorites', label: 'Favorites', icon: 'p2683f80' },
    { id: 'settings', label: 'Settings', icon: 'p32caf6b0' },
  ];

  const categories = [
    { 
      image: imgImage25028, 
      label: 'Workshops &\nTrainings',
      imageTransform: 'scale-y-[-1] rotate-180',
      imageSize: { width: 'w-[41.576px]', height: 'h-[40.727px]' },
      imageOffset: { left: 'left-[-7.46%]', top: 'top-0' },
      imageScale: { width: 'w-[116.42%]', height: 'h-[117.06%]' },
      containerOffset: { left: 'ml-0', top: 'mt-[0.85px]' }
    },
    { 
      image: imgImage25010, 
      label: 'Art &\ncreativity',
      imageTransform: 'scale-y-[-1] rotate-180',
      imageSize: { width: 'w-[36px]', height: 'h-[42px]' },
      imageOffset: { left: 'left-[-16.82%]', top: 'top-0' },
      imageScale: { width: 'w-[135.48%]', height: 'h-[116.67%]' },
      containerOffset: { left: 'ml-[3.5px]', top: 'mt-0' }
    },
    { 
      image: imgImage25011, 
      label: 'Virtual\ngames',
      imageTransform: 'scale-y-[-1] rotate-180',
      imageSize: { width: 'w-[42px]', height: 'h-[42px]' },
      imageOffset: { left: 'left-[-8.33%]', top: 'top-0' },
      imageScale: { width: 'w-[116.67%]', height: 'h-[116.67%]' },
      containerOffset: { left: 'ml-[0.88px]', top: 'mt-0' }
    },
    { 
      image: imgImage25012, 
      label: 'Wellness\nprograms',
      imageTransform: 'scale-y-[-1] rotate-180',
      imageSize: { width: 'w-[42px]', height: 'h-[40px]' },
      imageOffset: { left: 'left-[-8.33%]', top: 'top-[-2.94%]' },
      imageScale: { width: 'w-[116.67%]', height: 'h-[123.53%]' },
      containerOffset: { left: 'ml-[0.5px]', top: 'mt-px' }
    },
    { 
      image: imgImage25015, 
      label: 'Entertainment',
      imageTransform: '',
      imageSize: { width: 'w-[42px]', height: 'h-[41px]' },
      imageOffset: { left: 'left-[-8.33%]', top: 'top-0' },
      imageScale: { width: 'w-[116.67%]', height: 'h-[120%]' },
      containerOffset: { left: 'ml-[0.5px]', top: 'mt-0' }
    },
    { 
      image: imgImage25010, 
      label: 'Educational',
      imageTransform: 'scale-y-[-1] rotate-180',
      imageSize: { width: 'w-[36px]', height: 'h-[42px]' },
      imageOffset: { left: 'left-[-16.82%]', top: 'top-0' },
      imageScale: { width: 'w-[135.48%]', height: 'h-[116.67%]' },
      containerOffset: { left: 'ml-[3.5px]', top: 'mt-0' }
    },
    { 
      image: imgImage25013, 
      label: 'Themed\nparties',
      imageTransform: '',
      imageSize: { width: 'w-[41px]', height: 'h-[40px]' },
      imageOffset: { left: 'left-[-8.33%]', top: 'top-0' },
      imageScale: { width: 'w-[116.67%]', height: 'h-[120%]' },
      containerOffset: { left: 'ml-[0.5px]', top: 'mt-0' }
    },
    { 
      image: imgImage25014, 
      label: 'Corporate social\nresponsibility (CSR)',
      imageTransform: '',
      imageSize: { width: 'w-[42px]', height: 'h-[42px]' },
      imageOffset: { left: 'left-[-8.33%]', top: 'top-0' },
      imageScale: { width: 'w-[116.67%]', height: 'h-[116.67%]' },
      containerOffset: { left: 'ml-[0.5px]', top: 'mt-0' }
    }
  ];

  const [supabaseEvents, setSupabaseEvents] = useState<CatalogueItem[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setEventsLoading(true);
      setEventsError(null);
      const { data, error } = await db.listings.listByModule('events', 'active');
      if (cancelled) return;
      if (error) {
        setEventsError(error.message);
        setSupabaseEvents([]);
      } else {
        setSupabaseEvents((data ?? []).map(listingToCatalogueItem));
      }
      setEventsLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const categoryToMasterMap: Record<number, string[]> = {
    0: ['Corporate Workshops', 'Team Building Activities'],
    1: ['Cultural Performances', 'Magic & Illusion'],
    2: ['Team Building Activities'],
    3: ['Team Building Activities', 'Corporate Workshops'],
    4: ['Live Music & Bands', 'DJ & Electronic'],
    5: ['Corporate Workshops'],
    6: ['Comedy & Stand-up', 'Emcee & Anchoring'],
    7: ['Outdoor Adventures', 'Team Building Activities'],
  };

  const fallbackEvents: CatalogueItem[] = [
    { id: 'evt-fallback-1', source_type: 'mogzu_direct', module: 'events', category: 'Corporate Workshops', name: 'Personal Training Workshop', tagline: 'Elevate your personal training skills', description: 'Workshop format for teams.', photos: [imgImage25005], pricing_type: 'fixed', base_price: 15000, price_label: '₹15,000', is_mogzu_direct: true, is_available: true, city: 'Mumbai', tags: ['workshop'] },
    { id: 'evt-fallback-2', source_type: 'vendor', module: 'events', category: 'Team Building Activities', name: 'Leadership Sprint', tagline: 'Leadership sprint for managers', description: 'Leadership and collaboration sprint.', photos: [imgImage25006], pricing_type: 'fixed', base_price: 22000, price_label: '₹22,000', is_mogzu_direct: false, is_available: true, vendor_name: 'Partner', city: 'Mumbai', tags: ['leadership'] },
    { id: 'evt-fallback-3', source_type: 'mogzu_direct', module: 'events', category: 'Live Music & Bands', name: 'Live Band Evening', tagline: 'Corporate entertainment set', description: 'Live band performance for evening events.', photos: [imgImage25007], pricing_type: 'package', base_price: 45000, price_label: '₹45,000', is_mogzu_direct: true, is_available: true, city: 'Mumbai', tags: ['live band', 'entertainment'] },
  ];
  const normalizePricingType = (pricingType: CatalogueItem['pricing_type']) => {
    if (pricingType === 'transparent' || pricingType === 'offer_price' || pricingType === 'request_for_price') {
      return pricingType;
    }
    if (pricingType === 'custom_quote') return 'request_for_price';
    return 'transparent';
  };

  const mergedEvents = useMemo(() => {
    if (supabaseEvents.length > 0) return supabaseEvents;
    const fromCatalogue = getMergedCatalogue().filter((i) => i.module === 'events');
    return fromCatalogue.length > 0 ? fromCatalogue : fallbackEvents;
  }, [supabaseEvents]);

  const usingDemoEvents = supabaseEvents.length === 0 && !eventsLoading && !eventsError;

  const eventCards = useMemo(
    () =>
      mergedEvents.map((event, idx) => ({
        ...event,
        image: event.photos[0] ?? QA_IMAGES.eventCard[idx % QA_IMAGES.eventCard.length],
        minGuests: 20 + (idx % 8) * 10,
        maxGuests: 100 + (idx % 8) * 40,
        availableOn: `2026-0${(idx % 6) + 5}-1${idx % 9}`,
      })),
    [mergedEvents],
  );

  const filteredEvents = eventCards.filter((event) => {
    if (eventModuleFilter !== 'all' && event.module !== eventModuleFilter) return false;
    const keyword = searchKeyword.trim().toLowerCase();
    const locationMatch = searchLocation.trim()
      ? (event.city ?? '').toLowerCase().includes(searchLocation.trim().toLowerCase())
      : true;
    const keywordMatch = keyword
      ? `${event.name} ${event.category} ${event.description}`.toLowerCase().includes(keyword)
      : true;
    const guestsMatch = searchGuests.trim() ? Number(searchGuests) >= event.minGuests : true;
    const dateMatch = searchDate.trim() ? event.availableOn >= searchDate : true;
    const categoryMatch =
      selectedEventCategories.length > 0 ? selectedEventCategories.includes(event.category) : true;
    const sourceMatch = matchesSourceFilter(sourceFilter, event.is_mogzu_direct);
    const listPrice = event.base_price ?? (event.price_label ? Number(event.price_label.replace(/[^\d]/g, '')) : null);
    const budgetMatch = matchesPriceRange(listPrice, budgetMin ? Number(budgetMin) : undefined, priceMax);
    return locationMatch && keywordMatch && guestsMatch && dateMatch && categoryMatch && sourceMatch && budgetMatch;
  });

  const handleResetSearch = () => {
    setSearchLocation('');
    setSearchGuests('');
    setSearchDate('');
    setSearchKeyword('');
    setSelectedEventCategories([]);
    setSourceFilter('all');
    setBudgetMin('');
    setEventModuleFilter('events');
    setPriceMax(50000);
  };

  const activeFilterCount =
    selectedEventCategories.length +
    (sourceFilter !== 'all' ? 1 : 0) +
    (budgetMin ? 1 : 0) +
    (priceMax !== 50000 ? 1 : 0);

  const activeFilterChips = [
    ...(searchLocation ? [{ key: 'location', label: `City: ${searchLocation}` }] : []),
    ...(budgetMin ? [{ key: 'budgetMin', label: `Budget min: ${formatInr(Number(budgetMin))}` }] : []),
    ...(priceMax !== 50000 ? [{ key: 'budgetMax', label: `Budget up to: ${formatInr(priceMax)}` }] : []),
    ...(sourceFilter !== 'all' ? [{ key: 'source', label: `Source: ${sourceFilter}` }] : []),
    ...selectedEventCategories.map((x) => ({ key: `category-${x}`, label: `Category: ${x}` })),
  ];

  const removeChip = (key: string) => {
    if (key === 'location') setSearchLocation('');
    if (key === 'budgetMin') setBudgetMin('');
    if (key === 'budgetMax') setPriceMax(50000);
    if (key === 'source') setSourceFilter('all');
    if (key.startsWith('category-')) {
      const v = key.replace('category-', '');
      setSelectedEventCategories((prev) => prev.filter((c) => c !== v));
    }
  };

  const FiltersPanel = (
    <div className="bg-white/55 backdrop-blur-xl rounded-2xl p-5 border border-white/60 shadow-[0_16px_36px_rgba(37,99,235,0.16)] lg:sticky lg:top-4 max-h-[82vh] overflow-y-auto pb-20 relative">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[#0e1e3f] text-sm font-semibold">Filters</h3>
        <button
          onClick={() => {
            handleResetSearch();
            setMobileFiltersOpen(false);
          }}
          className="text-[#2563eb] text-xs hover:underline"
        >
          Clear all
        </button>
      </div>

      <div className="space-y-3">
        {[
          { id: 'module', label: 'Module' },
          { id: 'category', label: 'Category' },
          { id: 'source', label: 'Source' },
          { id: 'price', label: 'Price' },
        ].map((section) => (
          <div key={section.id} className="border border-slate-100 rounded-lg">
            <button
              type="button"
              className="w-full px-3 py-2 flex items-center justify-between text-xs font-semibold text-[#0e1e3f]"
              onClick={() =>
                setSectionCollapsed((prev) => ({ ...prev, [section.id]: !prev[section.id] }))
              }
            >
              <span>{section.label}</span>
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-200 ${
                  sectionCollapsed[section.id] ? 'rotate-180' : ''
                }`}
              />
            </button>
            {!sectionCollapsed[section.id] ? (
              <div className="px-3 pb-3">
                {section.id === 'module' ? (
                  <select
                    value={eventModuleFilter}
                    onChange={(e) => setEventModuleFilter(e.target.value as 'events' | 'all')}
                    className="w-full h-8 rounded-md border border-[#e0e0e0] px-2 text-xs text-[#475569]"
                  >
                    <option value="events">Events</option>
                    <option value="all">All modules</option>
                  </select>
                ) : null}
                {section.id === 'category' ? (
                  <div className="space-y-2">
                    {EVENT_CATEGORY_OPTIONS.map((filter) => (
                      <label key={filter} className="flex items-start gap-2 cursor-pointer group">
                        <span className="relative mt-0.5 inline-flex size-[18px] shrink-0">
                          <input
                            type="checkbox"
                            checked={selectedEventCategories.includes(filter)}
                            onChange={() => toggleEventCategory(filter)}
                            className="peer appearance-none size-[18px] rounded-[4px] border-[1.5px] border-slate-300 bg-white checked:bg-[#2563eb] checked:border-[#2563eb]"
                          />
                          <Check className="pointer-events-none absolute inset-0 m-auto hidden size-3 text-white peer-checked:block" strokeWidth={3} aria-hidden />
                        </span>
                        <span className="text-[#475569] text-xs leading-tight group-hover:text-[#2563eb]">
                          {filter}
                        </span>
                      </label>
                    ))}
                  </div>
                ) : null}
                {section.id === 'source' ? (
                  <select
                    value={sourceFilter}
                    onChange={(e) => setSourceFilter(e.target.value as CatalogueSourceFilter)}
                    className="w-full h-8 rounded-md border border-[#e0e0e0] px-2 text-xs text-[#475569]"
                  >
                    <option value="all">All</option>
                    <option value="mogzu">By Mogzu</option>
                    <option value="vendor">Vendor Partners</option>
                  </select>
                ) : null}
                {section.id === 'price' ? (
                  <div className="space-y-2">
                    <input
                      type="number"
                      min={0}
                      value={budgetMin}
                      placeholder="Min budget"
                      onChange={(e) => setBudgetMin(e.target.value)}
                      className="w-full h-8 rounded-md border border-[#e0e0e0] px-2 text-xs text-[#475569]"
                    />
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#878e9e]">{formatInr(0)}</span>
                      <span className="text-[#878e9e]">{formatInr(50000)}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50000"
                      value={priceMax}
                      onChange={(e) => setPriceMax(Number(e.target.value))}
                      className="w-full h-1 bg-slate-200 rounded appearance-none cursor-pointer accent-[#2563eb]"
                    />
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <div className="sticky bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm pt-3">
        <button
          type="button"
          onClick={() => setMobileFiltersOpen(false)}
          className="w-full rounded-full h-12 bg-[#2563eb] text-white text-[15px] font-semibold tracking-[0.3px]"
        >
          Apply Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen min-h-screen overflow-hidden mogzu-module-shell-bg">
      {/* Left Sidebar */}
      <SharedSidebar 
        collapsed={sidebarCollapsed} 
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeNav="activity"
      />

      {/* Main Content */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {/* Top Navigation */}
        <SharedHeader variant="blended" />

        {/* Content Area */}
        <MogzuCorporateScrollSurface>
          {/* Breadcrumb + Tabs */}
          <div className="border-b border-slate-300/[0.1] bg-transparent px-6 py-3">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-slate-400/10 bg-[#fffdf9]/[0.22] px-4 py-1 text-xs backdrop-blur-[2px]">
              <button onClick={() => navigate('/activitysuite')} className="text-[#2563eb] hover:underline font-normal">
                Activity Suite
              </button>
              <ChevronDown className="w-3 h-3 text-[#878e9e] -rotate-90" />
              <span className="text-[#878e9e]">Events</span>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-3 overflow-x-auto whitespace-nowrap py-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <h1 className="corp-h1 text-[#0e1e3f] mr-2">Events</h1>
              <button
                type="button"
                onClick={() => navigate('/events/home')}
                className="h-9 rounded-full border-[1.5px] border-[#2563eb] px-4 text-[14px] font-semibold text-[#0e1e3f] shadow-[1px_2px_6px_0px_rgba(0,0,0,0.16)]"
                style={{ backgroundImage: 'linear-gradient(-9.24736deg, rgb(228, 235, 255) 9.7419%, rgb(255, 255, 255) 85.097%)' }}
              >
                <span className="inline-flex items-center gap-2">
                  <Home className="h-5 w-5 text-[#2563eb]" />
                  Home
                </span>
              </button>

              <button
                onClick={() => navigate('/event-activity')}
                className={`flex h-9 items-center gap-2 rounded-full border-[1.5px] px-4 text-sm font-medium transition-all ${
                  activeTab === 'event-activity'
                    ? 'border-[#2563eb] font-semibold text-[#0e1e3f] shadow-[0_10px_24px_rgba(37,99,235,0.24)]'
                    : 'border-slate-300/25 bg-white/[0.12] text-[#475569] backdrop-blur-sm hover:border-[#93c5fd]'
                }`}
                style={activeTab === 'event-activity' ? { backgroundImage: 'linear-gradient(-9.24736deg, rgb(228, 235, 255) 9.7419%, rgb(255, 255, 255) 85.097%)' } : undefined}
              >
                <svg width="20" height="20" viewBox="0 0 28 28" fill="none" aria-hidden>
                  <path d={svgPathsSpaceX.p9bd8700} fill="#B45309" />
                </svg>
                Event Activity
              </button>

              <button
                onClick={() => navigate('/event-services')}
                className={`flex h-9 items-center gap-2 rounded-full border-[1.5px] px-4 text-sm font-medium transition-all ${
                  activeTab === 'event-service'
                    ? 'border-[#2563eb] font-semibold text-[#0e1e3f] shadow-[0_10px_24px_rgba(37,99,235,0.24)]'
                    : 'border-slate-300/25 bg-white/[0.12] text-[#475569] backdrop-blur-sm hover:border-[#93c5fd]'
                }`}
                style={activeTab === 'event-service' ? { backgroundImage: 'linear-gradient(-9.24736deg, rgb(228, 235, 255) 9.7419%, rgb(255, 255, 255) 85.097%)' } : undefined}
              >
                <Utensils className="h-5 w-5 text-[#0f766e]" strokeWidth={2.2} />
                Event Service
              </button>
            </div>
          </div>

          <div className="px-6 pb-6">
            {activeTab === 'event-service' ? (
              <EventServiceContent />
            ) : (
              <>
            {/* Banner */}
            <div className="mb-4">
              <div 
                className="relative min-h-[200px] rounded-3xl overflow-hidden border border-white/60 bg-white/45 backdrop-blur-xl shadow-[0_16px_36px_rgba(37,99,235,0.15)]"
                style={{
                  backgroundImage: 'linear-gradient(90deg, rgb(93, 143, 240) 0%, rgb(93, 143, 240) 100%)'
                }}
              >
                {/* Banner Image */}
                <div className="absolute right-0 top-0 h-full w-[45%]">
                  <img 
                    src={imgImage24995} 
                    alt="Meeting" 
                    className="w-full h-full object-cover" 
                  />
                </div>

                {/* Banner Content */}
                <div className="relative z-10 px-5 py-4 h-full flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-white text-lg font-semibold">Special offer on Meeting space</h2>
                      <span className="bg-white text-[#2563eb] text-xs font-medium px-2 py-1 rounded-full">
                        by BR group
                      </span>
                    </div>
                    <p className="text-white text-xs max-w-md leading-relaxed">
                      Book your next event with us and choose from a variety of tailored event packages, that ensure a seamless process and all-inclusive services.
                    </p>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => navigate('/event-activity/1')}
                    className="bg-[#2563eb] text-white px-8 py-2 rounded-full text-sm font-medium hover:bg-blue-700 w-fit"
                  >
                    View offer
                  </button>
                </div>

                {/* Pagination Dots */}
                <div className="absolute bottom-3 right-5 flex items-center gap-2">
                  <div className="w-6 h-2 bg-white rounded-full" />
                  <div className="size-2 bg-white/40 rounded-full" />
                  <div className="size-2 bg-white/40 rounded-full" />
                </div>
              </div>
            </div>

            {/* Category Icons */}
            <div className="mb-4">
              <div className="bg-white/55 backdrop-blur-xl rounded-2xl border border-white/60 p-4 flex items-center justify-between gap-2 shadow-[0_16px_36px_rgba(37,99,235,0.12)]">
                {categories.map((category, index) => (
                  <button
                    key={index}
                    className="flex flex-col items-center gap-2.5 p-2 rounded-lg hover:bg-gray-50 transition-colors flex-1"
                    onClick={() => {
                      setSelectedCategory(index);
                      const mapped = categoryToMasterMap[index] ?? [];
                      setSelectedEventCategories(mapped);
                    }}
                  >
                    <div className="relative size-[42px] flex items-center justify-center">
                      <div className={`col-1 flex items-center justify-center relative ${category.containerOffset.left} ${category.containerOffset.top} ${category.imageSize.width} ${category.imageSize.height}`}>
                        {category.imageTransform && (
                          <div className={`flex-none ${category.imageTransform}`}>
                            <div className={`relative ${category.imageSize.width} ${category.imageSize.height}`}>
                              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                                <img
                                  alt=""
                                  className={`absolute max-w-none ${category.imageOffset.left} ${category.imageOffset.top} ${category.imageScale.width} ${category.imageScale.height}`}
                                  src={category.image}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                        {!category.imageTransform && (
                          <div className={`relative ${category.imageSize.width} ${category.imageSize.height}`}>
                            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                              <img
                                alt=""
                                className={`absolute max-w-none ${category.imageOffset.left} ${category.imageOffset.top} ${category.imageScale.width} ${category.imageScale.height}`}
                                src={category.image}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className={`absolute inset-0 mix-blend-lighten ${selectedCategory === index ? 'bg-[#2563eb]' : 'bg-[#475569]'}`} />
                    </div>
                    <span className={`text-[12px] text-center leading-tight whitespace-pre-line font-normal max-w-[100px] ${selectedCategory === index ? 'text-[#2563eb]' : 'text-[#475569]'}`}>
                      {category.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Main Content with Filters */}
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Left Filters */}
              <div className="w-full lg:w-[240px] shrink-0">
                <div className="lg:hidden mb-3">
                  <button
                    type="button"
                    onClick={() => setMobileFiltersOpen(true)}
                    className="h-10 px-4 rounded-full border border-[#2563eb] text-[#2563eb] text-sm font-semibold"
                  >
                    Filters {activeFilterCount > 0 ? activeFilterCount : ''}
                  </button>
                </div>
                <div className="hidden lg:block">{FiltersPanel}</div>
              </div>

              {/* Right Content */}
              <div className="flex-1">
                {usingDemoEvents ? <DevMockDataBanner /> : null}
                {/* Search Bar */}
                <div className="bg-white/55 backdrop-blur-xl rounded-2xl border border-white/60 p-4 mb-4 shadow-[0_16px_36px_rgba(37,99,235,0.12)]">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[#0e1e3f] text-xs font-medium mb-1 block">Location</label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Enter location"
                          value={searchLocation}
                          onChange={(e) => setSearchLocation(e.target.value)}
                          className="w-full h-[38px] pl-3 pr-8 border border-[#e0e0e0] rounded-md text-sm text-[#0e1e3f] placeholder:text-[#878e9e] focus:outline-none focus:border-[#2563eb]"
                        />
                        <svg className="absolute right-2 top-1/2 -translate-y-1/2 size-4" fill="none" viewBox="0 0 18 24">
                          <path d={svgPaths.p3996be70} fill="#878E9E" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <label className="text-[#0e1e3f] text-xs font-medium mb-1 block">Attendees</label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Guests Number"
                          value={searchGuests}
                          onChange={(e) => setSearchGuests(e.target.value.replace(/[^0-9]/g, ''))}
                          className="w-full h-[38px] pl-3 pr-8 border border-[#e0e0e0] rounded-md text-sm text-[#0e1e3f] placeholder:text-[#878e9e] focus:outline-none focus:border-[#2563eb]"
                        />
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 size-4 text-[#878E9E]" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[#0e1e3f] text-xs font-medium mb-1 block">Date</label>
                      <div className="relative">
                        <input
                          type="date"
                          placeholder="Select date"
                          value={searchDate}
                          onChange={(e) => setSearchDate(e.target.value)}
                          className="w-full h-[38px] pl-3 pr-8 border border-[#e0e0e0] rounded-md text-sm text-[#0e1e3f] placeholder:text-[#878e9e] focus:outline-none focus:border-[#2563eb]"
                        />
                        <svg className="absolute right-2 top-1/2 -translate-y-1/2 size-4" fill="none" viewBox="0 0 30 30">
                          <path d={svgPaths.p1d095600} fill="#878E9E" />
                        </svg>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        document.getElementById('events-results-anchor')?.scrollIntoView({
                          behavior: 'smooth',
                          block: 'start',
                        })
                      }
                      className="bg-[#2563eb] text-white px-6 rounded-full text-sm font-medium hover:bg-blue-700 self-end h-[38px]"
                    >
                      Search
                    </button>
                  </div>
                </div>

                <div className="bg-white/55 backdrop-blur-xl rounded-2xl border border-white/60 p-4 mb-4 shadow-[0_16px_36px_rgba(37,99,235,0.12)]">
                  <label className="text-[#0e1e3f] text-xs font-medium mb-1 block">Keyword</label>
                  <input
                    type="text"
                    placeholder="Search by event name or category"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className="w-full h-[38px] px-3 border border-[#e0e0e0] rounded-md text-sm text-[#0e1e3f] placeholder:text-[#878e9e] focus:outline-none focus:border-[#2563eb]"
                  />
                </div>

                {/* Trending Section */}
                <div className="mb-3">
                  <h2 className="text-[#0e1e3f] text-lg font-semibold mb-1">Trending Conference space</h2>
                  <p className="text-[#878e9e] text-xs">
                    From leading industry summit and fast-paced networking and typesetting industry.
                  </p>
                  <p className="text-[#475569] text-xs mt-1">
                    Showing {filteredEvents.length} of {eventCards.length} listings
                  </p>
                </div>
                {activeFilterChips.length > 0 ? (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {activeFilterChips.map((chip) => (
                      <button
                        key={chip.key}
                        type="button"
                        onClick={() => removeChip(chip.key)}
                        className="inline-flex items-center gap-1.5 h-7 px-3 bg-white border border-[#d1d5db] rounded-md text-[12px] text-[#475569] hover:bg-gray-50 transition-colors"
                      >
                        {chip.label} <X className="size-3 text-slate-400" aria-hidden />
                      </button>
                    ))}
                  </div>
                ) : null}

                {/* Event Cards Grid */}
                <div
                  id="events-results-anchor"
                  className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 scroll-mt-4 transition-opacity duration-150 ${
                    gridAnimatingOut ? 'opacity-0' : 'opacity-100'
                  }`}
                >
                  {initialLoading ? (
                    Array.from({ length: 6 }).map((_, idx) => (
                      <div key={`skeleton-${idx}`} className="rounded-lg overflow-hidden bg-white border border-slate-200 p-3">
                        <div className="h-[200px] rounded-lg corp-shimmer" />
                        <div className="mt-3 h-4 w-[70%] rounded-full corp-shimmer" />
                        <div className="mt-2 h-3 w-[50%] rounded-full corp-shimmer" />
                        <div className="mt-3 h-3.5 w-[40%] rounded-full corp-shimmer" />
                      </div>
                    ))
                  ) : isError ? (
                    <div className="col-span-3 flex flex-col items-center justify-center py-16 text-center bg-white/65 backdrop-blur-md rounded-2xl border border-white/50">
                      <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-4">
                        <AlertCircle className="w-10 h-10 text-destructive" />
                      </div>
                      <h3 className="text-lg font-semibold text-[#0e1e3f] mb-2">
                        Something went wrong
                      </h3>
                      <p className="text-sm text-[#878e9e] mb-4 max-w-xs mx-auto">
                        We couldn't load results. Please check your connection and try again.
                      </p>
                      <button
                        onClick={() => setIsError(false)}
                        className="px-6 py-2 bg-destructive text-white rounded-full text-sm font-medium hover:opacity-90 transition-all shadow-md"
                      >
                        Retry
                      </button>
                    </div>
                  ) : filteredEvents.length > 0 ? (
                    filteredEvents.map((activity) => {
                      const normalizedPricingType = normalizePricingType(activity.pricing_type);
                      const pricingListing = {
                        pricing_type: normalizedPricingType,
                        price_type: (activity.price_type as 'per_person' | 'flat' | 'per_hour' | 'package' | undefined) ?? 'flat',
                        base_price: activity.base_price,
                        starting_price: activity.starting_price,
                      };
                      const pricingBadge = getPricingBadgeConfig(normalizedPricingType);
                      const listingId = String(activity.id);
                      const inCompare = compareIds.includes(listingId);
                      const listingBadges = (activity.tags ?? []).slice(0, 3).map((t) => {
                        const low = t.toLowerCase();
                        if (low.includes('top')) return 'Top Rated';
                        if (low.includes('verified')) return 'Verified';
                        if (low.includes('new')) return 'New';
                        return 'Popular';
                      });
                      return (
                      <div
                        key={activity.id}
                        className="group bg-white/65 backdrop-blur-md rounded-2xl overflow-hidden border border-white/50 shadow-[0_10px_30px_rgba(37,99,235,0.14)] hover:shadow-[0_18px_36px_rgba(37,99,235,0.22)] cursor-pointer transition-all duration-200 hover:-translate-y-0.5 h-full flex flex-col"
                        style={{ animation: 'pageEnter 300ms ease-out both', animationDelay: `${Math.min(400, Number(activity.id.toString().slice(-2)) * 40)}ms` }}
                        onClick={() => {
                          const route = eventDetailRoute(String(activity.id), normalizedPricingType);
                          navigate(route.pathname, { state: route.state });
                        }}
                      >
                      {/* Image */}
                      <div className="relative h-52 overflow-hidden">
                        <img
                          src={activity.image}
                          alt={activity.name}
                          className="w-full h-full object-cover transition-transform duration-[400ms] ease-out group-hover:scale-[1.04]"
                        />
                        {Array.isArray(activity.videos) && activity.videos.length > 0 ? (
                          <>
                            <span className="absolute right-2 top-2 rounded-full bg-[#0f172a]/75 px-2 py-0.5 text-[10px] font-semibold text-white">
                              VIDEO
                            </span>
                            <PlayCircle className="absolute bottom-2 right-2 h-6 w-6 text-white/90" />
                          </>
                        ) : null}
                        {activeRole === 'corporate' ? (
                          <WishlistHeart listingId={listingId} className="absolute top-2 right-2" />
                        ) : null}
                        <RatingBadge
                          listingId={listingId}
                          variant="overlay"
                          showCount={false}
                          className="absolute top-2 left-2"
                        />
                      </div>

                      {/* Content */}
                      <div className="p-3 flex-1 flex flex-col">
                        <h3 className="text-[#0e1e3f] text-sm font-semibold leading-tight mb-1 line-clamp-2 min-h-[2.5rem]">
                          {activity.name}
                        </h3>
                        <p className="text-[#878e9e] text-xs mb-2 line-clamp-2 min-h-[2rem]">{activity.tagline ?? activity.description}</p>

                        <div className="flex items-center gap-1.5 mb-1.5">
                          <svg className="size-3.5" fill="none" viewBox="0 0 22 22">
                            <path d={svgPaths.p260456f0} fill="#878E9E" />
                          </svg>
                          <span className="text-[#475569] text-xs">{activity.city ?? 'Location on request'}</span>
                        </div>

                        <div className="flex items-center gap-1.5 mb-3">
                          {(() => {
                            const Icon = getEventIconByCategoryText(activity.category ?? '');
                            return <Icon className="size-3.5 text-[#878E9E]" />;
                          })()}
                          <span className="text-[#475569] text-xs">{activity.category} · {activity.minGuests}-{activity.maxGuests} pax</span>
                        </div>

                        <div className="bg-[#f8f9fa] rounded p-2 mb-3">
                          <div className="flex items-center gap-2">
                            {(() => {
                              const vendorName = activity.is_mogzu_direct ? 'Mogzu' : (activity.vendor_name ?? 'Vendor');
                              const f = avatarFallback(vendorName);
                              return (
                                <div className={`size-7 rounded-full text-white text-[12px] font-semibold grid place-items-center ${f.colorClass}`}>
                                  {f.initials}
                                </div>
                              );
                            })()}
                            <div className="flex-1">
                              <p className="text-[13px] leading-none mb-1">
                                <span className="text-[#878e9e]">by:</span>
                                <span className="text-[#475569]"> {activity.is_mogzu_direct ? 'Mogzu' : (activity.vendor_name ?? 'Vendor')}</span>
                              </p>
                              <p className="text-[#fa8d40] text-[10px] leading-tight">33% of attendees are repeat customers</p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-auto space-y-2">
                          {(() => {
                            const tooltipText =
                              normalizedPricingType === 'transparent'
                                ? 'Full price shown upfront. Select date and book instantly.'
                                : normalizedPricingType === 'offer_price'
                                  ? 'Suggest your price. Vendor reviews and confirms.'
                                  : 'No fixed price. Request a custom quote.';
                            const isTooltipOpen = pricingTooltip?.id === listingId;
                            const showTooltip = () =>
                              setPricingTooltip({ id: listingId, text: tooltipText });
                            const hideTooltip = () => setPricingTooltip(null);
                            return (
                              <button
                                type="button"
                                aria-label={`${pricingBadge.label} pricing: ${tooltipText}`}
                                aria-expanded={isTooltipOpen}
                                className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${pricingBadge.className} relative cursor-help focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-1`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  isTooltipOpen ? hideTooltip() : showTooltip();
                                }}
                                onMouseEnter={showTooltip}
                                onMouseLeave={hideTooltip}
                                onFocus={showTooltip}
                                onBlur={hideTooltip}
                              >
                                {pricingBadge.label}
                                {isTooltipOpen ? (
                                  <span className="absolute bottom-[calc(100%+8px)] left-0 z-20 w-56 rounded-lg border border-slate-200 bg-white p-2 text-[12px] font-normal text-slate-700 shadow-lg">
                                    {pricingTooltip.text}
                                  </span>
                                ) : null}
                              </button>
                            );
                          })()}
                          <div className="text-[#0e1e3f] text-[15px] font-semibold">
                            {getPricingSummaryLine(pricingListing)}
                          </div>
                          {activeRole === 'corporate' ? (
                            <label
                              className="inline-flex items-center gap-1.5 text-[11px] text-slate-600"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input
                                type="checkbox"
                                checked={inCompare}
                                onChange={() => {
                                  const r = toggleCompareId(listingId, 3);
                                  if (r.blocked) setToast('You can compare up to 3 listings at a time.');
                                  setCompareIds(r.ids);
                                }}
                              />
                              Compare
                            </label>
                          ) : null}
                          {listingBadges.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {listingBadges.map((badge) => (
                                <span key={badge} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                                  {badge}
                                </span>
                              ))}
                            </div>
                          ) : null}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const route = eventDetailRoute(String(activity.id), normalizedPricingType);
                              navigate(route.pathname, { state: route.state });
                            }}
                            className={`w-full rounded-lg py-2 text-sm font-semibold transition-colors ${
                              normalizedPricingType === 'transparent'
                                ? 'bg-[#2563eb] text-white hover:bg-blue-700'
                                : normalizedPricingType === 'offer_price'
                                  ? 'border border-[#2563eb] text-[#2563eb] hover:bg-blue-50'
                                  : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {getPricingCtaLabel(normalizedPricingType)}
                          </button>
                        </div>
                      </div>
                    </div>
                    )})
                ) : (
                  <div className="col-span-3 flex flex-col items-center justify-center py-16 text-center bg-white/65 backdrop-blur-md rounded-2xl border border-white/50">
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                      <Search className="w-10 h-10 text-[#2563eb]" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#0e1e3f] mb-2">No results found</h3>
                    <p className="text-sm text-[#878e9e] mb-4 max-w-xs mx-auto">
                      No events matched your search/filter criteria.
                    </p>
                    <button
                      onClick={handleResetSearch}
                      className="px-6 py-2 bg-[#2563eb] text-white rounded-full text-sm font-medium hover:bg-blue-700 transition-all shadow-md"
                    >
                      Reset filters
                    </button>
                  </div>
                )}
              </div>
            </div>
            </div>
            </>
            )}
          </div>
          {mobileFiltersOpen ? (
            <div className="fixed inset-0 z-50 lg:hidden">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="absolute inset-0 bg-black/30 backdrop-blur-[8px]"
              />
              <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] rounded-t-2xl bg-white p-3 overflow-y-auto">
                <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-slate-300" />
                {FiltersPanel}
              </div>
            </div>
          ) : null}
          {toast ? (
            <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-slate-900 px-3 py-2 text-xs text-white shadow">
              {toast}
            </div>
          ) : null}
          <CompareStickyBar />
        </MogzuCorporateScrollSurface>
      </div>
    </div>
  );
}