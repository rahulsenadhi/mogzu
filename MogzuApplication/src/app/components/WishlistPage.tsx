import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { ArrowLeft, Heart, Loader2, Trash2 } from 'lucide-react'
import { SharedHeader } from './layouts/SharedHeader'
import { SharedSidebar } from './layouts/SharedSidebar'
import { MogzuCorporateScrollSurface } from './layouts/MogzuCorporateScrollSurface'
import { useAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import { storageService } from '@/lib/storage'
import type { Listing, ListingImage, Vendor, Wishlist } from '@/lib/database.types'

type Row = Wishlist & {
  listings:
    | (Listing & {
        listing_images: ListingImage[]
        vendors: Pick<Vendor, 'business_name'> | null
      })
    | null
}

export default function WishlistPage() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const load = useCallback(async () => {
    if (!profile) return
    setLoading(true)
    const { data } = await db.wishlists.listByUser(profile.id)
    setRows((data ?? []) as Row[])
    setLoading(false)
  }, [profile])

  useEffect(() => {
    load()
  }, [load])

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const handleRemove = async (listingId: string) => {
    if (!profile) return
    await db.wishlists.remove(profile.id, listingId)
    load()
  }

  const handleCompare = () => {
    if (selected.size < 2) return
    const ids = Array.from(selected).slice(0, 4).join(',')
    navigate(`/compare?ids=${ids}`)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#FFFDF9]">
      <SharedSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <SharedHeader onMobileMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <MogzuCorporateScrollSurface className="py-8">
          <div className="mx-auto max-w-4xl px-8">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800"
            >
              <ArrowLeft className="size-4" />
              Back
            </button>

            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="flex items-center gap-2 text-2xl font-bold text-[#0e1e3f]">
                  <Heart className="size-5" />
                  Wishlist
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Saved listings. Pick 2–4 to compare side by side.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCompare}
                disabled={selected.size < 2}
                className="rounded-md bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Compare ({selected.size})
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-14">
                <Loader2 className="size-6 animate-spin text-slate-400" />
              </div>
            ) : rows.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
                <Heart className="mx-auto mb-2 size-10 text-slate-300" />
                <p className="text-sm text-slate-500">
                  No saved listings yet. Tap the heart icon on any listing to save it.
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {rows.map((w) => {
                  const l = w.listings
                  if (!l) return null
                  const cover = l.listing_images?.[0]
                  const isSelected = selected.has(l.id)
                  return (
                    <li
                      key={l.id}
                      className={`flex flex-col gap-3 rounded-2xl border bg-white p-4 shadow-sm sm:flex-row sm:items-center ${
                        isSelected ? 'border-[#2563eb]' : 'border-slate-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggle(l.id)}
                        disabled={!isSelected && selected.size >= 4}
                        className="size-4 shrink-0"
                      />
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
                          {l.vendors?.business_name ?? '—'}{' '}
                          {l.location_city ? `· ${l.location_city}` : ''}
                        </p>
                        {l.base_price != null && (
                          <p className="mt-1 text-sm font-medium text-[#2563EB]">
                            ₹ {l.base_price.toLocaleString('en-IN')}
                            {l.price_unit ? ` / ${l.price_unit.replace('_', ' ')}` : ''}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemove(l.id)}
                        className="rounded-md p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </MogzuCorporateScrollSurface>
      </div>
    </div>
  )
}
