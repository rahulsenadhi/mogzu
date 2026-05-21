import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, CreditCard, Gift, MapPin, Package, PartyPopper, ShoppingBag, Sparkles } from 'lucide-react'
import { SharedHeader } from './layouts/SharedHeader'
import { SharedSidebar } from './layouts/SharedSidebar'
import { MogzuCorporateScrollSurface } from './layouts/MogzuCorporateScrollSurface'
import { QA_IMAGES } from '../lib/qaImagery'
import { apparelProducts, giftingBasketsProducts, giftingComboProducts, giftingGoLocalProducts } from '@/app/data/apparelProducts'

const bannerImage = QA_IMAGES.shopBanner

const bannerSlides = [
  {
    title: 'Special offer on Work Anniversary gifts 🎁',
    chip: 'Offer',
    subtitle: 'Book your next event with tailored gifting packages and all-inclusive services.',
    cta: 'View deals →',
    route: '/deals',
  },
  {
    title: 'Diwali Collection is here 🪔',
    chip: 'Festival',
    subtitle: 'Thoughtful gifts for your entire team',
    cta: 'Explore deals →',
    route: '/deals',
  },
  {
    title: 'Your brand. Their joy. ✨',
    chip: 'Custom',
    subtitle: 'Custom branded corporate gifts',
    cta: 'See offer deals →',
    route: '/deals',
  },
]

type HomeCard = { id: string; title: string; image: string; price: number; route: string }
type UpcomingOccasion = { id: string; title: string; dateISO: string; route: string }

function SectionHeading({
  title,
  rightAction,
}: {
  title: string
  rightAction?: ReactNode
}) {
  return (
    <div className={`flex items-center gap-3 mb-3 ${rightAction ? 'justify-between' : ''}`}>
      <h2 className="text-[16px] font-semibold text-slate-800 border-l-4 border-[#2563eb] pl-3">
        {title}
      </h2>
      {rightAction}
    </div>
  )
}

