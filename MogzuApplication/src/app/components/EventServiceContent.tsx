import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, Search, Star } from 'lucide-react';
import { WishlistHeart } from './global/WishlistHeart';
import { useNavigate } from 'react-router';
import { QA_IMAGES } from '../lib/qaImagery';
import { getPricingBadgeConfig, getPricingCtaLabel, getPricingSummaryLine } from './ui/PriceBlock';
import { getCompareIds, toggleCompareId } from '@/app/lib/listingSessionState';
import { useDemoRole } from '@/app/lib/demoRole';
import { getEventServiceCategoryIconConfig } from '@/app/lib/eventsIconMapping';
import { CategoryPillIcon } from './events/CategoryPillIcon';
import { EventsListingHero } from './events/EventsListingHero';
import { HorizontalScrollRow } from './events/HorizontalScrollRow';
import { BudgetRangeSlider } from './ui/BudgetRangeSlider';
import { ListingCardImageGallery } from './ui/ListingCardImageGallery';
import { getListingSlideImagesFromRecord } from './dspaceCardUtils';
import { useListingCardImageScroller } from '@/app/hooks/useListingCardImageScroller';
import { db } from '@/lib/db';
import { storageService } from '@/lib/storage';
import type { Listing, ListingImage } from '@/lib/database.types';

function listingToServiceListing(
  l: Listing & { listing_images?: ListingImage[]; vendors?: { business_name: string } | null },
): {
  id: string;
  title: string;
  category: ServiceCategory;
  city: string;
  capacity: number;
  vendorName: string;
  vendorRating: number;
  pricingType: PricingType;
  priceType: 'per_person' | 'flat' | 'per_hour' | 'package';
  basePrice?: number;
  startingPrice?: number;
  featured: boolean;
  createdAt: string;
  image: string;
  images: string[];
  insured: boolean;
} {
  const meta = (l.metadata ?? {}) as Record<string, unknown>;
  const imgs = (l.listing_images ?? []).map((img) =>
    storageService.listingImages.getUrl(img.storage_path),
  );
  const fallback = imgs[0] ?? QA_IMAGES.eventCard[0] ?? '';
  const category = (typeof meta.category === 'string' ? meta.category : 'Catering') as ServiceCategory;
  const pricingType: PricingType =
    l.pricing_type === 'offer'
      ? 'offer_price'
      : l.pricing_type === 'request_for_price'
        ? 'request_for_price'
        : 'transparent';
  const priceType: 'per_person' | 'flat' | 'per_hour' | 'package' =
    l.price_unit === 'per_person'
      ? 'per_person'
      : l.price_unit === 'per_hour'
        ? 'per_hour'
        : l.price_unit === 'per_day'
          ? 'package'
          : 'flat';
  return {
    id: l.id,
    title: l.title,
    category,
    city: l.location_city ?? '',
    capacity: l.max_capacity ?? 0,
    vendorName: l.vendors?.business_name ?? 'Vendor',
    vendorRating: typeof meta.rating === 'number' ? meta.rating : 4.5,
    pricingType,
    priceType,
    basePrice: pricingType === 'transparent' ? (l.base_price ?? undefined) : undefined,
    startingPrice: pricingType === 'offer_price' ? (l.base_price ?? undefined) : undefined,
    featured: meta.featured === true,
    createdAt: l.created_at,
    image: fallback,
    images: imgs.length > 0 ? imgs : [fallback],
    insured: meta.insured === true,
  };
}

type PricingType = 'transparent' | 'offer_price' | 'request_for_price';
type ServiceCategory =
  | 'Catering'
  | 'Audio Visuals'
  | 'Design & Decor'
  | 'Security'
  | 'Transportation'
  | 'Technology'
  | 'License/Permits';

type ServiceListing = {
  id: string;
  title: string;
  category: ServiceCategory;
  city: string;
  capacity: number;
  vendorName: string;
  vendorRating: number;
  pricingType: PricingType;
  priceType: 'per_person' | 'flat' | 'per_hour' | 'package';
  basePrice?: number;
  startingPrice?: number;
  featured: boolean;
  createdAt: string;
  image: string;
  images: string[];
  insured: boolean;
};

const CARD_IMAGES = QA_IMAGES.eventCard;

