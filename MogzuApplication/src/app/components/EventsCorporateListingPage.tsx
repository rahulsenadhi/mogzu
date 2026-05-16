import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { Calendar, ChevronDown, MapPin, Search, Star } from 'lucide-react'
import { SharedHeader } from './layouts/SharedHeader'
import { SharedSidebar } from './layouts/SharedSidebar'
import { MogzuCorporateScrollSurface } from './layouts/MogzuCorporateScrollSurface'
import {
  EVENT_ACTIVITY_LISTINGS,
  EVENT_SERVICES,
  EVENT_SERVICE_CATEGORIES,
  EVENT_TYPES,
  formatInr,
  type EventServiceCategory,
  type EventServicePricingType,
  type EventType,
} from '@/app/lib/eventsServicesData'
import { getPricingBadgeConfig } from './ui/PriceBlock'
import { ListingCardImageGallery } from './ui/ListingCardImageGallery'
import { getListingSlideImages, getListingSlideImagesFromRecord } from './dspaceCardUtils'
import { useListingCardImageScroller } from '@/app/hooks/useListingCardImageScroller'

type RatingMin = 0 | 3 | 4 | 4.5

const CITIES = ['All', 'Mumbai', 'Bengaluru', 'Delhi', 'Hyderabad', 'Pune', 'Chennai'] as const