export default function GiftingPage() {
  const navigate = useNavigate()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [slide, setSlide] = useState(0)
  const [isHeroHovered, setIsHeroHovered] = useState(false)
  const upcomingScrollerRef = useRef<HTMLDivElement | null>(null)
  const featuredScrollerRef = useRef<HTMLDivElement | null>(null)
  const trendingScrollerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (isHeroHovered) return
    const timer = window.setInterval(() => setSlide((s) => (s + 1) % bannerSlides.length), 5000)
    return () => window.clearInterval(timer)
  }, [isHeroHovered])

  const handleTrackViewed = (card: HomeCard, tabType: string) => {
    const key = 'mogzu_gifting_viewed'
    const raw = sessionStorage.getItem(key)
    const parsed = raw ? (JSON.parse(raw) as Array<{ id: string; name: string; image: string; price: number; tab_type: string }>) : []
    const nextItem = { id: card.id, name: card.title, image: card.image, price: card.price, tab_type: tabType }
    const next = [nextItem, ...parsed.filter((item) => item.id !== card.id)].slice(0, 8)
    sessionStorage.setItem(key, JSON.stringify(next))
  }

  const handleScrollUpcoming = (direction: 'left' | 'right') => {
    if (!upcomingScrollerRef.current) return
    const amount = 260
    upcomingScrollerRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    })
  }

  const handleScrollRow = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (!ref.current) return
    const amount = 300
    ref.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    })
  }

  const quickAccess = [
    { label: 'Shop', route: '/gifting/shop', icon: ShoppingBag, cardBg: 'bg-white', cardBorder: 'border-[#eec9ea]', cardHover: 'hover:bg-white', cardShadow: 'hover:shadow-[0_14px_30px_rgba(155,81,224,0.18)]', iconBg: 'bg-[#f8f2ff]', iconColor: 'text-[#9B51E0]' },
    { label: 'Celebrations', route: '/gifting/celebrations', icon: PartyPopper, cardBg: 'bg-white', cardBorder: 'border-[#c7d2fe]', cardHover: 'hover:bg-white', cardShadow: 'hover:shadow-[0_14px_30px_rgba(79,70,229,0.18)]', iconBg: 'bg-[#eef2ff]', iconColor: 'text-[#4f46e5]' },
    { label: 'Combo', route: '/gifting/combo', icon: Package, cardBg: 'bg-white', cardBorder: 'border-[#ffc79a]', cardHover: 'hover:bg-white', cardShadow: 'hover:shadow-[0_14px_30px_rgba(255,94,0,0.18)]', iconBg: 'bg-[#fff6ef]', iconColor: 'text-[#FF5E00]' },
    { label: 'E-gift', route: '/gifting/e-gift', icon: CreditCard, cardBg: 'bg-white', cardBorder: 'border-[#d5b8ff]', cardHover: 'hover:bg-white', cardShadow: 'hover:shadow-[0_14px_30px_rgba(155,81,224,0.18)]', iconBg: 'bg-[#f8f2ff]', iconColor: 'text-[#9B51E0]' },
    { label: 'Go-local', route: '/gifting/go-local', icon: MapPin, cardBg: 'bg-white', cardBorder: 'border-[#98ebcd]', cardHover: 'hover:bg-white', cardShadow: 'hover:shadow-[0_14px_30px_rgba(21,211,157,0.18)]', iconBg: 'bg-[#effff8]', iconColor: 'text-[#15D39D]' },
    { label: 'Baskets', route: '/gifting/baskets', icon: Gift, cardBg: 'bg-white', cardBorder: 'border-[#f8e38a]', cardHover: 'hover:bg-white', cardShadow: 'hover:shadow-[0_14px_30px_rgba(255,209,0,0.18)]', iconBg: 'bg-[#fffde8]', iconColor: 'text-[#d4a000]' },
  ]

  const trendingCards: HomeCard[] = useMemo(
    () => [
      ...giftingComboProducts.filter((i) => i.featured).map((i) => ({ id: i.id, title: i.name, image: i.images[0], price: i.bundle_price, route: '/gifting/combo' })),
      ...giftingGoLocalProducts.filter((i) => i.featured).map((i) => ({ id: i.id, title: i.name, image: i.images[0], price: i.price, route: '/gifting/go-local' })),
      ...giftingBasketsProducts.filter((i) => i.featured).map((i) => ({ id: i.id, title: i.name, image: i.images[0], price: i.price, route: '/gifting/baskets' })),
    ],
    [],
  )

  const upcomingOccasions: UpcomingOccasion[] = useMemo(() => {
    const seed: UpcomingOccasion[] = [
      { id: 'work-anniversary', title: 'Work Anniversary', dateISO: '2026-04-17', route: '/gifting/shop' },
      { id: 'eid', title: 'Eid', dateISO: '2026-04-22', route: '/gifting/shop' },
      { id: 'mothers-day', title: "Mother's Day", dateISO: '2026-05-10', route: '/gifting/shop' },
      { id: 'team-offsite', title: 'Team Offsite', dateISO: '2026-05-24', route: '/gifting/shop' },
      { id: 'new-joiner-kits', title: 'New Joiner Kits', dateISO: '2026-06-02', route: '/gifting/shop' },
      { id: 'diwali', title: 'Diwali', dateISO: '2026-11-08', route: '/gifting/shop' },
    ]

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return seed
      .map((o) => ({ ...o, dateISO: o.dateISO }))
      .filter((o) => {
        const d = new Date(`${o.dateISO}T00:00:00`)
        return !Number.isNaN(d.getTime()) && d >= today
      })
      .sort((a, b) => new Date(`${a.dateISO}T00:00:00`).getTime() - new Date(`${b.dateISO}T00:00:00`).getTime())
      .slice(0, 5)
  }, [])

  const viewedItems = typeof window !== 'undefined'
    ? (JSON.parse(sessionStorage.getItem('mogzu_gifting_viewed') || '[]') as Array<{ id: string; name: string; image: string; price: number; tab_type: string }>)
    : []

  const recentlyViewed = viewedItems.map((item) => ({
    id: item.id,
    title: item.name,
    image: item.image,
    price: item.price,
    route:
      item.tab_type === 'combo'
        ? '/gifting/combo'
        : item.tab_type === 'go-local'
          ? '/gifting/go-local'
          : item.tab_type === 'baskets'
            ? '/gifting/baskets'
            : '/shop',
  }))

  const displayedTrendingCards = trendingCards.length > 0
    ? trendingCards
    : [
        ...giftingComboProducts.slice(0, 2).map((i) => ({ id: i.id, title: i.name, image: i.images[0], price: i.bundle_price, route: '/gifting/combo' })),
        ...giftingGoLocalProducts.slice(0, 1).map((i) => ({ id: i.id, title: i.name, image: i.images[0], price: i.price, route: '/gifting/go-local' })),
        ...giftingBasketsProducts.slice(0, 1).map((i) => ({ id: i.id, title: i.name, image: i.images[0], price: i.price, route: '/gifting/baskets' })),
      ]

  const featuredShopCards: HomeCard[] = useMemo(
    () =>
      apparelProducts.slice(0, 6).map((p) => ({
        id: String(p.id),
        title: p.name,
        image: p.images[0] || p.image,
        price: p.price,
        route: '/gifting/shop',
      })),
    [],
  )

  return (
    <div className="flex h-screen min-h-screen overflow-hidden mogzu-module-shell-bg">
      <SharedSidebar collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} activeNav="shop" />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <SharedHeader variant="blended" onMobileMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} searchPlaceholder="Search" />
        <MogzuCorporateScrollSurface>
          <div className="border-b border-slate-300/[0.1] bg-transparent">
            <div className="mx-auto w-full max-w-[1280px] px-5 md:px-8 lg:px-12 py-2 space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-400/10 bg-[#fffdf9]/[0.22] px-4 py-1 text-[14px] backdrop-blur-[2px]">
                <button onClick={() => navigate('/dashboard')} className="text-[#7b879a] font-medium hover:text-[#2563eb] transition-colors">Dashboard</button>
                <ChevronDown className="w-4 h-4 text-[#a0aec0] rotate-[-90deg]" />
                <span className="text-[#0e1e3f] font-semibold tracking-tight">Gifting</span>
              </div>
              <div className="flex items-center gap-3 min-w-0">
                <h1 className="text-[22px] font-bold text-[#0e1e3f] leading-none">Gifting</h1>
                <div className="flex items-center gap-2 overflow-x-auto overflow-y-visible whitespace-nowrap py-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  <button
                    onClick={() => navigate('/gifting')}
                    className="h-9 flex items-center gap-2 px-4 rounded-full text-[14px] font-semibold border-[1.5px] border-[#2563eb] shadow-[1px_2px_6px_0px_rgba(0,0,0,0.16)] text-[#0e1e3f]"
                    style={{
                      backgroundImage:
                        'linear-gradient(-9.24736deg, rgb(228, 235, 255) 9.7419%, rgb(255, 255, 255) 85.097%)',
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <polyline points="9 22 9 12 15 12 15 22" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>Home</span>
                  </button>
                  <button onClick={() => navigate('/gifting/shop')} className="h-9 flex items-center gap-2 px-4 rounded-full text-[14px] font-medium transition-all duration-200 border-[1.5px] border-slate-300/25 bg-white/[0.12] text-[#475569] backdrop-blur-sm hover:border-[#93c5fd] hover:-translate-y-0.5 active:scale-[0.98]">
                    <ShoppingBag className="w-5 h-5 text-[#4f46e5]" />
                    <span>Shop</span>
                  </button>
                  <button onClick={() => navigate('/gifting/celebrations')} className="h-9 flex items-center gap-2 px-4 rounded-full text-[14px] font-medium transition-all duration-200 border-[1.5px] border-slate-300/25 bg-white/[0.12] text-[#475569] backdrop-blur-sm hover:border-[#93c5fd] hover:-translate-y-0.5 active:scale-[0.98]">
                    <PartyPopper className="w-5 h-5 text-[#FF5E00]" />
                    <span>Celebrations</span>
                  </button>
                  <button onClick={() => navigate('/gifting/combo')} className="h-9 flex items-center gap-2 px-4 rounded-full text-[14px] font-medium transition-all duration-200 border-[1.5px] border-slate-300/25 bg-white/[0.12] text-[#475569] backdrop-blur-sm hover:border-[#93c5fd] hover:-translate-y-0.5 active:scale-[0.98]">
                    <Package className="w-5 h-5 text-[#0ea5e9]" />
                    <span>Combo</span>
                  </button>
                  <button onClick={() => navigate('/gifting/e-gift')} className="h-9 flex items-center gap-2 px-4 rounded-full text-[14px] font-medium transition-all duration-200 border-[1.5px] border-slate-300/25 bg-white/[0.12] text-[#475569] backdrop-blur-sm hover:border-[#93c5fd] hover:-translate-y-0.5 active:scale-[0.98]">
                    <CreditCard className="w-5 h-5 text-[#9B51E0]" />
                    <span>E-gift</span>
                  </button>
                  <button onClick={() => navigate('/gifting/go-local')} className="h-9 flex items-center gap-2 px-4 rounded-full text-[14px] font-medium transition-all duration-200 border-[1.5px] border-slate-300/25 bg-white/[0.12] text-[#475569] backdrop-blur-sm hover:border-[#93c5fd] hover:-translate-y-0.5 active:scale-[0.98]">
                    <MapPin className="w-5 h-5 text-[#15D39D]" />
                    <span>Go-local</span>
                  </button>
                  <button onClick={() => navigate('/gifting/baskets')} className="h-9 flex items-center gap-2 px-4 rounded-full text-[14px] font-medium transition-all duration-200 border-[1.5px] border-slate-300/25 bg-white/[0.12] text-[#475569] backdrop-blur-sm hover:border-[#93c5fd] hover:-translate-y-0.5 active:scale-[0.98]">
                    <Gift className="w-5 h-5 text-[#d4a000]" />
                    <span>Baskets</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mx-auto w-full max-w-[1280px] px-5 md:px-8 lg:px-12 py-6 space-y-7">
            <div
              className="group relative overflow-hidden rounded-3xl border border-white/60 min-h-[200px] bg-white/45 backdrop-blur-xl shadow-[0_18px_40px_rgba(37,99,235,0.18)]"
              onMouseEnter={() => setIsHeroHovered(true)}
              onMouseLeave={() => setIsHeroHovered(false)}
            >
              {bannerSlides.map((b, idx) => (
                <div key={b.title} className={`absolute inset-0 transition-opacity duration-400 ${slide === idx ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                  <div className="absolute inset-0 bg-[linear-gradient(120deg,#ebf1ff_0%,#f5f8ff_45%,#e9efff_100%)]" />
                  <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(67,121,238,0.08)_0%,rgba(67,121,238,0)_65%)]" />
                  <div className="relative flex min-h-[200px]">
                    <div className="w-[55%] px-8 py-6 flex flex-col justify-center">
                      <div className="inline-flex items-center rounded-full bg-[#ebf1ff] text-[#475569] px-2.5 py-1 text-[12px] font-medium mb-3 w-fit">
                        ⭐ By DR group
                      </div>
                      <h3 className="text-[24px] font-bold text-[#0e1e3f] leading-tight line-clamp-2">{b.title}</h3>
                      <p className="text-[14px] text-[#64748b] leading-[1.6] mt-2 mb-5 max-w-[380px]">{b.subtitle}</p>
                    <button
                      type="button"
                        onClick={() => navigate(b.route)}
                        className="h-11 px-6 rounded-full bg-[linear-gradient(135deg,#2563eb,#3b82f6)] text-white text-[14px] font-semibold shadow-[0_10px_22px_rgba(37,99,235,0.28)] hover:-translate-y-0.5 active:scale-[0.98] transition-all w-fit"
                    >
                        {b.cta}
                    </button>
                    </div>
                    <div className="w-[45%] relative overflow-hidden">
                      <img src={bannerImage} alt="" className="h-full w-full object-cover" />
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                aria-label="Previous slide"
                onClick={() => setSlide((s) => (s - 1 + bannerSlides.length) % bannerSlides.length)}
                className="opacity-0 group-hover:opacity-100 transition-opacity absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white flex items-center justify-center"
              >
                <ChevronLeft className="w-[18px] h-[18px] text-[#2563eb]" />
              </button>
                <button
                  type="button"
                aria-label="Next slide"
                onClick={() => setSlide((s) => (s + 1) % bannerSlides.length)}
                className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white flex items-center justify-center"
                >
                <ChevronRight className="w-[18px] h-[18px] text-[#2563eb]" />
                </button>

              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                {bannerSlides.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Go to slide ${i + 1}`}
                    onClick={() => setSlide(i)}
                    className={`transition-all duration-300 ease-in-out ${slide === i ? 'w-6 h-2 rounded-full bg-[#4379ee]' : 'w-2 h-2 rounded-full bg-[#d1d5db]'}`}
                  >
                    <span className="sr-only">{`Slide ${i + 1}`}</span>
                  </button>
                ))}
                      </div>
                    </div>

            <section>
              <SectionHeading title="What are you looking for?" />
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {quickAccess.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    aria-label={`Go to ${item.label}`}
                    onClick={() => navigate(item.route)}
                    className={`rounded-xl border transition-all motion-safe:duration-200 motion-safe:hover:-translate-y-1 motion-reduce:transform-none p-4 h-[110px] flex flex-col items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb]/30 ${item.cardBg} ${item.cardBorder} ${item.cardHover} ${item.cardShadow}`}
                  >
                    <div className={`w-12 h-12 rounded-[12px] flex items-center justify-center ${item.iconBg}`}>
                      <item.icon className={`w-6 h-6 ${item.iconColor}`} />
                    </div>
                    <span className="text-[13px] font-semibold text-[#0e1e3f] text-center">{item.label}</span>
                  </button>
                ))}
                </div>
            </section>

            {upcomingOccasions.length > 0 && (
              <section>
                <SectionHeading
                  title="Upcoming occasions"
                  rightAction={
                  <button
                    type="button"
                    onClick={() => navigate('/gifting/celebrations')}
                      className="text-sm font-semibold text-[#2563eb] hover:underline shrink-0"
                  >
                      View all
                  </button>
                  }
                />
                <div className="relative">
                  <button
                    type="button"
                    aria-label="Scroll upcoming occasions left"
                    onClick={() => handleScrollUpcoming('left')}
                    className="absolute -left-2 top-1/2 z-10 -translate-y-1/2 w-8 h-8 rounded-full border border-[#dbe3f2] bg-white/95 shadow-sm hover:shadow-md flex items-center justify-center"
                  >
                    <ChevronLeft className="w-4 h-4 text-[#2563eb]" aria-hidden />
                  </button>
                  <button
                    type="button"
                    aria-label="Scroll upcoming occasions right"
                    onClick={() => handleScrollUpcoming('right')}
                    className="absolute -right-2 top-1/2 z-10 -translate-y-1/2 w-8 h-8 rounded-full border border-[#dbe3f2] bg-white/95 shadow-sm hover:shadow-md flex items-center justify-center"
                  >
                    <ChevronRight className="w-4 h-4 text-[#2563eb]" aria-hidden />
                  </button>
                <div ref={upcomingScrollerRef} className="overflow-x-auto pb-2 px-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  <div className="flex gap-3 min-w-max pr-1">
                    {upcomingOccasions.map((o, index) => {
                      const dateLabel = new Date(`${o.dateISO}T00:00:00`).toLocaleDateString(undefined, {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })
                      const occasionTone = [
                        {
                          card: 'from-[#eff6ff] to-[#dbeafe]',
                          border: 'border-[#bfdbfe]',
                          cta: 'bg-[#1d4ed8] hover:bg-[#1e40af]',
                          date: 'text-[#1e40af]',
                        },
                        {
                          card: 'from-[#fff7ed] to-[#ffedd5]',
                          border: 'border-[#fed7aa]',
                          cta: 'bg-[#ea580c] hover:bg-[#c2410c]',
                          date: 'text-[#c2410c]',
                        },
                        {
                          card: 'from-[#f5f3ff] to-[#ede9fe]',
                          border: 'border-[#ddd6fe]',
                          cta: 'bg-[#7c3aed] hover:bg-[#6d28d9]',
                          date: 'text-[#6d28d9]',
                        },
                        {
                          card: 'from-[#ecfeff] to-[#cffafe]',
                          border: 'border-[#a5f3fc]',
                          cta: 'bg-[#0e7490] hover:bg-[#155e75]',
                          date: 'text-[#0e7490]',
                        },
                      ][index % 4]

                      return (
                        <button
                          key={o.id}
                          type="button"
                          aria-label={`Shop gifts for ${o.title}`}
                          onClick={() => navigate(o.route, { state: { preselectedOccasion: o.title } })}
                          className={`w-[236px] rounded-2xl overflow-hidden border ${occasionTone.border} bg-gradient-to-br ${occasionTone.card} hover:shadow-[0_14px_28px_rgba(15,23,42,0.14)] transition-all hover:-translate-y-0.5 flex flex-col text-left`}
                        >
                          <div className="p-3.5 flex-1 flex flex-col gap-2.5">
                            <p className="text-[15px] font-bold tracking-tight text-slate-900 leading-snug line-clamp-2">{o.title}</p>
                            <div className="flex items-center gap-2 text-[13px] text-slate-600">
                              <CalendarDays className="w-4 h-4 text-slate-400" aria-hidden />
                              <span className={`truncate font-semibold ${occasionTone.date}`}>{dateLabel}</span>
                            </div>
                            <div className="mt-auto pt-0.5 flex justify-end">
                              <span className={`inline-flex h-8 items-center rounded-lg px-3 text-[11px] font-semibold text-white transition-colors ${occasionTone.cta}`}>
                                Explore →
                              </span>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
                </div>
              </section>
            )}

            <section>
              <SectionHeading
                title="Featured products"
                rightAction={
                  <button
                    type="button"
                    onClick={() => navigate('/gifting/shop')}
                    className="text-sm font-semibold text-[#2563eb] hover:underline shrink-0"
                  >
                    View all →
                  </button>
                }
              />
              <div className="relative">
                <button
                  type="button"
                  aria-label="Scroll featured products left"
                  onClick={() => handleScrollRow(featuredScrollerRef, 'left')}
                  className="absolute -left-2 top-1/2 z-10 -translate-y-1/2 w-8 h-8 rounded-full border border-[#dbe3f2] bg-white/95 shadow-sm hover:shadow-md flex items-center justify-center"
                >
                  <ChevronLeft className="w-4 h-4 text-[#2563eb]" aria-hidden />
                </button>
                <button
                  type="button"
                  aria-label="Scroll featured products right"
                  onClick={() => handleScrollRow(featuredScrollerRef, 'right')}
                  className="absolute -right-2 top-1/2 z-10 -translate-y-1/2 w-8 h-8 rounded-full border border-[#dbe3f2] bg-white/95 shadow-sm hover:shadow-md flex items-center justify-center"
                >
                  <ChevronRight className="w-4 h-4 text-[#2563eb]" aria-hidden />
                </button>
                <div ref={featuredScrollerRef} className="overflow-x-auto pb-2 px-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  <div className="flex gap-5 min-w-max pr-1">
                    {featuredShopCards.map((card, index) => {
                      const featuredMeta = [
                        { label: 'Campaign Ready', desc: 'Ideal for festival and company-wide gifting campaigns.', badge: 'bg-[#eaf2ff] text-[#1d4ed8] border-[#bfdbfe]' },
                        { label: 'Onboarding', desc: 'Useful welcome essentials for new joiners.', badge: 'bg-[#fff4e8] text-[#c2410c] border-[#fed7aa]' },
                        { label: 'Team Events', desc: 'Curated picks for offsites and team celebrations.', badge: 'bg-[#f3e8ff] text-[#7c3aed] border-[#ddd6fe]' },
                        { label: 'Client Gifting', desc: 'Premium options for partner and client moments.', badge: 'bg-[#ecfeff] text-[#0e7490] border-[#a5f3fc]' },
                      ][index % 4]

                      return (
                        <button
                          key={card.id}
                          type="button"
                          aria-label={`Open ${card.title}`}
                          onClick={() => {
                            handleTrackViewed(card, 'shop')
                            navigate(card.route)
                          }}
                        className="shrink-0 w-[292px] bg-gradient-to-b from-white to-[#f7fbff] rounded-3xl overflow-hidden border border-[#cfe0ff] shadow-[0_8px_20px_rgba(37,99,235,0.08)] hover:shadow-[0_20px_40px_rgba(37,99,235,0.18)] transition-all hover:-translate-y-1.5 h-full flex flex-col text-left"
                        >
                        <div className="relative">
                            <img src={card.image || bannerImage} alt={card.title} className="w-full h-44 object-cover saturate-110" />
                            <span className={`absolute left-3 top-3 rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide backdrop-blur-sm ${featuredMeta.badge}`}>
                              {featuredMeta.label}
                            </span>
                          </div>
                          <div className="p-4 flex-1 flex flex-col">
                          <p className="text-[14px] font-semibold tracking-tight text-[#0f172a] mb-2 line-clamp-2 leading-snug min-h-[40px]">{card.title}</p>
                          <p className="text-[12px] leading-5 text-slate-500 mb-2.5 line-clamp-2 min-h-[36px]">{featuredMeta.desc || 'Details available on next step'}</p>
                          <div className="mt-auto pt-1 flex items-end justify-between gap-3">
                              <div>
                                <p className="text-[11px] text-[#878e9e]">Starting at</p>
                                <p className="text-[15px] font-semibold text-[#1d4ed8]">
                                  {typeof card.price === 'number' ? `Rs ${card.price}/piece` : 'Price on request'}
                                </p>
                              </div>
                              <span className="inline-flex h-9 items-center rounded-xl bg-[linear-gradient(90deg,#1d4ed8,#2563eb,#0ea5e9)] px-3.5 text-[12px] font-semibold text-white shadow-md">
                                Explore →
                              </span>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </section>

            <section>
              <SectionHeading
                title="Trending this week"
                rightAction={
                  <button
                    type="button"
                    onClick={() => navigate('/gifting/shop?filter=trending')}
                    className="text-sm font-semibold text-[#2563eb] hover:underline shrink-0"
                  >
                    View all →
                  </button>
                }
              />
              <div className="relative">
                <button
                  type="button"
                  aria-label="Scroll trending products left"
                  onClick={() => handleScrollRow(trendingScrollerRef, 'left')}
                  className="absolute -left-2 top-1/2 z-10 -translate-y-1/2 w-8 h-8 rounded-full border border-[#dbe3f2] bg-white/95 shadow-sm hover:shadow-md flex items-center justify-center"
                >
                  <ChevronLeft className="w-4 h-4 text-[#2563eb]" aria-hidden />
                </button>
                <button
                  type="button"
                  aria-label="Scroll trending products right"
                  onClick={() => handleScrollRow(trendingScrollerRef, 'right')}
                  className="absolute -right-2 top-1/2 z-10 -translate-y-1/2 w-8 h-8 rounded-full border border-[#dbe3f2] bg-white/95 shadow-sm hover:shadow-md flex items-center justify-center"
                >
                  <ChevronRight className="w-4 h-4 text-[#2563eb]" aria-hidden />
                </button>
              <div ref={trendingScrollerRef} className="overflow-x-auto pb-3 px-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                <div className="flex gap-5 snap-x snap-mandatory min-w-max">
                  {displayedTrendingCards.map((card, index) => {
                    const trendType = card.route.includes('combo')
                      ? { label: 'Combo Bundle', desc: 'Best-selling package sets for team campaigns and festive drops.', badge: 'bg-[#fff4e8] text-[#c2410c] border-[#fed7aa]' }
                      : card.route.includes('go-local')
                        ? { label: 'Local Picks', desc: 'Region-first artisan gifting loved by distributed corporate teams.', badge: 'bg-[#ecfdf3] text-[#15803d] border-[#bbf7d0]' }
                        : { label: 'Gift Baskets', desc: 'Ready-to-send assortments for leadership, clients, and top performers.', badge: 'bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe]' }

                    return (
                      <button
                        key={card.id}
                        type="button"
                        aria-label={`Open ${card.title}`}
                        onClick={() => {
                          handleTrackViewed(card, card.route.includes('combo') ? 'combo' : card.route.includes('go-local') ? 'go-local' : 'baskets')
                          navigate(card.route)
                        }}
                        className="snap-start shrink-0 w-[292px] bg-gradient-to-b from-white to-[#f7fbff] rounded-3xl overflow-hidden border border-[#cfe0ff] shadow-[0_8px_20px_rgba(37,99,235,0.08)] hover:shadow-[0_20px_40px_rgba(37,99,235,0.18)] transition-all hover:-translate-y-1.5 h-full flex flex-col text-left"
                      >
                        <div className="relative">
                          <img src={card.image || bannerImage} alt={card.title} className="w-full h-44 object-cover saturate-110" />
                          <span className={`absolute left-3 top-3 rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide backdrop-blur-sm ${trendType.badge}`}>
                            {trendType.label}
                          </span>
                          <span className="absolute right-3 top-3 rounded-full bg-[#0f172a]/80 px-2 py-0.5 text-[10px] font-semibold text-white">
                            #{index + 1}
                          </span>
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                          <p className="text-[14px] font-semibold tracking-tight text-[#0f172a] mb-2 line-clamp-2 leading-snug min-h-[40px]">{card.title}</p>
                          <p className="text-[12px] leading-5 text-slate-500 mb-2.5 min-h-[36px] line-clamp-2">{trendType.desc || 'Details available on next step'}</p>
                          <div className="mt-auto flex items-end justify-between gap-3">
                            <div>
                              <p className="text-[11px] text-[#878e9e]">Starting at</p>
                              <p className="text-[15px] font-semibold text-[#1d4ed8]">
                                {typeof card.price === 'number' ? `Rs ${card.price}/piece` : 'Price on request'}
                              </p>
                            </div>
                            <span className="inline-flex h-9 items-center rounded-xl bg-[linear-gradient(90deg,#1d4ed8,#2563eb,#0ea5e9)] px-3.5 text-[12px] font-semibold text-white shadow-md">
                              Explore →
                            </span>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
              </div>
            </section>

            {recentlyViewed.length > 0 && (
              <section>
                <SectionHeading
                  title="Continue browsing"
                  rightAction={
                    <button
                      type="button"
                      onClick={() => navigate('/gifting/shop')}
                      className="text-sm font-semibold text-[#2563eb] hover:underline shrink-0"
                    >
                      Browse all →
                    </button>
                  }
                />
                <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [mask-image:linear-gradient(to_right,black_85%,transparent_100%)] [&::-webkit-scrollbar]:hidden">
                  <div className="flex gap-5 snap-x snap-mandatory pb-3 min-w-max">
                    {recentlyViewed.map((card) => (
                      <button
                        key={card.id}
                        type="button"
                        aria-label={`Continue with ${card.title}`}
                        onClick={() => navigate(card.route)}
                        className="snap-start shrink-0 w-[292px] bg-gradient-to-b from-white to-[#f7fbff] rounded-3xl overflow-hidden border border-[#cfe0ff] shadow-[0_8px_20px_rgba(37,99,235,0.08)] hover:shadow-[0_20px_40px_rgba(37,99,235,0.18)] transition-all hover:-translate-y-1.5 h-full flex flex-col text-left"
                      >
                        <div className="relative">
                          <img src={card.image || bannerImage} alt={card.title} className="w-full h-44 object-cover saturate-110" />
                          <span className="absolute left-3 top-3 rounded-full bg-[#0f172a]/85 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-white">
                            Continue
                          </span>
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                          <p className="text-[14px] font-semibold tracking-tight text-[#0f172a] mb-2 line-clamp-2 leading-snug min-h-[40px]">{card.title}</p>
                          <p className="text-[12px] leading-5 text-slate-500 mb-2.5 line-clamp-2 min-h-[36px]">Picked from your recent browsing activity.</p>
                          <div className="mt-auto flex items-end justify-between gap-3">
                            <div>
                            <p className="text-[11px] text-[#878e9e]">Starting at</p>
                            <p className="text-[15px] font-semibold text-[#1d4ed8]">
                              {typeof card.price === 'number' ? `Rs ${card.price}/piece` : 'Price on request'}
                            </p>
                            </div>
                            <span className="inline-flex h-9 items-center rounded-xl border border-[#bfdbfe] bg-[#eff6ff] px-3.5 text-[12px] font-semibold text-[#1d4ed8]">
                              Open →
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
              </div>
            </div>
              </section>
            )}
          </div>
        </MogzuCorporateScrollSurface>
      </div>
    </div>
  )
}