const buildSlideImages = (start: number) =>
  [0, 1, 2, 3, 4].map((i) => CARD_IMAGES[(start + i) % CARD_IMAGES.length]!);

const CATEGORIES: ServiceCategory[] = [
  'Catering',
  'Audio Visuals',
  'Design & Decor',
  'Security',
  'Transportation',
  'Technology',
  'License/Permits',
];

const CITIES = ['Hyderabad', 'Mumbai', 'Bangalore', 'Delhi', 'Chennai', 'Pune', 'Kolkata'];

// Sub-categories per service category (matching gifting pattern)
const SERVICE_SUBCATEGORIES: Record<ServiceCategory, { id: string; name: string; bgColor: string; textColor: string; activeBg: string; activeText: string }[]> = {
  Catering: [
    { id: 'buffet', name: 'Buffet', bgColor: '#fff7ed', textColor: '#ea580c', activeBg: '#ea580c', activeText: '#fff' },
    { id: 'plated', name: 'Plated Meals', bgColor: '#eff6ff', textColor: '#2563eb', activeBg: '#2563eb', activeText: '#fff' },
    { id: 'cocktail', name: 'Cocktail Snacks', bgColor: '#fdf4ff', textColor: '#9333ea', activeBg: '#9333ea', activeText: '#fff' },
    { id: 'beverages', name: 'Beverages', bgColor: '#f0fdf4', textColor: '#16a34a', activeBg: '#16a34a', activeText: '#fff' },
  ],
  'Audio Visuals': [
    { id: 'led', name: 'LED Screens', bgColor: '#eff6ff', textColor: '#2563eb', activeBg: '#2563eb', activeText: '#fff' },
    { id: 'sound', name: 'Sound System', bgColor: '#fdf4ff', textColor: '#9333ea', activeBg: '#9333ea', activeText: '#fff' },
    { id: 'lighting', name: 'Stage Lighting', bgColor: '#fefce8', textColor: '#ca8a04', activeBg: '#ca8a04', activeText: '#fff' },
    { id: 'streaming', name: 'Live Streaming', bgColor: '#fff1f2', textColor: '#e11d48', activeBg: '#e11d48', activeText: '#fff' },
  ],
  'Design & Decor': [
    { id: 'floral', name: 'Floral', bgColor: '#fff1f2', textColor: '#e11d48', activeBg: '#e11d48', activeText: '#fff' },
    { id: 'stage', name: 'Stage Design', bgColor: '#eff6ff', textColor: '#2563eb', activeBg: '#2563eb', activeText: '#fff' },
    { id: 'balloon', name: 'Balloon Decor', bgColor: '#fdf4ff', textColor: '#9333ea', activeBg: '#9333ea', activeText: '#fff' },
    { id: 'theming', name: 'Theming', bgColor: '#fefce8', textColor: '#ca8a04', activeBg: '#ca8a04', activeText: '#fff' },
  ],
  Security: [
    { id: 'crowd', name: 'Crowd Management', bgColor: '#fff7ed', textColor: '#ea580c', activeBg: '#ea580c', activeText: '#fff' },
    { id: 'vip', name: 'VIP Escort', bgColor: '#eff6ff', textColor: '#2563eb', activeBg: '#2563eb', activeText: '#fff' },
    { id: 'cctvr', name: 'CCTV & Surveillance', bgColor: '#fefce8', textColor: '#ca8a04', activeBg: '#ca8a04', activeText: '#fff' },
  ],
  Transportation: [
    { id: 'shuttle', name: 'Shuttle Bus', bgColor: '#eff6ff', textColor: '#2563eb', activeBg: '#2563eb', activeText: '#fff' },
    { id: 'luxury', name: 'Luxury Fleet', bgColor: '#fefce8', textColor: '#ca8a04', activeBg: '#ca8a04', activeText: '#fff' },
    { id: 'airport', name: 'Airport Transfers', bgColor: '#f0fdf4', textColor: '#16a34a', activeBg: '#16a34a', activeText: '#fff' },
  ],
  Technology: [
    { id: 'checkin', name: 'Digital Check-in', bgColor: '#eff6ff', textColor: '#2563eb', activeBg: '#2563eb', activeText: '#fff' },
    { id: 'app', name: 'Event App', bgColor: '#fdf4ff', textColor: '#9333ea', activeBg: '#9333ea', activeText: '#fff' },
    { id: 'hybrid', name: 'Hybrid Setup', bgColor: '#f0fdf4', textColor: '#16a34a', activeBg: '#16a34a', activeText: '#fff' },
  ],
  'License/Permits': [
    { id: 'noise', name: 'Noise Permit', bgColor: '#fff1f2', textColor: '#e11d48', activeBg: '#e11d48', activeText: '#fff' },
    { id: 'food', name: 'Food License', bgColor: '#fff7ed', textColor: '#ea580c', activeBg: '#ea580c', activeText: '#fff' },
    { id: 'police', name: 'Police NOC', bgColor: '#fefce8', textColor: '#ca8a04', activeBg: '#ca8a04', activeText: '#fff' },
  ],
};

