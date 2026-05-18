import { describe, it, expect } from 'vitest'
import { computeResaleMargin, generateInvoiceToken } from './partnerCheckout'

describe('computeResaleMargin', () => {
  it('returns (base * pct) / 100 rounded to nearest rupee', () => {
    expect(computeResaleMargin(10000, 15)).toBe(1500)
    expect(computeResaleMargin(12345, 7)).toBe(864.15)
  })

  it('returns 0 for non-positive base or markup', () => {
    expect(computeResaleMargin(0, 10)).toBe(0)
    expect(computeResaleMargin(-100, 10)).toBe(0)
    expect(computeResaleMargin(1000, 0)).toBe(0)
    expect(computeResaleMargin(1000, -5)).toBe(0)
  })

  it('returns 0 for non-finite inputs', () => {
    expect(computeResaleMargin(NaN, 10)).toBe(0)
    expect(computeResaleMargin(Infinity, 10)).toBe(0)
  })
})

describe('generateInvoiceToken', () => {
  it('returns a 24-char lowercase hex string', () => {
    const t = generateInvoiceToken()
    expect(t).toMatch(/^[0-9a-f]{24}$/)
  })

  it('produces unique tokens across calls', () => {
    const set = new Set(Array.from({ length: 50 }, () => generateInvoiceToken()))
    expect(set.size).toBe(50)
  })
})
