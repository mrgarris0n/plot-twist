import { describe, expect, it } from 'vitest'
import { createProject } from '../model/project'
import { SHADE_DEFAULTS } from '../state/store'
import { groundOf } from './slope'
import { bareSlopeStrength, buildScene, CANOPY_TRANSMISSION, growingSeasonHours, growingSeasonStrength, SEASON_SAMPLES_CACHE_SIZE, seasonSamples } from './scene'
import { sunHoursAt, sunHoursGrid } from './shadow'
import { fixtureLibrary, fixturePlant } from '../test/fixtures'

const base = () => createProject('t')

describe('scene', () => {
  it('maps a house to a solid box', () => {
    const p = base()
    p.shadeObjects.push({ id: 'h', kind: 'house', x: 5, y: 5, rotationDeg: 10, ...SHADE_DEFAULTS.house })
    expect(buildScene(p, null, 0, 'midsummer')).toEqual([
      { kind: 'box', id: 'h', cx: 5, cy: 5, widthM: 10, lengthM: 8, rotationDeg: 10, heightM: 7, transmission: 0 },
    ])
  })
  it('maps an existing tree to a crown', () => {
    const p = base()
    p.shadeObjects.push({ id: 't', kind: 'tree', x: 2, y: 3, rotationDeg: 0, ...SHADE_DEFAULTS.tree })
    const [o] = buildScene(p, null, 0, 'midsummer')
    expect(o).toMatchObject({ kind: 'crown', id: 't', cx: 2, cy: 3, radiusM: 3, zTop: 8, transmission: 0.15 })
    expect((o as { zBottom: number }).zBottom).toBeCloseTo(3.2)
  })
  it('an existing tree marked leafOff lets light through only in midwinter', () => {
    const p = base()
    p.shadeObjects.push({ id: 'a', kind: 'tree', x: 0, y: 0, rotationDeg: 0, ...SHADE_DEFAULTS.tree, canopy: 'dense', leafOff: true })
    expect(buildScene(p, null, 0, 'midwinter')[0]!.transmission).toBe(CANOPY_TRANSMISSION.leafOff)
    expect(buildScene(p, null, 0, 'midsummer')[0]!.transmission).toBe(CANOPY_TRANSMISSION.dense)
  })

  it('uses light and unknown canopy transmission', () => {
    const p = base()
    p.shadeObjects.push({ id: 'a', kind: 'tree', x: 0, y: 0, rotationDeg: 0, ...SHADE_DEFAULTS.tree, canopy: 'light' })
    p.shadeObjects.push({ id: 'b', kind: 'tree', x: 0, y: 0, rotationDeg: 0, ...SHADE_DEFAULTS.tree, canopy: null })
    expect(buildScene(p, null, 0, 'spring').map((o) => o.transmission)).toEqual([0.5, 0.3])
  })
  it('seasonSamples reuses recent results and forgets the oldest past the cap', () => {
    const p = createProject('t')
    p.location = { lat: 12.25, lon: 3.5 }
    const first = seasonSamples(p, 'spring')
    expect(seasonSamples(p, 'spring')).toBe(first)
    for (let deg = 1; deg <= SEASON_SAMPLES_CACHE_SIZE; deg++) seasonSamples({ ...p, northDeg: deg }, 'spring')
    const again = seasonSamples(p, 'spring')
    expect(again).not.toBe(first)
    expect(again).toEqual(first)
  })
  it('seasonSamples is empty without location and non-empty with', () => {
    const p = base()
    expect(seasonSamples(p, 'midsummer')).toEqual([])
    p.location = { lat: 47.5, lon: 19 }
    expect(seasonSamples(p, 'midsummer').length).toBeGreaterThan(0)
    expect(seasonSamples(p, 'midsummer')).toBe(seasonSamples(p, 'midsummer'))
  })
  it('growingSeasonHours is positive in open sky', () => {
    const p = base()
    p.location = { lat: 47.5, lon: 19 }
    expect(growingSeasonHours(p, null, { x: 1, y: 1 }, 0.3, 0)).toBeGreaterThan(8)
  })
})

