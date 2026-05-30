import type { Listing, ListingImage } from '@/lib/database.types'
import type { CatalogueItem } from '@/utils/catalogueTypes'
import { storageService } from '@/lib/storage'
import { QA_IMAGES } from '@/app/lib/qaImagery'

/**
 * Map a Supabase events `Listing` (with embedded images) to the UI `CatalogueItem`
 * shape used across the events discovery surfaces (EventsPage, EventsHomePage).
 * Shared so both pages stay in sync instead of copy-pasting the mapping.
 */
export function listingToEventsCatalogueItem(
  l: Listing & { listing_images?: ListingImage[] },
): CatalogueItem {
  const meta = (l.metadata ?? {}) as Record<string, unknown>
  const imgs = (l.listing_images ?? [])
    .slice()
    .sort((a, b) => a.display_order - b.display_order)
    .map((img) => storageService.listingImages.getUrl(img.storage_path))
  const pricing_type: CatalogueItem['pricing_type'] =
    l.pricing_type === 'offer'
      ? 'offer_price'
      : l.pricing_type === 'request_for_price'
        ? 'request_for_price'
        : 'transparent'
  const rawTags = meta.tags
  const tags = Array.isArray(rawTags) ? rawTags.filter((t): t is string => typeof t === 'string') : []
  const category = typeof meta.category === 'string' ? meta.category : 'Events'
  const vendorName = typeof meta.vendor_name === 'string' ? meta.vendor_name : undefined
  return {
    id: l.id,
    source_type: l.is_mogzu_direct ? 'mogzu_direct' : 'vendor',
    vendor_id: l.vendor_id ?? undefined,
    vendor_name: vendorName,
    module: 'events',
    category,
    name: l.title,
    tagline: typeof meta.tagline === 'string' ? meta.tagline : undefined,
    description: l.description ?? '',
    photos: imgs.length > 0 ? imgs : [QA_IMAGES.eventCard[0]],
    pricing_type,
    price_type: l.price_unit ?? undefined,
    base_price: l.base_price ?? undefined,
    starting_price: typeof meta.starting_price === 'number' ? meta.starting_price : undefined,
    price_label: l.base_price != null ? `₹${l.base_price.toLocaleString('en-IN')}` : undefined,
    is_mogzu_direct: l.is_mogzu_direct,
    is_available: l.status === 'active',
    rating: typeof meta.rating === 'number' ? meta.rating : undefined,
    city: l.location_city ?? undefined,
    tags,
  }
}
