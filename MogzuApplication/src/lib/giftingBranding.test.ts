import { describe, it, expect } from 'vitest'
import { PLACEMENT_OPTIONS, toPlacementType } from './giftingBranding'

describe('PLACEMENT_OPTIONS', () => {
  it('matches the DB CHECK constraint values exactly', () => {
    const values = PLACEMENT_OPTIONS.map((o) => o.value).sort()
    expect(values).toEqual(
      ['back_print', 'embossing', 'front_print', 'label', 'sleeve_band'].sort(),
    )
  })

  it('every option has a non-empty label + description', () => {
    for (const opt of PLACEMENT_OPTIONS) {
      expect(opt.label.length).toBeGreaterThan(0)
      expect(opt.description.length).toBeGreaterThan(0)
    }
  })
})

describe('toPlacementType', () => {
  it('passes canonical values through unchanged', () => {
    expect(toPlacementType('front_print')).toBe('front_print')
    expect(toPlacementType('back_print')).toBe('back_print')
    expect(toPlacementType('embossing')).toBe('embossing')
    expect(toPlacementType('label')).toBe('label')
    expect(toPlacementType('sleeve_band')).toBe('sleeve_band')
  })

  it('maps demo apparel positions onto canonical types', () => {
    expect(toPlacementType('back')).toBe('back_print')
    expect(toPlacementType('sleeve')).toBe('sleeve_band')
    expect(toPlacementType('strap')).toBe('sleeve_band')
    expect(toPlacementType('band')).toBe('sleeve_band')
    expect(toPlacementType('tag')).toBe('label')
    expect(toPlacementType('cover')).toBe('label')
    expect(toPlacementType('label_tag')).toBe('label')
    expect(toPlacementType('emboss')).toBe('embossing')
    expect(toPlacementType('interior')).toBe('embossing')
  })

  it('defaults unknown / nullish input to front_print', () => {
    expect(toPlacementType('center-chest')).toBe('front_print')
    expect(toPlacementType('left-chest')).toBe('front_print')
    expect(toPlacementType('')).toBe('front_print')
    expect(toPlacementType(undefined)).toBe('front_print')
    expect(toPlacementType(null)).toBe('front_print')
  })
})
