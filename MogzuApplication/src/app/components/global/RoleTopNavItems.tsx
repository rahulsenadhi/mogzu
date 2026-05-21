import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { useDemoRole } from '@/app/lib/demoRole'
import { getCompareIds, getWishlistIds, subscribeListingSession } from '@/app/lib/listingSessionState'

type NavItem = { label: string; to?: string; badge?: number }

export function RoleTopNavItems({ className = '' }: { className?: string }) {
  const navigate = useNavigate()
  const { activeRole } = useDemoRole()
  const [wishlistCount, setWishlistCount] = useState(() => getWishlistIds().length)
  const [compareCount, setCompareCount] = useState(() => getCompareIds().length)

  useEffect(() => {
    return subscribeListingSession(() => {
      setWishlistCount(getWishlistIds().length)
      setCompareCount(getCompareIds().length)
    })
  }, [])

  const items = useMemo<NavItem[]>(() => {
    if (activeRole === 'vendor') {
      return [
        { label: 'My Listings', to: '/vendor/listings' },
        { label: 'Create Listing', to: '/vendor/products/new' },
        { label: 'Performance', to: '/vendor/performance' },
      ]
    }
    if (activeRole === 'admin') {
      return [
        { label: 'Listings', to: '/admin/listings' },
        { label: 'Categories', to: '/admin/categories' },
        { label: 'Mogzu Direct', to: '/admin/mogzu-direct' },
      ]
    }
    return [
      { label: 'Mogzu Assistant', to: '/assistance' },
      { label: 'Saved', to: '/wishlist', badge: wishlistCount },
      { label: 'Compare', to: '/compare', badge: compareCount },
    ]
  }, [activeRole, compareCount, wishlistCount])

  const key = `${activeRole}-${wishlistCount}-${compareCount}`

  return (
    <nav className={`hidden md:flex items-center gap-4 ${className}`} aria-label="Top navigation">
      <div
        key={key}
        className="flex items-center gap-4 transition-all duration-200"
        style={{ opacity: 1, transform: 'translateY(0px)' }}
      >
        {items.map((item, idx) => (
          <button
            key={item.label}
            type="button"
            onClick={() => {
              if (!item.to) return
              navigate(item.to)
            }}
            className={`relative px-3 py-2 rounded-full text-sm font-semibold transition-all ${
              item.label === 'Mogzu Assistant'
                ? 'bg-[#2563eb] text-white hover:bg-[#1d4ed8] shadow-[0_6px_16px_rgba(37,99,235,0.32)]'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
            style={{ transitionDelay: `${idx * 50}ms` }}
          >
            {item.label}
            {item.badge ? (
              <span className="ml-2 inline-flex items-center justify-center rounded-full bg-[#EF4444] text-white text-[10px] font-bold px-1.5 min-w-[18px] h-[18px] align-middle">
                {item.badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>
    </nav>
  )
}

