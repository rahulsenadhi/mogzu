// Aggregate rating badge — avg + count from approved reviews.
// Canonical pattern from design-system/MASTER.md §6.
//
// Renders nothing if listing has zero approved reviews.

import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'
import { db } from '@/lib/db'

type Variant = 'overlay' | 'inline'

interface RatingBadgeProps {
  listingId: string
  variant?: Variant
  showCount?: boolean
  className?: string
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function RatingBadge({
  listingId,
  variant = 'inline',
  showCount = true,
  className,
}: RatingBadgeProps) {
  const [avg, setAvg] = useState<number | null>(null)
  const [count, setCount] = useState(0)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    if (!listingId || !UUID_RE.test(listingId)) return
    db.reviews.aggregate(listingId).then((res) => {
      if (cancelled) return
      setAvg(res.avg)
      setCount(res.count)
      setLoaded(true)
    })
    return () => {
      cancelled = true
    }
  }, [listingId])

  if (!loaded || avg == null || count === 0) return null

  if (variant === 'overlay') {
    return (
      <div
        className={
          className ??
          'px-2 py-0.5 bg-white/95 backdrop-blur-sm text-[#0e1e3f] rounded-md text-[10px] font-semibold inline-flex items-center gap-0.5 shadow-[0_6px_14px_rgba(15,23,42,0.14)]'
        }
      >
        <Star className="size-2.5" fill="#FFCC47" stroke="none" aria-hidden />
        <span aria-label={`${avg.toFixed(1)} out of 5 stars`}>{avg.toFixed(1)}</span>
        {showCount && <span className="text-slate-500">({count})</span>}
      </div>
    )
  }

  return (
    <div
      className={
        className ??
        'inline-flex items-center gap-1 text-xs font-semibold text-[#0e1e3f]'
      }
    >
      <Star className="size-3.5" fill="#FFCC47" stroke="none" aria-hidden />
      <span aria-label={`${avg.toFixed(1)} out of 5 stars`}>{avg.toFixed(1)}</span>
      {showCount && (
        <span className="font-normal text-slate-500">
          ({count} review{count === 1 ? '' : 's'})
        </span>
      )}
    </div>
  )
}
