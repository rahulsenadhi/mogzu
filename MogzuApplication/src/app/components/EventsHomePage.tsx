import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router'
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  Home,
  Megaphone,
  Mic2,
  Monitor,
  PlayCircle,
  Shield,
  Utensils,
} from 'lucide-react'
import { SharedHeader } from './layouts/SharedHeader'
import { SharedSidebar } from './layouts/SharedSidebar'
import { MogzuCorporateScrollSurface } from './layouts/MogzuCorporateScrollSurface'
import { EventsDiscoveryNav } from './events/EventsDiscoveryNav'
import svgPathsSpaceX from '@/imports/svg-5pj2l0pukf'
import { EVENT_ACTIVITY_LISTINGS, EVENT_SERVICES } from '@/app/lib/eventsServicesData'
import { getMergedCatalogue } from '@/utils/catalogueUtils'
import { db } from '@/lib/db'
import { DevMockDataBanner } from './global/DevMockDataBanner'
import { listingToEventsCatalogueItem } from '@/utils/eventsListingCatalogue'
import type { CatalogueItem } from '@/utils/catalogueTypes'

type HomeCard = {
  id: string
  title: string
  image: string
  priceLabel: string
  route: string
  tabType: string
  videoUrl?: string
}
type PlanningCard = { id: string; title: string; detail: string; route: string }

function SectionHeading({ title, rightAction }: { title: string; rightAction?: ReactNode }) {
  return (
    <div className={`mb-3 flex items-center gap-3 ${rightAction ? 'justify-between' : ''}`}>
      <h2 className="border-l-4 border-[#2563eb] pl-3 text-[16px] font-semibold text-slate-800">
        {title}
      </h2>
      {rightAction}
    </div>
  )
}

const quickAccess: Array<{
  label: string
  route: string
  icon: ReactNode
  cardBorder: string
  cardShadow: string
  iconBg: string
}> = [
  {
    label: 'Event Activity',
    route: '/event-activity',
    icon: <Clapperboard className="h-6 w-6 text-[#1d4ed8]" />,
    cardBorder: 'border-[#bfdbfe]',
    cardShadow: 'hover:shadow-[0_14px_30px_rgba(29,78,216,0.18)]',
    iconBg: 'bg-[#eff6ff]',
  },
  {
    label: 'Event Service',
    route: '/event-services',
    icon: <Megaphone className="h-6 w-6 text-[#b45309]" />,
    cardBorder: 'border-[#fde68a]',
    cardShadow: 'hover:shadow-[0_14px_30px_rgba(180,83,9,0.18)]',
    iconBg: 'bg-[#fffbeb]',
  },
  {
    label: 'Catering',
    route: '/events/new',
    icon: <Utensils className="h-6 w-6 text-[#0f766e]" />,
    cardBorder: 'border-[#bfe7dc]',
    cardShadow: 'hover:shadow-[0_14px_30px_rgba(15,118,110,0.18)]',
    iconBg: 'bg-[#ebfffa]',
  },
  {
    label: 'AV & Tech',
    route: '/events/new',
    icon: <Monitor className="h-6 w-6 text-[#0369a1]" />,
    cardBorder: 'border-[#bae6fd]',
    cardShadow: 'hover:shadow-[0_14px_30px_rgba(3,105,161,0.18)]',
    iconBg: 'bg-[#ecfeff]',
  },
  {
    label: 'Entertainment',
    route: '/events/new',
    icon: <Mic2 className="h-6 w-6 text-[#7c3aed]" />,
    cardBorder: 'border-[#e9d5ff]',
    cardShadow: 'hover:shadow-[0_14px_30px_rgba(124,58,237,0.18)]',
    iconBg: 'bg-[#faf5ff]',
  },
  {
    label: 'Security',
    route: '/events/new',
    icon: <Shield className="h-6 w-6 text-[#dc2626]" />,
    cardBorder: 'border-[#fecaca]',
    cardShadow: 'hover:shadow-[0_14px_30px_rgba(220,38,38,0.18)]',
    iconBg: 'bg-[#fef2f2]',
  },
]

