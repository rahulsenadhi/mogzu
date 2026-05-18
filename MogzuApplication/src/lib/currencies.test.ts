import { describe, it, expect } from 'vitest'
import { convertFromInr, formatPrice, type Currency } from './currencies'

const INR: Currency = {
  code: 'INR', symbol: '₹', decimal_places: 2, fx_rate: 1,
  is_active: true, fx_updated_at: '2026-05-18T00:00:00Z', display_order: 1,
}
const USD: Currency = {
  code: 'USD', symbol: '$', decimal_places: 2, fx_rate: 83,
  is_active: true, fx_updated_at: '2026-05-18T00:00:00Z', display_order: 2,
}
const JPY: Currency = {
  code: 'JPY', symbol: '¥', decimal_places: 0, fx_rate: 0.55,
  is_active: true, fx_updated_at: '2026-05-18T00:00:00Z', display_order: 3,
}

describe('convertFromInr', () => {
  it('passes INR through unchanged', () => {
    expect(convertFromInr(1000, INR)).toBe(1000)
  })

  it('divides by fx_rate for non-base currencies', () => {
    expect(convertFromInr(8300, USD)).toBeCloseTo(100, 5)
  })

  it('falls back to base when fx_rate is zero/missing', () => {
    const broken: Currency = { ...USD, fx_rate: 0 }
    expect(convertFromInr(500, broken)).toBe(500)
  })
})

describe('formatPrice', () => {
  it('prefixes the symbol and pads decimals', () => {
    expect(formatPrice(1000, INR)).toBe('₹1,000.00')
  })

  it('respects decimal_places=0 for zero-decimal currencies like JPY', () => {
    const out = formatPrice(100, JPY)
    expect(out.startsWith('¥')).toBe(true)
    expect(out).not.toContain('.')
  })

  it('converts then formats in target currency', () => {
    expect(formatPrice(8300, USD)).toBe('$100.00')
  })
})
