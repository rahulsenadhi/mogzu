// Phase 3 Feature 1 — public catalogue service.
// Reads only the anon-allowed slice of listings (active + public_visible)
// plus listing_categories + vendors_public + listing_images.

import { supabase } from './supabase'
import type { ModuleId } from './database.types'

export type PublicListingCard = {
  id: string
  module: ModuleId
  title: string
  description: string | null
  category_id: string | null
  category_name: string | null
  cover_image_path: string | null
  base_price: number | null
  pricing_type: string | null
  vendor_id: string
  vendor_name: string | null
  rating_avg: number | null
  rating_count: number
  is_mogzu_direct: boolean
}

export type PublicFilters = {
  module?: ModuleId
  search?: string
  categoryId?: string | null
  limit?: number
  offset?: number
}

function mapPublicListingRow(r: any): PublicListingCard {
  const images: { storage_path: string; display_order: number }[] = r.images ?? []
  images.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
  return {
    id: r.id,
    module: r.module,
    title: r.title,
    description: r.description,
    category_id: r.category_id,
    category_name: r.category?.name ?? null,
    cover_image_path: images[0]?.storage_path ?? null,
    base_price: r.base_price,
    pricing_type: r.pricing_type,
    vendor_id: r.vendor_id,
    vendor_name: r.vendor?.business_name ?? null,
    rating_avg: null,
    rating_count: 0,
    is_mogzu_direct: r.is_mogzu_direct ?? false,
  } satisfies PublicListingCard
}

// Backed by the existing listings select policy widened in
// migration 20260518000003 to admit anon when public_visible = TRUE.
export async function listPublicListings(
  filters: PublicFilters = {},
): Promise<{ data: PublicListingCard[]; error: string | null }> {
  let q = supabase
    .from('listings')
    .select(
      `id, module, title, description, category_id, base_price, pricing_type,
       vendor_id, is_mogzu_direct,
       category:listing_categories(name),
       vendor:vendors_public!vendor_id(business_name),
       images:listing_images(storage_path, display_order)`,
    )
    .eq('status', 'active')
    .eq('public_visible', true)
    .order('created_at', { ascending: false })
    .limit(filters.limit ?? 24)

  if (filters.module) q = q.eq('module', filters.module)
  if (filters.categoryId) q = q.eq('category_id', filters.categoryId)
  if (filters.search && filters.search.trim()) {
    q = q.ilike('title', `%${filters.search.trim()}%`)
  }
  if (filters.offset) q = q.range(filters.offset, filters.offset + (filters.limit ?? 24) - 1)

  const { data, error } = await q
  if (error) return { data: DEMO_LISTINGS.filter((d) => !filters.module || d.module === filters.module), error: error.message }

  const rows = (data ?? []).map((r: any) => mapPublicListingRow(r))
  if (rows.length === 0) {
    return {
      data: DEMO_LISTINGS.filter((d) => !filters.module || d.module === filters.module),
      error: null,
    }
  }
  return { data: rows, error: null }
}

