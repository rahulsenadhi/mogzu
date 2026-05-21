import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { Calendar, ChevronDown, MapPin, Search, Star, Users } from 'lucide-react'
import { WishlistHeart } from './global/WishlistHeart'
import { SharedHeader } from './layouts/SharedHeader'
import { SharedSidebar } from './layouts/SharedSidebar'
import { MogzuCorporateScrollSurface } from './layouts/MogzuCorporateScrollSurface'
import { EventsDiscoveryNav } from './events/EventsDiscoveryNav'
import { CategoryPillIcon } from './events/CategoryPillIcon'
import { EventsListingHero } from './events/EventsListingHero'
import { HorizontalScrollRow } from './events/HorizontalScrollRow'
import { BudgetRangeSlider } from './ui/BudgetRangeSlider'
import { QA_IMAGES } from '../lib/qaImagery'
import { type EventActivityListing } from '@/app/lib/eventsServicesData'
import { db } from '@/lib/db'
import { storageService } from '@/lib/storage'
import type { Listing, ListingImage } from '@/lib/database.types'

function uuidToNumber(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) h = ((h << 5) - h + id.charCodeAt(i)) | 0
  return Math.abs(h)
}

function listingToEventActivityListing(
  l: Listing & { listing_images?: ListingImage[] },
): EventActivityListing {
  const meta = (l.metadata ?? {}) as Record<string, unknown>
  const imgs = (l.listing_images ?? []).map((img) =>
    storageService.listingImages.getUrl(img.storage_path),
  )
  const fallbackImg = imgs[0] ?? QA_IMAGES.eventCard[0] ?? ''
  const pricingType: EventActivityListing['pricingType'] =
    l.pricing_type === 'offer'
      ? 'offer_price'
      : l.pricing_type === 'request_for_price'
        ? 'request_for_price'
        : 'transparent'
  const rawDates = Array.isArray(meta.availabilityDates) ? meta.availabilityDates : []
  const availabilityDates = rawDates.filter((d): d is string => typeof d === 'string')
  const rawTypes = Array.isArray(meta.supportedEventTypes) ? meta.supportedEventTypes : []
  const supportedEventTypes = rawTypes.filter(
    (t): t is EventActivityListing['supportedEventTypes'][number] => typeof t === 'string',
  ) as EventActivityListing['supportedEventTypes']
  const category =
    typeof meta.category === 'string'
      ? (meta.category as EventActivityListing['category'])
      : 'Activities'
  return {
    id: uuidToNumber(l.id),
    name: l.title,
    city: l.location_city ?? '',
    category,
    pricingType,
    price: l.base_price ?? undefined,
    originalPrice: typeof meta.originalPrice === 'number' ? meta.originalPrice : undefined,
    rating: typeof meta.rating === 'number' ? meta.rating : 4.5,
    ratingCount: typeof meta.ratingCount === 'number' ? meta.ratingCount : 0,
    image: fallbackImg,
    images: imgs.length > 0 ? imgs : [fallbackImg],
    availabilityDates,
    supportedEventTypes,
  }
}
import { getPricingBadgeConfig } from './ui/PriceBlock'
import {
  EVENT_ACTIVITY_SUBCATEGORIES,
  getEventActivityCategoryConfigs,
  getEventIconByCategoryText,
  type EventActivityCategoryId,
} from '@/app/lib/eventsIconMapping'
import { getListingSlideImagesFromRecord } from './dspaceCardUtils'
import { ListingCardImageGallery } from './ui/ListingCardImageGallery'

type RatingMin = 0 | 3 | 4 | 4.5

const CITIES = ['Mumbai', 'Bengaluru', 'Delhi', 'Hyderabad', 'Pune', 'Chennai'] as const

