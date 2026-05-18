import { describe, it, expect } from 'vitest'
import { CMS_BLOCK_KINDS } from './cms'

describe('CMS_BLOCK_KINDS', () => {
  it('exposes all six block kinds in the DB CHECK constraint', () => {
    const values = CMS_BLOCK_KINDS.map((k) => k.value).sort()
    expect(values).toEqual(
      [
        'announcement',
        'blog_post',
        'feature_card',
        'footer_link_group',
        'hero',
        'promo_banner',
      ].sort(),
    )
  })

  it('every kind has a label + description', () => {
    for (const k of CMS_BLOCK_KINDS) {
      expect(k.label.length).toBeGreaterThan(0)
      expect(k.description.length).toBeGreaterThan(0)
    }
  })
})
