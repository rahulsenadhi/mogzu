import { describe, it, expect } from 'vitest'
import { COMMERCIAL_MODELS, slugify } from './whiteLabelPartners'

describe('COMMERCIAL_MODELS', () => {
  it('matches the DB CHECK constraint', () => {
    expect([...COMMERCIAL_MODELS].sort()).toEqual([
      'flat_infra_fee',
      'per_corporate_seat',
      'revenue_share',
    ])
  })
})

describe('slugify', () => {
  it('lowercases and replaces runs of non-alphanumerics with single dashes', () => {
    expect(slugify('Acme Corp & Sons!')).toBe('acme-corp-sons')
  })

  it('trims leading and trailing dashes', () => {
    expect(slugify('---hello---world---')).toBe('hello-world')
  })

  it('caps the slug at 48 chars', () => {
    const long = 'a'.repeat(80)
    expect(slugify(long).length).toBeLessThanOrEqual(48)
  })

  it('returns an empty string for purely non-alphanumeric input', () => {
    expect(slugify('!!!')).toBe('')
  })
})