// DEMO FALLBACK — shows when Supabase returns 0 rows
// Remove this fallback once real listings exist in Supabase
const DEMO_DATA_EVENT_ACTIVITIES: EventActivityListing[] = [
  {
    id: 9001,
    name: 'Corporate Team Building Workshop',
    city: 'Mumbai',
    category: 'Activities',
    pricingType: 'transparent',
    price: 32000,
    rating: 4.7,
    ratingCount: 128,
    image: QA_IMAGES.eventCard[0],
    images: QA_IMAGES.eventCard.slice(0, 5),
    availabilityDates: ['2026-06-10', '2026-06-15', '2026-06-20'],
    supportedEventTypes: ['Team Outing', 'Conference', 'Networking'],
  },
  {
    id: 9002,
    name: 'Pro AV & Stage Production Services',
    city: 'Bengaluru',
    category: 'AV & Tech',
    pricingType: 'request_for_price',
    rating: 4.6,
    ratingCount: 84,
    image: QA_IMAGES.eventCard[1],
    images: QA_IMAGES.eventCard.slice(0, 5),
    availabilityDates: ['2026-06-05', '2026-06-12', '2026-06-22'],
    supportedEventTypes: ['Conference', 'Product Launch'],
  },
  {
    id: 9003,
    name: 'Event Photography & Videography',
    city: 'Mumbai',
    category: 'Photography',
    pricingType: 'offer_price',
    originalPrice: 48000,
    price: 38000,
    rating: 4.8,
    ratingCount: 211,
    image: QA_IMAGES.eventCard[2],
    images: QA_IMAGES.eventCard.slice(0, 5),
    availabilityDates: ['2026-06-08', '2026-06-18', '2026-06-25'],
    supportedEventTypes: ['Conference', 'Product Launch', 'Networking', 'Birthday'],
  },
  {
    id: 9004,
    name: 'Premium Corporate Catering',
    city: 'Bengaluru',
    category: 'Catering',
    pricingType: 'transparent',
    price: 1200,
    rating: 4.5,
    ratingCount: 156,
    image: QA_IMAGES.eventCard[3],
    images: QA_IMAGES.eventCard.slice(0, 5),
    availabilityDates: ['2026-06-07', '2026-06-14', '2026-06-21'],
    supportedEventTypes: ['Conference', 'Team Outing', 'Product Launch'],
  },
  {
    id: 9005,
    name: 'Wellness & Yoga Retreat Program',
    city: 'Mumbai',
    category: 'Activities',
    pricingType: 'transparent',
    price: 22000,
    rating: 4.6,
    ratingCount: 92,
    image: QA_IMAGES.eventCard[4],
    images: QA_IMAGES.eventCard.slice(0, 5),
    availabilityDates: ['2026-06-11', '2026-06-19', '2026-06-26'],
    supportedEventTypes: ['Team Outing', 'Other'],
  },
  {
    id: 9006,
    name: 'Live Entertainment & DJ Acts',
    city: 'Bengaluru',
    category: 'Entertainment',
    pricingType: 'offer_price',
    originalPrice: 55000,
    price: 45000,
    rating: 4.7,
    ratingCount: 174,
    image: QA_IMAGES.eventCard[0],
    images: QA_IMAGES.eventCard.slice(0, 5),
    availabilityDates: ['2026-06-09', '2026-06-16', '2026-06-23'],
    supportedEventTypes: ['Product Launch', 'Networking', 'Birthday', 'Other'],
  },
]

const activePillStyle = {
  backgroundImage: 'linear-gradient(-9.24736deg, rgb(228, 235, 255) 9.7419%, rgb(255, 255, 255) 85.097%)',
}

