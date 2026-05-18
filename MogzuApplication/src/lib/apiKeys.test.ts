import { describe, it, expect } from 'vitest'
import { webcrypto } from 'node:crypto'
import {
  AVAILABLE_SCOPES,
  generateApiKeySecret,
  hashApiKey,
  prefixForDisplay,
} from './apiKeys'

// Polyfill Web Crypto for the Node test environment.
if (!(globalThis as { crypto?: Crypto }).crypto) {
  (globalThis as { crypto: Crypto }).crypto = webcrypto as unknown as Crypto
}

describe('generateApiKeySecret', () => {
  it('prefixes with mzk_ and 32 hex chars', () => {
    const k = generateApiKeySecret()
    expect(k).toMatch(/^mzk_[0-9a-f]{32}$/)
  })

  it('produces unique values across calls', () => {
    const set = new Set(Array.from({ length: 50 }, generateApiKeySecret))
    expect(set.size).toBe(50)
  })
})

describe('prefixForDisplay', () => {
  it('takes the first 12 chars (mzk_ + 8 hex)', () => {
    const k = 'mzk_0123456789abcdef0123456789abcdef'
    expect(prefixForDisplay(k)).toBe('mzk_01234567')
  })
})

describe('hashApiKey', () => {
  it('returns a 64-char lowercase hex SHA-256', async () => {
    const h = await hashApiKey('mzk_test')
    expect(h).toMatch(/^[0-9a-f]{64}$/)
  })

  it('is deterministic for the same input', async () => {
    const a = await hashApiKey('mzk_test')
    const b = await hashApiKey('mzk_test')
    expect(a).toBe(b)
  })

  it('differs for different inputs', async () => {
    const a = await hashApiKey('mzk_aaa')
    const b = await hashApiKey('mzk_bbb')
    expect(a).not.toBe(b)
  })
})

describe('AVAILABLE_SCOPES', () => {
  it('exposes the canonical scope list', () => {
    expect(AVAILABLE_SCOPES).toContain('read:bookings')
    expect(AVAILABLE_SCOPES).toContain('write:bookings')
    expect(AVAILABLE_SCOPES).toContain('read:invoices')
  })
})
