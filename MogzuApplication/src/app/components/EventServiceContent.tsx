import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, Heart, Search, Star } from 'lucide-react';
import { useNavigate } from 'react-router';
import { QA_IMAGES } from '../lib/qaImagery';
import { getPricingBadgeConfig, getPricingCtaLabel, getPricingSummaryLine } from './ui/PriceBlock';
import { getCompareIds, getWishlistIds, toggleCompareId, toggleWishlistId } from '@/app/lib/listingSessionState';
import { useDemoRole } from '@/app/lib/demoRole';
import { getEventServiceCategoryIconConfig } from '@/app/lib/eventsIconMapping';

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
  insured: boolean;
};

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

const SEEDED_SERVICES: ServiceListing[] = [
  { id: 'svc-1', title: 'Executive Buffet Program', category: 'Catering', city: 'Mumbai', capacity: 220, vendorName: 'RoyalPlatter Caterers', vendorRating: 4.8, pricingType: 'transparent', priceType: 'per_person', basePrice: 950, featured: true, createdAt: '2026-03-01', image: QA_IMAGES.serviceCard, insured: true },
  { id: 'svc-2', title: 'Townhall AV Production Kit', category: 'Audio Visuals', city: 'Bangalore', capacity: 500, vendorName: 'PrismWave Technologies', vendorRating: 4.6, pricingType: 'offer_price', priceType: 'flat', startingPrice: 138000, featured: true, createdAt: '2026-03-15', image: QA_IMAGES.serviceCard, insured: true },
  { id: 'svc-3', title: 'Brand Experience Decor Build', category: 'Design & Decor', city: 'Delhi', capacity: 350, vendorName: 'AuraDecor Events', vendorRating: 4.5, pricingType: 'request_for_price', priceType: 'flat', featured: false, createdAt: '2026-02-25', image: QA_IMAGES.serviceCard, insured: false },
  { id: 'svc-4', title: 'Corporate Event Security Unit', category: 'Security', city: 'Hyderabad', capacity: 300, vendorName: 'ShieldOne Security', vendorRating: 4.4, pricingType: 'transparent', priceType: 'flat', basePrice: 26000, featured: false, createdAt: '2026-03-03', image: QA_IMAGES.serviceCard, insured: true },
  { id: 'svc-5', title: 'Delegate Shuttle Fleet', category: 'Transportation', city: 'Pune', capacity: 180, vendorName: 'TransitPro Mobility', vendorRating: 4.7, pricingType: 'offer_price', priceType: 'flat', startingPrice: 32000, featured: false, createdAt: '2026-03-10', image: QA_IMAGES.serviceCard, insured: true },
  { id: 'svc-6', title: 'Hybrid Event App + Check-in', category: 'Technology', city: 'Chennai', capacity: 450, vendorName: 'EventStack Tech', vendorRating: 4.5, pricingType: 'request_for_price', priceType: 'flat', featured: false, createdAt: '2026-03-20', image: QA_IMAGES.serviceCard, insured: true },
  { id: 'svc-7', title: 'Permit Desk & Compliance', category: 'License/Permits', city: 'Delhi', capacity: 300, vendorName: 'PermitBridge Advisors', vendorRating: 4.3, pricingType: 'request_for_price', priceType: 'flat', featured: false, createdAt: '2026-01-29', image: QA_IMAGES.serviceCard, insured: false },
];

