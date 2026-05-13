/**
 * Listings approved by admin and surfaced on corporate browse/search (localStorage only).
 */
import type { Product } from '@/app/data/apparelProducts';
import { apparelProducts } from '@/app/data/apparelProducts';
import type { BagProduct } from '@/app/data/bagsProducts';
import { bagsProducts } from '@/app/data/bagsProducts';
import type { TechProduct } from '@/app/data/techProducts';
import { techProducts } from '@/app/data/techProducts';
import type { WellnessProduct } from '@/app/data/wellnessProducts';
import { wellnessProducts } from '@/app/data/wellnessProducts';
import type { StationeryProduct } from '@/app/data/stationeryProducts';
import { stationeryProducts } from '@/app/data/stationeryProducts';
export const CORPORATE_APPROVED_LISTINGS_KEY = 'mogzu_corporate_approved_listings';

export const CORPORATE_APPROVED_LISTINGS_UPDATED_EVENT = 'mogzu-corporate-approved-listings-updated';

export type CorporateApprovedListing = {
  listingId: string;
  onboardingId: string;
  businessName: string;
  vendorEmail?: string;
  listingTitle: string;
  shortDescription: string;
  location: string;
  listingProfileIds?: string;
  submittedAt: number;
  approvedAt: number;
};

function safeParse(raw: string | null): CorporateApprovedListing[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (v): v is CorporateApprovedListing =>
        v &&
        typeof v === 'object' &&
        typeof (v as CorporateApprovedListing).listingId === 'string' &&
        typeof (v as CorporateApprovedListing).listingTitle === 'string'
    );
  } catch {
    return [];
  }
}

export function loadCorporateApprovedListings(): CorporateApprovedListing[] {
  return safeParse(localStorage.getItem(CORPORATE_APPROVED_LISTINGS_KEY));
}

export function listingProfileIncludes(
  listingProfileIds: string | undefined,
  token: 'space' | 'activity' | 'gift' | 'event' | 'hey_genie'
): boolean {
  const p = (listingProfileIds || '').toLowerCase();
  return p
    .split(/[,]+/)
    .map((x) => x.trim())
    .some((x) => x === token);
}

export function approvedActivityListingToActivityRow(l: CorporateApprovedListing): {
  id: number;
  category: string;
  subcategory: string;
  description: string;
  tags: string[];
  teamSize: string;
  image: string;
  location: string;
  rating: number;
  price: string;
} {
  return {
    id: -hashListingId(l.listingId),
    category: 'Team Building',
    subcategory: l.listingTitle.slice(0, 48),
    description: l.shortDescription,
    tags: [l.businessName, 'partner listing', 'admin approved'],
    teamSize: 'On request',
    image: 'corporate team building activity group workshop',
    location: l.location,
    rating: 0,
    price: 'On request',
  };
}

function hashListingId(listingId: string): number {
  let h = 0;
  for (let i = 0; i < listingId.length; i++) h = (h * 31 + listingId.charCodeAt(i)) >>> 0;
  return 800000 + (h % 99999);
}

export type PartnerGiftCategoryId = 'apparel' | 'bags' | 'tech' | 'health' | 'stationery';

function normalizeText(l: CorporateApprovedListing): string {
  return `${l.listingTitle || ''} ${l.shortDescription || ''} ${l.location || ''}`.toLowerCase();
}

function pickByHash<T>(items: T[], hash: number): T {
  if (items.length === 0) throw new Error('pickByHash: empty items');
  return items[Math.abs(hash) % items.length];
}

