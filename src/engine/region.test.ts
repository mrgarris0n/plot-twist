import { describe, expect, it } from 'vitest'
import type { PlantRecord } from '../model/plants'
import { inEurope, suitsRegion } from './region'

const rec = (origin: PlantRecord['origin'], grownIn: PlantRecord['grownIn'] = null) => ({ origin, grownIn }) as PlantRecord
const budapest = { lat: 47.5, lon: 19.04 }

describe('inEurope', () => {
  it('knows European gardens', () => {
    for (const p of [budapest, { lat: 38.7, lon: -9.1 }, { lat: 64.1, lon: -21.9 }, { lat: 55.7, lon: 37.6 }, { lat: 37.5, lon: 14 }, { lat: 35.9, lon: 14.5 }, { lat: 51.5, lon: -0.1 }])
      expect(inEurope(p)).toBe(true)
  })
  it('leaves out North Africa, Turkey and other continents', () => {
    for (const p of [{ lat: 35.8, lon: -5.8 }, { lat: 39.9, lon: 32.8 }, { lat: 40.7, lon: -74 }, { lat: -33.9, lon: 151.2 }, { lat: 30, lon: 31 }])
      expect(inEurope(p)).toBe(false)
  })
})

describe('suitsRegion', () => {
  it('hides American-only natives in Europe unless a source has them as a European garden plant', () => {
    expect(suitsRegion(rec(['north-america']), budapest)).toBe(false)
    expect(suitsRegion(rec(['north-america', 'south-america']), budapest)).toBe(false)
    expect(suitsRegion(rec(['south-america'], ['europe']), budapest)).toBe(true)
  })
  it('keeps plants from elsewhere, unknown origins and gardens outside Europe', () => {
    expect(suitsRegion(rec(['asia']), budapest)).toBe(true)
    expect(suitsRegion(rec(['europe', 'north-america']), budapest)).toBe(true)
    expect(suitsRegion(rec(null), budapest)).toBe(true)
    expect(suitsRegion(rec(['north-america']), { lat: 40.7, lon: -74 })).toBe(true)
    expect(suitsRegion(rec(['north-america']), null)).toBe(true)
  })
})
