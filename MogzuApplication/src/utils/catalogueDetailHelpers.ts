import type { MogzuDirectListing, MogzuPricingMode, PartnerListing } from '@/app/lib/mogzuDomain';
import type { CatalogueItem } from './catalogueTypes';

function cataloguePricingToMogzuMode(item: CatalogueItem): MogzuPricingMode {
  if (item.pricing_type === 'fixed') return 'fixed';
  if (item.base_price == null) return 'on_request';
  return 'negotiable';
}

function cataloguePricingToPartnerMode(item: CatalogueItem): MogzuPricingMode {
  return cataloguePricingToMogzuMode(item);
}

/**
 * When a row exists in merged catalogue but not in `loadMogzuDirectListings()`, build a minimal domain row for the detail UI.
 */
export function resolveMogzuDirectDisplayListing(
  item: CatalogueItem,
  domain: MogzuDirectListing | null,
): MogzuDirectListing {
  if (domain) return domain;
  const now = new Date().toISOString();
  const pm = cataloguePricingToMogzuMode(item);
  return {
    id: item.id,
    owner_type: 'mogzu_direct',
    module: item.module,
    title: item.name,
    description_short: item.tagline ?? '',
    description_long: item.description,
    images: [...item.photos],
    videos: [...(item.videos ?? [])],
    category: item.category,
    pricing_mode: pm,
    price: item.base_price ?? 0,
    price_unit: 'unit',
    status: item.is_available ? 'active' : 'draft',
    managed_by: 'mogzu_team',
    buyer_detail: {
      amenities: [],
      portfolio_links: [],
      portfolio_captions: [],
      policies: [],
      payment_methods: [],
      payment_terms: '',
    },
    created_at: now,
    updated_at: now,
  };
}

/**
 * When a row exists in merged catalogue but not in `loadPartnerListings()`, build a minimal domain row for the detail UI.
 */
export function resolvePartnerDisplayListing(
  item: CatalogueItem,
  domain: PartnerListing | null,
): PartnerListing {
  if (domain) return domain;
  const now = new Date().toISOString();
  const pm = cataloguePricingToPartnerMode(item);
  return {
    id: item.id,
    owner_type: 'partner',
    partner_id: item.vendor_id ?? '',
    module: item.module,
    title: item.name,
    description_short: item.tagline ?? '',
    description_long: item.description,
    images: [...item.photos],
    portfolio_links: [],
    videos: [...(item.videos ?? [])],
    category: item.category,
    pricing_mode: pm,
    price: item.base_price ?? 0,
    price_unit: 'unit',
    profit_share_percentage: 0,
    status: item.is_available ? 'active' : 'draft',
    buyer_detail: {
      amenities: [],
      portfolio_links: [],
      portfolio_captions: [],
      policies: [],
      payment_methods: [],
      payment_terms: '',
    },
    created_at: now,
    updated_at: now,
  };
}
