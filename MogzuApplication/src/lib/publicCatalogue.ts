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
  pricing_mode: string | null
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

// Backed by the existing listings select policy widened in
// migration 20260518000003 to admit anon when public_visible = TRUE.
export async function listPublicListings(
  filters: PublicFilters = {},
): Promise<{ data: PublicListingCard[]; error: string | null }> {
  let q = supabase
    .from('listings')
    .select(
      `id, module, title, description, category_id, base_price, pricing_mode,
       vendor_id, is_mogzu_direct,
       category:listing_categories(name),
       vendor:vendors_public!vendor_id(business_name),
       images:listing_images(image_path, display_order)`,
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
  if (error) return { data: [], error: error.message }

  const rows = (data ?? []).map((r: any) => {
    const images: { image_path: string; display_order: number }[] = r.images ?? []
    images.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
    return {
      id: r.id,
      module: r.module,
      title: r.title,
      description: r.description,
      category_id: r.category_id,
      category_name: r.category?.name ?? null,
      cover_image_path: images[0]?.image_path ?? null,
      base_price: r.base_price,
      pricing_mode: r.pricing_mode,
      vendor_id: r.vendor_id,
      vendor_name: r.vendor?.business_name ?? null,
      rating_avg: null,
      rating_count: 0,
      is_mogzu_direct: r.is_mogzu_direct ?? false,
    } satisfies PublicListingCard
  })

  return { data: rows, error: null }
}

export async function getPublicListing(
  id: string,
): Promise<{ data: PublicListingCard | null; error: string | null }> {
  const { data, error } = await listPublicListings({ limit: 1 })
  if (error) return { data: null, error }
  return { data: data.find((r) => r.id === id) ?? null, error: null }
}

export const PUBLIC_MODULES: { value: ModuleId; label: string }[] = [
  { value: 'events', label: 'Events' },
  { value: 'gifting', label: 'Gifting' },
  { value: 'spacex_coworking', label: 'D-Space — Coworking' },
  { value: 'spacex_stay', label: 'D-Space — Stay' },
]