export default function EventsCorporateListingPage() {
  const navigate = useNavigate()

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const [city, setCity] = useState<(typeof CITIES)[number]>('All')
  const [eventType, setEventType] = useState<EventType | 'All'>('All')
  const [budgetMax, setBudgetMax] = useState(100000)
  const [date, setDate] = useState('')

  const [activeCategoryChip, setActiveCategoryChip] = useState<EventServiceCategory | 'All'>('All')

  const [sidebarCategory, setSidebarCategory] = useState<EventServiceCategory | 'All'>('All')
  const [sidebarCity, setSidebarCity] = useState<(typeof CITIES)[number]>('All')
  const [sidebarBudgetMax, setSidebarBudgetMax] = useState(100000)
  const [ratingMin, setRatingMin] = useState<RatingMin>(0)
  const [pricingType, setPricingType] = useState<EventServicePricingType | 'all'>('all')
  const [availabilityDate, setAvailabilityDate] = useState('')

  const [keyword, setKeyword] = useState('')
  const [searchAppliedAt, setSearchAppliedAt] = useState(0)
  const [listingMode, setListingMode] = useState<'all' | 'services' | 'activities'>('all')
  const { goToPrevCardImage, goToNextCardImage, getActiveIndex } = useListingCardImageScroller()

  const effectiveCity = sidebarCity !== 'All' ? sidebarCity : city
  const effectiveBudgetMax = sidebarBudgetMax !== 100000 ? sidebarBudgetMax : budgetMax
  const effectiveCategory: EventServiceCategory | 'All' =
    sidebarCategory !== 'All' ? sidebarCategory : activeCategoryChip
  const effectiveDate = availabilityDate || date
  const effectiveEventType = eventType

  const filtered = useMemo(() => {
    const query = keyword.trim().toLowerCase()
    return EVENT_SERVICES.filter((s) => {
      if (effectiveCity !== 'All' && s.city !== effectiveCity) return false
      if (effectiveCategory !== 'All' && s.category !== effectiveCategory) return false
      if (effectiveEventType !== 'All' && !s.supportedEventTypes.includes(effectiveEventType)) return false
      if (pricingType !== 'all' && s.pricingType !== pricingType) return false
      if (ratingMin > 0 && s.rating < ratingMin) return false
      if (s.pricingType !== 'request_for_price' && typeof s.price === 'number' && s.price > effectiveBudgetMax) return false
      if (effectiveDate && !s.availabilityDates.some((d) => d >= effectiveDate)) return false
      if (query) {
        const hay = `${s.name} ${s.vendorName} ${s.category} ${s.city}`.toLowerCase()
        if (!hay.includes(query)) return false
      }
      return true
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveCity, effectiveCategory, effectiveBudgetMax, effectiveDate, effectiveEventType, pricingType, ratingMin, searchAppliedAt])

  const filteredActivities = useMemo(() => {
    const query = keyword.trim().toLowerCase()
    return EVENT_ACTIVITY_LISTINGS.filter((s) => {
      if (effectiveCity !== 'All' && s.city !== effectiveCity) return false
      if (effectiveCategory !== 'All' && s.category !== effectiveCategory) return false
      if (effectiveEventType !== 'All' && !s.supportedEventTypes.includes(effectiveEventType)) return false
      if (pricingType !== 'all' && s.pricingType !== pricingType) return false
      if (ratingMin > 0 && s.rating < ratingMin) return false
      if (s.pricingType !== 'request_for_price' && typeof s.price === 'number' && s.price > effectiveBudgetMax) return false
      if (effectiveDate && !s.availabilityDates.some((d) => d >= effectiveDate)) return false
      if (query) {
        const hay = `${s.name} ${s.category} ${s.city}`.toLowerCase()
        if (!hay.includes(query)) return false
      }
      return true
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveCity, effectiveCategory, effectiveBudgetMax, effectiveDate, effectiveEventType, pricingType, ratingMin, searchAppliedAt])

  const handleClearAll = () => {
    setCity('All')
    setEventType('All')
    setBudgetMax(100000)
    setDate('')
    setActiveCategoryChip('All')

    setSidebarCategory('All')
    setSidebarCity('All')
    setSidebarBudgetMax(100000)
    setRatingMin(0)
    setPricingType('all')
    setAvailabilityDate('')

    setKeyword('')
    setListingMode('all')
    setSearchAppliedAt((n) => n + 1)
  }

  const handleSearch = () => {
    setSearchAppliedAt((n) => n + 1)
    document.getElementById('events-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="flex h-screen min-h-screen overflow-hidden mogzu-module-shell-bg">
      <SharedSidebar collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} activeNav="activity" />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <SharedHeader variant="blended" onMobileMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} searchPlaceholder="Search events..." />

        <MogzuCorporateScrollSurface>
          <div className="border-b border-slate-300/[0.1] bg-transparent">
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-400/10 bg-[#fffdf9]/[0.22] px-4 py-1 text-[12px] backdrop-blur-[2px] mb-3">
                <button type="button" onClick={() => navigate('/dashboard')} className="text-[#7b879a] font-medium hover:text-[#2563eb]">
                  Dashboard
                </button>
                <ChevronDown className="size-4 text-[#a0aec0] -rotate-90" />
                <span className="text-[#0e1e3f] font-semibold">Events</span>
              </div>

              <div className="flex items-end justify-between gap-4">
                <div>
                  <h1 className="text-[22px] font-bold text-[#0e1e3f] leading-none">Events</h1>
                  <p className="mt-1 text-[13px] text-[#878e9e]">Discover and book trusted event services for your corporate needs.</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => navigate('/events/new')}
                      className="h-9 rounded-full border border-[#2563eb] bg-[#2563eb] px-4 text-[13px] font-semibold text-white"
                    >
                      New layout
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/events/classic')}
                      className="h-9 rounded-full border border-[#d1d5db] bg-white px-4 text-[13px] font-semibold text-[#475569]"
                    >
                      Classic layout
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="h-10 px-4 rounded-full border border-[#d1d5db] text-[#475569] text-[13px] font-semibold hover:border-[#2563eb]"
                >
                  Clear all
                </button>
              </div>

              {/* Top filter bar */}
              <div className="mt-4 rounded-2xl border border-white/60 bg-white/55 backdrop-blur-xl p-4 shadow-[0_16px_36px_rgba(37,99,235,0.12)]">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3 items-end">
                  <div>
                    <label className="text-[12px] font-semibold text-[#0e1e3f]">City</label>
                    <div className="relative mt-1">
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value as (typeof CITIES)[number])}
                        className="w-full h-10 rounded-lg border border-[#e5e7eb] bg-white px-3 pr-9 text-[13px] text-[#475569] focus:outline-none focus:border-[#2563eb]"
                      >
                        {CITIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-[#94a3b8] pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[12px] font-semibold text-[#0e1e3f]">Event type</label>
                    <div className="relative mt-1">
                      <select
                        value={eventType}
                        onChange={(e) => setEventType(e.target.value as EventType | 'All')}
                        className="w-full h-10 rounded-lg border border-[#e5e7eb] bg-white px-3 pr-9 text-[13px] text-[#475569] focus:outline-none focus:border-[#2563eb]"
                      >
                        <option value="All">All</option>
                        {EVENT_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-[#94a3b8] pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[12px] font-semibold text-[#0e1e3f]">Budget max</label>
                    <div className="mt-1">
                      <div className="flex items-center justify-between text-[11px] text-[#878e9e]">
                        <span>₹0</span>
                        <span>{formatInr(100000)}</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100000}
                        value={budgetMax}
                        onChange={(e) => setBudgetMax(Number(e.target.value))}
                        className="mt-1 w-full h-1 bg-slate-200 rounded appearance-none cursor-pointer accent-[#2563eb]"
                      />
                      <p className="mt-1 text-[12px] font-semibold text-[#0e1e3f]">{formatInr(budgetMax)}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-[12px] font-semibold text-[#0e1e3f]">Date</label>
                    <div className="relative mt-1">
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full h-10 rounded-lg border border-[#e5e7eb] bg-white px-3 pr-9 text-[13px] text-[#475569] focus:outline-none focus:border-[#2563eb]"
                      />
                      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-[#94a3b8] pointer-events-none" />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSearch}
                    className="h-10 rounded-lg bg-[#2563eb] text-white text-[13px] font-semibold hover:bg-blue-700"
                  >
                    Search
                  </button>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      placeholder="Search services, vendors, categories..."
                      className="w-full h-10 rounded-lg border border-[#e5e7eb] bg-white pl-10 pr-3 text-[13px] text-[#0e1e3f] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#2563eb]"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#94a3b8]" />
                  </div>
                  <button
                    type="button"
                    onClick={handleSearch}
                    className="h-10 px-4 rounded-lg border border-[#cbd5e1] bg-white text-[13px] font-semibold text-[#475569] hover:border-[#2563eb]"
                  >
                    Apply
                  </button>
                </div>
              </div>

              {/* Service category chips */}
              <div className="mt-4 overflow-x-auto">
                <div className="flex gap-2 min-w-max whitespace-nowrap pb-1">
                  {(['All', ...EVENT_SERVICE_CATEGORIES] as const).map((c) => {
                    const active = activeCategoryChip === c
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setActiveCategoryChip(c)}
                        className={`h-9 px-4 rounded-full border-[1.5px] text-[13px] transition-all ${
                          active
                            ? 'border-[#2563eb] shadow-[0_10px_24px_rgba(37,99,235,0.24)] font-semibold text-[#0e1e3f]'
                            : 'border-slate-300/25 bg-white/[0.12] text-[#475569] backdrop-blur-sm hover:border-[#93c5fd]'
                        }`}
                        style={
                          active
                            ? { backgroundImage: 'linear-gradient(-9.24736deg, rgb(228, 235, 255) 9.7419%, rgb(255, 255, 255) 85.097%)' }
                            : undefined
                        }
                      >
                        {c}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="mt-3 flex gap-2">
                {([
                  { id: 'all' as const, label: 'All Listings' },
                  { id: 'services' as const, label: 'Event Services', href: '/event-services' as const },
                  { id: 'activities' as const, label: 'Event Activity', href: '/event-activity' as const },
                ]).map((mode) => {
                  const active = listingMode === mode.id
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => {
                        if (mode.id !== 'all') {
                          navigate(mode.href)
                          return
                        }
                        setListingMode('all')
                      }}
                      className={`h-9 px-4 rounded-full border-[1.5px] text-[13px] font-semibold transition-all ${
                        active
                          ? 'border-[#2563eb] shadow-[0_10px_24px_rgba(37,99,235,0.24)] text-[#0e1e3f]'
                          : 'border-slate-300/25 bg-white/[0.12] text-[#475569] backdrop-blur-sm hover:border-[#93c5fd]'
                      }`}
                      style={
                        active
                          ? { backgroundImage: 'linear-gradient(-9.24736deg, rgb(228, 235, 255) 9.7419%, rgb(255, 255, 255) 85.097%)' }
                          : undefined
                      }
                    >
                      {mode.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex gap-4">
              {/* Sidebar filters (desktop only) */}
              <aside className="hidden lg:block w-[240px] shrink-0">
                <div className="bg-white/55 backdrop-blur-xl rounded-2xl border border-white/60 p-5 shadow-[0_16px_36px_rgba(37,99,235,0.16)] sticky top-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[14px] font-semibold text-[#0e1e3f]">Filters</h3>
                    <button type="button" onClick={handleClearAll} className="text-[12px] text-[#2563eb] hover:underline">
                      Clear all
                    </button>
                  </div>

                  <div className="mt-4 space-y-3 text-[13px]">
                    <div>
                      <label className="text-[12px] font-semibold text-[#0e1e3f]">Category</label>
                      <div className="relative mt-1">
                        <select
                          value={sidebarCategory}
                          onChange={(e) => setSidebarCategory(e.target.value as EventServiceCategory | 'All')}
                          className="w-full h-10 rounded-lg border border-[#e5e7eb] bg-white px-3 pr-9 text-[13px] text-[#475569] focus:outline-none focus:border-[#2563eb]"
                        >
                          <option value="All">All</option>
                          {EVENT_SERVICE_CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-[#94a3b8] pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="text-[12px] font-semibold text-[#0e1e3f]">City</label>
                      <div className="relative mt-1">
                        <select
                          value={sidebarCity}
                          onChange={(e) => setSidebarCity(e.target.value as (typeof CITIES)[number])}
                          className="w-full h-10 rounded-lg border border-[#e5e7eb] bg-white px-3 pr-9 text-[13px] text-[#475569] focus:outline-none focus:border-[#2563eb]"
                        >
                          {CITIES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-[#94a3b8] pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="text-[12px] font-semibold text-[#0e1e3f]">Budget max</label>
                      <input
                        type="range"
                        min={0}
                        max={100000}
                        value={sidebarBudgetMax}
                        onChange={(e) => setSidebarBudgetMax(Number(e.target.value))}
                        className="mt-2 w-full h-1 bg-slate-200 rounded appearance-none cursor-pointer accent-[#2563eb]"
                      />
                      <p className="mt-1 text-[12px] font-semibold text-[#0e1e3f]">{formatInr(sidebarBudgetMax)}</p>
                    </div>

                    <div>
                      <label className="text-[12px] font-semibold text-[#0e1e3f]">Rating (min)</label>
                      <div className="relative mt-1">
                        <select
                          value={ratingMin}
                          onChange={(e) => setRatingMin(Number(e.target.value) as RatingMin)}
                          className="w-full h-10 rounded-lg border border-[#e5e7eb] bg-white px-3 pr-9 text-[13px] text-[#475569] focus:outline-none focus:border-[#2563eb]"
                        >
                          <option value={0}>All</option>
                          <option value={3}>3.0+</option>
                          <option value={4}>4.0+</option>
                          <option value={4.5}>4.5+</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-[#94a3b8] pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="text-[12px] font-semibold text-[#0e1e3f]">Pricing type</label>
                      <div className="relative mt-1">
                        <select
                          value={pricingType}
                          onChange={(e) => setPricingType(e.target.value as EventServicePricingType | 'all')}
                          className="w-full h-10 rounded-lg border border-[#e5e7eb] bg-white px-3 pr-9 text-[13px] text-[#475569] focus:outline-none focus:border-[#2563eb]"
                        >
                          <option value="all">All</option>
                          <option value="transparent">Transparent</option>
                          <option value="offer_price">Offer Price</option>
                          <option value="request_for_price">Request for Price</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-[#94a3b8] pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="text-[12px] font-semibold text-[#0e1e3f]">Availability date</label>
                      <div className="relative mt-1">
                        <input
                          type="date"
                          value={availabilityDate}
                          onChange={(e) => setAvailabilityDate(e.target.value)}
                          className="w-full h-10 rounded-lg border border-[#e5e7eb] bg-white px-3 pr-9 text-[13px] text-[#475569] focus:outline-none focus:border-[#2563eb]"
                        />
                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-[#94a3b8] pointer-events-none" />
                      </div>
                    </div>

                    <button type="button" onClick={handleSearch} className="w-full h-11 rounded-lg bg-[#2563eb] text-white text-[13px] font-semibold hover:bg-blue-700">
                      Apply filters
                    </button>
                  </div>
                </div>
              </aside>

              {/* Listing grid */}
              <section className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <p className="text-[13px] text-[#475569]">
                    Showing{' '}
                    <span className="font-semibold text-[#0e1e3f]">
                      {listingMode === 'services'
                        ? filtered.length
                        : listingMode === 'activities'
                          ? filteredActivities.length
                          : filtered.length + filteredActivities.length}
                    </span>{' '}
                    listings
                  </p>
                </div>

                <div
                  id="events-results"
                  className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 auto-rows-[1fr]"
                >
                  {(listingMode === 'all' || listingMode === 'services') &&
                    filtered.map((s) => {
                    const cardId = `svc-${s.id}`
                    const slideImages = getListingSlideImages(...s.images)
                    const activeImageIndex = getActiveIndex(cardId)
                    const badge = getPricingBadgeConfig(s.pricingType)
                    const showPrice = s.pricingType !== 'request_for_price' && typeof s.price === 'number'
                    return (
                      <article
                        key={s.id}
                        className="group bg-white/65 backdrop-blur-md rounded-2xl border border-white/50 overflow-hidden shadow-[0_10px_30px_rgba(37,99,235,0.14)] hover:shadow-[0_18px_36px_rgba(37,99,235,0.22)] hover:-translate-y-0.5 transition-all h-full flex flex-col"
                      >
                        <ListingCardImageGallery
                          images={slideImages}
                          alt={s.name}
                          activeIndex={activeImageIndex}
                          onPrev={(e) => {
                            e.stopPropagation()
                            goToPrevCardImage(cardId, slideImages.length)
                          }}
                          onNext={(e) => {
                            e.stopPropagation()
                            goToNextCardImage(cardId, slideImages.length)
                          }}
                        >
                          <span className="absolute left-3 top-3 z-[3] inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[11px] font-semibold text-[#0e1e3f]">
                            <Star className="size-3 fill-[#FFCC47] text-[#FFCC47]" /> {s.rating.toFixed(1)} <span className="text-[#878e9e]">({s.ratingCount})</span>
                          </span>
                        </ListingCardImageGallery>

                        <div className="p-[14px] flex-1 flex flex-col">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-[14px] font-semibold text-[#0e1e3f] leading-snug line-clamp-2">{s.name}</p>
                            <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700">
                              {s.category}
                            </span>
                          </div>

                          <p className="mt-1 text-[12px] text-[#878e9e]">{s.vendorName}</p>

                          <div className="mt-3 flex items-center justify-between gap-2">
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${badge.className}`}>
                              {badge.label}
                            </span>
                            <span className="inline-flex items-center gap-1 text-[12px] text-[#475569]">
                              <MapPin className="size-4 text-[#878e9e]" /> {s.city}
                            </span>
                          </div>

                          <div className="mt-3">
                            {showPrice ? (
                              <div className="flex items-baseline justify-between gap-2">
                                {s.pricingType === 'offer_price' && typeof s.originalPrice === 'number' ? (
                                  <span className="text-[12px] text-[#878e9e] line-through">{formatInr(s.originalPrice)}</span>
                                ) : (
                                  <span className="text-[12px] text-transparent">.</span>
                                )}
                                <span className="text-[15px] font-semibold text-[#2563eb]">{formatInr(s.price ?? 0)}</span>
                              </div>
                            ) : (
                              <p className="text-[13px] font-semibold text-[#0e1e3f]">Request for Price</p>
                            )}
                          </div>

                          <div className="mt-auto pt-4">
                            <button
                              type="button"
                              onClick={() => navigate(`/events/services/${encodeURIComponent(s.id)}`)}
                              className="w-full h-11 rounded-full bg-[#2563eb] text-white text-[13px] font-semibold hover:bg-blue-700"
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      </article>
                    )
                    })}

                  {(listingMode === 'all' || listingMode === 'activities') &&
                    filteredActivities.map((a) => {
                      const cardId = `act-${a.id}`
                      const slideImages = getListingSlideImagesFromRecord(a)
                      const activeImageIndex = getActiveIndex(cardId)
                      const badge = getPricingBadgeConfig(a.pricingType)
                      const showPrice = a.pricingType !== 'request_for_price' && typeof a.price === 'number'
                      return (
                        <article
                          key={`act-${a.id}`}
                          className="group bg-white/65 backdrop-blur-md rounded-2xl border border-white/50 overflow-hidden shadow-[0_10px_30px_rgba(37,99,235,0.14)] hover:shadow-[0_18px_36px_rgba(37,99,235,0.22)] hover:-translate-y-0.5 transition-all h-full flex flex-col"
                        >
                          <ListingCardImageGallery
                            images={slideImages}
                            alt={a.name}
                            activeIndex={activeImageIndex}
                            onPrev={(e) => {
                              e.stopPropagation()
                              goToPrevCardImage(cardId, slideImages.length)
                            }}
                            onNext={(e) => {
                              e.stopPropagation()
                              goToNextCardImage(cardId, slideImages.length)
                            }}
                          >
                            <span className="absolute left-3 top-3 z-[3] inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[11px] font-semibold text-[#0e1e3f]">
                              <Star className="size-3 fill-[#FFCC47] text-[#FFCC47]" /> {a.rating.toFixed(1)} <span className="text-[#878e9e]">({a.ratingCount})</span>
                            </span>
                          </ListingCardImageGallery>

                          <div className="p-[14px] flex-1 flex flex-col">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-[14px] font-semibold text-[#0e1e3f] leading-snug line-clamp-2">{a.name}</p>
                              <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700">
                                {a.category}
                              </span>
                            </div>

                            <p className="mt-1 text-[12px] text-[#878e9e]">Event Activity Listing</p>

                            <div className="mt-3 flex items-center justify-between gap-2">
                              <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${badge.className}`}>
                                {badge.label}
                              </span>
                              <span className="inline-flex items-center gap-1 text-[12px] text-[#475569]">
                                <MapPin className="size-4 text-[#878e9e]" /> {a.city}
                              </span>
                            </div>

                            <div className="mt-3">
                              {showPrice ? (
                                <div className="flex items-baseline justify-between gap-2">
                                  {a.pricingType === 'offer_price' && typeof a.originalPrice === 'number' ? (
                                    <span className="text-[12px] text-[#878e9e] line-through">{formatInr(a.originalPrice)}</span>
                                  ) : (
                                    <span className="text-[12px] text-transparent">.</span>
                                  )}
                                  <span className="text-[15px] font-semibold text-[#2563eb]">{formatInr(a.price ?? 0)}</span>
                                </div>
                              ) : (
                                <p className="text-[13px] font-semibold text-[#0e1e3f]">Request for Price</p>
                              )}
                            </div>

                            <div className="mt-auto pt-4">
                              <button
                                type="button"
                                onClick={() => navigate(`/event-activity/${a.id}`)}
                                className="w-full h-11 rounded-full bg-[#2563eb] text-white text-[13px] font-semibold hover:bg-blue-700"
                              >
                                View Details
                              </button>
                            </div>
                          </div>
                        </article>
                      )
                    })}

                  {(listingMode === 'services' && filtered.length === 0) ||
                  (listingMode === 'activities' && filteredActivities.length === 0) ||
                  (listingMode === 'all' && filtered.length + filteredActivities.length === 0) ? (
                    <div className="col-span-full bg-white/65 backdrop-blur-md rounded-2xl border border-white/50 p-10 text-center">
                      <div className="mx-auto size-12 rounded-full bg-blue-50 grid place-items-center mb-3">
                        <Search className="size-6 text-[#2563eb]" />
                      </div>
                      <p className="text-[16px] font-semibold text-[#0e1e3f]">No services found</p>
                      <p className="mt-1 text-[13px] text-[#878e9e]">Try adjusting your filters.</p>
                      <button type="button" onClick={handleClearAll} className="mt-4 h-11 px-6 rounded-full bg-[#2563eb] text-white text-[13px] font-semibold hover:bg-blue-700">
                        Reset filters
                      </button>
                    </div>
                  ) : null}
                </div>
              </section>
            </div>
          </div>
        </MogzuCorporateScrollSurface>
      </div>
    </div>
  )
}