// DEMO FALLBACK — shows when Supabase returns 0 rows
// Remove this fallback once real listings exist in Supabase
const DEMO_DATA_SERVICES: ServiceListing[] = [
  { id: 'svc-1', title: 'Executive Buffet Program', category: 'Catering', city: 'Mumbai', capacity: 220, vendorName: 'RoyalPlatter Caterers', vendorRating: 4.8, pricingType: 'transparent', priceType: 'per_person', basePrice: 950, featured: true, createdAt: '2026-03-01', image: CARD_IMAGES[0]!, images: buildSlideImages(0), insured: true },
  { id: 'svc-2', title: 'Townhall AV Production Kit', category: 'Audio Visuals', city: 'Bangalore', capacity: 500, vendorName: 'PrismWave Technologies', vendorRating: 4.6, pricingType: 'offer_price', priceType: 'flat', startingPrice: 138000, featured: true, createdAt: '2026-03-15', image: CARD_IMAGES[1]!, images: buildSlideImages(1), insured: true },
  { id: 'svc-3', title: 'Brand Experience Decor Build', category: 'Design & Decor', city: 'Delhi', capacity: 350, vendorName: 'AuraDecor Events', vendorRating: 4.5, pricingType: 'request_for_price', priceType: 'flat', featured: false, createdAt: '2026-02-25', image: CARD_IMAGES[2]!, images: buildSlideImages(2), insured: false },
  { id: 'svc-4', title: 'Corporate Event Security Unit', category: 'Security', city: 'Hyderabad', capacity: 300, vendorName: 'ShieldOne Security', vendorRating: 4.4, pricingType: 'transparent', priceType: 'flat', basePrice: 26000, featured: false, createdAt: '2026-03-03', image: CARD_IMAGES[3]!, images: buildSlideImages(3), insured: true },
  { id: 'svc-5', title: 'Delegate Shuttle Fleet', category: 'Transportation', city: 'Pune', capacity: 180, vendorName: 'TransitPro Mobility', vendorRating: 4.7, pricingType: 'offer_price', priceType: 'flat', startingPrice: 32000, featured: false, createdAt: '2026-03-10', image: CARD_IMAGES[4]!, images: buildSlideImages(4), insured: true },
  { id: 'svc-6', title: 'Hybrid Event App + Check-in', category: 'Technology', city: 'Chennai', capacity: 450, vendorName: 'EventStack Tech', vendorRating: 4.5, pricingType: 'request_for_price', priceType: 'flat', featured: false, createdAt: '2026-03-20', image: CARD_IMAGES[5]!, images: buildSlideImages(5), insured: true },
  { id: 'svc-7', title: 'Permit Desk & Compliance', category: 'License/Permits', city: 'Delhi', capacity: 300, vendorName: 'PermitBridge Advisors', vendorRating: 4.3, pricingType: 'request_for_price', priceType: 'flat', featured: false, createdAt: '2026-01-29', image: CARD_IMAGES[6]!, images: buildSlideImages(6), insured: false },
];

const activePillStyle = {
  backgroundImage: 'linear-gradient(-9.24736deg, rgb(228, 235, 255) 9.7419%, rgb(255, 255, 255) 85.097%)',
};

