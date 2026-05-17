// Hey Genie — Story 11.1
//
// Text-first natural-language assistant. Parses free-text employee prompts into
// a structured intent, fetches matching listings, then hands off to the
// existing booking flow with prefilled query params. Voice (VAPI) is a later
// upgrade — keep this module SDK-free so it ships first.

import { db } from './db'
import type { Listing, ListingImage, ModuleId, Vendor } from './database.types'

export type HeyGenieIntent = {
  module: ModuleId | null
  headcount: number | null
  date: string | null // ISO yyyy-mm-dd
  budgetPerPerson: number | null
  budgetTotal: number | null
  city: string | null
  rawText: string
  // Free-text keywords kept for ranking + audit.
  keywords: string[]
}

export type ListingMatch = {
  listing: Listing & {
    listing_images?: ListingImage[]
    vendors?: Vendor | null
  }
  score: number
  reasons: string[]
}

// ─── Module detection ────────────────────────────────────────────────────────

const MODULE_KEYWORDS: Record<ModuleId, string[]> = {
  events: [
    'event', 'party', 'lunch', 'dinner', 'team', 'offsite', 'meetup', 'dine',
    'celebration', 'gathering', 'conference', 'venue', 'banquet', 'workshop',
    'training', 'birthday', 'anniversary', 'kickoff', 'launch',
  ],
  gifting: [
    'gift', 'gifts', 'hamper', 'voucher', 'goodie', 'goodies', 'present',
    'reward', 'recognition', 'diwali', 'rakhi', 'newyear', 'festival',
    'thank you', 'thanks', 'send',
  ],
  spacex_coworking: [
    'coworking', 'co-working', 'workspace', 'desk', 'desks', 'hot desk',
    'cabin', 'private office', 'meeting room', 'conference room', 'office space',
  ],
  spacex_stay: [
    'stay', 'hotel', 'room', 'rooms', 'accommodation', 'overnight', 'guest house',
    'lodging', 'night', 'nights', 'check-in', 'checkin',
  ],
}

const CITY_LIST = [
  'bangalore', 'bengaluru', 'mumbai', 'pune', 'delhi', 'gurgaon', 'gurugram',
  'noida', 'hyderabad', 'chennai', 'kolkata', 'ahmedabad', 'jaipur', 'goa',
  'kochi', 'cochin', 'chandigarh', 'lucknow', 'indore',
]

const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

const STOPWORDS = new Set([
  'a', 'an', 'the', 'for', 'and', 'or', 'to', 'in', 'on', 'at', 'of', 'with',
  'i', 'we', 'our', 'my', 'me', 'us', 'is', 'are', 'be', 'book', 'find', 'need',
  'want', 'please', 'hey', 'genie', 'around', 'next', 'this', 'under', 'about',
  'people', 'persons', 'person', 'pax', 'per', 'rs', 'inr', 'rupees',
])

// ─── Parser ──────────────────────────────────────────────────────────────────

export function parseHeyGenieIntent(rawText: string): HeyGenieIntent {
  const text = rawText.toLowerCase()

  const module = detectModule(text)
  const headcount = extractHeadcount(text)
  const date = extractDate(text)
  const { perPerson, total } = extractBudget(text)
  const city = extractCity(text)
  const keywords = extractKeywords(text)

  return {
    module,
    headcount,
    date,
    budgetPerPerson: perPerson,
    budgetTotal: total,
    city,
    rawText,
    keywords,
  }
}

function detectModule(text: string): ModuleId | null {
  let bestModule: ModuleId | null = null
  let bestHits = 0
  for (const [mod, kws] of Object.entries(MODULE_KEYWORDS) as [ModuleId, string[]][]) {
    let hits = 0
    for (const kw of kws) {
      if (text.includes(kw)) hits += 1
    }
    if (hits > bestHits) {
      bestHits = hits
      bestModule = mod
    }
  }
  return bestModule
}

