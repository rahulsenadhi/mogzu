import { db } from '@/lib/db'
import type { Listing } from '@/lib/database.types'

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
