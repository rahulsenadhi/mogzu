import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { AlertCircle, Bookmark, BookmarkCheck, Clock3, Flame, Search, SlidersHorizontal, Sparkles, Tag, Users } from 'lucide-react'
import { SharedHeader } from '@/app/components/layouts/SharedHeader'
import { SharedSidebar } from '@/app/components/layouts/SharedSidebar'
import { MogzuCorporateScrollSurface } from '@/app/components/layouts/MogzuCorporateScrollSurface'
import { DevMockDataBanner } from '@/app/components/global/DevMockDataBanner'
import { db } from '@/lib/db'
import {
  DEMO_CATALOG_DEALS,
  mapPromotionRowToDeal,
  type CatalogDeal,
  type DealCategory,
} from '@/app/lib/promotionOffers'

const categories: DealCategory[] = ['All', 'D Space', 'Events', 'Gifting']

type SortMode = 'recommended' | 'expiringSoon' | 'popular'

export default function DealsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState<DealCategory>('All')
  const [sortMode, setSortMode] = useState<SortMode>('recommended')
  const [savedOnly, setSavedOnly] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [savedDeals, setSavedDeals] = useState<string[]>([])
  const [claimedDeals, setClaimedDeals] = useState<string[]>([])
  const [recentClaimId, setRecentClaimId] = useState<string | null>(null)
  const [liveDeals, setLiveDeals] = useState<CatalogDeal[]>([])
  const [usingDemo, setUsingDemo] = useState(false)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      setIsError(false)
      const { data, error } = await db.promotions.listActive()
      if (cancelled) return
      if (error) {
        setIsError(true)
        setLiveDeals([])
        setUsingDemo(true)
      } else if ((data ?? []).length === 0) {
        setLiveDeals([])
        setUsingDemo(true)
      } else {
        setLiveDeals((data ?? []).map((row) => mapPromotionRowToDeal(row as never)))
        setUsingDemo(false)
      }
      setIsLoading(false)
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const claimedDealId = (location.state as { claimedDealId?: string } | null)?.claimedDealId
    if (!claimedDealId) return

    setClaimedDeals((current) => (current.includes(claimedDealId) ? current : [...current, claimedDealId]))
    setRecentClaimId(claimedDealId)

    window.setTimeout(() => {
      setRecentClaimId((current) => (current === claimedDealId ? null : current))
    }, 3500)
  }, [location.state])

  const catalogDeals = usingDemo ? DEMO_CATALOG_DEALS : liveDeals

  const filteredDeals = useMemo(() => {
    const normalizedQuery = searchTerm.trim().toLowerCase()
    let list = [...catalogDeals]

    if (activeCategory !== 'All') {
      list = list.filter((deal) => deal.category === activeCategory)
    }

    if (normalizedQuery) {
      list = list.filter(
        (deal) =>
          deal.title.toLowerCase().includes(normalizedQuery) ||
          deal.provider.toLowerCase().includes(normalizedQuery) ||
          deal.description.toLowerCase().includes(normalizedQuery)
      )
    }

    if (savedOnly) {
      list = list.filter((deal) => savedDeals.includes(deal.id))
    }

    if (sortMode === 'popular') {
      list.sort((a, b) => b.claimedCount - a.claimedCount)
      return list
    }

    if (sortMode === 'expiringSoon') {
      list.sort((a, b) => new Date(a.validUntil).getTime() - new Date(b.validUntil).getTime())
      return list
    }

    list.sort((a, b) => Number(Boolean(b.highlighted)) - Number(Boolean(a.highlighted)))
    return list
  }, [activeCategory, catalogDeals, savedDeals, savedOnly, searchTerm, sortMode])

  const totalSavingsPotential = useMemo(() => {
    return catalogDeals.reduce((acc, deal) => {
      const numeric = Number.parseInt(deal.discount.replace(/\D/g, ''), 10)
      return Number.isNaN(numeric) ? acc : acc + numeric
    }, 0)
  }, [catalogDeals])

  const toggleSaved = (dealId: string) => {
    setSavedDeals((current) => (current.includes(dealId) ? current.filter((id) => id !== dealId) : [...current, dealId]))
  }

  const isQueryFiltered = Boolean(searchTerm.trim()) || activeCategory !== 'All' || savedOnly
  const stats = [
    { label: 'Active deals', value: catalogDeals.length, icon: Tag },
    { label: 'Saved', value: savedDeals.length, icon: BookmarkCheck },
    { label: 'Potential discount', value: `${totalSavingsPotential}%+`, icon: Sparkles },
  ]

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-[#f8fbff] via-[#fdfdff] to-[#f6f8ff]">
      <SharedSidebar collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <SharedHeader
          onMobileMenuToggle={() => setSidebarCollapsed((value) => !value)}
          searchPlaceholder="Search deals, vendors, categories..."
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
        />

        <MogzuCorporateScrollSurface className="px-5 py-5 sm:px-7">
          <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-5 text-sm">
            <section className="relative overflow-hidden rounded-3xl border border-[#d8e4ff]/90 bg-gradient-to-r from-[#0e1e3f] via-[#1f3f8f] to-[#3568dd] px-5 py-6 shadow-[0_24px_60px_rgba(53,104,221,0.22)] sm:px-7">
              <div className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-[#8cb5ff]/20 blur-3xl" />
              <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/90">
                    <Sparkles className="size-3 text-[#fbbf24]" />
                    Corporate deals
                  </p>
                  <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                    Exclusive offers for your team
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm text-blue-100">
                    Curated rates across D Space, Events and Gifting with faster claiming, clearer value, and live partner popularity signals.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/bookings')}
                  className="self-start rounded-xl border border-white/30 bg-white/15 px-4 py-2 text-xs font-semibold text-white transition-colors motion-safe:duration-200 hover:bg-white/25 focus:outline-none focus:ring-2 focus:ring-white/40"
                >
                  View bookings
                </button>
              </div>
            </section>

            <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {stats.map((stat) => (
                <article
                  key={stat.label}
                  className="rounded-2xl border border-slate-200/80 bg-white/95 px-4 py-4 shadow-[0_8px_26px_rgba(15,23,42,0.08)] backdrop-blur-sm transition-transform motion-safe:duration-200 motion-safe:hover:-translate-y-0.5 motion-reduce:transform-none"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">{stat.label}</p>
                    <div className="rounded-lg bg-[#edf3ff] p-1.5 text-[#3568dd]">
                      <stat.icon className="size-3.5" />
                    </div>
                  </div>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-[#0e1e3f]">{stat.value}</p>
                </article>
              ))}
            </section>

            {usingDemo && !isLoading ? (
              <DevMockDataBanner message="No active vendor promotions in Supabase — showing demo deals. Vendors can publish offers from Promotions." />
            ) : null}

            {recentClaimId ? (
              <section className="rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-xs font-medium text-emerald-800 shadow-sm">
                Deal claimed successfully. It is now marked as claimed in your list.
              </section>
            ) : null}

            <section className="sticky top-2 z-20 rounded-2xl border border-slate-200/90 bg-white/90 p-4 shadow-[0_12px_32px_rgba(15,23,42,0.08)] backdrop-blur-md">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="relative w-full lg:max-w-md">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      placeholder="Search by title, vendor or keyword"
                      aria-label="Search deals"
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/15"
                    />
                  </div>
                  <label className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-700">
                    <SlidersHorizontal className="size-4 text-slate-500" />
                    Sort by
                    <select
                      value={sortMode}
                      onChange={(event) => setSortMode(event.target.value as SortMode)}
                      aria-label="Sort deals"
                      className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none"
                    >
                      <option value="recommended">Recommended</option>
                      <option value="expiringSoon">Expiring soon</option>
                      <option value="popular">Most popular</option>
                    </select>
                  </label>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  {categories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setActiveCategory(category)}
                      className={`rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors motion-safe:duration-200 ${
                        activeCategory === category
                          ? 'border-[#4379ee] bg-[#ebf1ff] text-[#1d4ed8]'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setSavedOnly((value) => !value)}
                    className={`rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors motion-safe:duration-200 ${
                      savedOnly
                        ? 'border-[#0e1e3f] bg-[#0e1e3f] text-white'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    Saved only
                  </button>
                </div>
              </div>
            </section>

            {isLoading ? (
              <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={`deal-skeleton-${index}`}
                    className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm"
                  >
                    <div className="h-40 animate-pulse motion-reduce:animate-none bg-slate-200/80" />
                    <div className="space-y-3 p-4">
                      <div className="h-3 w-1/3 animate-pulse motion-reduce:animate-none rounded bg-slate-200/80" />
                      <div className="h-5 w-4/5 animate-pulse motion-reduce:animate-none rounded bg-slate-200/80" />
                      <div className="h-3 w-full animate-pulse motion-reduce:animate-none rounded bg-slate-200/70" />
                      <div className="h-3 w-5/6 animate-pulse motion-reduce:animate-none rounded bg-slate-200/70" />
                      <div className="h-8 w-full animate-pulse motion-reduce:animate-none rounded-lg bg-slate-200/70" />
                    </div>
                  </div>
                ))}
              </section>
            ) : null}

            {!isLoading && isError ? (
              <section className="flex flex-col items-center rounded-xl border border-red-200/90 bg-white/90 p-7 text-center shadow-sm">
                <div className="mb-2 rounded-full bg-red-50 p-2.5">
                  <AlertCircle className="size-5 text-red-600" />
                </div>
                <h2 className="text-base font-semibold text-[#0e1e3f]">Unable to load deals</h2>
                <p className="mt-1 max-w-md text-xs text-slate-600 sm:text-sm">
                  We could not fetch the latest offers right now. Please try again.
                </p>
                <button
                  type="button"
                  onClick={() => setIsError(false)}
                  className="mt-3 rounded-lg bg-[#0e1e3f] px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-[#1b3264]"
                >
                  Retry
                </button>
              </section>
            ) : null}

            {!isLoading && !isError && filteredDeals.length === 0 ? (
              <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-full bg-[#ebf1ff] text-[#4379ee]">
                  <Tag className="size-4" />
                </div>
                <h2 className="text-base font-semibold text-[#0e1e3f]">
                  {isQueryFiltered ? 'No deals match your filters' : 'No deals available yet'}
                </h2>
                <p className="mt-1 text-xs text-slate-600 sm:text-sm">
                  {isQueryFiltered
                    ? 'Try clearing search, turning off saved-only, or selecting a different category.'
                    : 'New offers will appear here once your account receives partner promotions.'}
                </p>
                {isQueryFiltered ? (
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSearchTerm('')
                        setSavedOnly(false)
                        setActiveCategory('All')
                      }}
                      className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Clear filters
                    </button>
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      className="rounded-lg bg-[#0e1e3f] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[#1b3264]"
                    >
                      Browse all deals
                    </button>
                  </div>
                ) : null}
              </section>
            ) : null}

            {!isLoading && !isError && filteredDeals.length > 0 ? (
              <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {filteredDeals.map((deal) => {
                  const isSaved = savedDeals.includes(deal.id)
                  const isClaimed = claimedDeals.includes(deal.id)

                  return (
                    <article
                      key={deal.id}
                      className="group overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_6px_24px_rgba(15,23,42,0.08)] transition-[border-color,box-shadow,transform] motion-safe:duration-200 motion-safe:hover:-translate-y-0.5 motion-reduce:transform-none hover:border-[#bdd3ff] hover:shadow-[0_16px_34px_rgba(37,99,235,0.16)]"
                    >
                      <div className="relative h-40 w-full overflow-hidden">
                        <img
                          src={deal.imageUrl}
                          alt={deal.title}
                          className="h-full w-full object-cover transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-[1.04] motion-reduce:transform-none"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent" />
                        <div className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold text-slate-700 shadow-sm">
                          {deal.category}
                        </div>
                        <div className="absolute right-3 top-3 rounded-full bg-[#FA8D40] px-2.5 py-1 text-[10px] font-bold text-white shadow-sm">
                          {deal.discount}
                        </div>
                        {deal.highlighted ? (
                          <div className="absolute bottom-3 left-3 rounded-full border border-white/20 bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-[#0e1e3f]">
                            Recommended
                          </div>
                        ) : null}
                      </div>

                      <div className="p-4">
                        <div className="mb-2 flex items-start justify-between gap-3">
                          <div>
                            <h3 className="line-clamp-2 text-base font-semibold leading-snug tracking-tight text-[#0e1e3f]">
                              {deal.title}
                            </h3>
                            <p className="mt-1 text-xs font-medium text-[#4379ee]">{deal.provider}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleSaved(deal.id)}
                            aria-label={isSaved ? 'Remove from saved deals' : 'Save deal'}
                            className="rounded-md border border-slate-200 bg-white p-1.5 text-slate-500 transition-colors motion-safe:duration-200 hover:border-slate-300 hover:text-slate-700"
                          >
                            {isSaved ? <BookmarkCheck className="size-3.5 text-[#2563eb]" /> : <Bookmark className="size-3.5" />}
                          </button>
                        </div>

                        <p className="line-clamp-2 text-xs leading-relaxed text-slate-600">{deal.description}</p>

                        <div className="mt-3 rounded-xl border border-slate-200/80 bg-slate-50/80 p-2.5">
                          <div className="flex items-center justify-between text-[11px] text-slate-600">
                            <p className="inline-flex items-center gap-1 font-medium">
                              <Clock3 className="size-3" />
                              Valid until {deal.validUntil}
                            </p>
                            <p className="inline-flex items-center gap-1">
                              <Users className="size-3" />
                              {deal.claimedCount} claimed
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between border-t border-slate-200/70 pt-3">
                          <p className="inline-flex items-center gap-1 text-xs font-semibold text-[#0e1e3f]">
                            <Flame className="size-3 text-[#f97316]" />
                            {deal.discount}
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              if (isClaimed) return
                              setClaimedDeals((current) => [...current, deal.id])
                              navigate(`/deals/claim/${deal.id}`)
                            }}
                            className={`min-h-[36px] rounded-lg px-3 py-1 text-[11px] font-semibold transition-colors motion-safe:duration-200 ${
                              isClaimed
                                ? 'cursor-default border border-emerald-200 bg-emerald-50 text-emerald-700'
                                : 'bg-[#3568dd] text-white hover:bg-[#2a55b8] focus:outline-none focus:ring-2 focus:ring-[#3568dd]/30'
                            }`}
                          >
                            {isClaimed ? 'Claimed' : 'Claim deal'}
                          </button>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </section>
            ) : null}
          </div>
        </MogzuCorporateScrollSurface>
      </div>
    </div>
  )
}