export default function EventsHomePage() {
  const navigate = useNavigate()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [slide, setSlide] = useState(0)
  const [isHeroHovered, setIsHeroHovered] = useState(false)
  const planningRef = useRef<HTMLDivElement | null>(null)
  const featuredRef = useRef<HTMLDivElement | null>(null)
  const trendingRef = useRef<HTMLDivElement | null>(null)

  const eventCatalogue = useMemo(() => getMergedCatalogue().filter((x) => x.module === 'events'), [])
  const videoListings = useMemo(
    () => eventCatalogue.filter((x) => Array.isArray(x.videos) && x.videos.length > 0),
    [eventCatalogue],
  )

  // Real events catalogue from Supabase; falls back to demo data when empty.
  const [supabaseEvents, setSupabaseEvents] = useState<CatalogueItem[]>([])
  const [eventsLoading, setEventsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    void db.listings
      .listByModule('events', 'active')
      .then(({ data }) => {
        if (cancelled) return
        setSupabaseEvents((data ?? []).map(listingToEventsCatalogueItem))
        setEventsLoading(false)
      })
      .catch(() => {
        if (!cancelled) setEventsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const usingDemoEvents = !eventsLoading && supabaseEvents.length === 0
  const HERO_TITLES = [
    'Discover high-impact event experiences for your teams',
    'Book trusted event services across cities with transparent options',
    'Plan, compare, and execute corporate events from one place',
  ]
  const HERO_CTAS = ['Explore Event Activity →', 'Explore Event Service →', 'Explore Events →']
  const HERO_ROUTES = ['/event-activity', '/event-services', '/events/home']

  const heroSlides = useMemo(() => {
    if (supabaseEvents.length > 0) {
      return supabaseEvents.slice(0, 3).map((item, idx) => ({
        title: HERO_TITLES[idx] ?? HERO_TITLES[0],
        chip: item.category,
        subtitle: [
          item.name,
          item.vendor_name ? `by ${item.vendor_name}` : null,
          item.city ? `in ${item.city}` : null,
          item.rating != null ? `· ${item.rating.toFixed(1)}★` : null,
        ]
          .filter(Boolean)
          .join(' '),
        cta: HERO_CTAS[idx] ?? HERO_CTAS[2],
        route: HERO_ROUTES[idx] ?? HERO_ROUTES[2],
        image: item.photos[0] ?? '',
      }))
    }
    return EVENT_SERVICES.slice(0, 3).map((service, idx) => ({
      title: HERO_TITLES[idx] ?? HERO_TITLES[0],
      chip: service.category,
      subtitle: `${service.name} by ${service.vendorName} in ${service.city} with ${service.rating.toFixed(1)} rating.`,
      cta: HERO_CTAS[idx] ?? HERO_CTAS[2],
      route: HERO_ROUTES[idx] ?? HERO_ROUTES[2],
      image: service.images[0] || '',
    }))
  }, [supabaseEvents])

  const planningCards: PlanningCard[] = useMemo(() => {
    if (supabaseEvents.length > 0) {
      return supabaseEvents.slice(0, 5).map((item) => ({
        id: item.id,
        title: item.name,
        detail: item.city ?? 'Available on request',
        route: '/events/new',
      }))
    }
    return EVENT_SERVICES.slice(0, 5).map((service) => ({
      id: service.id,
      title: service.name,
      detail: `${service.city} · Next availability: ${service.availabilityDates[0] || 'Date on request'}`,
      route: '/events/new',
    }))
  }, [supabaseEvents])

  const featuredCards: HomeCard[] = useMemo(() => {
    if (supabaseEvents.length > 0) {
      return supabaseEvents.slice(0, 4).map((item) => ({
        id: item.id,
        title: item.name,
        image: item.photos[0] ?? '',
        priceLabel: item.price_label ?? 'On request',
        route: '/events/new',
        tabType: item.category,
      }))
    }
    return EVENT_SERVICES.slice(0, 4).map((service) => ({
      id: service.id,
      title: service.name,
      image: service.images[0] || '',
      priceLabel: service.price ? `₹${service.price.toLocaleString('en-IN')}` : 'On request',
      route: '/events/new',
      tabType: service.category,
      videoUrl: videoListings.find((x) => x.category === service.category && x.videos && x.videos.length > 0)?.videos?.[0],
    }))
  }, [supabaseEvents, videoListings])

  const trendingCards: HomeCard[] = useMemo(() => {
    if (supabaseEvents.length > 0) {
      return supabaseEvents.slice(4, 8).map((item) => ({
        id: item.id,
        title: item.name,
        image: item.photos[0] ?? '',
        priceLabel: item.price_label ?? 'On request',
        route: '/event-activity',
        tabType: item.category,
      }))
    }
    return EVENT_ACTIVITY_LISTINGS.slice(0, 4).map((activity) => ({
      id: String(activity.id),
      title: activity.name,
      image: activity.image,
      priceLabel: activity.price ? `₹${activity.price.toLocaleString('en-IN')}` : 'On request',
      route: '/event-activity',
      tabType: activity.category,
      videoUrl: videoListings.find((x) => x.name.toLowerCase().includes(activity.name.toLowerCase().split(' ')[0]))?.videos?.[0],
    }))
  }, [supabaseEvents, videoListings])

  useEffect(() => {
    if (isHeroHovered || heroSlides.length <= 1) return
    const timer = window.setInterval(() => setSlide((s) => (s + 1) % heroSlides.length), 5000)
    return () => window.clearInterval(timer)
  }, [heroSlides.length, isHeroHovered])

  const trackViewed = (card: HomeCard) => {
    const key = 'mogzu_events_viewed'
    const raw = sessionStorage.getItem(key)
    const parsed = raw ? (JSON.parse(raw) as Array<{ id: string; name: string; image: string; priceLabel: string; tab_type: string; route: string }>) : []
    const nextItem = { id: card.id, name: card.title, image: card.image, priceLabel: card.priceLabel, tab_type: card.tabType, route: card.route }
    const next = [nextItem, ...parsed.filter((item) => item.id !== card.id)].slice(0, 8)
    sessionStorage.setItem(key, JSON.stringify(next))
  }

  const recentlyViewed = useMemo(() => {
    if (typeof window === 'undefined') return []
    const raw = sessionStorage.getItem('mogzu_events_viewed') || '[]'
    const parsed = JSON.parse(raw) as Array<{ id: string; name: string; image: string; priceLabel: string; route: string }>
    return parsed.map((item) => ({
      id: item.id,
      title: item.name,
      image: item.image,
      priceLabel: item.priceLabel,
      route: item.route,
    }))
  }, [slide])

  const scrollRow = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right', amount = 300) => {
    if (!ref.current) return
    ref.current.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  const renderMedia = (card: HomeCard, label: string) => {
    if (card.videoUrl) {
      return (
        <div className="relative h-44 w-full overflow-hidden">
          <img src={card.image} alt={card.title} className="h-full w-full object-cover saturate-110" />
          <span className="absolute left-3 top-3 rounded-full border border-[#bfdbfe] bg-[#eaf2ff] px-2.5 py-1 text-[11px] font-semibold tracking-wide text-[#1d4ed8] backdrop-blur-sm">
            {label}
          </span>
          <span className="absolute right-3 top-3 rounded-full bg-[#0f172a]/75 px-2 py-0.5 text-[10px] font-semibold text-white">VIDEO</span>
          <PlayCircle className="absolute bottom-3 right-3 h-6 w-6 text-white/90" />
        </div>
      )
    }
    return (
      <div className="relative">
        <img src={card.image} alt={card.title} className="h-44 w-full object-cover saturate-110" />
        <span className="absolute left-3 top-3 rounded-full border border-[#bfdbfe] bg-[#eaf2ff] px-2.5 py-1 text-[11px] font-semibold tracking-wide text-[#1d4ed8] backdrop-blur-sm">
          {label}
        </span>
      </div>
    )
  }

  return (
    <div className="flex h-screen min-h-screen overflow-hidden mogzu-module-shell-bg">
      <SharedSidebar collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} activeNav="activity" />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <SharedHeader variant="blended" onMobileMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} searchPlaceholder="Search Events" />
        <MogzuCorporateScrollSurface>
          <div className="border-b border-slate-300/[0.1] bg-transparent">
            <div className="mx-auto w-full max-w-[1280px] px-5 md:px-8 lg:px-12 py-2 space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-400/10 bg-[#fffdf9]/[0.22] px-4 py-1 text-[14px] backdrop-blur-[2px]">
                <button onClick={() => navigate('/dashboard')} className="font-medium text-[#7b879a] transition-colors hover:text-[#2563eb]">Dashboard</button>
                <ChevronDown className="h-4 w-4 rotate-[-90deg] text-[#a0aec0]" />
                <span className="font-semibold tracking-tight text-[#0e1e3f]">Events</span>
              </div>
              <div className="flex min-w-0 items-center gap-3">
                <h1 className="text-[22px] font-bold leading-none text-[#0e1e3f]">Events</h1>
                <div className="flex items-center gap-2 overflow-x-auto overflow-y-visible whitespace-nowrap py-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  <button className="h-9 rounded-full border-[1.5px] border-[#2563eb] px-4 text-[14px] font-semibold text-[#0e1e3f] shadow-[1px_2px_6px_0px_rgba(0,0,0,0.16)]" style={{ backgroundImage: 'linear-gradient(-9.24736deg, rgb(228, 235, 255) 9.7419%, rgb(255, 255, 255) 85.097%)' }}>
                    <span className="inline-flex items-center gap-2">
                      <Home className="h-5 w-5 text-[#2563eb]" />
                      Home
                    </span>
                  </button>
                  <button type="button" onClick={() => navigate('/event-activity')} className="h-9 flex items-center gap-2 rounded-full border-[1.5px] border-slate-300/25 bg-white/[0.12] px-4 text-[14px] font-medium text-[#475569] backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#93c5fd] active:scale-[0.98]">
                    <svg width="20" height="20" viewBox="0 0 28 28" fill="none" aria-hidden><path d={svgPathsSpaceX.p9bd8700} fill="#B45309" /></svg>
                    <span>Event Activity</span>
                  </button>
                  <button type="button" onClick={() => navigate('/event-services')} className="h-9 flex items-center gap-2 rounded-full border-[1.5px] border-slate-300/25 bg-white/[0.12] px-4 text-[14px] font-medium text-[#475569] backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#93c5fd] active:scale-[0.98]">
                    <Utensils className="h-5 w-5 text-[#0f766e]" strokeWidth={2.2} />
                    <span>Event Service</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mx-auto w-full max-w-[1280px] px-5 md:px-8 lg:px-12 py-6 space-y-7">
            {usingDemoEvents ? <DevMockDataBanner /> : null}
            <div className="group relative min-h-[200px] overflow-hidden rounded-3xl border border-white/60 bg-white/45 shadow-[0_18px_40px_rgba(37,99,235,0.18)] backdrop-blur-xl" onMouseEnter={() => setIsHeroHovered(true)} onMouseLeave={() => setIsHeroHovered(false)}>
              {heroSlides.map((b, idx) => (
                <div key={b.title} className={`absolute inset-0 transition-opacity duration-400 ${slide === idx ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
                  <div className="absolute inset-0 bg-[linear-gradient(120deg,#ebf1ff_0%,#f5f8ff_45%,#e9efff_100%)]" />
                  <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(67,121,238,0.08)_0%,rgba(67,121,238,0)_65%)]" />
                  <div className="relative flex min-h-[200px]">
                    <div className="flex w-[55%] flex-col justify-center px-8 py-6">
                      <div className="mb-3 inline-flex w-fit items-center rounded-full bg-[#ebf1ff] px-2.5 py-1 text-[12px] font-medium text-[#475569]">⭐ {b.chip}</div>
                      <h3 className="line-clamp-2 text-[24px] font-bold leading-tight text-[#0e1e3f]">{b.title}</h3>
                      <p className="mb-5 mt-2 max-w-[380px] text-[14px] leading-[1.6] text-[#64748b]">{b.subtitle}</p>
                      <button type="button" onClick={() => navigate(b.route)} className="h-11 w-fit rounded-full bg-[linear-gradient(135deg,#2563eb,#3b82f6)] px-6 text-[14px] font-semibold text-white shadow-[0_10px_22px_rgba(37,99,235,0.28)] transition-all hover:-translate-y-0.5 active:scale-[0.98]">{b.cta}</button>
                    </div>
                    <div className="relative w-[45%] overflow-hidden">
                      <img src={b.image} alt="" className="h-full w-full object-cover" />
                    </div>
                  </div>
                </div>
              ))}
              <button type="button" aria-label="Previous slide" onClick={() => setSlide((s) => (s - 1 + heroSlides.length) % heroSlides.length)} className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white">
                <ChevronLeft className="h-[18px] w-[18px] text-[#2563eb]" />
              </button>
              <button type="button" aria-label="Next slide" onClick={() => setSlide((s) => (s + 1) % heroSlides.length)} className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white">
                <ChevronRight className="h-[18px] w-[18px] text-[#2563eb]" />
              </button>
              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5">
                {heroSlides.map((_, i) => (
                  <button key={i} type="button" aria-label={`Go to slide ${i + 1}`} onClick={() => setSlide(i)} className={`transition-all duration-300 ease-in-out ${slide === i ? 'h-2 w-6 rounded-full bg-[#4379ee]' : 'h-2 w-2 rounded-full bg-[#d1d5db]'}`} />
                ))}
              </div>
            </div>

            <section>
              <SectionHeading title="What are you looking for?" />
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                {quickAccess.map((item) => (
                  <button key={item.label} type="button" onClick={() => navigate(item.route)} className={`h-[110px] rounded-xl border bg-white p-4 transition-all motion-safe:duration-200 motion-safe:hover:-translate-y-1 ${item.cardBorder} ${item.cardShadow} flex flex-col items-center justify-center gap-2 text-center`}>
                    <div className={`flex h-12 w-12 items-center justify-center rounded-[12px] ${item.iconBg}`}>{item.icon}</div>
                    <span className="text-[13px] font-semibold text-[#0e1e3f]">{item.label}</span>
                  </button>
                ))}
              </div>
            </section>

            <section>
              <SectionHeading title="Upcoming event windows" rightAction={<button type="button" onClick={() => navigate('/events/new')} className="shrink-0 text-sm font-semibold text-[#2563eb] hover:underline">View all</button>} />
              {planningCards.length > 0 ? (
                <div className="relative">
                  <button type="button" aria-label="Scroll left" onClick={() => scrollRow(planningRef, 'left', 260)} className="absolute -left-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-[#dbe3f2] bg-white/95 shadow-sm hover:shadow-md"><ChevronLeft className="h-4 w-4 text-[#2563eb]" /></button>
                  <button type="button" aria-label="Scroll right" onClick={() => scrollRow(planningRef, 'right', 260)} className="absolute -right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-[#dbe3f2] bg-white/95 shadow-sm hover:shadow-md"><ChevronRight className="h-4 w-4 text-[#2563eb]" /></button>
                  <div ref={planningRef} className="overflow-x-auto px-1 pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    <div className="flex min-w-max gap-3 pr-1">
                      {planningCards.map((o, index) => {
                        const tone = [
                          { card: 'from-[#eff6ff] to-[#dbeafe]', border: 'border-[#bfdbfe]', cta: 'bg-[#1d4ed8] hover:bg-[#1e40af]' },
                          { card: 'from-[#fff7ed] to-[#ffedd5]', border: 'border-[#fed7aa]', cta: 'bg-[#ea580c] hover:bg-[#c2410c]' },
                          { card: 'from-[#f5f3ff] to-[#ede9fe]', border: 'border-[#ddd6fe]', cta: 'bg-[#7c3aed] hover:bg-[#6d28d9]' },
                          { card: 'from-[#ecfeff] to-[#cffafe]', border: 'border-[#a5f3fc]', cta: 'bg-[#0e7490] hover:bg-[#155e75]' },
                        ][index % 4]
                        return (
                          <button key={o.id} type="button" onClick={() => navigate(o.route)} className={`w-[236px] rounded-2xl border bg-gradient-to-br ${tone.card} ${tone.border} flex flex-col overflow-hidden text-left transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(15,23,42,0.14)]`}>
                            <div className="flex flex-1 flex-col gap-2.5 p-3.5">
                              <p className="line-clamp-2 text-[15px] font-bold leading-snug tracking-tight text-slate-900">{o.title}</p>
                              <div className="flex items-center gap-2 text-[13px] text-slate-600">
                                <CalendarDays className="h-4 w-4 text-slate-400" />
                                <span className="truncate font-semibold text-[#334155]">{o.detail}</span>
                              </div>
                              <div className="mt-auto flex justify-end pt-0.5">
                                <span className={`inline-flex h-8 items-center rounded-lg px-3 text-[11px] font-semibold text-white ${tone.cta}`}>Explore →</span>
                              </div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-[#dbe3f2] bg-white/85 p-5 text-sm text-[#64748b]">Availability windows are not available yet.</div>
              )}
            </section>

            <section>
              <SectionHeading title="Featured events" rightAction={<button type="button" onClick={() => navigate('/events/new')} className="shrink-0 text-sm font-semibold text-[#2563eb] hover:underline">View all →</button>} />
              {featuredCards.length > 0 ? (
                <div className="relative">
                  <button type="button" aria-label="Scroll featured left" onClick={() => scrollRow(featuredRef, 'left')} className="absolute -left-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-[#dbe3f2] bg-white/95 shadow-sm hover:shadow-md"><ChevronLeft className="h-4 w-4 text-[#2563eb]" /></button>
                  <button type="button" aria-label="Scroll featured right" onClick={() => scrollRow(featuredRef, 'right')} className="absolute -right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-[#dbe3f2] bg-white/95 shadow-sm hover:shadow-md"><ChevronRight className="h-4 w-4 text-[#2563eb]" /></button>
                  <div ref={featuredRef} className="overflow-x-auto px-1 pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    <div className="flex min-w-max gap-5 pr-1">
                      {featuredCards.map((card) => (
                        <button key={card.id} type="button" onClick={() => { trackViewed(card); navigate(card.route) }} className="h-full w-[292px] shrink-0 overflow-hidden rounded-3xl border border-[#cfe0ff] bg-gradient-to-b from-white to-[#f7fbff] text-left shadow-[0_8px_20px_rgba(37,99,235,0.08)] transition-all hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(37,99,235,0.18)]">
                          {renderMedia(card, 'Featured')}
                          <div className="flex flex-1 flex-col p-4">
                            <p className="mb-2 min-h-[40px] line-clamp-2 text-[14px] font-semibold leading-snug tracking-tight text-[#0f172a]">{card.title}</p>
                            <p className="mb-2.5 min-h-[36px] line-clamp-2 text-[12px] leading-5 text-slate-500">Curated from Events inventory for high-intent corporate bookings.</p>
                            <div className="mt-auto flex items-end justify-between gap-3 pt-1">
                              <div>
                                <p className="text-[11px] text-[#878e9e]">Starting at</p>
                                <p className="text-[15px] font-semibold text-[#1d4ed8]">{card.priceLabel}</p>
                              </div>
                              <span className="inline-flex h-9 items-center rounded-xl bg-[linear-gradient(90deg,#1d4ed8,#2563eb,#0ea5e9)] px-3.5 text-[12px] font-semibold text-white shadow-md">Explore →</span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-[#dbe3f2] bg-white/85 p-5 text-sm text-[#64748b]">Featured events inventory is not available yet.</div>
              )}
            </section>

            <section>
              <SectionHeading title="Trending this week" rightAction={<button type="button" onClick={() => navigate('/event-activity')} className="shrink-0 text-sm font-semibold text-[#2563eb] hover:underline">View all →</button>} />
              {trendingCards.length > 0 ? (
                <div className="relative">
                  <button type="button" aria-label="Scroll trending left" onClick={() => scrollRow(trendingRef, 'left')} className="absolute -left-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-[#dbe3f2] bg-white/95 shadow-sm hover:shadow-md"><ChevronLeft className="h-4 w-4 text-[#2563eb]" /></button>
                  <button type="button" aria-label="Scroll trending right" onClick={() => scrollRow(trendingRef, 'right')} className="absolute -right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-[#dbe3f2] bg-white/95 shadow-sm hover:shadow-md"><ChevronRight className="h-4 w-4 text-[#2563eb]" /></button>
                  <div ref={trendingRef} className="overflow-x-auto px-1 pb-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    <div className="flex min-w-max snap-x snap-mandatory gap-5">
                      {trendingCards.map((card, index) => (
                        <button key={card.id} type="button" onClick={() => { trackViewed(card); navigate(card.route) }} className="h-full w-[292px] shrink-0 snap-start overflow-hidden rounded-3xl border border-[#cfe0ff] bg-gradient-to-b from-white to-[#f7fbff] text-left shadow-[0_8px_20px_rgba(37,99,235,0.08)] transition-all hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(37,99,235,0.18)]">
                          {renderMedia(card, 'Trending')}
                          <div className="flex flex-1 flex-col p-4">
                            <p className="mb-2 min-h-[40px] line-clamp-2 text-[14px] font-semibold leading-snug tracking-tight text-[#0f172a]">{card.title}</p>
                            <p className="mb-2.5 min-h-[36px] line-clamp-2 text-[12px] leading-5 text-slate-500">Popular this week across event activities and service categories.</p>
                            <div className="mt-auto flex items-end justify-between gap-3">
                              <div>
                                <p className="text-[11px] text-[#878e9e]">Starting at</p>
                                <p className="text-[15px] font-semibold text-[#1d4ed8]">{card.priceLabel}</p>
                              </div>
                              <span className="inline-flex h-9 items-center rounded-xl bg-[linear-gradient(90deg,#1d4ed8,#2563eb,#0ea5e9)] px-3.5 text-[12px] font-semibold text-white shadow-md">Explore →</span>
                            </div>
                          </div>
                          <span className="absolute right-3 top-3 rounded-full bg-[#0f172a]/80 px-2 py-0.5 text-[10px] font-semibold text-white">#{index + 1}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-[#dbe3f2] bg-white/85 p-5 text-sm text-[#64748b]">Trending events listings are not available yet.</div>
              )}
            </section>

            {recentlyViewed.length > 0 ? (
              <section>
                <SectionHeading title="Continue browsing" rightAction={<button type="button" onClick={() => navigate('/events/new')} className="shrink-0 text-sm font-semibold text-[#2563eb] hover:underline">Browse all →</button>} />
                <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [mask-image:linear-gradient(to_right,black_85%,transparent_100%)] [&::-webkit-scrollbar]:hidden">
                  <div className="flex min-w-max snap-x snap-mandatory gap-5 pb-3">
                    {recentlyViewed.map((card) => (
                      <button key={card.id} type="button" onClick={() => navigate(card.route)} className="h-full w-[292px] shrink-0 snap-start overflow-hidden rounded-3xl border border-[#cfe0ff] bg-gradient-to-b from-white to-[#f7fbff] text-left shadow-[0_8px_20px_rgba(37,99,235,0.08)] transition-all hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(37,99,235,0.18)]">
                        <div className="relative">
                          <img src={card.image} alt={card.title} className="h-44 w-full object-cover saturate-110" />
                          <span className="absolute left-3 top-3 rounded-full bg-[#0f172a]/85 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-white">Continue</span>
                        </div>
                        <div className="flex flex-1 flex-col p-4">
                          <p className="mb-2 min-h-[40px] line-clamp-2 text-[14px] font-semibold leading-snug tracking-tight text-[#0f172a]">{card.title}</p>
                          <p className="mb-2.5 min-h-[36px] line-clamp-2 text-[12px] leading-5 text-slate-500">Picked from your recent Events browsing activity.</p>
                          <div className="mt-auto flex items-end justify-between gap-3">
                            <div>
                              <p className="text-[11px] text-[#878e9e]">Starting at</p>
                              <p className="text-[15px] font-semibold text-[#1d4ed8]">{card.priceLabel}</p>
                            </div>
                            <span className="inline-flex h-9 items-center rounded-xl border border-[#bfdbfe] bg-[#eff6ff] px-3.5 text-[12px] font-semibold text-[#1d4ed8]">Open →</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            ) : (
              <section>
                <SectionHeading title="Continue browsing" />
                <div className="rounded-2xl border border-[#dbe3f2] bg-white/85 p-5 text-sm text-[#64748b]">
                  No recent Events views yet. Explore Event Activity and Event Service to build this section.
                </div>
              </section>
            )}
          </div>
        </MogzuCorporateScrollSurface>
      </div>
    </div>
  )
}
