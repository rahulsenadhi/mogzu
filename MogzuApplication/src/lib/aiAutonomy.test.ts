import { describe, it, expect } from 'vitest'
import { evaluatePolicy, type AiAutonomySettings } from './aiAutonomy'

const settings = (over: Partial<AiAutonomySettings> = {}): AiAutonomySettings => ({
  corporate_id: 'corp-1',
  is_enabled: true,
  spend_cap_inr: 50000,
  blocked_categories: [],
  updated_by: null,
  updated_at: '2026-05-18T00:00:00Z',
  ...over,
})

describe('evaluatePolicy', () => {
  it('rejects when settings row is missing', () => {
    expect(evaluatePolicy(null, { amountInr: 100 })).toMatch(/disabled/i)
  })

  it('rejects when is_enabled is false', () => {
    expect(
      evaluatePolicy(settings({ is_enabled: false }), { amountInr: 100 }),
    ).toMatch(/disabled/i)
  })

  it('rejects when amount exceeds spend cap', () => {
    expect(evaluatePolicy(settings(), { amountInr: 60000 })).toMatch(/Spend cap/)
  })

  it('rejects when category is blocked', () => {
    expect(
      evaluatePolicy(settings({ blocked_categories: ['alcohol'] }), {
        amountInr: 100,
        categorySlug: 'alcohol',
      }),
    ).toMatch(/blocked/)
  })

  it('returns null when the attempt clears every guard', () => {
    expect(
      evaluatePolicy(settings({ blocked_categories: ['alcohol'] }), {
        amountInr: 100,
        categorySlug: 'gifting',
      }),
    ).toBeNull()
  })
})