export function inferPartnerGiftCategoryAndSubcategory(l: CorporateApprovedListing): { category: PartnerGiftCategoryId; subcategory: string } {
  const text = normalizeText(l);

  // Category inference priority: tech/bags/health/stationery -> apparel fallback.
  const isTech = /(power\s*bank|powerbank|charger|usb|pendrive|pendrive|speaker|earbud|earphones|bluetooth|wireless\s*charger|smart\s*bottle|laptop\s*stand|desk\s*lamp|power banks|wireless charger|tech\s*kit|techkit|smart\s*clock)/i.test(text);
  const isBags = /(bag|backpack|tote|sling|duffel|travel\s*kit|travelkit|laptop\s*(bag|sleeve)|leather|eco\s*friendly|ecofriendly|drawstring|wallet)/i.test(text);
  const isStationery = /(notebook|notebooks|diary|calendar|pen|pens|sticky\s*notes|sticky|organizer|organisers|planner|writingset|writing\s*set|leather\s*diary|desk\s*accessor)/i.test(text);
  const isHealth = /(hamper|hampers|aromatherapy|candle|candles|diffuser|herbal\s*tea|tea|yoga\s*mat|yogamats|bottle|fitness\s*band|fitnessbands|skincare|bath\s*body|body\s*set|health\s*kit|wellness)/i.test(text);

  if (isTech) {
    const sub =
      text.includes('speaker') ? 'speakers'
      : text.includes('earbud') || text.includes('earphones') ? 'earbuds'
      : text.includes('pendrive') || /\busb\b/.test(text) ? 'pendrives'
      : text.includes('wireless') ? 'wirelesschargers'
      : text.includes('smart bottle') || (text.includes('smart') && text.includes('bottle')) ? 'smartbottles'
      : text.includes('laptop stand') || (text.includes('laptop') && text.includes('stand')) ? 'laptopstands'
      : text.includes('desk lamp') || (text.includes('desk') && text.includes('lamp')) ? 'desklamps'
      : text.includes('smart clock') || (text.includes('smart') && text.includes('clock')) ? 'smartclocks'
      : text.includes('tech kit') || text.includes('techkit') || text.includes('kit') ? 'techkits'
      : 'powerbanks';
    return { category: 'tech', subcategory: sub };
  }

  if (isBags) {
    const sub =
      text.includes('backpack') ? 'backpacks'
      : text.includes('tote') ? 'tote'
      : text.includes('sling') ? 'sling'
      : text.includes('duffel') ? 'duffel'
      : text.includes('travel') ? 'travelkits'
      : text.includes('laptop') ? 'laptop'
      : text.includes('eco') || text.includes('ecofriendly') ? 'ecofriendly'
      : text.includes('leather') ? 'leather'
      : 'backpacks';
    return { category: 'bags', subcategory: sub };
  }

  if (isStationery) {
    const sub =
      text.includes('leather diary') ? 'leatherdiaries'
      : text.includes('diary') ? 'diaries'
      : text.includes('calendar') ? 'calendars'
      : text.includes('sticky') ? 'stickynotes'
      : text.includes('organizer') || text.includes('organiser') ? 'organizers'
      : text.includes('pen') ? (text.includes('metal') ? 'metalpens' : 'pens')
      : text.includes('writing set') || text.includes('writingset') ? 'writingsets'
      : text.includes('desk accessory') || text.includes('deskaccessory') ? 'deskaccessories'
      : text.includes('kit') ? 'kits'
      : 'notebooks';
    return { category: 'stationery', subcategory: sub };
  }

  if (isHealth) {
    const sub =
      text.includes('hamper') ? 'hampers'
      : text.includes('aromatherapy') ? 'aromatherapy'
      : text.includes('candle') ? 'candles'
      : text.includes('diffuser') ? 'diffusers'
      : text.includes('herbal') && text.includes('tea') ? 'herbaltea'
      : text.includes('tea') ? 'herbaltea'
      : text.includes('yoga') ? 'yogamats'
      : text.includes('fitness') && text.includes('band') ? 'fitnessbands'
      : text.includes('fitnessband') ? 'fitnessbands'
      : text.includes('skincare') ? 'skincarekits'
      : text.includes('bath') || text.includes('body') ? 'bathbodysets'
      : text.includes('bottle') ? 'bottles'
      : 'healthkits';
    return { category: 'health', subcategory: sub };
  }

  // Apparel fallback
  const sub =
    text.includes('hoodie') ? 'hoodies'
    : text.includes('jacket') ? 'jackets'
    : text.includes('cap') ? 'caps'
    : /(trouser|track pants|track\s*pants|bottom|jogger|pants)/i.test(text) ? 'bottomwear'
    : /(blazer|workwear|formal)/i.test(text) ? 'workwear'
    : /(set|kit|custom\s*set|customset)/i.test(text) ? 'customsets'
    : 'tshirts';
  return { category: 'apparel', subcategory: sub };
}