function extractHeadcount(text: string): number | null {
  // "10 people", "for 25", "team of 12", "20 pax"
  const patterns = [
    /(\d{1,4})\s*(?:people|persons|pax|guests|employees|ppl)\b/,
    /(?:team|group|party)\s*of\s*(\d{1,4})/,
    /for\s+(\d{1,4})\b/,
  ]
  for (const re of patterns) {
    const m = text.match(re)
    if (m) {
      const n = parseInt(m[1], 10)
      if (n > 0 && n < 10000) return n
    }
  }
  return null
}

function extractDate(text: string): string | null {
  const now = new Date()
  // "tomorrow"
  if (/\btomorrow\b/.test(text)) {
    const d = new Date(now)
    d.setDate(d.getDate() + 1)
    return iso(d)
  }
  if (/\btoday\b/.test(text)) return iso(now)
  // "next friday", "this friday", "friday"
  for (let i = 0; i < DAY_NAMES.length; i++) {
    const day = DAY_NAMES[i]
    const re = new RegExp(`\\b(next\\s+|this\\s+)?${day}\\b`)
    const m = text.match(re)
    if (m) {
      const target = new Date(now)
      const today = target.getDay()
      let diff = (i - today + 7) % 7
      if (diff === 0 || m[1]?.trim() === 'next') diff = diff === 0 ? 7 : diff + (m[1]?.trim() === 'next' ? 7 : 0)
      target.setDate(target.getDate() + diff)
      return iso(target)
    }
  }
  // "on 15 may", "15/05/2026", "2026-05-15"
  const isoMatch = text.match(/\b(20\d{2})-(\d{2})-(\d{2})\b/)
  if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`
  const dmy = text.match(/\b(\d{1,2})[\/\-](\d{1,2})[\/\-](20\d{2})\b/)
  if (dmy) {
    const dd = dmy[1].padStart(2, '0')
    const mm = dmy[2].padStart(2, '0')
    return `${dmy[3]}-${mm}-${dd}`
  }
  return null
}

function iso(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function extractBudget(text: string): { perPerson: number | null; total: number | null } {
  // "under ₹500 per person", "₹50000 total", "budget 1000/head"
  let perPerson: number | null = null
  let total: number | null = null

  const perPersonRe = /(?:under|below|upto|up\s*to|max(?:imum)?|around|about|~)?\s*(?:₹|rs\.?|inr)?\s*(\d{2,7})\s*(?:\/|per|a)\s*(?:head|person|pax|employee|guest|ppl)/i
  const m1 = text.match(perPersonRe)
  if (m1) perPerson = parseInt(m1[1], 10)

  const totalRe = /(?:total|budget|spend|cost)\s*(?:of)?\s*(?:₹|rs\.?|inr)?\s*(\d{3,8})/i
  const m2 = text.match(totalRe)
  if (m2) total = parseInt(m2[1], 10)

  // Bare "under ₹500" → assume per-person if module is events/gifting + headcount present
  if (!perPerson && !total) {
    const bare = text.match(/(?:under|below|upto|max)\s*(?:₹|rs\.?|inr)?\s*(\d{3,7})\b/i)
    if (bare) perPerson = parseInt(bare[1], 10)
  }

  return { perPerson, total }
}

function extractCity(text: string): string | null {
  for (const c of CITY_LIST) {
    if (text.includes(c)) {
      if (c === 'bengaluru') return 'Bangalore'
      if (c === 'cochin') return 'Kochi'
      if (c === 'gurugram') return 'Gurgaon'
      return c.charAt(0).toUpperCase() + c.slice(1)
    }
  }
  return null
}

function extractKeywords(text: string): string[] {
  return text
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w) && !/^\d+$/.test(w))
    .slice(0, 12)
}

// ─── Matcher ─────────────────────────────────────────────────────────────────

export async function findMatchingListings(
  intent: HeyGenieIntent,
  limit = 3,
): Promise<ListingMatch[]> {
  if (!intent.module) return []

  const { data, error } = await db.listings.listByModule(intent.module, 'active')
  if (error || !data) return []

  const matches: ListingMatch[] = []
  for (const raw of data) {
    const listing = raw as ListingMatch['listing']
    const { score, reasons } = scoreListing(listing, intent)
    if (score > 0) matches.push({ listing, score, reasons })
  }

  matches.sort((a, b) => b.score - a.score)
  return matches.slice(0, limit)
}

function scoreListing(
  listing: ListingMatch['listing'],
  intent: HeyGenieIntent,
): { score: number; reasons: string[] } {
  let score = 1
  const reasons: string[] = []

  // Capacity fit
  if (intent.headcount != null) {
    const min = listing.min_capacity ?? 0
    const max = listing.max_capacity ?? Number.MAX_SAFE_INTEGER
    if (intent.headcount >= min && intent.headcount <= max) {
      score += 4
      reasons.push(`Fits ${intent.headcount} guests`)
    } else if (intent.headcount > max) {
      score -= 2 // over capacity = strong penalty
    } else {
      score -= 1
    }
  }

  // Budget fit
  if (intent.budgetPerPerson != null && listing.base_price != null) {
    const perHead =
      listing.price_unit === 'per_person'
        ? listing.base_price
        : listing.price_unit === 'flat' && intent.headcount
          ? listing.base_price / intent.headcount
          : null
    if (perHead != null) {
      if (perHead <= intent.budgetPerPerson) {
        score += 3
        reasons.push(`Within ₹${intent.budgetPerPerson}/head budget`)
      } else if (perHead <= intent.budgetPerPerson * 1.15) {
        score += 1
        reasons.push(`Slightly above budget (₹${Math.round(perHead)}/head)`)
      } else {
        score -= 2
      }
    }
  }

  // City match
  if (intent.city && listing.location_city) {
    if (listing.location_city.toLowerCase() === intent.city.toLowerCase()) {
      score += 3
      reasons.push(`Located in ${intent.city}`)
    } else {
      score -= 1
    }
  }

  // Keyword overlap with title/description
  const hay = `${listing.title} ${listing.description ?? ''}`.toLowerCase()
  let kwHits = 0
  for (const kw of intent.keywords) {
    if (hay.includes(kw)) kwHits += 1
  }
  if (kwHits > 0) {
    score += Math.min(kwHits, 3)
    reasons.push(`Matches "${intent.keywords.slice(0, 2).join(', ')}"`)
  }

  return { score, reasons }
}

// ─── Booking handoff ─────────────────────────────────────────────────────────

export function buildBookingHref(listing: Listing, intent: HeyGenieIntent): string {
  const params = new URLSearchParams()
  if (intent.date) params.set('date', intent.date)
  if (intent.headcount != null) params.set('headcount', String(intent.headcount))
  const qs = params.toString()
  const suffix = qs ? `?${qs}` : ''

  switch (listing.module) {
    case 'events':
      return `/book/event/${listing.id}${suffix}`
    case 'spacex_coworking':
    case 'spacex_stay':
      return `/book/space/${listing.id}${suffix}`
    case 'gifting':
      return `/gifting/send?listing=${listing.id}${qs ? '&' + qs : ''}`
    default:
      return `/listing/${listing.id}${suffix}`
  }
}

// ─── Friendly assistant reply ────────────────────────────────────────────────

export function formatIntentSummary(intent: HeyGenieIntent): string {
  const parts: string[] = []
  if (intent.module) parts.push(moduleLabel(intent.module))
  if (intent.headcount != null) parts.push(`${intent.headcount} guests`)
  if (intent.date) parts.push(formatDateHuman(intent.date))
  if (intent.budgetPerPerson != null) parts.push(`₹${intent.budgetPerPerson}/head budget`)
  if (intent.city) parts.push(`in ${intent.city}`)
  if (parts.length === 0) return 'I need a bit more detail — what are you planning?'
  return `Looking for ${parts.join(' · ')}`
}

function moduleLabel(m: ModuleId): string {
  return (
    {
      events: 'an event',
      gifting: 'gifts',
      spacex_coworking: 'a coworking space',
      spacex_stay: 'a stay',
    } satisfies Record<ModuleId, string>
  )[m]
}

function formatDateHuman(isoDate: string): string {
  try {
    const d = new Date(isoDate + 'T00:00:00')
    return d.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    })
  } catch {
    return isoDate
  }
}