export default function EventActivityPage() {
  const navigate = useNavigate()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<EventActivityCategoryId | 'all'>('all')
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all')
  const [selectedCities, setSelectedCities] = useState<string[]>([])
  const [budgetMax, setBudgetMax] = useState(50000)
  const [ratingMin, setRatingMin] = useState<RatingMin>(0)
  const [date, setDate] = useState('')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [attendees, setAttendees] = useState('')
  const [sortBy, setSortBy] = useState<'recommended' | 'price_low' | 'price_high' | 'rating'>('recommended')
  const [cardImageIndexById, setCardImageIndexById] = useState<Record<string, number>>({})
  const [openSections, setOpenSections] = useState({ city: true, rating: true, budget: true })
  const categories = getEventActivityCategoryConfigs()

  const toggleCity = (c: string) =>
    setSelectedCities((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]))

  const toggleSection = (key: keyof typeof openSections) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }))

  const clearAllFilters = () => {
    setSelectedCategory('all')
    setSelectedSubcategory('all')
    setSelectedCities([])
    setBudgetMax(50000)
    setRatingMin(0)
    setDate('')
    setSearchKeyword('')
    setAttendees('')
    setSortBy('recommended')
  }

  const [supabaseListings, setSupabaseListings] = useState<EventActivityListing[]>([])
  const [listingsLoading, setListingsLoading] = useState(true)
  const [listingsError, setListingsError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setListingsLoading(true)
      setListingsError(null)
      const { data, error } = await db.listings.listByModule('events', 'active')
      if (cancelled) return
      if (error) {
        setListingsError(error.message)
        setSupabaseListings([])
      } else {
        setSupabaseListings((data ?? []).map(listingToEventActivityListing))
      }
      setListingsLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const filteredActivities = useMemo(() => {
    const q = searchKeyword.toLowerCase().trim()
    const finalData = supabaseListings.length > 0 ? supabaseListings : DEMO_DATA_EVENT_ACTIVITIES
    let results = finalData.filter((item) => {
      if (selectedCities.length > 0 && !selectedCities.includes(item.city)) return false
      if (ratingMin > 0 && item.rating < ratingMin) return false
      if (typeof item.price === 'number' && item.price > budgetMax) return false
      if (selectedCategory !== 'all') {
        const categoryKeywords: Record<EventActivityCategoryId, string[]> = {
          workshops_trainings: ['workshop', 'training'],
          arts_creativity: ['art', 'creativity'],
          virtual_games: ['virtual', 'game'],
          wellness_programs: ['wellness'],
          entertainment: ['entertainment'],
          themed_parties: ['party'],
          csr: ['csr'],
        }
        const keywords = categoryKeywords[selectedCategory] ?? []
        const normalized = item.category.toLowerCase()
        if (keywords.length > 0 && !keywords.some((word) => normalized.includes(word))) return false
      }
      if (q) {
        const hay = `${item.name} ${item.category} ${item.city}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      if (date && !item.availabilityDates.some((d) => d >= date)) return false
      return true
    })
    if (sortBy === 'price_low') results = [...results].sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0))
    if (sortBy === 'price_high') results = [...results].sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0))
    if (sortBy === 'rating') results = [...results].sort((a, b) => b.rating - a.rating)
    return results
  }, [budgetMax, selectedCities, date, ratingMin, searchKeyword, selectedCategory, sortBy, supabaseListings])

  const goToPrevCardImage = (cardId: string, total: number) => {
    setCardImageIndexById((prev) => {
      const current = prev[cardId] ?? 0
      return { ...prev, [cardId]: (current - 1 + total) % total }
    })
  }

  const goToNextCardImage = (cardId: string, total: number) => {
    setCardImageIndexById((prev) => {
      const current = prev[cardId] ?? 0
      return { ...prev, [cardId]: (current + 1) % total }
    })
  }

  const activeSubcategories = selectedCategory !== 'all' ? EVENT_ACTIVITY_SUBCATEGORIES[selectedCategory] ?? [] : []

  const heroSlides = useMemo(
    () => [
      {
        title: 'Build high-engagement event activities',
        chip: 'Corporate experiences',
        subtitle: 'Workshops, wellness, entertainment, and team experiences for your next corporate event.',
        cta: 'View featured activity',
        image: QA_IMAGES.eventsHero,
        onCtaClick: () => navigate('/event-activity/1'),
      },
      {
        title: 'Book team workshops that drive real outcomes',
        chip: 'Workshops & Trainings',
        subtitle: 'Leadership labs, skill-building sessions, and instructor-led programs for every team size.',
        cta: 'Explore workshops',
        image: QA_IMAGES.eventsHero,
        onCtaClick: () => {
          setSelectedCategory('workshops_trainings')
          setSelectedSubcategory('all')
        },
      },
      {
        title: 'Wellness programs employees actually enjoy',
        chip: 'Wellness Programs',
        subtitle: 'Yoga, meditation, fitness challenges, and spa experiences for healthier teams.',
        cta: 'Browse wellness',
        image: QA_IMAGES.eventsHero,
        onCtaClick: () => {
          setSelectedCategory('wellness_programs')
          setSelectedSubcategory('all')
        },
      },
    ],
    [navigate],
  )

  return (
    <div className="flex h-screen min-h-screen overflow-hidden mogzu-module-shell-bg">
      <SharedSidebar collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} activeNav="activity" />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <SharedHeader variant="blended" onMobileMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} searchPlaceholder="Search activities..." />
        <MogzuCorporateScrollSurface>
          <EventsDiscoveryNav activeTab="event-activity" />

          <div className="mx-auto w-full max-w-[1280px] px-5 md:px-8 lg:px-12 pt-6">
            <EventsListingHero slides={heroSlides} />

            <HorizontalScrollRow className="mb-4">
              <button
                type="button"
                onClick={() => { setSelectedCategory('all'); setSelectedSubcategory('all') }}
                className={`h-9 flex shrink-0 items-center gap-2 px-4 rounded-full border-[1.5px] transition-all duration-200 whitespace-nowrap hover:-translate-y-0.5 active:scale-[0.98] ${
                  selectedCategory === 'all'
                    ? 'border-[#2563eb] shadow-[0_10px_24px_rgba(37,99,235,0.2)] text-[#0e1e3f] font-semibold'
                    : 'border-slate-300/25 bg-white/[0.12] text-[#475569] backdrop-blur-sm hover:border-[#93c5fd]'
                }`}
                style={selectedCategory === 'all' ? activePillStyle : undefined}
              >
                All activities
              </button>
              {categories.map((category) => {
                const Icon = category.icon
                const isActive = selectedCategory === category.id
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => { setSelectedCategory(category.id); setSelectedSubcategory('all') }}
                    className={`h-9 flex shrink-0 items-center gap-2 px-4 rounded-full border-[1.5px] transition-all duration-200 whitespace-nowrap hover:-translate-y-0.5 active:scale-[0.98] ${
                      isActive
                        ? 'border-[#2563eb] shadow-[0_10px_24px_rgba(37,99,235,0.2)] text-[#0e1e3f] font-semibold'
                        : 'border-slate-300/25 bg-white/[0.12] text-[#475569] backdrop-blur-sm hover:border-[#93c5fd]'
                    }`}
                    style={isActive ? activePillStyle : undefined}
                  >
                    <CategoryPillIcon icon={Icon} color={category.color} />
                    <span className={`text-[14px] ${isActive ? 'font-semibold' : 'font-medium'}`}>{category.label.replace('\n', ' ')}</span>
                  </button>
                )
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
                    {activeSubcategories.map((sub) => {
                      const SubIcon = sub.icon
                      const isActive = selectedSubcategory === sub.id
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => setSelectedSubcategory(sub.id)}
                          className={`flex h-9 shrink-0 items-center gap-2 rounded-lg border px-3 text-[13px] font-semibold whitespace-nowrap transition-all ${
                            isActive
                              ? 'border-[#2563eb] bg-[#2563eb] text-white shadow-md'
                              : 'border-[#e5e7eb] bg-white text-[#475569] hover:border-[#4379ee] hover:text-[#4379ee]'
                          }`}
                        >
                          <SubIcon
                            className="h-4 w-4 shrink-0"
                            style={{ color: isActive ? '#ffffff' : sub.textColor }}
                            strokeWidth={2.2}
                          />
                          <span>{sub.name}</span>
                        </button>
                      )
                    })}
                </div>
              </HorizontalScrollRow>
            )}
          </div>

          {/* Grid + Sidebar */}
          <div className="mx-auto w-full max-w-[1280px] px-5 md:px-8 lg:px-12 pb-6 flex gap-4">
            {/* Filter aside */}
            <aside className="w-[240px] flex-shrink-0 lg:sticky lg:top-4 lg:self-start">
              <div className="bg-white/55 backdrop-blur-xl rounded-2xl p-5 border border-white/60 shadow-[0_16px_36px_rgba(37,99,235,0.16)]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[16px] font-semibold text-[#0e1e3f]">Filters</h3>
                  <button type="button" onClick={clearAllFilters} className="text-[13px] font-medium text-[#4379ee] underline">Clear all</button>
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
                      {CITIES.map((c) => (
                        <label key={c} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedCities.includes(c)}
                            onChange={() => toggleCity(c)}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600"
                          />
                          <span className="text-sm text-[#475569]">{c}</span>
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
                      {([4.5, 4.0, 3.0, 0] as RatingMin[]).map((r) => (
                        <label key={r} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="ratingMin"
                            checked={ratingMin === r}
                            onChange={() => setRatingMin(r)}
                          />
                          <span className="text-sm text-[#475569]">{r === 0 ? 'All ratings' : `${r}+ ★`}</span>
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
                    <span>Budget (max)</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${openSections.budget ? '' : '-rotate-90'}`} />
                  </button>
                  {openSections.budget && (
                    <BudgetRangeSlider
                      min={0}
                      max={500000}
                      step={5000}
                      value={budgetMax}
                      onChange={setBudgetMax}
                      minLabel="₹0"
                      maxLabel="₹5L"
                    />
                  )}
                </div>
              </div>
            </aside>

            {/* Right column */}
            <div className="flex-1">
              {/* Search + Sort */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                  <input
                    type="text"
                    placeholder="Search by activity, host, or location"
                    className="w-full h-10 pl-10 pr-4 text-[14px] placeholder:text-[#878e9e] bg-white border border-[#e5e7eb] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4379ee]/20"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2 justify-end">
                  <span className="text-[13px] text-[#878e9e]">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    className="h-10 px-3 text-[14px] border border-[#e5e7eb] rounded-xl bg-white/70 focus:outline-none focus:ring-2 focus:ring-[#4379ee]/20"
                  >
                    <option value="recommended">Recommended</option>
                    <option value="rating">Highest Rated</option>
                    <option value="price_low">Price: Low–High</option>
                    <option value="price_high">Price: High–Low</option>
                  </select>
                </div>
              </div>

              {/* Campaign filters row */}
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#64748b]">Campaign filters</div>
              <div className="mb-3 grid grid-cols-1 md:grid-cols-3 gap-2">
                <div className="relative">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs border border-white/70 rounded-lg bg-white/65 backdrop-blur-md hover:border-[#93c5fd] focus:outline-none focus:ring-2 focus:ring-[#93c5fd]/40"
                    aria-label="Filter by date"
                  />
                  <Calendar className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#64748b]" />
                </div>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="Attendees count"
                    value={attendees}
                    onChange={(e) => setAttendees(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs border border-white/70 rounded-lg bg-white/65 backdrop-blur-md hover:border-[#93c5fd] focus:outline-none focus:ring-2 focus:ring-[#93c5fd]/40"
                  />
                  <Users className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#64748b]" />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => { setSelectedCategory(e.target.value as EventActivityCategoryId | 'all'); setSelectedSubcategory('all') }}
                  className="px-2.5 py-2 text-xs border border-white/70 rounded-lg bg-white/65 backdrop-blur-md hover:border-[#93c5fd] focus:outline-none focus:ring-2 focus:ring-[#93c5fd]/40"
                >
                  <option value="all">Category: All</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.label.replace('\n', ' ')}</option>
                  ))}
                </select>
              </div>

              <p className="mb-3 text-[13px] text-[#878e9e]">
                Showing {filteredActivities.length} result{filteredActivities.length === 1 ? '' : 's'}
              </p>

              {/* Cards grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {listingsLoading ? (
                  <div className="col-span-full rounded-2xl border border-[#dbe3f2] bg-white/70 p-10 text-center text-sm text-[#475569]">
                    Loading event activities…
                  </div>
                ) : listingsError ? (
                  <div className="col-span-full rounded-2xl border border-rose-200 bg-rose-50 p-10 text-center">
                    <p className="text-sm font-semibold text-rose-700">Couldn't load activities</p>
                    <p className="mt-1 text-xs text-rose-600">{listingsError}</p>
                  </div>
                ) : filteredActivities.length === 0 ? (
                  <div className="col-span-full rounded-2xl border border-[#dbe3f2] bg-white/70 p-10 text-center">
                    <p className="text-[16px] font-semibold text-[#0e1e3f]">No event activities found</p>
                    <p className="text-[13px] text-[#64748b] mt-1">Try updating the filters to see more results.</p>
                  </div>
                ) : filteredActivities.map((activity) => {
                  const cardId = String(activity.id)
                  const sliderImages = getListingSlideImagesFromRecord(activity)
                  const activeImageIndex = cardImageIndexById[cardId] ?? 0
                  const normalizedPricingType =
                    activity.pricingType === 'offer_price'
                      ? 'offer_price'
                      : activity.pricingType === 'request_for_price'
                        ? 'request_for_price'
                        : 'transparent'
                  const badge = getPricingBadgeConfig(normalizedPricingType)
                  const CategoryIcon = getEventIconByCategoryText(activity.category)

                  return (
                    <div
                      key={activity.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => navigate(`/event-activity/${activity.id}`)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate(`/event-activity/${activity.id}`) }}
                      className="bg-white/65 backdrop-blur-md rounded-2xl overflow-hidden border border-white/50 shadow-[0_10px_30px_rgba(37,99,235,0.14)] hover:shadow-[0_18px_36px_rgba(37,99,235,0.22)] transition-all group h-full flex flex-col cursor-pointer"
                    >
                      <ListingCardImageGallery
                        images={sliderImages}
                        alt={activity.name}
                        activeIndex={activeImageIndex}
                        onPrev={(e) => {
                          e.stopPropagation()
                          goToPrevCardImage(cardId, sliderImages.length)
                        }}
                        onNext={(e) => {
                          e.stopPropagation()
                          goToNextCardImage(cardId, sliderImages.length)
                        }}
                      >
                        <button
                          type="button"
                          onClick={(e) => e.stopPropagation()}
                          className="absolute top-2.5 left-2.5 z-[3] h-7 px-2.5 bg-white/95 backdrop-blur-sm rounded-full text-[10px] font-semibold text-[#334155] hover:bg-white hover:-translate-y-0.5 active:scale-95 transition-all shadow border border-[#e2e8f0] inline-flex items-center"
                        >
                          Compare
                        </button>
                        <WishlistHeart
                          listingId={String(cardId)}
                          className="absolute top-2.5 right-2.5 z-[3] w-8 h-8 bg-white/95 rounded-full flex items-center justify-center hover:bg-white hover:-translate-y-0.5 active:scale-95 transition-all shadow border border-[#e2e8f0]"
                        />
                        <div className="absolute bottom-2.5 right-2.5 z-[3] bg-[#16a34a] text-white text-[10px] font-semibold px-2.5 h-6 rounded-full inline-flex items-center gap-1 shadow-md">
                          <span>{activity.rating.toFixed(1)}</span>
                          <Star className="h-3 w-3 fill-white" />
                        </div>
                        <div className="absolute top-11 left-2.5 z-[3]">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${badge.className}`}>{badge.label}</span>
                        </div>
                      </ListingCardImageGallery>

                      {/* Info section — gradient background matching gifting */}
                      <div className="p-3 flex-1 flex flex-col bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(239,246,255,0.72))]">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#878e9e] mb-1 truncate">
                          <CategoryIcon className="inline h-3 w-3 mr-1 text-[#878e9e]" />
                          {activity.category}
                        </p>
                        <p className="text-sm font-semibold text-[#0e1e3f] mb-1 line-clamp-2 min-h-[36px]">{activity.name}</p>
                        <p className="text-xs text-[#878e9e] mb-2">
                          <MapPin className="inline h-3 w-3 mr-0.5" />{activity.city}
                        </p>
                        <div className="mt-auto">
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#64748b]">Starting at</p>
                          <p className="text-sm font-bold text-[#0e1e3f]">
                            {typeof activity.price === 'number' ? `₹${activity.price.toLocaleString('en-IN')}` : 'On request'}
                            {typeof activity.price === 'number' && (
                              <span className="text-xs font-normal text-[#64748b] ml-1">/event</span>
                            )}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); navigate(`/event-activity/${activity.id}`) }}
                          className="mt-3 w-full h-9 rounded-lg bg-[#2563eb] text-white text-[13px] font-semibold hover:bg-[#1d4ed8] transition-colors"
                        >
                          View details
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </MogzuCorporateScrollSurface>
      </div>
    </div>
  )
}
