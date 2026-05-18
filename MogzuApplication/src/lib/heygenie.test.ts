import { describe, it, expect } from 'vitest'
import {
  parseHeyGenieIntent,
  buildBookingHref,
  formatIntentSummary,
} from './heygenie'
import type { Listing } from './database.types'

const listing = (over: Partial<Listing> = {}): Listing => ({
  id: 'list-1',
  vendor_id: 'v-1',
  module: 'events',
  title: 'Test',
  description: null,
  base_price: 0,
  price_unit: 'flat',
  min_capacity: null,
  max_capacity: null,
  location_city: null,
  location_address: null,
  status: 'active',
  created_at: '2026-05-18T00:00:00Z',
  updated_at: '2026-05-18T00:00:00Z',
  ...(over as object),
} as Listing)

describe('parseHeyGenieIntent — module detection', () => {
  it('detects events from event/party/offsite keywords', () => {
    expect(parseHeyGenieIntent('plan our team offsite').module).toBe('events')
    expect(parseHeyGenieIntent('birthday party for 20').module).toBe('events')
  })

  it('detects gifting from gift/hamper/voucher', () => {
    expect(parseHeyGenieIntent('send diwali hampers').module).toBe('gifting')
  })

  it('detects coworking and stay', () => {
    expect(parseHeyGenieIntent('need a hot desk for 5').module).toBe('spacex_coworking')
    expect(parseHeyGenieIntent('book a hotel room overnight').module).toBe('spacex_stay')
  })

  it('returns null when nothing matches', () => {
    expect(parseHeyGenieIntent('hello').module).toBeNull()
  })
})

describe('parseHeyGenieIntent — headcount', () => {
  it('extracts "N people / pax / guests"', () => {
    expect(parseHeyGenieIntent('lunch for 25 people').headcount).toBe(25)
    expect(parseHeyGenieIntent('20 pax dinner').headcount).toBe(20)
  })

  it('extracts "team/group of N"', () => {
    expect(parseHeyGenieIntent('event for team of 12').headcount).toBe(12)
  })

  it('extracts bare "for N"', () => {
    expect(parseHeyGenieIntent('party for 50').headcount).toBe(50)
  })

  it('caps the digit window at 4 chars (regex bound, not validation)', () => {
    // "99999" greedy-matches the first 4 digits = 9999; documents the limit.
    expect(parseHeyGenieIntent('for 99999 people').headcount).toBe(9999)
  })
})

describe('parseHeyGenieIntent — date', () => {
  it('parses ISO yyyy-mm-dd literally', () => {
    expect(parseHeyGenieIntent('event on 2026-08-15').date).toBe('2026-08-15')
  })

  it('parses dd/mm/yyyy and dd-mm-yyyy', () => {
    expect(parseHeyGenieIntent('book 5/8/2026').date).toBe('2026-08-05')
    expect(parseHeyGenieIntent('book 15-08-2026').date).toBe('2026-08-15')
  })

  it('resolves tomorrow to today+1', () => {
    const out = parseHeyGenieIntent('lunch tomorrow').date
    expect(out).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

describe('parseHeyGenieIntent — budget', () => {
  it('extracts per-person budget', () => {
    const i = parseHeyGenieIntent('lunch under ₹500 per person')
    expect(i.budgetPerPerson).toBe(500)
  })

  it('extracts total budget', () => {
    const i = parseHeyGenieIntent('total budget of 50000')
    expect(i.budgetTotal).toBe(50000)
  })

  it('falls back to bare "under N" as per-person', () => {
    const i = parseHeyGenieIntent('gifting under 800')
    expect(i.budgetPerPerson).toBe(800)
  })
})

describe('parseHeyGenieIntent — city', () => {
  it('normalises Bengaluru → Bangalore', () => {
    expect(parseHeyGenieIntent('event in bengaluru').city).toBe('Bangalore')
  })

  it('normalises Cochin → Kochi and Gurugram → Gurgaon', () => {
    expect(parseHeyGenieIntent('stay in cochin').city).toBe('Kochi')
    expect(parseHeyGenieIntent('office in gurugram').city).toBe('Gurgaon')
  })

  it('title-cases known cities', () => {
    expect(parseHeyGenieIntent('venue in mumbai').city).toBe('Mumbai')
  })

  it('returns null for unknown cities', () => {
    expect(parseHeyGenieIntent('venue in atlantis').city).toBeNull()
  })
})

describe('parseHeyGenieIntent — keywords', () => {
  it('strips stopwords, short tokens, and pure numbers', () => {
    const kws = parseHeyGenieIntent('we need a rooftop venue for 30 people').keywords
    expect(kws).toContain('rooftop')
    expect(kws).toContain('venue')
    expect(kws).not.toContain('we')
    expect(kws).not.toContain('30')
  })

  it('caps at 12 keywords', () => {
    const kws = parseHeyGenieIntent(
      'rooftop venue garden lawn poolside terrace lounge bar club hall studio loft cabana',
    ).keywords
    expect(kws.length).toBeLessThanOrEqual(12)
  })
})

describe('buildBookingHref', () => {
  it('routes events to /book/event/:id', () => {
    const href = buildBookingHref(listing({ module: 'events' }), parseHeyGenieIntent(''))
    expect(href).toBe('/book/event/list-1')
  })

  it('routes both spacex modules to /book/space/:id', () => {
    expect(buildBookingHref(listing({ module: 'spacex_coworking' }), parseHeyGenieIntent('')))
      .toBe('/book/space/list-1')
    expect(buildBookingHref(listing({ module: 'spacex_stay' }), parseHeyGenieIntent('')))
      .toBe('/book/space/list-1')
  })

  it('routes gifting to /gifting/send?listing=', () => {
    const href = buildBookingHref(listing({ module: 'gifting' }), parseHeyGenieIntent(''))
    expect(href).toBe('/gifting/send?listing=list-1')
  })

  it('appends date + headcount query params', () => {
    const intent = parseHeyGenieIntent('event on 2026-08-15 for 30 people')
    const href = buildBookingHref(listing({ module: 'events' }), intent)
    expect(href).toContain('/book/event/list-1?')
    expect(href).toContain('date=2026-08-15')
    expect(href).toContain('headcount=30')
  })

  it('merges params via & for gifting URLs', () => {
    const intent = parseHeyGenieIntent('send hampers for 10 on 2026-08-15')
    const href = buildBookingHref(listing({ module: 'gifting' }), intent)
    expect(href.startsWith('/gifting/send?listing=list-1&')).toBe(true)
  })
})

describe('formatIntentSummary', () => {
  it('asks for detail when no fields parsed', () => {
    const summary = formatIntentSummary(parseHeyGenieIntent('hello'))
    expect(summary).toMatch(/more detail/i)
  })

  it('composes the parts when intent fields are present', () => {
    const summary = formatIntentSummary(
      parseHeyGenieIntent('team offsite for 30 in mumbai under ₹1000 per person'),
    )
    expect(summary).toContain('an event')
    expect(summary).toContain('30 guests')
    expect(summary).toContain('in Mumbai')
    expect(summary).toContain('₹1000/head')
  })
})
