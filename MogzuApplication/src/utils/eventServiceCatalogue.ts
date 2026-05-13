import { QA_IMAGES } from '@/app/lib/qaImagery';
import type { CatalogueItem } from './catalogueTypes';

/** Mirrors seeded services in `EventServiceContent` for catalogue resolution on wishlist/compare. */
const SEEDED_SERVICE_ROWS = [
  { id: 'svc-1', title: 'Executive Buffet Program', category: 'Catering', city: 'Mumbai', vendorName: 'RoyalPlatter Caterers', vendorRating: 4.8, pricingType: 'transparent' as const, priceType: 'per_person' as const, basePrice: 950, startingPrice: undefined, insured: true },
  { id: 'svc-2', title: 'Townhall AV Production Kit', category: 'Audio Visuals', city: 'Bangalore', vendorName: 'PrismWave Technologies', vendorRating: 4.6, pricingType: 'offer_price' as const, priceType: 'flat' as const, basePrice: undefined, startingPrice: 138000, insured: true },
  { id: 'svc-3', title: 'Brand Experience Decor Build', category: 'Design & Decor', city: 'Delhi', vendorName: 'AuraDecor Events', vendorRating: 4.5, pricingType: 'request_for_price' as const, priceType: 'flat' as const, basePrice: undefined, startingPrice: undefined, insured: false },
  { id: 'svc-4', title: 'Corporate Event Security Unit', category: 'Security', city: 'Hyderabad', vendorName: 'ShieldOne Security', vendorRating: 4.4, pricingType: 'transparent' as const, priceType: 'flat' as const, basePrice: 26000, startingPrice: undefined, insured: true },
  { id: 'svc-5', title: 'Delegate Shuttle Fleet', category: 'Transportation', city: 'Pune', vendorName: 'TransitPro Mobility', vendorRating: 4.7, pricingType: 'offer_price' as const, priceType: 'flat' as const, basePrice: undefined, startingPrice: 32000, insured: true },
  { id: 'svc-6', title: 'Hybrid Event App + Check-in', category: 'Technology', city: 'Chennai', vendorName: 'EventStack Tech', vendorRating: 4.5, pricingType: 'request_for_price' as const, priceType: 'flat' as const, basePrice: undefined, startingPrice: undefined, insured: true },
  { id: 'svc-7', title: 'Permit Desk & Compliance', category: 'License/Permits', city: 'Delhi', vendorName: 'PermitBridge Advisors', vendorRating: 4.3, pricingType: 'request_for_price' as const, priceType: 'flat' as const, basePrice: undefined, startingPrice: undefined, insured: false },
];

function priceLabel(row: (typeof SEEDED_SERVICE_ROWS)[number]): string {
  if (row.pricingType === 'request_for_price') return 'Price on request';
  if (row.pricingType === 'offer_price') return `From ₹${(row.startingPrice ?? 0).toLocaleString('en-IN')} / event`;
  return `₹${(row.basePrice ?? 0).toLocaleString('en-IN')} / ${row.priceType === 'per_person' ? 'person' : 'event'}`;
}

export function getEventServiceCatalogueItems(): CatalogueItem[] {
  return SEEDED_SERVICE_ROWS.map((row) => ({
    id: row.id,
    source_type: 'vendor' as const,
    vendor_name: row.vendorName,
    module: 'events',
    category: row.category,
    name: row.title,
    description: `${row.title} — ${row.category} in ${row.city}.`,
    photos: [QA_IMAGES.serviceCard],
    pricing_type: row.pricingType,
    price_type: row.priceType,
    base_price: row.basePrice,
    starting_price: row.startingPrice,
    price_label: priceLabel(row),
    is_mogzu_direct: false,
    is_available: true,
    rating: row.vendorRating,
    city: row.city,
    tags: ['service'],
  }));
}
