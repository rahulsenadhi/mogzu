import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import {
  Calendar,
  ChevronDown,
  Heart,
  Home,
  MapPin,
  PlayCircle,
  Search,
  Star,
  Users,
} from 'lucide-react'
import { SharedHeader } from './layouts/SharedHeader'
import { SharedSidebar } from './layouts/SharedSidebar'
import { MogzuCorporateScrollSurface } from './layouts/MogzuCorporateScrollSurface'
import { ImageWithFallback } from './figma/ImageWithFallback'
import { QA_IMAGES } from '../lib/qaImagery'
import { EVENT_ACTIVITY_LISTINGS } from '@/app/lib/eventsServicesData'
import { getPricingBadgeConfig } from './ui/PriceBlock'
import { getEventActivityCategoryConfigs, getEventIconByCategoryText, type EventActivityCategoryId } from '@/app/lib/eventsIconMapping'
import { getListingSlideImages } from './dspaceCardUtils'

type RatingMin = 0 | 3 | 4 | 4.5
const CITIES = ['All', 'Mumbai', 'Bengaluru', 'Delhi', 'Hyderabad', 'Pune', 'Chennai'] as const

export default function EventActivityPage() {
  const navigate = useNavigate()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<EventActivityCategoryId | 'all'>('all')
  const [city, setCity] = useState<(typeof CITIES)[number]>('All')
  const [budgetMax, setBudgetMax] = useState(50000)
  const [ratingMin, setRatingMin] = useState<RatingMin>(0)
  const [date, setDate] = useState('')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [attendees, setAttendees] = useState('')
  const [cardImageIndexById, setCardImageIndexById] = useState<Record<string, number>>({})
  const [likedById, setLikedById] = useState<Record<string, boolean>>({})

  const categories = getEventActivityCategoryConfigs()

  const clearAllFilters = () => {
    setSelectedCategory('all')
    setCity('All')
    setBudgetMax(50000)
    setRatingMin(0)
    setDate('')
    setSearchKeyword('')
    setAttendees('')
  }

  const filteredActivities = useMemo(() => {
    const q = searchKeyword.toLowerCase().trim()
    const guestCount = Number(attendees)
    return EVENT_ACTIVITY_LISTINGS.filter((item) => {
      if (city !== 'All' && item.city !== city) return false
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
      if (!Number.isNaN(guestCount) && guestCount > 0 && !item.supportedEventTypes.includes('Conference')) return false
      return true
    })
  }, [attendees, budgetMax, city, date, ratingMin, searchKeyword, selectedCategory])

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

  return (
    <div className="flex h-screen bg-[#fffdf9] overflow-hidden">
      <SharedSidebar collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} activeNav="activity" />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <SharedHeader onMobileMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} searchPlaceholder="Search activities..." />
        <MogzuCorporateScrollSurface>
          <div className="max-w-7xl mx-auto px-6 pt-6 pb-2">
            <div className="flex items-center gap-2 text-[12px]">
              <button type="button" onClick={() => navigate('/activitysuite')} className="text-[#2563eb] hover:underline">Activity Suite</button>
              <ChevronDown className="size-4 text-[#878e9e] -rotate-90" />
              <button type="button" onClick={() => navigate('/events')} className="text-[#2563eb] hover:underline">Events</button>
              <ChevronDown className="size-4 text-[#878e9e] -rotate-90" />
              <span className="text-[#878e9e]">Event Activity</span>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-6 pb-5">
            <div className="relative h-[200px] rounded-2xl overflow-hidden border border-white/60 shadow-[0_16px_36px_rgba(37,99,235,0.15)]">
              <ImageWithFallback src={QA_IMAGES.eventsHero} alt="Events activity hero" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#102f6f]/85 via-[#1d4ed8]/50 to-transparent" />
              <div className="relative z-10 h-full p-7 flex flex-col justify-between">
                <div>
                  <p className="text-white/80 text-xs font-medium uppercase tracking-wide">Events Activity</p>
                  <h1 className="text-3xl font-semibold text-white mt-1">Build high-engagement corporate experiences</h1>
                </div>
                <button type="button" onClick={() => navigate('/event-activity/1')} className="h-11 px-6 rounded-full bg-white text-[#1d4ed8] text-sm font-semibold w-fit">View featured activity</button>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-6 py-1 mb-5">
            <div className="flex items-center gap-2 overflow-x-auto overflow-y-visible whitespace-nowrap py-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <button type="button" onClick={() => navigate('/events/home')} className="h-9 flex items-center gap-2 px-4 rounded-full border-[1.5px] border-slate-300/25 bg-white/[0.12] text-[#475569] backdrop-blur-sm">
                <Home className="h-4.5 w-4.5 text-[#2563eb]" />
                <span className="text-[14px] font-medium">Home</span>
              </button>
              <button type="button" onClick={() => navigate('/events/new')} className="h-9 flex items-center gap-2 px-4 rounded-full border-[1.5px] border-slate-300/25 bg-white/[0.12] text-[#475569] backdrop-blur-sm">
                <span className="text-[14px] font-medium">Events</span>
              </button>
              <button type="button" className="h-9 flex items-center gap-2 px-4 rounded-full border-[1.5px] border-[#2563eb] text-[#0e1e3f] shadow-[0_10px_24px_rgba(37,99,235,0.2)]" style={{ backgroundImage: 'linear-gradient(-9.24736deg, rgb(228, 235, 255) 9.7419%, rgb(255, 255, 255) 85.097%)' }}>
                <span className="text-[14px] font-semibold">Event Activity</span>
              </button>
              <button type="button" onClick={() => navigate('/event-services')} className="h-9 flex items-center gap-2 px-4 rounded-full border-[1.5px] border-slate-300/25 bg-white/[0.12] text-[#475569] backdrop-blur-sm">
                <span className="text-[14px] font-medium">Event Service</span>
              </button>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-6 flex flex-col lg:flex-row gap-4">
            <aside className="w-full lg:w-[240px] flex-shrink-0">
              <div className="bg-white/55 backdrop-blur-xl rounded-2xl p-5 border border-white/60 shadow-[0_16px_36px_rgba(37,99,235,0.16)]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[16px] font-semibold text-[#0e1e3f]">Filters</h3>
                  <button type="button" onClick={clearAllFilters} className="text-[13px] font-medium text-[#4379ee] underline hover:text-[#3568dd]">Clear all</button>
                </div>
                <div className="border-t border-slate-200/70 pt-3 space-y-4">
                  <div>
                    <h4 className="text-xs font-semibold text-[#0e1e3f] mb-2">City</h4>
                    <select value={city} onChange={(e) => setCity(e.target.value as (typeof CITIES)[number])} className="w-full h-10 px-3 text-[13px] border border-slate-200/80 rounded-xl bg-white/95 focus:outline-none focus:ring-2 focus:ring-[#4379ee]/25">
                      {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-[#0e1e3f] mb-2">Rating</h4>
                    <select value={ratingMin} onChange={(e) => setRatingMin(Number(e.target.value) as RatingMin)} className="w-full h-10 px-3 text-[13px] border border-slate-200/80 rounded-xl bg-white/95 focus:outline-none focus:ring-2 focus:ring-[#4379ee]/25">
                      <option value={0}>All</option>
                      <option value={3}>3.0+</option>
                      <option value={4}>4.0+</option>
                      <option value={4.5}>4.5+</option>
                    </select>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-[#0e1e3f] mb-2">Budget max</h4>
                    <input type="range" min={0} max={50000} value={budgetMax} onChange={(e) => setBudgetMax(Number(e.target.value))} className="w-full h-1 bg-slate-200 rounded appearance-none cursor-pointer accent-[#4379ee]" />
                    <p className="mt-1 text-xs text-[#475569]">{`₹${budgetMax.toLocaleString()}`}</p>
                  </div>
                </div>
              </div>
            </aside>

            <div className="flex-1 flex flex-col">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                  <input type="text" placeholder="Search by activity, host, or location" className="w-full h-10 pl-10 pr-4 text-[14px] placeholder:text-[#878e9e] bg-white border border-[#e5e7eb] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4379ee]/20" value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} />
                </div>
                <div className="w-full md:w-64 relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                  <input type="number" placeholder="Attendees" className="w-full h-10 pl-10 pr-4 text-[14px] placeholder:text-[#878e9e] bg-white border border-[#e5e7eb] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4379ee]/20" value={attendees} onChange={(e) => setAttendees(e.target.value)} />
                </div>
              </div>

              <div className="mb-2 mt-3 text-[11px] font-semibold uppercase tracking-wide text-[#64748b]">Category Filters</div>
              <div className="mb-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                <div className="relative">
                  <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value as EventActivityCategoryId | 'all')} className="w-full px-2.5 py-2 text-xs border border-white/70 rounded-lg bg-white/65 backdrop-blur-md hover:border-[#93c5fd] focus:outline-none focus:ring-2 focus:ring-[#93c5fd]/40 appearance-none">
                    <option value="all">All Categories</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.label.replace('\n', ' ')}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#64748b]" />
                </div>
                <div className="relative">
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-2.5 py-2 text-xs border border-white/70 rounded-lg bg-white/65 backdrop-blur-md hover:border-[#93c5fd] focus:outline-none focus:ring-2 focus:ring-[#93c5fd]/40" />
                  <Calendar className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#64748b]" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-6">
                {filteredActivities.length === 0 ? (
                  <div className="col-span-full rounded-2xl border border-[#dbe3f2] bg-white/70 p-10 text-center">
                    <p className="text-[16px] font-semibold text-[#0e1e3f]">No event activities found</p>
                    <p className="text-[13px] text-[#64748b] mt-1">Try updating the filters to see more results.</p>
                  </div>
                ) : filteredActivities.map((activity) => {
                  const cardId = String(activity.id)
                  const sliderImages = getListingSlideImages(activity.image)
                  const activeImageIndex = cardImageIndexById[cardId] ?? 0
                  const activeImage = sliderImages[activeImageIndex] ?? activity.image
                  const normalizedPricingType = activity.pricingType === 'offer_price' ? 'offer_price' : activity.pricingType === 'request_for_price' ? 'request_for_price' : 'transparent'
                  const badge = getPricingBadgeConfig(normalizedPricingType)
                  const Icon = getEventIconByCategoryText(activity.category)
                  const hasVideo = false

                  return (
                    <div key={activity.id} role="button" tabIndex={0} onClick={() => navigate(`/event-activity/${activity.id}`)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate(`/event-activity/${activity.id}`) }} className="group flex min-h-[380px] flex-col overflow-hidden rounded-2xl border border-white/60 bg-white/65 backdrop-blur-md shadow-[0_10px_30px_rgba(37,99,235,0.14)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(37,99,235,0.22)] cursor-pointer">
                      <div className="relative h-40 overflow-hidden">
                        <ImageWithFallback src={activeImage} alt={activity.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                        {sliderImages.length > 1 ? (
                          <>
                            <button type="button" onClick={(e) => { e.stopPropagation(); goToPrevCardImage(cardId, sliderImages.length) }} className="absolute left-2.5 top-1/2 z-[2] h-7 w-7 -translate-y-1/2 rounded-full border border-[#dbe3f2] bg-white/90 text-sm font-bold text-[#334155]">‹</button>
                            <button type="button" onClick={(e) => { e.stopPropagation(); goToNextCardImage(cardId, sliderImages.length) }} className="absolute right-2.5 top-1/2 z-[2] h-7 w-7 -translate-y-1/2 rounded-full border border-[#dbe3f2] bg-white/90 text-sm font-bold text-[#334155]">›</button>
                          </>
                        ) : null}
                        <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-[#0e1e3f]">
                          <Star className="size-3 fill-[#FFCC47] text-[#FFCC47]" />
                          {activity.rating.toFixed(1)}
                        </span>
                        {hasVideo ? (
                          <span className="absolute right-2.5 bottom-2.5 inline-flex items-center gap-1 rounded-full bg-[#0f172a]/75 px-2 py-0.5 text-[10px] font-semibold text-white">
                            <PlayCircle className="size-3" /> VIDEO
                          </span>
                        ) : null}
                        <button type="button" onClick={(e) => { e.stopPropagation(); setLikedById((prev) => ({ ...prev, [cardId]: !prev[cardId] })) }} className="absolute top-2.5 right-2.5 h-7 w-7 rounded-full bg-white/85 grid place-items-center">
                          <Heart className={`h-4 w-4 ${likedById[cardId] ? 'text-red-500 fill-red-500' : 'text-slate-500'}`} />
                        </button>
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-[16px] font-semibold text-[#0e1e3f] leading-snug line-clamp-2">{activity.name}</h3>
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${badge.className}`}>{badge.label}</span>
                        </div>
                        <p className="mt-1 text-[12px] text-[#64748b] line-clamp-2">{`${activity.supportedEventTypes.join(', ')} activity`}</p>
                        <div className="mt-2 flex items-center gap-1.5 text-[12px] text-[#475569]">
                          <MapPin className="size-3.5 text-[#878e9e]" /> {activity.city}
                        </div>
                        <div className="mt-1 flex items-center gap-1.5 text-[12px] text-[#475569]">
                          <Icon className="size-3.5 text-[#878e9e]" /> {activity.category}
                        </div>
                        <div className="mt-3">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#64748b]">Starting at</p>
                          <div className="mt-1 flex items-baseline gap-2">
                            <span className="text-[20px] leading-none font-semibold text-[#0e1e3f]">{typeof activity.price === 'number' ? `₹${activity.price.toLocaleString()}` : 'On request'}</span>
                            {typeof activity.price === 'number' ? <span className="text-[12px] font-medium text-[#64748b]">/event</span> : null}
                          </div>
                        </div>
                        <button type="button" onClick={(e) => { e.stopPropagation(); navigate(`/event-activity/${activity.id}`) }} className="mt-auto h-10 rounded-xl bg-[#2563eb] text-white text-[13px] font-semibold hover:bg-[#1d4ed8]">View details</button>
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