describe('scene with plants', () => {
  const lib = fixtureLibrary(
    fixturePlant({ id: 'apple' }),
    fixturePlant({ id: 'pine', leafHabit: 'evergreen', canopyDensity: 'light' }),
    fixturePlant({ id: 'herb', variants: [{ id: 'a', label: 'A', matureHeightM: 0.3, matureWidthM: 0.3, yearsToMaturity: 1, minSpacingM: null }] }),
  )
  const place = (id: string, plantId: string, plantedYear = 0) => ({ id, plantId, variantId: null, x: 1, y: 2, plantedYear, heightOverrideM: null, widthOverrideM: null })
  it('grown apple becomes a crown', () => {
    const p = base()
    p.plants.push(place('a1', 'apple'))
    const [o] = buildScene(p, lib, 6, 'midsummer')
    expect(o).toMatchObject({ kind: 'crown', id: 'a1', cx: 1, cy: 2, transmission: 0.15 })
    expect((o as { radiusM: number }).radiusM).toBeGreaterThan(1.8)
    expect((o as { radiusM: number }).radiusM).toBeLessThanOrEqual(2)
  })
  it('skips unplanted, tiny and unknown plants', () => {
    const p = base()
    p.plants.push(place('a1', 'apple', 3), place('h', 'herb'), place('u', 'missing'))
    expect(buildScene(p, lib, 0, 'midsummer')).toEqual([])
    expect(buildScene(p, null, 10, 'midsummer')).toEqual([])
  })
  it('deciduous leaves are off in midwinter, evergreen keeps density', () => {
    const p = base()
    p.plants.push(place('a1', 'apple'), place('p1', 'pine'))
    expect(buildScene(p, lib, 6, 'midwinter').map((o) => o.transmission)).toEqual([0.8, 0.5])
    expect(buildScene(p, lib, 6, 'midsummer').map((o) => o.transmission)).toEqual([0.15, 0.5])
  })
  describe('sloped ground', () => {
    const sloped = (): ReturnType<typeof base> => {
      const p = base()
      p.location = { lat: 47.5, lon: 19 }
      p.slope = { steepness: 'strong', facing: 'S' }
      return p
    }
    const house = (id: string, y: number) => ({ id, kind: 'house' as const, x: 5, y, rotationDeg: 0, ...SHADE_DEFAULTS.house })
    it('obstacles sit on the slope', () => {
      const p = sloped()
      p.shadeObjects.push(house('up', 1), house('down', 9))
      const [up, down] = buildScene(p, null, 0, 'midsummer') as { zBase: number }[]
      expect(up!.zBase).toBeGreaterThan(0)
      expect(down!.zBase).toBeLessThan(0)
    })
    it('off-plot house on slope still shades', () => {
      const p = sloped()
      p.shadeObjects.push(house('n', -5))
      const [h] = buildScene(p, null, 0, 'midsummer') as { zBase: number }[]
      const expected = groundOf(p).zAt({ x: 5, y: -5 })
      expect(expected).toBeGreaterThan(0)
      expect(h!.zBase).toBeCloseTo(expected, 9)
      const open = { ...p, shadeObjects: [] }
      const pt = { x: 5, y: 0.5 }
      expect(growingSeasonHours(p, null, pt, 0.3, 0)).toBeLessThan(growingSeasonHours(open, null, pt, 0.3, 0))
    })
    it('no slope and a flat slope give exactly equal hours', () => {
      const a = base()
      a.location = { lat: 47.5, lon: 19 }
      a.shadeObjects.push(house('h', 3))
      const b = { ...a, slope: { steepness: 'flat' as const, facing: null } }
      for (const pt of [{ x: 5, y: 0.5 }, { x: 2, y: 5 }, { x: 8, y: 9 }])
        expect(growingSeasonHours(b, null, pt, 0.3, 0)).toBe(growingSeasonHours(a, null, pt, 0.3, 0))
    })
    it('gentle north-facing slope differs from flat', () => {
      const a = base()
      a.location = { lat: 47.5, lon: 19 }
      a.shadeObjects.push({ ...house('h', 6), lengthM: 1, heightM: 3 })
      const b = { ...a, slope: { steepness: 'gentle' as const, facing: 'N' as const } }
      // points just north of the wall, where the shadow edge moves with the slope
      const differs = [3, 3.5, 4, 4.5, 5].some((y) => growingSeasonHours(b, null, { x: 5, y }, 0.3, 0) !== growingSeasonHours(a, null, { x: 5, y }, 0.3, 0))
      expect(differs).toBe(true)
    })
  })
  describe('sun strength', () => {
    const at = (lat: number, steepness: 'flat' | 'strong' | 'veryStrong', facing: 'N' | 'S' | null) => {
      const p = base()
      p.location = { lat, lon: 19 }
      p.slope = { steepness, facing }
      return p
    }
    it('open flat spot is 100%', () => {
      expect(bareSlopeStrength(at(47.5, 'flat', null))).toBe(1)
      expect(bareSlopeStrength(base())).toBeNull()
      expect(growingSeasonStrength(base(), null, { x: 1, y: 1 }, 0.3, 0)).toBeNull()
      expect(growingSeasonStrength(at(47.5, 'flat', null), null, { x: 1, y: 1 }, 0.3, 0)).toBeCloseTo(1, 9)
    })
    it('south slope is stronger in the north', () => {
      expect(bareSlopeStrength(at(50, 'strong', 'S'))!).toBeGreaterThan(1.03)
      expect(bareSlopeStrength(at(50, 'strong', 'N'))!).toBeLessThan(0.97)
    })
    it('north-facing slope is stronger in the south', () => {
      expect(bareSlopeStrength(at(-35, 'strong', 'N'))!).toBeGreaterThan(1.03)
    })
    it('strength never negative', () => {
      const p = at(60, 'veryStrong', 'N')
      const g = sunHoursGrid(p.plot, 0.3, seasonSamples(p, 'midwinter'), buildScene(p, null, 0, 'midwinter'), groundOf(p))
      const finite = Array.from(g.strength).filter((v) => !Number.isNaN(v))
      expect(finite.length).toBeGreaterThan(0)
      for (const v of finite) expect(v).toBeGreaterThanOrEqual(0)
    })
  })
})

