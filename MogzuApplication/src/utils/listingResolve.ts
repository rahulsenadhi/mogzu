import { QA_IMAGES } from '@/app/lib/qaImagery';
import { getMergedCatalogue } from './catalogueUtils';
import type { CatalogueItem } from './catalogueTypes';
import { getEventServiceCatalogueItems } from './eventServiceCatalogue';

/** Full merged catalogue + event service seeds (svc-*). */
export function getFullCorporateListingCatalogue(): CatalogueItem[] {
  return [...getMergedCatalogue(), ...getEventServiceCatalogueItems()];
}

const ACTIVITY_CARD_IMAGES = [
  QA_IMAGES.eventCard[0],
  QA_IMAGES.eventCard[1],
  QA_IMAGES.eventCard[2],
  QA_IMAGES.eventCard[3],
  QA_IMAGES.eventCard[4],
];

/** Demo activity rows (ids 1–9) aligned with `EventActivityPage` routes. */
function activitySeedToCatalogue(id: number): CatalogueItem | null {
  if (id < 1 || id > 9 || !Number.isInteger(id)) return null;
  const image = ACTIVITY_CARD_IMAGES[(id - 1) % ACTIVITY_CARD_IMAGES.length];
  return {
    id: String(id),
    source_type: 'mogzu_direct',
    module: 'events',
    category: 'Corporate Workshops',
    name: 'The Business of Personal Training',
    tagline: 'Elevate Your Personal Training Skills',
    description: 'Elevate Your Personal Training Skills',
    photos: [image],
    pricing_type: 'transparent',
    price_type: 'flat',
    base_price: 15000,
    price_label: '₹15,000',
    is_mogzu_direct: true,
    is_available: true,
    rating: 4.5,
    city: 'Mumbai',
    tags: ['activity'],
  };
}

export function findCatalogueItemById(id: string): CatalogueItem | undefined {
  const merged = getFullCorporateListingCatalogue().find((x) => x.id === id);
  if (merged) return merged;
  const n = Number(id);
  if (!Number.isNaN(n) && String(n) === id) {
    const seed = activitySeedToCatalogue(n);
    if (seed) return seed;
  }
  return undefined;
}

export function isServiceListingId(id: string): boolean {
  return id.startsWith('svc-');
}
