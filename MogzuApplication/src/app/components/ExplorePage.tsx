// Phase 3 Feature 1 (P3.1) — anonymous public catalogue browse.

import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { Loader2, Search, Sparkles } from 'lucide-react'
import { listPublicListings, PUBLIC_MODULES, type PublicListingCard } from '@/lib/publicCatalogue'
import { realtimeService } from '@/lib/realtime'
import { storageService } from '@/lib/storage'
import { t } from '@/lib/i18n'
import type { ModuleId } from '@/lib/database.types'
import { WishlistHeart } from './global/WishlistHeart'
import { RatingBadge } from './global/RatingBadge'
import { useCurrency } from '@/lib/i18n/useCurrency'
import { MogzuAmbientBackdrop } from '@/app/components/layouts/MogzuAmbientBackdrop'
import { MogzuLogo } from '@/app/components/branding/MogzuLogo'
import { LocalePicker } from '@/app/components/global/LocalePicker'
import {
  MOGZU_GLASS_CARD,
  MOGZU_GLASS_CHIP,
  MOGZU_GLASS_HERO,
  MOGZU_GLASS_INPUT,
  MOGZU_PRIMARY_BTN,
} from '@/app/components/ui/mogzuGlassStyles'

function imageUrl(path: string | null): string | undefined {
  if (!path) return undefined
  // Listing images live in the vendor-images bucket. Anon GET via the
  // public-url helper is fine for active + public_visible rows.
  return storageService.listingImages.getUrl(path)
}

function formatPrice(
  card: PublicListingCard,
  formatCurrency: (value: number | null | undefined) => string,
): string {
  if (card.pricing_type === 'request_for_price') return t('catalogue.request_quote')
  if (card.base_price == null) return t('common.dash')
  return formatCurrency(card.base_price)
}

