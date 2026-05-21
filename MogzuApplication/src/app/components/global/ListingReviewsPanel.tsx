// Listing reviews panel — shown on event/space/gifting detail pages.
// Reads approved reviews via db.reviews.listByListing.
//
// Design-system/MASTER.md §7. Solid card variant.

import { useCallback, useEffect, useState } from 'react'
import { Loader2, Star } from 'lucide-react'
import { db } from '@/lib/db'
import type { Review } from '@/lib/database.types'

interface ListingReviewsPanelProps {
  listingId: string
  initialLimit?: number
  className?: string
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function Stars({ rating }: { rating: number }) {
  return (
    <span
      className="inline-flex items-center gap-0.5"
      aria-label={`${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className="size-3.5"
          fill={n <= rating ? '#FFCC47' : 'transparent'}
          stroke={n <= rating ? 'none' : '#CBD5E1'}
          strokeWidth={1.5}
          aria-hidden
        />
      ))}
    </span>
  )
}

export function ListingReviewsPanel({
  listingId,
  initialLimit = 5,
  className,
}: ListingReviewsPanelProps) {
  const [rows, setRows] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)

  const load = useCallback(async () => {
    if (!listingId) return
    if (!UUID_RE.test(listingId)) {
      // Mock id (e.g. numeric seed data) — skip Supabase, render empty state.
      setRows([])
      setLoading(false)
      return
    }
    setLoading(true)
    const { data } = await db.reviews.listByListing(listingId)
    setRows((data ?? []) as Review[])
    setLoading(false)
  }, [listingId])

  useEffect(() => {
    load()
  }, [load])

  const visible = showAll ? rows : rows.slice(0, initialLimit)
  const hidden = rows.length - visible.length
  const avg =
    rows.length > 0
      ? rows.reduce((acc, r) => acc + (r.rating ?? 0), 0) / rows.length
      : 0

  return (
    <section
      className={
        className ??
        'bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8'
      }
    >
      <header className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#0e1e3f]">Reviews</h2>
        {rows.length > 0 && (
          <div className="inline-flex items-center gap-2 text-sm text-slate-600">
            <Stars rating={Math.round(avg)} />
            <span className="font-semibold text-[#0e1e3f]">{avg.toFixed(1)}</span>
            <span className="text-slate-400">
              ({rows.length} review{rows.length === 1 ? '' : 's'})
            </span>
          </div>
        )}
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="size-5 animate-spin text-slate-400" />
        </div>
      ) : rows.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-400">
          No reviews yet. Be the first to share an experience after your booking.
        </p>
      ) : (
        <ul>
          {visible.map((r) => (
            <li
              key={r.id}
              className="border-b border-slate-100 py-4 last:border-b-0"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Stars rating={r.rating} />
                  <span className="text-xs font-semibold text-slate-700">
                    {r.reviewer_name ?? 'Verified booker'}
                  </span>
                  {r.source === 'invite' && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                      Pre-platform review
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-500">
                  {formatDate(r.created_at)}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-700">{r.body}</p>
              {r.vendor_reply && (
                <div className="mt-3 rounded-xl bg-slate-50 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Vendor reply
                  </p>
                  <p className="mt-1 text-sm text-slate-700">{r.vendor_reply}</p>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {!showAll && hidden > 0 && (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="mt-4 inline-flex items-center text-xs font-semibold text-[#2563eb] hover:underline"
        >
          View all {rows.length} reviews
        </button>
      )}
    </section>
  )
}
