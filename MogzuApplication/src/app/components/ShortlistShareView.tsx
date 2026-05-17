import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { Loader2, Bookmark } from 'lucide-react'
import { SharedHeader } from './layouts/SharedHeader'
import { MogzuCorporateScrollSurface } from './layouts/MogzuCorporateScrollSurface'
import { db } from '@/lib/db'
import { storageService } from '@/lib/storage'
import type { Listing, ListingImage, Shortlist, ShortlistItem, Vendor } from '@/lib/database.types'

export default function ShortlistShareView() {
  const navigate = useNavigate()
  const params = useParams<{ token: string }>()
  const [shortlist, setShortlist] = useState<
    (Shortlist & { corporate_accounts?: { name: string | null } }) | null
  >(null)
  const [items, setItems] = useState<
    (ShortlistItem & {
      listings?: (Listing & { listing_images: ListingImage[]; vendors: Vendor | null }) | null
    })[]
  >([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    if (!params.token) return
    setLoading(true)
    setError('')
    const { data, error: tokErr } = await db.shortlists.getByToken(params.token)
    if (tokErr || !data) {
      setError(tokErr?.message ?? 'Shortlist not found.')
      setLoading(false)
      return
    }
    setShortlist(data as any)
    if (data.expires_at && new Date(data.expires_at).getTime() < Date.now()) {
      setError('This shortlist has expired.')
      setLoading(false)
      return
    }
    await db.shortlists.incrementView(data.id)
    const itemsRes = await db.shortlists.listItems(data.id)
    setItems((itemsRes.data ?? []) as any)
    setLoading(false)
  }, [params.token])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#FFFDF9]">
      <SharedHeader />
      <MogzuCorporateScrollSurface className="py-8">
        <div className="mx-auto max-w-4xl px-8">
          {loading ? (
            <div className="flex items-center justify-center py-14">
              <Loader2 className="size-6 animate-spin text-slate-400" />
            </div>
          ) : error ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-6 text-center">
              <p className="text-sm text-rose-700">{error}</p>
            </div>
          ) : !shortlist ? null : (
            <>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
                  <Bookmark className="size-3" />
                  Curated for {shortlist.corporate_accounts?.name ?? 'your team'}
                </p>
                <h1 className="mt-1 text-2xl font-bold text-[#0e1e3f]">{shortlist.name}</h1>
                {shortlist.intro_note && (
                  <p className="mt-2 text-sm text-slate-600">{shortlist.intro_note}</p>
                )}
              </div>

              <h2 className="mb-2 mt-6 text-sm font-semibold uppercase tracking-wide text-slate-500">
                {items.length} listings
              </h2>
              {items.length === 0 ? (
                <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                  Your AM hasn't added any listings yet.
                </p>
              ) : (
                <ul className="space-y-3">
                  {items.map((it) => {
                    const l = it.listings
                    if (!l) return null
                    const cover = l.listing_images?.[0]
                    return (
                      <li
                        key={it.id}
                        className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
                      >
                        <div className="size-20 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                          {cover && (
                            <img
                              src={storageService.spaceImages.getUrl(cover.storage_path)}
                              alt=""
                              className="size-full object-cover"
                            />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-slate-900">{l.title}</p>
                          <p className="text-xs text-slate-500">
                            {l.vendors?.business_name ?? '—'}
                            {l.location_city ? ` · ${l.location_city}` : ''}
                          </p>
                          {it.am_note && (
                            <p className="mt-1 text-xs italic text-slate-600">{it.am_note}</p>
                          )}
                          {l.base_price != null && (
                            <p className="mt-1 text-sm font-medium text-[#2563EB]">
                              ₹ {l.base_price.toLocaleString('en-IN')}
                              {l.price_unit ? ` / ${l.price_unit.replace('_', ' ')}` : ''}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              l.module === 'events'
                                ? `/book/event/${l.id}`
                                : `/book/space/${l.id}`,
                            )
                          }
                          className="rounded-md bg-[#2563eb] px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                        >
                          Book
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </>
          )}
        </div>
      </MogzuCorporateScrollSurface>
    </div>
  )
}
