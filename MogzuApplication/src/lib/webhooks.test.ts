import { describe, it, expect } from 'vitest'
import { webcrypto } from 'node:crypto'
import { AVAILABLE_EVENTS, generateSigningSecret } from './webhooks'

if (!(globalThis as { crypto?: Crypto }).crypto) {
  (globalThis as { crypto: Crypto }).crypto = webcrypto as unknown as Crypto
}

describe('generateSigningSecret', () => {
  it('prefixes with whsec_ and 48 hex chars (24 bytes)', () => {
    const s = generateSigningSecret()
    expect(s).toMatch(/^whsec_[0-9a-f]{48}$/)
  })

  it('produces unique values across calls', () => {
    const set = new Set(Array.from({ length: 50 }, generateSigningSecret))
    expect(set.size).toBe(50)
  })
})

describe('AVAILABLE_EVENTS', () => {
  it('matches the DB CHECK / default array', () => {
    expect(AVAILABLE_EVENTS).toEqual([
      'booking.created',
      'booking.approved',
      'booking.completed',
      'invoice.paid',
      'dispute.opened',
    ])
  })
})