export default function EventServiceContent() {
  const navigate = useNavigate();
  const { activeRole } = useDemoRole();
  const [services, setServices] = useState<ServiceListing[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setServicesLoading(true);
      setServicesError(null);
      const { data, error } = await db.listings.listByModule('events', 'active');
      if (cancelled) return;
      if (error) {
        setServicesError(error.message);
        setServices([]);
      } else {
        setServices((data ?? []).map(listingToServiceListing));
      }
      setServicesLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | 'all'>('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [capacityBand, setCapacityBand] = useState<'all' | 'up50' | '51_200' | '201_500' | '500+'>('all');
  const [budgetMax, setBudgetMax] = useState(1000000);
  const [pricingTypes, setPricingTypes] = useState<PricingType[]>([]);
  const [insuredOnly, setInsuredOnly] = useState(false);
  const [ratingFloor, setRatingFloor] = useState(0);
  const [sortBy, setSortBy] = useState<'relevant' | 'highest_rated' | 'price_low_high' | 'price_high_low' | 'newest'>('relevant');
  const [search, setSearch] = useState('');
  const [compareIds, setCompareIds] = useState<string[]>(() => getCompareIds());
  const [toast, setToast] = useState('');
  const [openSections, setOpenSections] = useState({
    category: true,
    city: true,
    capacity: false,
    budget: true,
    pricing: false,
    rating: true,
  });
  const { goToPrevCardImage, goToNextCardImage, getActiveIndex } = useListingCardImageScroller();

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(''), 2200);
    return () => window.clearTimeout(id);
  }, [toast]);

  const toggleSection = (key: keyof typeof openSections) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const toggleCity = (city: string) =>
    setSelectedCities((prev) => prev.includes(city) ? prev.filter((x) => x !== city) : [...prev, city]);

  const togglePricingType = (t: PricingType) =>
    setPricingTypes((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);

  const clearAll = () => {
    setSelectedCategory('all');
    setSelectedSubcategory('all');
    setSelectedCities([]);
    setCapacityBand('all');
    setBudgetMax(1000000);
    setPricingTypes([]);
    setInsuredOnly(false);
    setRatingFloor(0);
    setSortBy('relevant');
    setSearch('');
  };

  const filtered = useMemo(() => {
    const finalData = services.length > 0 ? services : DEMO_DATA_SERVICES;
    const base = finalData.filter((row) => {
      if (selectedCategory !== 'all' && row.category !== selectedCategory) return false;
      if (selectedCities.length > 0 && !selectedCities.includes(row.city)) return false;
      if (insuredOnly && !row.insured) return false;
      if (pricingTypes.length > 0 && !pricingTypes.includes(row.pricingType)) return false;
      if (ratingFloor > 0 && row.vendorRating < ratingFloor) return false;
      const effPrice = row.pricingType === 'offer_price' ? row.startingPrice ?? 0 : row.basePrice ?? 0;
      if (row.pricingType !== 'request_for_price' && effPrice > budgetMax) return false;
      if (search.trim() && !`${row.title} ${row.vendorName} ${row.category}`.toLowerCase().includes(search.trim().toLowerCase())) return false;
      if (capacityBand === 'up50' && row.capacity > 50) return false;
      if (capacityBand === '51_200' && (row.capacity < 51 || row.capacity > 200)) return false;
      if (capacityBand === '201_500' && (row.capacity < 201 || row.capacity > 500)) return false;
      if (capacityBand === '500+' && row.capacity < 500) return false;
      return true;
    });
    const sorted = [...base];
    sorted.sort((a, b) => {
      if (sortBy === 'highest_rated') return b.vendorRating - a.vendorRating;
      if (sortBy === 'newest') return b.createdAt.localeCompare(a.createdAt);
      if (sortBy === 'price_low_high') {
        const ap = a.pricingType === 'offer_price' ? a.startingPrice ?? 0 : a.basePrice ?? 0;
        const bp = b.pricingType === 'offer_price' ? b.startingPrice ?? 0 : b.basePrice ?? 0;
        return ap - bp;
      }
      if (sortBy === 'price_high_low') {
        const ap = a.pricingType === 'offer_price' ? a.startingPrice ?? 0 : a.basePrice ?? 0;
        const bp = b.pricingType === 'offer_price' ? b.startingPrice ?? 0 : b.basePrice ?? 0;
        return bp - ap;
      }
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return b.vendorRating - a.vendorRating;
    });
    return sorted;
  }, [budgetMax, capacityBand, insuredOnly, pricingTypes, ratingFloor, search, selectedCategory, selectedCities, services, sortBy]);

  const activeSubcategories = selectedCategory !== 'all' ? SERVICE_SUBCATEGORIES[selectedCategory] ?? [] : [];

  const heroSlides = useMemo(
    () => [
      {
        title: 'Book catering, AV, decor, and more',
        chip: 'Trusted vendors',
        subtitle: 'Compare transparent pricing, insured partners, and capacity-fit services for your next corporate event.',
        cta: 'Browse services',
        image: QA_IMAGES.eventsHero,
        onCtaClick: () => document.getElementById('event-service-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
      },
      {
        title: 'Executive catering for large townhalls',
        chip: 'Catering',
        subtitle: 'Buffet programs, plated meals, and beverage packages from rated corporate caterers.',
        cta: 'Explore catering',
        image: QA_IMAGES.eventsHero,
        onCtaClick: () => {
          setSelectedCategory('Catering');
          setSelectedSubcategory('all');
        },
      },
      {
        title: 'Production-ready AV for hybrid events',
        chip: 'Audio Visuals',
        subtitle: 'LED walls, sound systems, lighting rigs, and live streaming from verified AV partners.',
        cta: 'View AV services',
        image: QA_IMAGES.eventsHero,
        onCtaClick: () => {
          setSelectedCategory('Audio Visuals');
          setSelectedSubcategory('all');
        },
      },
    ],
    [],
  );

  return (
    <div className="space-y-4">
      <EventsListingHero slides={heroSlides} />

      <HorizontalScrollRow className="mb-4">
        <button
          type="button"
          onClick={() => { setSelectedCategory('all'); setSelectedSubcategory('all'); }}
          className={`h-9 flex shrink-0 items-center gap-2 px-4 rounded-full border-[1.5px] transition-all duration-200 whitespace-nowrap hover:-translate-y-0.5 active:scale-[0.98] ${
            selectedCategory === 'all'
              ? 'border-[#2563eb] shadow-[0_10px_24px_rgba(37,99,235,0.2)] text-[#0e1e3f] font-semibold'
              : 'border-slate-300/25 bg-white/[0.12] text-[#475569] backdrop-blur-sm hover:border-[#93c5fd]'
          }`}
          style={selectedCategory === 'all' ? activePillStyle : undefined}
        >
          All services
        </button>
        {CATEGORIES.map((cat) => {
          const active = selectedCategory === cat;
          const iconConfig = getEventServiceCategoryIconConfig(cat);
          const Icon = iconConfig.icon;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => { setSelectedCategory(cat); setSelectedSubcategory('all'); }}
              className={`h-9 flex shrink-0 items-center gap-2 px-4 rounded-full border-[1.5px] transition-all duration-200 whitespace-nowrap hover:-translate-y-0.5 active:scale-[0.98] ${
                active
                  ? 'border-[#2563eb] shadow-[0_10px_24px_rgba(37,99,235,0.2)] text-[#0e1e3f] font-semibold'
                  : 'border-slate-300/25 bg-white/[0.12] text-[#475569] backdrop-blur-sm hover:border-[#93c5fd]'
              }`}
              style={active ? activePillStyle : undefined}
            >
              <CategoryPillIcon icon={Icon} color={iconConfig.color} />
              <span className={`text-[14px] ${active ? 'font-semibold' : 'font-medium'}`}>{cat}</span>
            </button>
          );
        })}
      </HorizontalScrollRow>

      {activeSubcategories.length > 0 && (
        <HorizontalScrollRow className="mb-5">
          <div className="flex min-w-max gap-2">
            <button
              type="button"
              onClick={() => setSelectedSubcategory('all')}
              className={`flex h-9 shrink-0 items-center gap-2 rounded-lg border px-4 text-[13px] font-semibold whitespace-nowrap transition-all ${
                selectedSubcategory === 'all'
                  ? 'border-[#2563eb] bg-[#2563eb] text-white shadow-md'
                  : 'border-[#e5e7eb] bg-white text-[#475569] hover:border-[#4379ee] hover:text-[#4379ee]'
              }`}
            >
              All
            </button>
            {activeSubcategories.map((sub) => (
              <button
                key={sub.id}
                type="button"
                onClick={() => setSelectedSubcategory(sub.id)}
                className={`flex h-9 shrink-0 items-center rounded-lg border px-4 text-[13px] font-semibold whitespace-nowrap transition-all ${
                  selectedSubcategory === sub.id
                    ? 'border-[#2563eb] bg-[#2563eb] text-white shadow-md'
                    : 'border-[#e5e7eb] bg-white text-[#475569] hover:border-[#4379ee] hover:text-[#4379ee]'
                }`}
              >
                {sub.name}
              </button>
            ))}
          </div>
        </HorizontalScrollRow>
      )}

      <div id="event-service-results" className="flex gap-4">
        {/* Filter aside */}
        <aside className="w-[240px] flex-shrink-0 lg:sticky lg:top-4 lg:self-start">
          <div className="bg-white/55 backdrop-blur-xl rounded-2xl border border-white/60 p-5 shadow-[0_16px_36px_rgba(37,99,235,0.16)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[16px] font-semibold text-[#0e1e3f]">Filters</h3>
              <button type="button" onClick={clearAll} className="text-[13px] font-medium text-[#4379ee] underline">Clear all</button>
            </div>

            {/* City */}
            <div className="mb-4">
              <button
                type="button"
                onClick={() => toggleSection('city')}
                className="w-full flex items-center justify-between text-sm font-semibold text-[#0e1e3f] mb-2"
              >
                <span>City</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${openSections.city ? '' : '-rotate-90'}`} />
              </button>
              {openSections.city && (
                <div className="space-y-2">
                  {CITIES.map((city) => (
                    <label key={city} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCities.includes(city)}
                        onChange={() => toggleCity(city)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600"
                      />
                      <span className="text-sm text-[#475569]">{city}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Capacity */}
            <div className="mb-4">
              <button
                type="button"
                onClick={() => toggleSection('capacity')}
                className="w-full flex items-center justify-between text-sm font-semibold text-[#0e1e3f] mb-2"
              >
                <span>Event Capacity</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${openSections.capacity ? '' : '-rotate-90'}`} />
              </button>
              {openSections.capacity && (
                <div className="space-y-2">
                  {([['all', 'All sizes'], ['up50', 'Up to 50'], ['51_200', '51–200'], ['201_500', '201–500'], ['500+', '500+']] as [typeof capacityBand, string][]).map(([id, label]) => (
                    <label key={id} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="capacityBand" checked={capacityBand === id} onChange={() => setCapacityBand(id)} />
                      <span className="text-sm text-[#475569]">{label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Budget */}
            <div className="mb-4">
              <button
                type="button"
                onClick={() => toggleSection('budget')}
                className="w-full flex items-center justify-between text-sm font-semibold text-[#0e1e3f] mb-2"
              >
                <span>Budget (₹)</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${openSections.budget ? '' : '-rotate-90'}`} />
              </button>
              {openSections.budget && (
                <BudgetRangeSlider
                  min={0}
                  max={1000000}
                  step={10000}
                  value={budgetMax}
                  onChange={setBudgetMax}
                  minLabel="₹0"
                  maxLabel="₹10L"
                />
              )}
            </div>

            {/* Pricing type */}
            <div className="mb-4">
              <button
                type="button"
                onClick={() => toggleSection('pricing')}
                className="w-full flex items-center justify-between text-sm font-semibold text-[#0e1e3f] mb-2"
              >
                <span>Pricing Type</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${openSections.pricing ? '' : '-rotate-90'}`} />
              </button>
              {openSections.pricing && (
                <div className="space-y-2">
                  {(['transparent', 'offer_price', 'request_for_price'] as PricingType[]).map((t) => (
                    <label key={t} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pricingTypes.includes(t)}
                        onChange={() => togglePricingType(t)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600"
                      />
                      <span className="text-sm text-[#475569]">
                        {t === 'transparent' ? 'Transparent' : t === 'offer_price' ? 'Offer Price' : 'On Request'}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Rating */}
            <div className="mb-4">
              <button
                type="button"
                onClick={() => toggleSection('rating')}
                className="w-full flex items-center justify-between text-sm font-semibold text-[#0e1e3f] mb-2"
              >
                <span>Rating</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${openSections.rating ? '' : '-rotate-90'}`} />
              </button>
              {openSections.rating && (
                <div className="space-y-2">
                  {[4.5, 4.0, 3.5, 0].map((r) => (
                    <label key={r} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="ratingFloor" checked={ratingFloor === r} onChange={() => setRatingFloor(r)} />
                      <span className="text-sm text-[#475569]">{r === 0 ? 'All ratings' : `${r}+ ★`}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Insured */}
            <label className="flex items-center gap-2 text-sm text-[#475569] cursor-pointer">
              <input
                type="checkbox"
                checked={insuredOnly}
                onChange={(e) => setInsuredOnly(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600"
              />
              Insurance covered only
            </label>
          </div>
        </aside>

        {/* Right column */}
        <section className="flex-1 min-w-0">
          {/* Search + Sort */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search service or vendor"
                className="w-full h-10 pl-10 pr-4 text-[14px] placeholder:text-[#878e9e] bg-white border border-[#e5e7eb] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4379ee]/20"
              />
            </div>
            <div className="flex items-center gap-2 justify-end">
              <span className="text-[13px] text-[#878e9e]">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="h-10 px-3 text-[14px] border border-[#e5e7eb] rounded-xl bg-white/70 focus:outline-none focus:ring-2 focus:ring-[#4379ee]/20"
              >
                <option value="relevant">Most Relevant</option>
                <option value="highest_rated">Highest Rated</option>
                <option value="price_low_high">Price: Low–High</option>
                <option value="price_high_low">Price: High–Low</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>

          {/* Campaign filters row */}
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#64748b]">Campaign filters</div>
          <div className="mb-3 grid grid-cols-1 md:grid-cols-3 gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value as ServiceCategory | 'all'); setSelectedSubcategory('all'); }}
              className="px-2.5 py-2 text-xs border border-white/70 rounded-lg bg-white/65 backdrop-blur-md hover:border-[#93c5fd] focus:outline-none focus:ring-2 focus:ring-[#93c5fd]/40"
            >
              <option value="all">Category: All</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select
              value={capacityBand}
              onChange={(e) => setCapacityBand(e.target.value as typeof capacityBand)}
              className="px-2.5 py-2 text-xs border border-white/70 rounded-lg bg-white/65 backdrop-blur-md hover:border-[#93c5fd] focus:outline-none focus:ring-2 focus:ring-[#93c5fd]/40"
            >
              <option value="all">Capacity: All</option>
              <option value="up50">Up to 50</option>
              <option value="51_200">51–200</option>
              <option value="201_500">201–500</option>
              <option value="500+">500+</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-2.5 py-2 text-xs border border-white/70 rounded-lg bg-white/65 backdrop-blur-md hover:border-[#93c5fd] focus:outline-none focus:ring-2 focus:ring-[#93c5fd]/40"
            >
              <option value="relevant">Sort: Recommended</option>
              <option value="highest_rated">Sort: Highest Rated</option>
              <option value="price_low_high">Sort: Price Low–High</option>
              <option value="price_high_low">Sort: Price High–Low</option>
              <option value="newest">Sort: Newest</option>
            </select>
          </div>

          <p className="mb-3 text-[13px] text-[#878e9e]">
            Showing {filtered.length} of {services.length} listings
          </p>

          {/* Cards grid */}
          {servicesLoading ? (
            <div className="rounded-2xl border border-white/50 bg-white/65 backdrop-blur-md p-12 text-center text-sm text-[#475569]">
              Loading services…
            </div>
          ) : servicesError ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-10 text-center">
              <p className="text-sm font-semibold text-rose-700">Couldn't load services</p>
              <p className="mt-1 text-xs text-rose-600">{servicesError}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-white/50 bg-white/65 backdrop-blur-md p-12 text-center">
              <Search className="mx-auto h-8 w-8 text-slate-300" />
              <h3 className="mt-2 text-base font-semibold text-slate-900">No listings match your filters</h3>
              <p className="mt-1 text-sm text-slate-500">Try adjusting or clearing your filters</p>
              <button type="button" onClick={clearAll} className="mt-4 rounded-full bg-[#2563eb] px-5 py-2 text-sm font-semibold text-white">
                Clear All Filters
              </button>
            </div>
          ) : (
            <div id="event-service-results" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map((row) => {
                const cardId = row.id;
                const slideImages = getListingSlideImagesFromRecord(row);
                const activeImageIndex = getActiveIndex(cardId);
                const inCompare = compareIds.includes(row.id);
                const badge = getPricingBadgeConfig(row.pricingType);
                const detailId = row.id.replace(/[^\d]/g, '') || '1';
                const iconConfig = getEventServiceCategoryIconConfig(row.category);
                const Icon = iconConfig.icon;
                return (
                  <article
                    key={row.id}
                    className="group bg-white/65 backdrop-blur-md rounded-2xl overflow-hidden border border-white/50 shadow-[0_10px_30px_rgba(37,99,235,0.14)] hover:shadow-[0_18px_36px_rgba(37,99,235,0.22)] cursor-pointer hover:-translate-y-0.5 transition-all duration-200 h-full flex flex-col"
                    onClick={() => navigate(`/events/services/${detailId}`, { state: { pricing_type: row.pricingType, source_listing_id: row.id } })}
                  >
                    <ListingCardImageGallery
                      images={slideImages}
                      alt={row.title}
                      activeIndex={activeImageIndex}
                      onPrev={(e) => {
                        e.stopPropagation();
                        goToPrevCardImage(cardId, slideImages.length);
                      }}
                      onNext={(e) => {
                        e.stopPropagation();
                        goToNextCardImage(cardId, slideImages.length);
                      }}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (activeRole === 'corporate') {
                            const r = toggleCompareId(row.id, 3);
                            if (r.blocked) setToast('You can compare up to 3 listings at a time.');
                            setCompareIds(r.ids);
                          }
                        }}
                        className={`absolute top-2.5 left-2.5 z-[3] h-7 px-2.5 bg-white/95 backdrop-blur-sm rounded-full text-[10px] font-semibold hover:bg-white hover:-translate-y-0.5 active:scale-95 transition-all shadow border inline-flex items-center ${
                          inCompare ? 'text-[#2563eb] border-[#2563eb]' : 'text-[#334155] border-[#e2e8f0]'
                        }`}
                      >
                        {inCompare ? '✓ Compare' : 'Compare'}
                      </button>
                      {activeRole === 'corporate' ? (
                        <WishlistHeart listingId={row.id} className="absolute top-2.5 right-2.5 z-[3]" />
                      ) : null}
                      <div className="absolute bottom-2.5 right-2.5 z-[3] bg-[#16a34a] text-white text-[10px] font-semibold px-2.5 h-6 rounded-full inline-flex items-center gap-1 shadow-md">
                        <span>{row.vendorRating.toFixed(1)}</span>
                        <Star className="h-3 w-3 fill-white" />
                      </div>
                      <div className="absolute top-11 left-2.5 z-[3]">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${badge.className}`}>{badge.label}</span>
                      </div>
                    </ListingCardImageGallery>

                    {/* Info — gradient background matching gifting */}
                    <div className="p-3 flex-1 flex flex-col bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(239,246,255,0.72))]">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#878e9e] mb-1 truncate">
                        <Icon className="inline h-3 w-3 mr-1" style={{ color: iconConfig.color }} />
                        {row.vendorName}
                      </p>
                      <p className="text-sm font-semibold text-[#0e1e3f] mb-1 line-clamp-2 min-h-[36px]">{row.title}</p>
                      <p className="text-xs text-[#878e9e] mb-2">{row.city} · Capacity {row.capacity.toLocaleString()}</p>
                      <div className="mt-auto">
                        <p className="text-sm font-bold text-[#0e1e3f]">
                          {getPricingSummaryLine({
                            pricing_type: row.pricingType,
                            price_type: row.priceType,
                            base_price: row.basePrice,
                            starting_price: row.startingPrice,
                          })}
                        </p>
                      </div>
                      {activeRole === 'corporate' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/events/services/${detailId}`, { state: { pricing_type: row.pricingType, source_listing_id: row.id } });
                          }}
                          className={`mt-3 w-full h-9 rounded-lg text-[13px] font-semibold transition-colors ${
                            row.pricingType === 'transparent'
                              ? 'bg-[#2563eb] text-white hover:bg-[#1d4ed8]'
                              : row.pricingType === 'offer_price'
                                ? 'border border-[#2563eb] text-[#2563eb] hover:bg-[#eff6ff]'
                                : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {getPricingCtaLabel(row.pricingType)}
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {toast && (
        <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-slate-900 px-3 py-2 text-xs text-white shadow">
          {toast}
        </div>
      )}
    </div>
  );
}