describe('boxes on a slope', () => {
  const sloped = (withFence: boolean) => {
    const p = createProject('t')
    p.plot = { kind: 'rect', widthM: 30, lengthM: 30 }
    p.location = { lat: 51.5, lon: 0 }
    p.slope = { steepness: 'strong', facing: 'S' }
    if (withFence) p.shadeObjects.push({ id: 'f', kind: 'fence', x: 15, y: 15, rotationDeg: 0, widthM: 0.2, lengthM: 20, heightM: 2, canopy: null })
    return p
  }
  it('a long fence running downhill shades both its uphill and downhill ends', () => {
    const lost = (y: number) => {
      const at = { x: 15.6, y }
      return growingSeasonHours(sloped(false), null, at, 0, 0) - growingSeasonHours(sloped(true), null, at, 0, 0)
    }
    expect(lost(6.5)).toBeGreaterThan(1.5)
    expect(lost(23.5)).toBeGreaterThan(1.5)
    expect(lost(15)).toBeGreaterThan(1.5)
  })
  it('the sheared box follows the plane: a flat fence stays flat', () => {
    const p = sloped(true)
    p.slope = { steepness: 'flat', facing: null }
    const [o] = buildScene(p, null, 0, 'spring')
    expect(o).not.toHaveProperty('zSlope')
  })
})

describe('grid and point agree on a slope', () => {
  it('sunHoursGrid hours equal sunHoursAt at cell centres, with a long fence and a house', () => {
    const p = createProject('t')
    p.plot = { kind: 'rect', widthM: 30, lengthM: 30 }
    p.location = { lat: 51.5, lon: 0 }
    p.slope = { steepness: 'strong', facing: 'S' }
    p.shadeObjects.push(
      { id: 'f', kind: 'fence', x: 15, y: 15, rotationDeg: 0, widthM: 0.2, lengthM: 20, heightM: 2, canopy: null },
      { id: 'h', kind: 'house', x: 6, y: 6, rotationDeg: 20, ...SHADE_DEFAULTS.house },
    )
    const ground = groundOf(p)
    const samples = seasonSamples(p, 'midsummer')
    const scene = buildScene(p, null, 0, 'midsummer')
    const grid = sunHoursGrid(p.plot, 0.3, samples, scene, ground)
    for (const [col, row] of [[31, 13], [31, 47], [31, 30], [12, 12], [50, 5]] as const) {
      const at = { x: (col + 0.5) * grid.cellM, y: (row + 0.5) * grid.cellM }
      expect(grid.hours[row * grid.cols + col]).toBeCloseTo(sunHoursAt(at, 0.3, samples, scene, undefined, ground), 4)
    }
  })

  it('a bed is not a shade obstacle: a point inside it gets the same hours as without it', () => {
    const p = base()
    p.location = { lat: 47.5, lon: 19 }
    const open = growingSeasonHours(p, null, { x: 5, y: 5 }, 0.1, 0)
    const bed = { id: 'bed', kind: 'bed' as const, x: 5, y: 5, rotationDeg: 0, widthM: 1.2, lengthM: 2.4, heightM: 0.3, canopy: null }
    const withBed = { ...p, shadeObjects: [bed] } // a new object: buildScene memoises per project
    expect(buildScene(withBed, null, 0, 'midsummer')).toEqual([])
    expect(growingSeasonHours(withBed, null, { x: 5, y: 5 }, 0.1, 0)).toBe(open)
  })
})
