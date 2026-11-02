import { describe, expect, it } from 'vitest'
import type { PlacedPlant } from '../model/project'
import { effectiveSize, sizeAt, type EffectiveSize } from './growth'
import { fixturePlant } from '../test/fixtures'

const s: EffectiveSize = { matureHeightM: 4, matureWidthM: 4, yearsToMaturity: 6, growthKnown: true, minSpacingM: null }
const pp = (o: Partial<PlacedPlant> = {}): PlacedPlant => ({ id: 'p', plantId: 'x', variantId: null, x: 0, y: 0, plantedYear: 0, heightOverrideM: null, widthOverrideM: null, ...o })

describe('growth', () => {
  it('starts at 10 % of mature size', () => {
    expect(sizeAt(s, 0).heightM).toBeCloseTo(0.4)
    expect(sizeAt(s, 0).widthM).toBeCloseTo(0.4)
  })
  it('is 95-100 % at yearsToMaturity', () => {
    const h = sizeAt(s, 6).heightM / 4
    expect(h).toBeGreaterThanOrEqual(0.95 - 1e-9)
    expect(h).toBeLessThanOrEqual(1)
  })
  it('is monotonic over 0..20', () => {
    let prev = -1
    for (let a = 0; a <= 20; a++) {
      const h = sizeAt(s, a).heightM
      expect(h).toBeGreaterThanOrEqual(prev)
      prev = h
    }
  })
  it('is zero before planting', () => {
    expect(sizeAt(s, -1)).toEqual({ heightM: 0, widthM: 0 })
  })
  it('unknown yearsToMaturity uses the layer typical speed: 10 % at year 0, ~95 % at year 20 for a canopy tree', () => {
    const rec = fixturePlant({ layer: 'canopy', variants: [{ id: 'a', label: 'A', matureHeightM: 10, matureWidthM: 8, yearsToMaturity: null, minSpacingM: null }] })
    const size = effectiveSize(pp(), rec)
    expect(size).toMatchObject({ yearsToMaturity: 20, growthKnown: false })
    expect(sizeAt(size, 0).heightM).toBeCloseTo(1)
    expect(sizeAt(size, 20).heightM / 10).toBeCloseTo(0.95, 2)
  })
  it('known yearsToMaturity is unchanged and flagged known', () => {
    expect(effectiveSize(pp(), fixturePlant({ layer: 'canopy' }))).toMatchObject({ yearsToMaturity: 6, growthKnown: true })
  })
  it('effectiveSize: overrides win, variant chosen with default fallback', () => {
    const rec = fixturePlant({ variants: [
      { id: 'a', label: 'A', matureHeightM: 4, matureWidthM: 4, yearsToMaturity: 6, minSpacingM: 3 },
      { id: 'b', label: 'B', matureHeightM: 8, matureWidthM: 7, yearsToMaturity: 10, minSpacingM: null },
    ] })
    expect(effectiveSize(pp(), rec).matureHeightM).toBe(4)
    expect(effectiveSize(pp({ variantId: 'b' }), rec)).toMatchObject({ matureHeightM: 8, matureWidthM: 7, yearsToMaturity: 10 })
    expect(effectiveSize(pp({ variantId: 'zzz' }), rec).matureHeightM).toBe(4)
    expect(effectiveSize(pp({ heightOverrideM: 2.5, widthOverrideM: 1 }), rec)).toMatchObject({ matureHeightM: 2.5, matureWidthM: 1, yearsToMaturity: 6 })
  })
})
