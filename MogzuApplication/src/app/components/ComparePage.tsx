import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { ArrowLeft, Loader2, Scale } from 'lucide-react'
import { SharedHeader } from './layouts/SharedHeader'
import { SharedSidebar } from './layouts/SharedSidebar'
import { MogzuCorporateScrollSurface } from './layouts/MogzuCorporateScrollSurface'
import { db } from '@/lib/db'
import { storageService } from '@/lib/storage'
import type { Listing, ListingImage, Vendor } from '@/lib/database.types'

type Detail = Listing & {
  listing_images: ListingImage[]
  vendors: Vendor | null
}

export default function ComparePage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const idsParam = params.get('ids') ?? ''
  const ids = useMemo(
    () => idsParam.split(',').filter(Boolean).slice(0, 4),
    [idsParam],
  )

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [listings, setListings] = useState<Detail[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const results = await Promise.all(ids.map((id) => db.listings.getById(id)))
    setListings(results.map((r) => r.data).filter(Boolean) as Detail[])
    setLoading(false)
  }, [ids])

  useEffect(() => {
    load()
  }, [load])

  const rows: { label: string; render: (l: Detail) => string; diff?: boolean }[] = [
    { label: 'Vendor', render: (l) => l.vendors?.business_name ?? '—' },
    { label: 'City', render: (l) => l.location_city ?? '—' },
    {
      label: 'Pricing',
      diff: true,
      render: (l) =>
        l.base_price != null
          ? `₹ ${l.base_price.toLocaleString('en-IN')}${l.price_unit ? ` / ${l.price_unit.replace('_', ' ')}` : ''}`
          : l.pricing_type,
    },
    {
      label: 'Capacity',
      diff: true,
      render: (l) =>
        l.min_capacity && l.max_capacity
          ? `${l.min_capacity}–${l.max_capacity}`
          : l.max_capacity != null
            ? `Up to ${l.max_capacity}`
            : '—',
    },
    { label: 'Module', render: (l) => l.module.replace('_', ' ') },
    { label: 'Confirmation SLA', render: (l) => `${l.confirmation_sla_hours}h` },
    { label: 'Cancellation policy', render: (l) => l.cancellation_policy ?? '—' },
  ]

  return (
    <div className="flex h-screen overflow-hidden bg-[#FFFDF9]">
      <SharedSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <SharedHeader onMobileMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <MogzuCorporateScrollSurface className="py-8">
          <div className="mx-auto max-w-6xl px-8">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800"
            >
              <ArrowLeft className="size-4" />
              Back
            </button>

            <h1 className="flex items-center gap-2 text-2xl font-bold text-[#0e1e3f]">
              <Scale className="size-5" />
              Compare listings
            </h1>
            <p className="mb-6 mt-1 text-sm text-slate-500">
              Side-by-side comparison. Differing rows are highlighted.
            </p>

            {loading ? (
              <div className="flex items-center justify-center py-14">
                <Loader2 className="size-6 animate-spin text-slate-400" />
              </div>
            ) : listings.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
                No listings selected. Append <code>?ids=&lt;uuid&gt;,&lt;uuid&gt;</code> or pick
                from wishlist.
              </p>
            ) : (
              <div className="overflow-auto rounded-2xl border border-slate-200 bg-white">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr>
                      <th className="w-40 border-b border-slate-200 bg-slate-50 px-4 py-3 text-left text-xs uppercase text-slate-500">
                        Listing
                      </th>
                      {listings.map((l) => {
                        const cover = l.listing_images?.[0]
                        return (
                          <th
                            key={l.id}
                            className="border-b border-l border-slate-100 bg-slate-50 px-4 py-3 text-left"
                          >
                            <div className="flex items-center gap-3">
                              <div className="size-12 overflow-hidden rounded-lg bg-slate-100">
                                {cover && (
                                  <img
                                    src={storageService.spaceImages.getUrl(cover.storage_path)}
                                    alt=""
                                    className="size-full object-cover"
                                  />
                                )}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900">{l.title}</p>
                                <p className="text-[11px] font-normal text-slate-500">
                                  {l.vendors?.business_name ?? '—'}
                                </p>
                              </div>
                            </div>
                          </th>
                        )
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => {
                      const values = listings.map((l) => row.render(l))
                      const allSame = values.every((v) => v === values[0])
                      const highlight = row.diff && !allSame
                      return (
                        <tr key={row.label} className={highlight ? 'bg-amber-50/40' : ''}>
                          <th className="border-b border-slate-100 px-4 py-2 text-left text-xs font-semibold text-slate-500">
                            {row.label}
                          </th>
                          {listings.map((l, i) => (
                            <td
                              key={l.id}
                              className="border-b border-l border-slate-100 px-4 py-2 text-sm"
                            >
                              {values[i]}
                            </td>
                          ))}
                        </tr>
                      )
                    })}
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500" />
                      {listings.map((l) => (
                        <td key={l.id} className="border-l border-slate-100 px-4 py-3">
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
                            Book this
                          </button>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </MogzuCorporateScrollSurface>
      </div>
    </div>
  )
}
