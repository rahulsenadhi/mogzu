// Reusable wishlist heart button. Canonical pattern from
// design-system/MASTER.md §5. Persists via db.wishlists.
//
// Use inside listing card image wells (position: absolute top-2 right-2)
// or beside title on detail pages (variant="inline").

import { useCallback, useEffect, useState, type MouseEvent } from 'react'
import { Heart } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { db } from '@/lib/db'

type Variant = 'overlay' | 'inline'

interface WishlistHeartProps {
  listingId: string
  variant?: Variant
  className?: string
}

// UUID v4-ish shape — used to gate real db writes vs. local-state fallback for
// mock-data surfaces that still use numeric/string ids.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const isPersistable = (id: string) => UUID_RE.test(id)

export function WishlistHeart({ listingId, variant = 'overlay', className }: WishlistHeartProps) {
  const { profile } = useAuth()
  const [saved, setSaved] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let cancelled = false
    if (!profile || !listingId) return
    if (!isPersistable(listingId)) return // mock id — leave local state
    db.wishlists.isInWishlist(profile.id, listingId).then(({ count }) => {
      if (!cancelled) setSaved((count ?? 0) > 0)
    })
    return () => {
      cancelled = true
    }
  }, [profile, listingId])

  const toggle = useCallback(
    async (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation()
      e.preventDefault()
      if (!profile || busy) return
      const wasSaved = saved
      setSaved(!wasSaved) // optimistic
      if (!isPersistable(listingId)) return // local-only on mock ids
      setBusy(true)
      const op = wasSaved
        ? db.wishlists.remove(profile.id, listingId)
        : db.wishlists.add(profile.id, listingId)
      const { error } = await op
      if (error) setSaved(wasSaved) // revert on failure
      setBusy(false)
    },
    [profile, listingId, saved, busy],
  )

  if (!profile) return null

  if (variant === 'inline') {
    return (
      <button
        type="button"
        onClick={toggle}
        aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
        aria-pressed={saved}
        className={
          className ??
          'inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50'
        }
      >
        <Heart
          className={`w-4 h-4 ${saved ? 'text-[#ff6b35] fill-[#ff6b35]' : 'text-[#878e9e]'}`}
        />
        {saved ? 'Saved' : 'Save'}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
      aria-pressed={saved}
      className={
        className ??
        'absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm flex items-center justify-center rounded-full hover:bg-white transition-all shadow-sm z-10'
      }
    >
      <Heart
        className={`w-4 h-4 ${saved ? 'text-[#ff6b35] fill-[#ff6b35]' : 'text-[#878e9e]'}`}
      />
    </button>
  )
}
