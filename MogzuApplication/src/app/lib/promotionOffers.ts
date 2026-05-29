import type { ModuleId, Promotion } from '@/lib/database.types'

export type DealCategory = 'All' | 'D Space' | 'Events' | 'Gifting'

export type CatalogDeal = {
  id: string
  source: 'supabase' | 'demo'
  category: Exclude<DealCategory, 'All'>
  title: string
  provider: string
  description: string
  discount: string
  imageUrl: string
  validUntil: string
  claimedCount: number
  highlighted?: boolean
  listingId?: string | null
}

const MODULE_IMAGES: Record<ModuleId, string> = {
  events:
    'https://images.unsplash.com/photo-1768508664411-9bef1b361224?w=1080&q=80',
  gifting:
    'https://images.unsplash.com/photo-1508899203029-1c9eb493c9bd?w=1080&q=80',
  spacex_coworking:
    'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1080&q=80',
  spacex_stay:
    'https://images.unsplash.com/photo-1690199827629-552c41f6450f?w=1080&q=80',
}

export const formatPromotionDiscount = (promo: Promotion): string => {
  switch (promo.kind) {
    case 'percent_off':
      return promo.value != null ? `${promo.value}% OFF` : 'DISCOUNT'
    case 'flat_off':
      return promo.value != null ? `₹${promo.value.toLocaleString('en-IN')} OFF` : 'SAVE'
    case 'free_addon':
      return promo.add_on_name ? `FREE ${promo.add_on_name.toUpperCase()}` : 'FREE ADD-ON'
    case 'paid_boost':
      return 'FEATURED'
    default:
      return 'OFFER'
  }
}

export const moduleToDealCategory = (module: ModuleId | null | undefined): CatalogDeal['category'] => {
  if (module === 'gifting') return 'Gifting'
  if (module === 'events') return 'Events'
  return 'D Space'
}

type PromotionRow = Promotion & {
  listings?: { title?: string | null; module?: ModuleId | null } | null
  vendors?: { business_name?: string | null } | null
}

export const mapPromotionRowToDeal = (row: PromotionRow): CatalogDeal => {
  const module = row.listings?.module ?? null
  const ends = new Date(row.ends_at)
  return {
    id: row.id,
    source: 'supabase',
    category: moduleToDealCategory(module),
    title: row.title,
    provider: row.vendors?.business_name ?? row.listings?.title ?? 'Mogzu partner',
    description: row.description ?? 'Limited-time corporate offer from a verified vendor.',
    discount: formatPromotionDiscount(row),
    imageUrl: MODULE_IMAGES[module ?? 'events'],
    validUntil: Number.isNaN(ends.getTime())
      ? row.ends_at
      : ends.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    claimedCount: row.redemptions ?? 0,
    highlighted: row.kind === 'paid_boost',
    listingId: row.listing_id,
  }
}

export const isPromotionUuid = (id: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)

/** Demo fallback when no active rows in `promotions`. */
export const DEMO_CATALOG_DEALS: CatalogDeal[] = [
  {
    id: 'demo-1',
    source: 'demo',
    category: 'D Space',
    title: '50% off monthly coworking',
    provider: 'WeWork',
    description:
      'Get half off your first month of any hot desk membership when you book for at least three months.',
    discount: '50% OFF',
    imageUrl:
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1080&q=80',
    validUntil: '31 Dec 2026',
    claimedCount: 182,
    highlighted: true,
  },
  {
    id: 'demo-2',
    source: 'demo',
    category: 'Gifting',
    title: 'Bulk corporate hampers',
    provider: 'GiftBasket Co.',
    description: 'Order 20 or more premium corporate hampers and receive an automatic 25% discount.',
    discount: '25% OFF',
    imageUrl:
      'https://images.unsplash.com/photo-1508899203029-1c9eb493c9bd?w=1080&q=80',
    validUntil: '30 Nov 2026',
    claimedCount: 96,
  },
  {
    id: 'demo-3',
    source: 'demo',
    category: 'Events',
    title: 'Free AV setup for summits',
    provider: 'Stage Masters',
    description: 'Book a full-day corporate event and get complete audio-visual setup included.',
    discount: 'FREE AV',
    imageUrl:
      'https://images.unsplash.com/photo-1768508664411-9bef1b361224?w=1080&q=80',
    validUntil: '15 Oct 2026',
    claimedCount: 64,
    highlighted: true,
  },
  {
    id: 'demo-4',
    source: 'demo',
    category: 'D Space',
    title: 'Book 3 days, get 1 free',
    provider: 'Regus Meeting Rooms',
    description: 'Book any premium meeting room for three consecutive days and get the fourth day free.',
    discount: '1 DAY FREE',
    imageUrl:
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1080&q=80',
    validUntil: '15 Dec 2026',
    claimedCount: 121,
  },
  {
    id: 'demo-5',
    source: 'demo',
    category: 'Gifting',
    title: 'Festive welcome kits combo',
    provider: 'Mogzu Store',
    description: 'Bundle of notebooks, drinkware and premium snack packs for onboarding cohorts.',
    discount: 'SAVE 30%',
    imageUrl:
      'https://images.unsplash.com/photo-1629196911514-cfd8d628a0c7?w=1080&q=80',
    validUntil: '10 Jan 2027',
    claimedCount: 44,
  },
]

export const findDemoDeal = (id: string) => DEMO_CATALOG_DEALS.find((d) => d.id === id)
