import { describe, it, expect } from 'vitest'
import { KYC_STATUSES, ONBOARDING_STATUSES, REGIONS } from './vendorOnboarding'

describe('vendorOnboarding constants', () => {
  it('REGIONS matches the DB CHECK constraint', () => {
    expect([...REGIONS].sort()).toEqual(['ae', 'eu', 'in', 'sg', 'uk', 'us'])
  })

  it('ONBOARDING_STATUSES matches the DB CHECK constraint', () => {
    expect([...ONBOARDING_STATUSES].sort()).toEqual([
      'approved',
      'awaiting_admin',
      'kyc_in_review',
      'rejected',
      'submitted',
    ])
  })

  it('KYC_STATUSES matches the DB CHECK constraint', () => {
    expect([...KYC_STATUSES].sort()).toEqual(['approved', 'pending', 'rejected', 'review'])
  })
})