export default function EventServiceContent() {
  const navigate = useNavigate();
  const { activeRole } = useDemoRole();
  const [services] = useState<ServiceListing[]>(SEEDED_SERVICES);
  const [selectedCategories, setSelectedCategories] = useState<ServiceCategory[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [capacityBand, setCapacityBand] = useState<'all' | 'up50' | '51_200' | '201_500' | '500+'>('all');
  const [budgetMax, setBudgetMax] = useState(1000000);
  const [pricingTypes, setPricingTypes] = useState<PricingType[]>([]);
  const [insuredOnly, setInsuredOnly] = useState(false);
  const [ratingFloor, setRatingFloor] = useState(0);
  const [sortBy, setSortBy] = useState<'relevant' | 'highest_rated' | 'price_low_high' | 'price_high_low' | 'newest'>('relevant');
  const [search, setSearch] = useState('');
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => getWishlistIds());
  const [compareIds, setCompareIds] = useState<string[]>(() => getCompareIds());
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(''), 2200);
    return () => window.clearTimeout(id);
  }, [toast]);

  const filtered = useMemo(() => {
    const base = services.filter((row) => {
      if (selectedCategories.length > 0 && !selectedCategories.includes(row.category)) return false;
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
        if (a.pricingType === 'request_for_price' && b.pricingType !== 'request_for_price') return 1;
        if (b.pricingType === 'request_for_price' && a.pricingType !== 'request_for_price') return -1;
        const ap = a.pricingType === 'offer_price' ? a.startingPrice ?? 0 : a.basePrice ?? 0;
        const bp = b.pricingType === 'offer_price' ? b.startingPrice ?? 0 : b.basePrice ?? 0;
        return ap - bp;
      }
      if (sortBy === 'price_high_low') {
        if (a.pricingType === 'request_for_price' && b.pricingType !== 'request_for_price') return 1;
        if (b.pricingType === 'request_for_price' && a.pricingType !== 'request_for_price') return -1;
        const ap = a.pricingType === 'offer_price' ? a.startingPrice ?? 0 : a.basePrice ?? 0;
        const bp = b.pricingType === 'offer_price' ? b.startingPrice ?? 0 : b.basePrice ?? 0;
        return bp - ap;
      }
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return b.vendorRating - a.vendorRating;
    });
    return sorted;
  }, [budgetMax, capacityBand, insuredOnly, pricingTypes, ratingFloor, search, selectedCategories, selectedCities, services, sortBy]);

  const clearAll = () => {
    setSelectedCategories([]);
    setSelectedCities([]);
    setCapacityBand('all');
    setBudgetMax(1000000);
    setPricingTypes([]);
    setInsuredOnly(false);
    setRatingFloor(0);
    setSortBy('relevant');
    setSearch('');
  };

  const activeChipCount =
    selectedCategories.length +
    selectedCities.length +
    (capacityBand !== 'all' ? 1 : 0) +
    (budgetMax !== 1000000 ? 1 : 0) +
    pricingTypes.length +
    (insuredOnly ? 1 : 0) +
    (ratingFloor > 0 ? 1 : 0);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg p-4 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-[#0e1e3f] text-lg font-semibold">Event Services</h2>
          <p className="text-xs text-[#878e9e]">Showing {filtered.length} of {services.length} listings</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search service or vendor"
            className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
          />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} className="h-10 rounded-lg border border-slate-200 px-2 text-sm">
            <option value="relevant">Most Relevant</option>
            <option value="highest_rated">Highest Rated</option>
            <option value="price_low_high">Price: Low-High</option>
            <option value="price_high_low">Price: High-Low</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg p-3 flex items-center gap-2 overflow-x-auto">
        {CATEGORIES.map((cat) => {
          const active = selectedCategories.includes(cat);
          const iconConfig = getEventServiceCategoryIconConfig(cat);
          const Icon = iconConfig.icon;
          const count = services.filter((s) => s.category === cat).length;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategories((prev) => (prev.includes(cat) ? prev.filter((x) => x !== cat) : [...prev, cat]))}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs whitespace-nowrap ${
                active ? 'bg-blue-50 border-[#2563eb] text-[#2563eb]' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon className="h-3.5 w-3.5" color={iconConfig.color} /> {cat} ({count})
            </button>
          );
        })}
      </div>

      <div className="flex gap-4 flex-col lg:flex-row">
        <aside className="w-full lg:w-[260px] bg-white rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#0e1e3f]">Filters</h3>
            <button type="button" onClick={clearAll} className="text-xs text-[#2563eb] hover:underline">Clear all</button>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-700 mb-1">City</p>
            <div className="space-y-1">
              {CITIES.map((city) => (
                <label key={city} className="flex items-center gap-2 text-xs text-slate-600">
                  <input type="checkbox" checked={selectedCities.includes(city)} onChange={() => setSelectedCities((prev) => prev.includes(city) ? prev.filter((x) => x !== city) : [...prev, city])} />
                  {city}
                </label>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-700 mb-1">Event Capacity</p>
            {[
              ['all', 'All'],
              ['up50', 'Up to 50'],
              ['51_200', '51-200'],
              ['201_500', '201-500'],
              ['500+', '500+'],
            ].map(([id, label]) => (
              <label key={id} className="flex items-center gap-2 text-xs text-slate-600">
                <input type="radio" name="capacityBand" checked={capacityBand === id} onChange={() => setCapacityBand(id as typeof capacityBand)} />
                {label}
              </label>
            ))}
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-700 mb-1">Budget (₹)</p>
            <input type="range" min={0} max={1000000} step={10000} value={budgetMax} onChange={(e) => setBudgetMax(Number(e.target.value))} className="w-full accent-[#2563eb]" />
            <p className="text-xs text-slate-500">Up to ₹{budgetMax.toLocaleString('en-IN')}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-700 mb-1">Pricing Type</p>
            {(['transparent', 'offer_price', 'request_for_price'] as PricingType[]).map((t) => (
              <label key={t} className="flex items-center gap-2 text-xs text-slate-600">
                <input type="checkbox" checked={pricingTypes.includes(t)} onChange={() => setPricingTypes((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t])} />
                {t}
              </label>
            ))}
          </div>
          <label className="flex items-center gap-2 text-xs text-slate-700">
            <input type="checkbox" checked={insuredOnly} onChange={(e) => setInsuredOnly(e.target.checked)} />
            Insurance Covered only
          </label>
          <div>
            <p className="text-xs font-semibold text-slate-700 mb-1">Rating</p>
            {[4.5, 4.0, 3.5].map((r) => (
              <label key={r} className="flex items-center gap-2 text-xs text-slate-600">
                <input type="radio" name="ratingFloor" checked={ratingFloor === r} onChange={() => setRatingFloor(r)} />
                {r}+
              </label>
            ))}
            <label className="flex items-center gap-2 text-xs text-slate-600">
              <input type="radio" name="ratingFloor" checked={ratingFloor === 0} onChange={() => setRatingFloor(0)} />
              All ratings
            </label>
          </div>
          <button type="button" className="w-full h-12 rounded-full bg-[#2563eb] text-white text-sm font-semibold">
            Apply Filters ({activeChipCount})
          </button>
        </aside>

        <section className="flex-1">
          {activeChipCount > 0 ? (
            <div className="mb-3 flex flex-wrap gap-2">
              {[...selectedCategories, ...selectedCities].map((chip) => (
                <span key={chip} className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-700">
                  {chip}
                </span>
              ))}
            </div>
          ) : null}

          {filtered.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-white p-12 text-center">
              <Search className="mx-auto h-8 w-8 text-slate-300" />
              <h3 className="mt-2 text-base font-semibold text-slate-900">No listings match your filters</h3>
              <p className="mt-1 text-sm text-slate-500">Try adjusting or clearing your filters</p>
              <button type="button" onClick={clearAll} className="mt-4 rounded-full bg-[#2563eb] px-5 py-2 text-sm font-semibold text-white">
                Clear All Filters
              </button>
            </div>
          ) : (
            <div id="event-service-results" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((row) => {
                const isSaved = wishlistIds.includes(row.id);
                const inCompare = compareIds.includes(row.id);
                const badge = getPricingBadgeConfig(row.pricingType);
                const detailId = row.id.replace(/[^\d]/g, '') || '1'
                return (
                  <article
                    key={row.id}
                    className="group bg-white rounded-lg overflow-hidden border border-slate-200 cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
                    onClick={() => navigate(`/events/services/${detailId}`, { state: { pricing_type: row.pricingType, source_listing_id: row.id } })}
                  >
                    <div className="relative h-[170px] overflow-hidden">
                      <img src={row.image} alt={row.title} className="h-full w-full object-cover transition-transform duration-[400ms] group-hover:scale-[1.04]" />
                      {activeRole === 'corporate' ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setWishlistIds(toggleWishlistId(row.id));
                          }}
                          className="absolute top-2 right-2 size-8 rounded-full bg-white/80 grid place-items-center"
                          aria-label="Save listing"
                        >
                          <Heart className={`h-4 w-4 ${isSaved ? 'text-red-500 fill-red-500' : 'text-slate-600'}`} />
                        </button>
                      ) : null}
                      <div className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-[#22c55e] px-2 py-0.5 text-xs text-white">
                        <Star className="h-3 w-3 fill-white" /> {row.vendorRating.toFixed(1)}
                      </div>
                    </div>
                    <div className="p-3 space-y-2">
                      <h3 className="text-sm font-semibold text-[#0e1e3f] line-clamp-2">{row.title}</h3>
                      <p className="text-xs text-slate-500">{row.city} · Capacity {row.capacity}</p>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${badge.className}`}>{badge.label}</span>
                      <p className="text-sm font-semibold text-[#0e1e3f]">
                        {getPricingSummaryLine({
                          pricing_type: row.pricingType,
                          price_type: row.priceType,
                          base_price: row.basePrice,
                          starting_price: row.startingPrice,
                        })}
                      </p>
                      {activeRole === 'corporate' ? (
                        <>
                          <label className="inline-flex items-center gap-1 text-[11px] text-slate-600" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={inCompare}
                              onChange={() => {
                                const r = toggleCompareId(row.id, 3);
                                if (r.blocked) {
                                  setToast('You can compare up to 3 listings at a time.');
                                }
                                setCompareIds(r.ids);
                              }}
                            />
                            Compare
                          </label>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/events/services/${detailId}`, { state: { pricing_type: row.pricingType, source_listing_id: row.id } });
                            }}
                            className={`w-full rounded-lg py-2 text-sm font-semibold ${
                              row.pricingType === 'transparent'
                                ? 'bg-[#2563eb] text-white'
                                : row.pricingType === 'offer_price'
                                  ? 'border border-[#2563eb] text-[#2563eb]'
                                  : 'border border-slate-300 text-slate-700'
                            }`}
                          >
                            {getPricingCtaLabel(row.pricingType)}
                          </button>
                        </>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
      {toast ? (
        <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-slate-900 px-3 py-2 text-xs text-white shadow">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