export default function ExplorePage() {
  const navigate = useNavigate()
  const { module: moduleParam } = useParams<{ module?: ModuleId }>()
  const activeModule: ModuleId = (moduleParam as ModuleId) ?? 'events'

  const [search, setSearch] = useState('')
  const [rows, setRows] = useState<PublicListingCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { formatCurrency } = useCurrency()

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    const { data, error: err } = await listPublicListings({
      module: activeModule,
      search,
      limit: 24,
    })
    if (err) setError(err)
    setRows(data)
    setLoading(false)
  }, [activeModule, search])

  useEffect(() => {
    load()
  }, [load])

  // Cascade reactivity: admin enable/disable on listing_categories cascades
  // to listings.public_visible via the DB trigger. Refetch on either change
  // so the consumer-facing catalogue stays inside the 60s SLA.
  useEffect(() => {
    const offCat = realtimeService.watchCategories(() => load())
    const offListings = realtimeService.watchListings(activeModule, () => load())
    return () => {
      offCat()
      offListings()
    }
  }, [activeModule, load])

  const moduleLabel = PUBLIC_MODULES.find((m) => m.value === activeModule)?.label ?? activeModule

  return (
    <div className="relative min-h-screen mogzu-module-shell-bg">
      <div className="pointer-events-none fixed inset-0">
        <MogzuAmbientBackdrop variant="corporate" density="full" />
      </div>

      <header className="relative z-[1] border-b border-white/60 bg-white/60 backdrop-blur-xl shadow-[0_8px_24px_rgba(37,99,235,0.10)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2" aria-label="Mogzu home">
            <MogzuLogo variant="wordmark" className="h-8 w-auto max-w-[112px]" />
          </Link>
          <div className="flex items-center gap-3">
            <LocalePicker />
            <Link
              to="/login"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-[#0e1e3f]"
            >
              {t('auth.sign_in')}
            </Link>
            <Link to="/signup" className={MOGZU_PRIMARY_BTN + ' px-4 py-1.5 text-sm'}>
              {t('auth.get_started')}
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-[1] mx-auto max-w-6xl px-6 py-8">
        <div className={MOGZU_GLASS_HERO + ' mb-6'}>
          <span className={MOGZU_GLASS_CHIP}>
            <Sparkles className="size-3.5" />
            Public discovery
          </span>
          <h1 className="mt-3 text-[30px] font-extrabold tracking-[-0.02em] text-slate-900 sm:text-[34px]">
            {t('catalogue.explore_prefix')} {moduleLabel}
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-600">
            {t('catalogue.subtitle')}
          </p>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          {PUBLIC_MODULES.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => navigate(`/explore/${m.value}`)}
              className={`h-9 rounded-full border-[1.5px] px-4 text-sm font-medium transition-all duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#93c5fd]/50 ${
                m.value === activeModule
                  ? 'border-slate-900 bg-slate-900 text-white shadow-[0_8px_20px_rgba(15,23,42,0.25)]'
                  : 'border-slate-300/25 bg-white/[0.12] text-[#475569] backdrop-blur-sm hover:-translate-y-0.5 hover:border-[#93c5fd] active:scale-[0.98]'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className={MOGZU_GLASS_INPUT + ' mt-4 shadow-[0_10px_24px_rgba(37,99,235,0.10)] transition-shadow duration-300 hover:shadow-[0_14px_28px_rgba(37,99,235,0.14)]'}>
          <Search className="size-4 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`${t('catalogue.search_placeholder_prefix')} ${moduleLabel.toLowerCase()}…`}
            className="flex-1 bg-transparent text-sm outline-none"
          />
        </div>

        {error && (
          <p className="mt-3 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        )}

        <section className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-14">
              <Loader2 className="size-6 animate-spin text-slate-400" />
            </div>
          ) : rows.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center">
              <p className="text-sm text-slate-500">
                {t('catalogue.empty_prefix')} {moduleLabel}. {t('catalogue.empty_hint')}
                <code className="mx-1 rounded bg-slate-100 px-1.5 py-0.5 text-xs">public_visible</code>
                {t('catalogue.empty_hint_suffix')}
              </p>
            </div>
          ) : (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rows.map((card) => (
                <li
                  key={card.id}
                  className={`overflow-hidden ${MOGZU_GLASS_CARD} transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(37,99,235,0.22)] ${
                    card.is_mogzu_direct ? 'border-[#F5D2E3]' : 'border-white/60'
                  }`}
                >
                  <div className="relative aspect-[4/3] bg-slate-100">
                    {imageUrl(card.cover_image_path) ? (
                      <img
                        src={imageUrl(card.cover_image_path)}
                        alt={card.title}
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-xs text-slate-400">
                        {t('common.no_image')}
                      </div>
                    )}
                    <WishlistHeart listingId={card.id} />
                    {card.is_mogzu_direct && (
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-[#0F172A]/55 to-transparent" />
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-[15px] font-bold leading-5 tracking-[-0.01em] text-slate-900">
                        {card.title}
                      </h3>
                      {card.is_mogzu_direct && (
                        <span className="shrink-0 rounded-full border border-[#F6C7DF] bg-[#FFF0F7] px-2 py-0.5 text-[10px] font-semibold text-[#B42369]">
                          {t('catalogue.mogzu_direct')}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs font-medium text-slate-500">
                      {card.vendor_name ?? t('common.dash')}
                      {card.category_name ? ` · ${card.category_name}` : ''}
                    </p>
                    <RatingBadge listingId={card.id} className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-[#0e1e3f]" />
                    {card.description && (
                      <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-600">{card.description}</p>
                    )}
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-900">
                        {formatPrice(card, formatCurrency)}
                      </span>
                      <Link
                        to={`/signup?next=/explore/${card.module}/${card.id}`}
                        className={MOGZU_PRIMARY_BTN + ' px-3 py-1 text-xs'}
                      >
                        {t('catalogue.sign_up_to_book')}
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  )
}
