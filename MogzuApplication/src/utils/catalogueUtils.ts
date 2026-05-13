import type { MogzuDirectListing, MogzuListingModule, PartnerListing, PartnerUser } from '@/app/lib/mogzuDomain';
import {
  loadMogzuDirectListings,
  loadPartnerListings,
  loadPartnerUsers,
} from '@/app/lib/mogzuDomain';
import type { CatalogueItem } from './catalogueTypes';

export type { CatalogueItem } from './catalogueTypes';

/** Optional future-facing keys; merged with live `mogzu_direct_listings` / partner data when empty. */
export const MOGZU_VENDOR_LISTINGS_KEY = 'mogzu_vendor_listings' as const;
export const MOGZU_DIRECT_CATALOGUE_KEY = 'mogzu_direct_catalogue' as const;

function safeParseJsonArray(raw: string | null): unknown[] {
  if (!raw) return [];
  try {
    const p = JSON.parse(raw) as unknown;
    return Array.isArray(p) ? p : [];
  } catch {
    return [];
  }
}

function isModule(m: string): m is MogzuListingModule {
  return m === 'dspace' || m === 'gifting' || m === 'events';
}

function mapPricingModeToCatalogue(
  mode: MogzuDirectListing['pricing_mode'] | PartnerListing['pricing_mode']
): CatalogueItem['pricing_type'] {
  if (mode === 'fixed') return 'transparent';
  if (mode === 'negotiable') return 'offer_price';
  return 'request_for_price';
}

function priceLabelFromListing(
  price: number,
  priceUnit: string,
  mode: MogzuDirectListing['pricing_mode'] | PartnerListing['pricing_mode']
): string {
  if (mode === 'on_request') return 'Price on request';
  if (mode === 'negotiable')
    return `From ₹${price.toLocaleString('en-IN')} / ${priceUnit}`;
  return `₹${price.toLocaleString('en-IN')} / ${priceUnit}`;
}

export function mapMogzuDirectToCatalogue(l: MogzuDirectListing): CatalogueItem {
  const pt = mapPricingModeToCatalogue(l.pricing_mode);
  return {
    id: l.id,
    source_type: 'mogzu_direct',
    module: l.module,
    category: l.category,
    name: l.title,
    tagline: l.description_short?.trim() ? l.description_short.slice(0, 160) : undefined,
    description: l.description_long?.trim() || l.description_short,
    photos: [...l.images],
    videos: Array.isArray((l as { videos?: unknown }).videos)
      ? ((l as { videos?: unknown[] }).videos ?? []).filter((x): x is string => typeof x === 'string')
      : [],
    pricing_type: pt,
    price_type: l.price_type,
    base_price: l.pricing_mode === 'on_request' ? undefined : l.price,
    starting_price: l.starting_price,
    min_acceptable_offer: l.min_acceptable_offer,
    offer_validity_hours: l.offer_validity_hours,
    response_time_hours: l.response_time_hours,
    add_ons: l.add_ons,
    price_label: priceLabelFromListing(l.price, l.price_unit, l.pricing_mode),
    is_mogzu_direct: true,
    is_available: l.status === 'active',
    vendor_name: 'Mogzu',
    tags: [],
  };
}

function mapPartnerToCatalogue(l: PartnerListing, partnerNameById: Map<string, string>): CatalogueItem {
  const pt = mapPricingModeToCatalogue(l.pricing_mode);
  const priceLabel =
    l.status === 'pending_review'
      ? 'Under review'
      : priceLabelFromListing(l.price, l.price_unit, l.pricing_mode);
  return {
    id: l.id,
    source_type: 'vendor',
    vendor_id: l.partner_id,
    vendor_name: partnerNameById.get(l.partner_id) || 'Partner',
    module: l.module,
    category: l.category,
    name: l.title,
    tagline: l.description_short?.trim() ? l.description_short.slice(0, 160) : undefined,
    description: l.description_long?.trim() || l.description_short,
    photos: [...l.images],
    videos: [...l.videos],
    pricing_type: pt,
    price_type: l.price_type,
    base_price: l.pricing_mode === 'on_request' ? undefined : l.price,
    starting_price: l.starting_price,
    min_acceptable_offer: l.min_acceptable_offer,
    offer_validity_hours: l.offer_validity_hours,
    response_time_hours: l.response_time_hours,
    add_ons: l.add_ons,
    price_label: priceLabel,
    is_mogzu_direct: false,
    is_available: l.status === 'active' || l.status === 'pending_review',
    tags: [],
  };
}

function rowActive(status: unknown): boolean {
  return status === 'active' || status === 'Active';
}

