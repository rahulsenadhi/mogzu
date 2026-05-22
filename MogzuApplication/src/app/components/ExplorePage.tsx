// Phase 3 Feature 1 (P3.1) — anonymous public catalogue browse.

import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { Loader2, Search } from 'lucide-react'
import { listPublicListings, PUBLIC_MODULES, type PublicListingCard } from '@/lib/publicCatalogue'
import { realtimeService } from '@/lib/realtime'
import { storageService } from '@/lib/storage'
import { t } from '@/lib/i18n'
import type { ModuleId } from '@/lib/database.types'
import { WishlistHeart } from './global/WishlistHeart'
import { RatingBadge } from './global/RatingBadge'

function imageUrl(path: string | null): string | undefined {
  if (!path) return undefined
  // Listing images live in the vendor-images bucket. Anon GET via the
  // public-url helper is fine for active + public_visible rows.
  return storageService.listingImages.getUrl(path)
}

function formatPrice(card: PublicListingCard): string {
  if (card.pricing_type === 'request_for_price') return t('catalogue.request_quote')
  if (card.base_price == null) return t('common.dash')
  return `₹${Number(card.base_price).toLocaleString('en-IN')}`
}

export default function ExplorePage() {
  const navigate = useNavigate()
  const { module: moduleParam } = useParams<{ module?: ModuleId }>()
  const activeModule: ModuleId = (moduleParam as ModuleId) ?? 'events'

  const [search, setSearch] = useState('')
  const [rows, setRows] = useState<PublicListingCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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
    <div className="min-h-screen bg-[#FFFDF9]">
      {/* Top bar — minimal so it works pre-login. */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-xl font-bold tracking-tight text-[#0e1e3f]">
            Mogzu
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-medium text-slate-600 hover:text-[#0e1e3f]"
            >
              {t('auth.sign_in')}
            </Link>
            <Link
              to="/signup"
              className="rounded-md bg-[#2563eb] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[#1d4ed8]"
            >
              {t('auth.get_started')}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="text-2xl font-bold text-slate-900">{t('catalogue.explore_prefix')} {moduleLabel}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {t('catalogue.subtitle')}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          {PUBLIC_MODULES.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => navigate(`/explore/${m.value}`)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                m.value === activeModule
                  ? 'bg-slate-900 text-white'
                  : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2">
          <Search className="size-4 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`${t('catalogue.search_placeholder_prefix')} ${moduleLabel.toLowerCase()}…`}
            className="flex-1 text-sm outline-none"
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
                <li key={card.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
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
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-slate-900">{card.title}</h3>
                      {card.is_mogzu_direct && (
                        <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                          {t('catalogue.mogzu_direct')}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {card.vendor_name ?? t('common.dash')}
                      {card.category_name ? ` · ${card.category_name}` : ''}
                    </p>
                    <RatingBadge listingId={card.id} className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-[#0e1e3f]" />
                    {card.description && (
                      <p className="mt-2 line-clamp-2 text-xs text-slate-600">{card.description}</p>
                    )}
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-900">{formatPrice(card)}</span>
                      <Link
                        to={`/signup?next=/explore/${card.module}/${card.id}`}
                        className="rounded-md bg-[#2563eb] px-3 py-1 text-xs font-semibold text-white hover:bg-[#1d4ed8]"
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