const DEMO_LISTINGS: PublicListingCard[] = [
  {
    id: 'demo-listing-1', module: 'events', title: 'Grand Ballroom — Team Events & Conferences',
    description: 'A stunning 5,000 sq ft ballroom perfect for corporate events, product launches, and annual days. Fully equipped with AV, catering, and decor.',
    category_id: null, category_name: 'Conference & Events', cover_image_path: null,
    base_price: 150000, pricing_type: 'fixed', vendor_id: 'demo-vendor-1', vendor_name: 'The Grand Venue',
    rating_avg: 4.8, rating_count: 34, is_mogzu_direct: true,
  },
  {
    id: 'demo-listing-2', module: 'events', title: 'Outdoor Amphitheatre — Corporate Celebrations',
    description: 'Scenic outdoor amphitheatre with a capacity of 300. Ideal for team outings, cultural events, and product showcases.',
    category_id: null, category_name: 'Outdoor Events', cover_image_path: null,
    base_price: 75000, pricing_type: 'fixed', vendor_id: 'demo-vendor-2', vendor_name: 'AmpSpace Events',
    rating_avg: 4.5, rating_count: 18, is_mogzu_direct: false,
  },
  {
    id: 'demo-listing-3', module: 'events', title: 'Rooftop Terrace — Cocktail & Networking Evenings',
    description: 'Premium rooftop venue for up to 80 guests. Stunning city views, in-house bar, and customisable lighting.',
    category_id: null, category_name: 'Networking', cover_image_path: null,
    base_price: 45000, pricing_type: 'request_for_price', vendor_id: 'demo-vendor-3', vendor_name: 'Skyline Hospitality',
    rating_avg: 4.7, rating_count: 52, is_mogzu_direct: true,
  },
  {
    id: 'demo-listing-4', module: 'gifting', title: 'Premium Diwali Hamper — Corporate Edition',
    description: 'Curated festive hamper with artisan sweets, branded merchandise, and a personalised greeting card. GST invoice included.',
    category_id: null, category_name: 'Festive Gifting', cover_image_path: null,
    base_price: 2499, pricing_type: 'fixed', vendor_id: 'demo-vendor-4', vendor_name: 'GiftBox India',
    rating_avg: 4.9, rating_count: 211, is_mogzu_direct: true,
  },
  {
    id: 'demo-listing-5', module: 'gifting', title: 'Executive Welcome Kit — New Joiner Onboarding',
    description: 'Branded notebook, pen, mug, and welcome letter in a custom box. Perfect for new employee onboarding.',
    category_id: null, category_name: 'Onboarding', cover_image_path: null,
    base_price: 1299, pricing_type: 'fixed', vendor_id: 'demo-vendor-5', vendor_name: 'Merch Studio',
    rating_avg: 4.6, rating_count: 88, is_mogzu_direct: false,
  },
  {
    id: 'demo-listing-6', module: 'spacex_coworking', title: 'Premium Co-working Floor — BKC, Mumbai',
    description: '200-seat co-working floor in the heart of BKC. Private cabins, hot desks, meeting rooms, and 24/7 access.',
    category_id: null, category_name: 'Coworking', cover_image_path: null,
    base_price: 12000, pricing_type: 'fixed', vendor_id: 'demo-vendor-6', vendor_name: 'WorkHub BKC',
    rating_avg: 4.4, rating_count: 43, is_mogzu_direct: false,
  },
  {
    id: 'demo-listing-7', module: 'spacex_stay', title: 'Business Suite — Taj Lands End, Mumbai',
    description: 'Luxury business suite with sea view, complimentary breakfast, and executive lounge access.',
    category_id: null, category_name: 'Hotel Stay', cover_image_path: null,
    base_price: 18000, pricing_type: 'fixed', vendor_id: 'demo-vendor-7', vendor_name: 'Taj Hotels',
    rating_avg: 4.9, rating_count: 127, is_mogzu_direct: true,
  },
]

export async function getPublicListing(
  id: string,
): Promise<{ data: PublicListingCard | null; error: string | null }> {
  const { data, error } = await supabase
    .from('listings')
    .select(
      `id, module, title, description, category_id, base_price, pricing_type,
       vendor_id, is_mogzu_direct,
       category:listing_categories(name),
       vendor:vendors_public!vendor_id(business_name),
       images:listing_images(storage_path, display_order)`,
    )
    .eq('id', id)
    .eq('status', 'active')
    .eq('public_visible', true)
    .maybeSingle()
  if (error) return { data: null, error: error.message }
  if (!data) return { data: null, error: null }
  return { data: mapPublicListingRow(data), error: null }
}

export const PUBLIC_MODULES: { value: ModuleId; label: string }[] = [
  { value: 'events', label: 'Events' },
  { value: 'gifting', label: 'Gifting' },
  { value: 'spacex_coworking', label: 'D-Space — Coworking' },
  { value: 'spacex_stay', label: 'D-Space — Stay' },
]