/** Map loosely-typed JSON from `mogzu_direct_catalogue` into `CatalogueItem`. */
function normalizeDirectCatalogueRow(d: Record<string, unknown>): CatalogueItem | null {
  const id = typeof d.id === 'string' ? d.id : '';
  if (!id) return null;
  const modRaw = typeof d.module === 'string' ? d.module : 'gifting';
  const module = isModule(modRaw) ? modRaw : 'gifting';
  const photos = Array.isArray(d.photos)
    ? d.photos.filter((x): x is string => typeof x === 'string')
    : Array.isArray(d.images)
      ? (d.images as unknown[]).filter((x): x is string => typeof x === 'string')
      : [];
  const videos = Array.isArray(d.videos)
    ? d.videos.filter((x): x is string => typeof x === 'string')
    : [];
  const name = typeof d.name === 'string' ? d.name : typeof d.title === 'string' ? d.title : 'Untitled';
  const description =
    typeof d.description === 'string'
      ? d.description
      : typeof d.description_long === 'string'
        ? d.description_long
        : '';
  const pt =
    d.pricing_type === 'fixed' ||
    d.pricing_type === 'per_head' ||
    d.pricing_type === 'package' ||
    d.pricing_type === 'custom_quote' ||
    d.pricing_type === 'transparent' ||
    d.pricing_type === 'offer_price' ||
    d.pricing_type === 'request_for_price'
      ? d.pricing_type
      : 'custom_quote';
  const base =
    typeof d.base_price === 'number' && !Number.isNaN(d.base_price)
      ? d.base_price
      : typeof d.price === 'number' && !Number.isNaN(d.price)
        ? d.price
        : undefined;
  const price_label =
    typeof d.price_label === 'string'
      ? d.price_label
      : base != null
        ? `₹${base.toLocaleString('en-IN')}`
        : 'Price on request';
  return {
    id,
    source_type: 'mogzu_direct',
    module,
    category: typeof d.category === 'string' ? d.category : 'General',
    name,
    tagline: typeof d.tagline === 'string' ? d.tagline : undefined,
    description,
    photos,
    videos,
    pricing_type: pt,
    price_type:
      d.price_type === 'per_person' || d.price_type === 'flat' || d.price_type === 'per_hour' || d.price_type === 'package'
        ? d.price_type
        : undefined,
    base_price: base,
    starting_price: typeof d.starting_price === 'number' ? d.starting_price : undefined,
    min_acceptable_offer: typeof d.min_acceptable_offer === 'number' ? d.min_acceptable_offer : undefined,
    offer_validity_hours: typeof d.offer_validity_hours === 'number' ? d.offer_validity_hours : undefined,
    response_time_hours: typeof d.response_time_hours === 'number' ? d.response_time_hours : undefined,
    add_ons: Array.isArray(d.add_ons)
      ? d.add_ons
          .filter((x): x is Record<string, unknown> => Boolean(x) && typeof x === 'object')
          .map((x) => ({
            name: typeof x.name === 'string' ? x.name : 'Add-on',
            price: typeof x.price === 'number' ? x.price : undefined,
          }))
      : undefined,
    price_label,
    is_mogzu_direct: true,
    is_available: d.is_available !== false && rowActive(d.status),
    vendor_name: typeof d.vendor_name === 'string' ? d.vendor_name : 'Mogzu',
    rating: typeof d.rating === 'number' ? d.rating : undefined,
    city: typeof d.city === 'string' ? d.city : undefined,
    tags: Array.isArray(d.tags) ? d.tags.filter((x): x is string => typeof x === 'string') : [],
  };
}

