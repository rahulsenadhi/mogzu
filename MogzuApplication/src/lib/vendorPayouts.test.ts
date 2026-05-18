import { describe, it, expect } from 'vitest'
import { PAYOUT_RAILS, maskAccount } from './vendorPayouts'

describe('PAYOUT_RAILS', () => {
  it('matches the DB CHECK constraint values', () => {
    expect([...PAYOUT_RAILS].sort()).toEqual(
      ['ach', 'fast_sg', 'manual', 'razorpay_x', 'sepa', 'wise'],
    )
  })
})

describe('maskAccount', () => {
  it('masks all but the last 4 chars', () => {
    expect(maskAccount('1234567890')).toBe('••••7890')
  })

  it('returns short strings verbatim (cannot mask safely)', () => {
    expect(maskAccount('1234')).toBe('1234')
    expect(maskAccount('')).toBe('')
  })
})
