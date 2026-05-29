import { db } from '@/lib/db'
import type { Listing, ListingAddOn, ListingImage } from '@/lib/database.types'

export function uuidToNumber(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) h = ((h << 5) - h + id.charCodeAt(i)) | 0
  return Math.abs(h)
}

export function isListingUuid(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
}

export function parseInrAmount(label: string): number | null {
  const m = label.replace(/,/g, '').match(/₹?\s*([\d.]+)/)
  if (!m) return null
  const n = Number(m[1])
  return Number.isFinite(n) ? n : null
}

export function parseDurationHours(raw: string): number {
  const m = raw.match(/([\d.]+)/)
  if (!m) return 2
  const n = Number(m[1])
  return Number.isFinite(n) && n > 0 ? n : 2
}

export async function resolveGiftingListing(routeId: string): Promise<Listing | null> {
  if (isListingUuid(routeId)) {
    const { data } = await db.listings.getById(routeId)
    return (data as Listing | null) ?? null
  }

  const numId = Number(routeId)
  if (!Number.isFinite(numId)) return null

  const { data } = await db.listings.listByModule('gifting', 'active')
  const rows = (data ?? []) as Listing[]
  return rows.find((l) => uuidToNumber(l.id) === numId) ?? null
}

export async function resolveEventsListing(routeId: string): Promise<Listing | null> {
  if (isListingUuid(routeId)) {
    const { data } = await db.listings.getById(routeId)
    return (data as Listing | null) ?? null
  }

  const numId = Number(routeId)
  if (!Number.isFinite(numId)) return null

  const { data } = await db.listings.listByModule('events', 'active')
  const rows = (data ?? []) as Listing[]
  return rows.find((l) => uuidToNumber(l.id) === numId) ?? null
}

export async function resolveSpacexListing(
  routeId: string,
): Promise<(Listing & { listing_images?: ListingImage[] }) | null> {
  if (isListingUuid(routeId)) {
    const { data } = await db.listings.getById(routeId)
    return (data as Listing & { listing_images?: ListingImage[] }) ?? null
  }

  const numId = Number(routeId)
  if (!Number.isFinite(numId)) return null

  const [coworking, stay] = await Promise.all([
    db.listings.listByModule('spacex_coworking', 'active'),
    db.listings.listByModule('spacex_stay', 'active'),
  ])
  const rows = [
    ...((coworking.data ?? []) as (Listing & { listing_images?: ListingImage[] })[]),
    ...((stay.data ?? []) as (Listing & { listing_images?: ListingImage[] })[]),
  ]
  return rows.find((l) => uuidToNumber(l.id) === numId) ?? null
}

export type EventsListingDetail = Listing & {
  listing_images?: ListingImage[]
  listing_add_ons?: ListingAddOn[]
  vendors?: { business_name?: string } | null
}

/** Full listing row with images and add-ons for event detail pages. */
export async function resolveEventsListingDetail(routeId: string): Promise<EventsListingDetail | null> {
  const match = await resolveEventsListing(routeId)
  if (!match) return null
  const { data } = await db.listings.getById(match.id)
  return (data as EventsListingDetail | null) ?? null
}