/** Map loosely-typed JSON from `mogzu_vendor_listings` into `CatalogueItem`. */
function normalizeVendorCatalogueRow(v: Record<string, unknown>): CatalogueItem | null {
  const id = typeof v.id === 'string' ? v.id : '';
  if (!id) return null;
  const modRaw = typeof v.module === 'string' ? v.module : 'gifting';
  const module = isModule(modRaw) ? modRaw : 'gifting';
  const photos = Array.isArray(v.photos)
    ? v.photos.filter((x): x is string => typeof x === 'string')
    : Array.isArray(v.images)
      ? (v.images as unknown[]).filter((x): x is string => typeof x === 'string')
      : [];
  const videos = Array.isArray(v.videos)
    ? v.videos.filter((x): x is string => typeof x === 'string')
    : [];
  const name = typeof v.name === 'string' ? v.name : typeof v.title === 'string' ? v.title : 'Untitled';
  const description =
    typeof v.description === 'string'
      ? v.description
      : typeof v.description_long === 'string'
        ? v.description_long
        : '';
  const pt =
    v.pricing_type === 'fixed' ||
    v.pricing_type === 'per_head' ||
    v.pricing_type === 'package' ||
    v.pricing_type === 'custom_quote' ||
    v.pricing_type === 'transparent' ||
    v.pricing_type === 'offer_price' ||
    v.pricing_type === 'request_for_price'
      ? v.pricing_type
      : 'custom_quote';
  const base =
    typeof v.base_price === 'number' && !Number.isNaN(v.base_price)
      ? v.base_price
      : typeof v.price === 'number' && !Number.isNaN(v.price)
        ? v.price
        : undefined;
  const price_label =
    typeof v.price_label === 'string'
      ? v.price_label
      : base != null
        ? `₹${base.toLocaleString('en-IN')}`
        : 'Price on request';
  return {
    id,
    source_type: 'vendor',
    vendor_id: typeof v.vendor_id === 'string' ? v.vendor_id : undefined,
    vendor_name: typeof v.vendor_name === 'string' ? v.vendor_name : 'Vendor',
    module,
    category: typeof v.category === 'string' ? v.category : 'General',
    name,
    tagline: typeof v.tagline === 'string' ? v.tagline : undefined,
    description,
    photos,
    videos,
    pricing_type: pt,
    price_type:
      v.price_type === 'per_person' || v.price_type === 'flat' || v.price_type === 'per_hour' || v.price_type === 'package'
        ? v.price_type
        : undefined,
    base_price: base,
    starting_price: typeof v.starting_price === 'number' ? v.starting_price : undefined,
    min_acceptable_offer: typeof v.min_acceptable_offer === 'number' ? v.min_acceptable_offer : undefined,
    offer_validity_hours: typeof v.offer_validity_hours === 'number' ? v.offer_validity_hours : undefined,
    response_time_hours: typeof v.response_time_hours === 'number' ? v.response_time_hours : undefined,
    add_ons: Array.isArray(v.add_ons)
      ? v.add_ons
          .filter((x): x is Record<string, unknown> => Boolean(x) && typeof x === 'object')
          .map((x) => ({
            name: typeof x.name === 'string' ? x.name : 'Add-on',
            price: typeof x.price === 'number' ? x.price : undefined,
          }))
      : undefined,
    price_label,
    is_mogzu_direct: false,
    is_available: v.is_available !== false && rowActive(v.status),
    rating: typeof v.rating === 'number' ? v.rating : undefined,
    city: typeof v.city === 'string' ? v.city : undefined,
    tags: Array.isArray(v.tags) ? v.tags.filter((x): x is string => typeof x === 'string') : [],
  };
}

/**
 * Merges Mogzu Direct + vendor-network listings into one list (Direct first).
 * Reads `mogzu_direct_catalogue` and `mogzu_vendor_listings` when non-empty;
 * otherwise maps from `mogzu_direct_listings` and `partner_listings` (existing app data).
 */
export function getMergedCatalogue(): CatalogueItem[] {
  if (typeof localStorage === 'undefined') return [];

  const vendorRaw = safeParseJsonArray(localStorage.getItem(MOGZU_VENDOR_LISTINGS_KEY));
  const directRaw = safeParseJsonArray(localStorage.getItem(MOGZU_DIRECT_CATALOGUE_KEY));

  let direct: CatalogueItem[] = [];
  if (directRaw.length > 0) {
    direct = directRaw
      .filter((item) => item && typeof item === 'object' && rowActive((item as { status?: unknown }).status))
      .map((item) => normalizeDirectCatalogueRow(item as Record<string, unknown>))
      .filter((x): x is CatalogueItem => Boolean(x));
  } else {
    direct = loadMogzuDirectListings()
      .filter((l) => l.status === 'active')
      .map(mapMogzuDirectToCatalogue);
  }

  let vendors: CatalogueItem[] = [];
  if (vendorRaw.length > 0) {
    vendors = vendorRaw
      .filter((item) => item && typeof item === 'object' && rowActive((item as { status?: unknown }).status))
      .map((item) => normalizeVendorCatalogueRow(item as Record<string, unknown>))
      .filter((x): x is CatalogueItem => Boolean(x));
  } else {
    const users = loadPartnerUsers();
    const partnerNameById = new Map(users.map((u: PartnerUser) => [u.id, u.business_name?.trim() || u.name || 'Partner']));
    vendors = loadPartnerListings()
      .filter((l) => l.status === 'active' || l.status === 'pending_review')
      .map((l) => mapPartnerToCatalogue(l, partnerNameById));
  }

  return [...direct, ...vendors];
}
