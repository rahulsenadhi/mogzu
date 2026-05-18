import { describe, it, expect } from 'vitest'
import {
  STAGE_PIPELINES,
  buildProofPhotoPath,
  findStage,
  generateOtpCode,
  getStagePipeline,
  nextStage,
} from './bookingTracker'

describe('STAGE_PIPELINES', () => {
  it('covers all four modules', () => {
    expect(Object.keys(STAGE_PIPELINES).sort()).toEqual(
      ['events', 'gifting', 'spacex_coworking', 'spacex_stay'].sort(),
    )
  })

  it('every stage has key + label + proofRequired', () => {
    for (const stages of Object.values(STAGE_PIPELINES)) {
      for (const s of stages) {
        expect(s.key).toMatch(/^[a-z_]+$/)
        expect(s.label.length).toBeGreaterThan(0)
        expect(['auto', 'optional', 'mandatory']).toContain(s.proofRequired)
      }
    }
  })
})

describe('getStagePipeline', () => {
  it('returns the gifting pipeline ordered correctly', () => {
    const stages = getStagePipeline('gifting').map((s) => s.key)
    expect(stages).toEqual([
      'order_placed',
      'in_production',
      'dispatched',
      'out_for_delivery',
      'delivered',
      'confirmed',
    ])
  })
})

describe('findStage', () => {
  it('finds existing stages', () => {
    expect(findStage('events', 'arrived_at_venue')?.proofRequired).toBe('mandatory')
  })
  it('returns undefined for unknown stages', () => {
    expect(findStage('events', 'nope')).toBeUndefined()
  })
})

describe('nextStage', () => {
  it('returns the first stage when nothing has been submitted', () => {
    expect(nextStage('events', [])?.key).toBe('booking_confirmed')
  })
  it('skips ahead based on submitted keys', () => {
    expect(
      nextStage('events', ['booking_confirmed', 'vendor_assigned'])?.key,
    ).toBe('en_route')
  })
  it('returns null when the pipeline is complete', () => {
    const allKeys = getStagePipeline('gifting').map((s) => s.key)
    expect(nextStage('gifting', allKeys)).toBeNull()
  })
})

describe('generateOtpCode', () => {
  it('returns a 6-digit numeric string', () => {
    for (let i = 0; i < 50; i++) {
      const code = generateOtpCode()
      expect(code).toMatch(/^\d{6}$/)
      const n = Number(code)
      expect(n).toBeGreaterThanOrEqual(100000)
      expect(n).toBeLessThanOrEqual(999999)
    }
  })
})

describe('buildProofPhotoPath', () => {
  it('uses the booking-proof namespace and embeds booking + stage', () => {
    const path = buildProofPhotoPath('abc-123', 'arrived_at_venue')
    expect(path).toMatch(/^booking-proof\/abc-123\/arrived_at_venue\/[0-9a-f]{16}\.jpg$/)
  })
})
