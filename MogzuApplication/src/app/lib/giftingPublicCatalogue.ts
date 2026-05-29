/**
 * Maps Supabase public gifting listings into Gifting Shop product card shapes.
 */
import type { Product } from '@/app/data/apparelProducts'
import type { BagProduct } from '@/app/data/bagsProducts'
import type { TechProduct } from '@/app/data/techProducts'
import type { WellnessProduct } from '@/app/data/wellnessProducts'
import type { StationeryProduct } from '@/app/data/stationeryProducts'
import { listPublicListings, type PublicListingCard } from '@/lib/publicCatalogue'
import { storageService } from '@/lib/storage'
import {
  approvedGiftListingToApparelProduct,
  approvedGiftListingToPartnerBagProduct,
  approvedGiftListingToPartnerStationeryProduct,
  approvedGiftListingToPartnerTechProduct,
  approvedGiftListingToPartnerWellnessProduct,
  inferPartnerGiftCategoryAndSubcategory,
  type CorporateApprovedListing,
  type PartnerGiftCategoryId,
} from '@/app/lib/corporateApprovedListingsStorage'

export type LiveGiftingByCategory = {
  apparel: Product[]
  bags: BagProduct[]
  tech: TechProduct[]
  stationery: StationeryProduct[]
  health: WellnessProduct[]
}

export type GiftingCatalogueProduct =
  | Product
  | BagProduct
  | TechProduct
  | StationeryProduct
  | WellnessProduct

export function publicListingCardToApproved(card: PublicListingCard): CorporateApprovedListing {
  return {
    listingId: card.id,
    onboardingId: '',
    businessName: card.vendor_name ?? 'Mogzu vendor',
    vendorEmail: undefined,
    listingTitle: card.title,
    shortDescription: card.description ?? '',
    location: '',
    listingProfileIds: 'gift',
    submittedAt: Date.now(),
    approvedAt: Date.now(),
  }
}

function withCoverImage<T extends { image: string; images?: string[] }>(
  product: T,
  card: PublicListingCard,
): T {
  if (!card.cover_image_path) return product
  const url = storageService.listingImages.getUrl(card.cover_image_path)
  const images = [url, ...(product.images ?? []).filter((i) => i !== url)]
  return { ...product, image: url, images }
}

export function mapPublicListingToGiftProduct(card: PublicListingCard): GiftingCatalogueProduct {
  const approved = publicListingCardToApproved(card)
  const { category } = inferPartnerGiftCategoryAndSubcategory(approved)

  let product: GiftingCatalogueProduct
  switch (category) {
    case 'bags':
      product = approvedGiftListingToPartnerBagProduct(approved)
      break
    case 'tech':
      product = approvedGiftListingToPartnerTechProduct(approved)
      break
    case 'stationery':
      product = approvedGiftListingToPartnerStationeryProduct(approved)
      break
    case 'health':
      product = approvedGiftListingToPartnerWellnessProduct(approved)
      break
    case 'apparel':
    default:
      product = approvedGiftListingToApparelProduct(approved)
      break
  }

  return withCoverImage(product, card)
}

export function groupLiveGiftingListings(cards: PublicListingCard[]): LiveGiftingByCategory {
  const acc: LiveGiftingByCategory = {
    apparel: [],
    bags: [],
    tech: [],
    stationery: [],
    health: [],
  }

  for (const card of cards) {
    if (card.module !== 'gifting') continue
    const approved = publicListingCardToApproved(card)
    const { category } = inferPartnerGiftCategoryAndSubcategory(approved)
    const product = mapPublicListingToGiftProduct(card)
    pushByCategory(acc, category, product)
  }

  return acc
}

function pushByCategory(
  acc: LiveGiftingByCategory,
  category: PartnerGiftCategoryId,
  product: GiftingCatalogueProduct,
): void {
  switch (category) {
    case 'bags':
      acc.bags.push(product as BagProduct)
      break
    case 'tech':
      acc.tech.push(product as TechProduct)
      break
    case 'stationery':
      acc.stationery.push(product as StationeryProduct)
      break
    case 'health':
      acc.health.push(product as WellnessProduct)
      break
    case 'apparel':
    default:
      acc.apparel.push(product as Product)
      break
  }
}

/** Live / partner rows first; dedupe by mogzuListingId when present. */
export function dedupeGiftProducts<T extends { id: number; mogzuListingId?: string }>(
  ...lists: T[][]
): T[] {
  const out: T[] = []
  const seenListingIds = new Set<string>()
  const seenNumericIds = new Set<number>()

  for (const list of lists) {
    for (const item of list) {
      if (item.mogzuListingId) {
        if (seenListingIds.has(item.mogzuListingId)) continue
        seenListingIds.add(item.mogzuListingId)
        out.push(item)
        continue
      }
      if (seenNumericIds.has(item.id)) continue
      seenNumericIds.add(item.id)
      out.push(item)
    }
  }

  return out
}

export async function fetchLiveGiftingCatalogue(): Promise<{
  data: PublicListingCard[]
  error: string | null
}> {
  return listPublicListings({ module: 'gifting', limit: 48 })
}