/** Map approved gift listing into a valid apparel demo product (Gifting Shop booking won't break). */
export function approvedGiftListingToApparelProduct(l: CorporateApprovedListing): Product {
  const hash = hashListingId(l.listingId);
  const { subcategory } = inferPartnerGiftCategoryAndSubcategory(l);
  const candidates = apparelProducts.filter((p) => p.subcategory === subcategory);
  const base = candidates.length ? pickByHash(candidates, hash) : pickByHash(apparelProducts, hash);

  return {
    ...base,
    id: hash,
    name: l.listingTitle,
    brand: (l.businessName || base.brand).slice(0, 40),
    description: l.shortDescription || base.description,
  };
}

export function approvedGiftListingToPartnerBagProduct(l: CorporateApprovedListing): BagProduct {
  const hash = hashListingId(l.listingId);
  const { subcategory } = inferPartnerGiftCategoryAndSubcategory(l);
  const candidates = bagsProducts.filter((p) => p.subcategory === (subcategory as any));
  const base = candidates.length ? pickByHash(candidates, hash) : pickByHash(bagsProducts, hash);

  return {
    ...base,
    id: hash,
    name: l.listingTitle,
    brand: (l.businessName || base.brand).slice(0, 60),
    description: l.shortDescription || base.description,
  };
}

export function approvedGiftListingToPartnerTechProduct(l: CorporateApprovedListing): TechProduct {
  const hash = hashListingId(l.listingId);
  const { subcategory } = inferPartnerGiftCategoryAndSubcategory(l);
  const candidates = techProducts.filter((p) => p.subcategory === (subcategory as any));
  const base = candidates.length ? pickByHash(candidates, hash) : pickByHash(techProducts, hash);

  return {
    ...base,
    id: hash,
    name: l.listingTitle,
    brand: (l.businessName || base.brand).slice(0, 60),
    description: l.shortDescription || base.description,
  };
}

export function approvedGiftListingToPartnerWellnessProduct(l: CorporateApprovedListing): WellnessProduct {
  const hash = hashListingId(l.listingId);
  const { subcategory } = inferPartnerGiftCategoryAndSubcategory(l);
  const candidates = wellnessProducts.filter((p) => p.subcategory === (subcategory as any));
  const base = candidates.length ? pickByHash(candidates, hash) : pickByHash(wellnessProducts, hash);

  return {
    ...base,
    id: hash,
    name: l.listingTitle,
    brand: (l.businessName || base.brand).slice(0, 60),
    description: l.shortDescription || base.description,
  };
}

export function approvedGiftListingToPartnerStationeryProduct(l: CorporateApprovedListing): StationeryProduct {
  const hash = hashListingId(l.listingId);
  const { subcategory } = inferPartnerGiftCategoryAndSubcategory(l);
  const candidates = stationeryProducts.filter((p) => p.subcategory === (subcategory as any));
  const base = candidates.length ? pickByHash(candidates, hash) : pickByHash(stationeryProducts, hash);

  return {
    ...base,
    id: hash,
    name: l.listingTitle,
    brand: (l.businessName || base.brand).slice(0, 60),
    description: l.shortDescription || base.description,
  };
}

export function addCorporateApprovedListingFromPending(row: {
  listingId: string;
  onboardingId: string;
  businessName: string;
  vendorEmail?: string;
  listingTitle: string;
  shortDescription: string;
  location: string;
  listingProfileIds?: string;
  submittedAt: number;
}): void {
  const existing = loadCorporateApprovedListings();
  if (existing.some((l) => l.listingId === row.listingId)) return;
  const entry: CorporateApprovedListing = {
    ...row,
    approvedAt: Date.now(),
  };
  localStorage.setItem(CORPORATE_APPROVED_LISTINGS_KEY, JSON.stringify([entry, ...existing]));
  try {
    window.dispatchEvent(new Event(CORPORATE_APPROVED_LISTINGS_UPDATED_EVENT));
  } catch {
    // ignore
  }
}
