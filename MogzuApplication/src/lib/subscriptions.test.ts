import { describe, it, expect } from 'vitest'
import { hasFeature, type Plan } from './subscriptions'

const plan = (over: Partial<Plan> = {}): Plan => ({
  id: 'growth',
  name: 'Growth',
  tier: 'growth',
  monthly_per_seat: 999,
  annual_per_seat: 9990,
  currency: 'INR',
  feature_flags: {
    sso_enabled: false,
    ai_agents_count: 1,
    custom_contracts: false,
    audit_export: false,
  },
  is_active: true,
  display_order: 2,
  created_at: '2026-05-18T00:00:00Z',
  ...over,
})

describe('hasFeature', () => {
  it('returns false for null / undefined plan', () => {
    expect(hasFeature(null, 'sso_enabled')).toBe(false)
    expect(hasFeature(undefined, 'sso_enabled')).toBe(false)
  })

  it('returns the boolean flag verbatim', () => {
    expect(hasFeature(plan(), 'sso_enabled')).toBe(false)
    expect(hasFeature(plan({ feature_flags: { sso_enabled: true, ai_agents_count: 1, custom_contracts: false, audit_export: true } }), 'sso_enabled')).toBe(true)
    expect(hasFeature(plan(), 'audit_export')).toBe(false)
  })

  it('treats positive numeric flags as enabled', () => {
    expect(hasFeature(plan(), 'ai_agents_count')).toBe(true)
    expect(
      hasFeature(plan({ feature_flags: { sso_enabled: false, ai_agents_count: 0, custom_contracts: false, audit_export: false } }), 'ai_agents_count'),
    ).toBe(false)
  })
})
