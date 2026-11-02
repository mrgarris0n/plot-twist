import { describe, expect, it } from 'vitest'
import { createProject, plotBounds, pointInPlot, projectSchema } from './project'

describe('project', () => {
  it('createProject passes schema', () => {
    const p = createProject('Back yard')
    expect(projectSchema.parse(p)).toEqual(p)
    expect(p.plot).toEqual({ kind: 'rect', widthM: 10, lengthM: 10 })
    expect(p.settings).toEqual({ units: 'metric', season: 'midsummer', year: 0 })
  })
  it('old saved climate still parses', () => {
    const climate = { source: 'lookup' as const, minWinterC: -5, lastFrostDoy: 100, firstFrostDoy: 300, frostFree: false }
    const p = { ...createProject('old'), climate }
    expect(projectSchema.parse(p).climate).toEqual(climate)
  })
  it('climate rain and cloud values survive the schema, including nulls', () => {
    const base = { source: 'lookup' as const, minWinterC: -5, lastFrostDoy: 100, firstFrostDoy: 300, frostFree: false }
    const withRain = { ...base, rainYearMm: 640, rainWarmMm: 310, cloudWarmPct: 72 }
    const nulls = { ...base, rainYearMm: null, rainWarmMm: null, cloudWarmPct: null }
    expect(projectSchema.parse({ ...createProject('r'), climate: withRain }).climate).toEqual(withRain)
    expect(projectSchema.parse({ ...createProject('n'), climate: nulls }).climate).toEqual(nulls)
  })
  it('old project without slope parses', () => {
    const p = createProject('old')
    expect('slope' in projectSchema.parse(p)).toBe(false)
  })
  it('slope round-trips', () => {
    const slope = { steepness: 'strong' as const, facing: 'SW' as const }
    expect(projectSchema.parse({ ...createProject('s'), slope }).slope).toEqual(slope)
    const flat = { steepness: 'flat' as const, facing: null }
    expect(projectSchema.parse({ ...createProject('f'), slope: flat }).slope).toEqual(flat)
  })
  it('rejects flat with a facing and non-flat without one', () => {
    expect(() => projectSchema.parse({ ...createProject('x'), slope: { steepness: 'flat', facing: 'S' } })).toThrow()
    expect(() => projectSchema.parse({ ...createProject('x'), slope: { steepness: 'gentle', facing: null } })).toThrow()
  })
  it('schema rejects bad data', () => {
    expect(() => projectSchema.parse({ ...createProject('x'), schemaVersion: 2 })).toThrow()
  })
  describe('schema rejects degenerate data', () => {
    const base = createProject('x')
    const shade = { id: 's', kind: 'house' as const, x: 0, y: 0, widthM: 5, lengthM: 5, rotationDeg: 0, heightM: 5, canopy: null }
    const plant = { id: 'p', plantId: 'apple', variantId: null, x: 1, y: 1, plantedYear: 0, heightOverrideM: null, widthOverrideM: null }
    const tri = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }]
    const bad: [string, unknown][] = [
      ['rect width 0', { ...base, plot: { kind: 'rect', widthM: 0, lengthM: 5 } }],
      ['rect length negative', { ...base, plot: { kind: 'rect', widthM: 5, lengthM: -1 } }],
      ['rect width > 1000', { ...base, plot: { kind: 'rect', widthM: 1001, lengthM: 5 } }],
      ['polygon 2 points', { ...base, plot: { kind: 'polygon', points: tri.slice(0, 2) } }],
      ['polygon NaN point', { ...base, plot: { kind: 'polygon', points: [...tri.slice(0, 2), { x: NaN, y: 0 }] } }],
      ['rect Infinity', { ...base, plot: { kind: 'rect', widthM: Infinity, lengthM: 5 } }],
      ['shade width 0', { ...base, shadeObjects: [{ ...shade, widthM: 0 }] }],
      ['shade height 0', { ...base, shadeObjects: [{ ...shade, heightM: 0 }] }],
      ['shade length negative', { ...base, shadeObjects: [{ ...shade, lengthM: -2 }] }],
      ['negative height override', { ...base, plants: [{ ...plant, heightOverrideM: -1 }] }],
      ['zero width override', { ...base, plants: [{ ...plant, widthOverrideM: 0 }] }],
      ['huge height override', { ...base, plants: [{ ...plant, heightOverrideM: 1e9 }] }],
      ['plantedYear 21', { ...base, plants: [{ ...plant, plantedYear: 21 }] }],
      ['plantedYear 1.5', { ...base, plants: [{ ...plant, plantedYear: 1.5 }] }],
      ['plantedYear -1', { ...base, plants: [{ ...plant, plantedYear: -1 }] }],
      ['settings.year 21', { ...base, settings: { ...base.settings, year: 21 } }],
      ['settings.year 2.5', { ...base, settings: { ...base.settings, year: 2.5 } }],
      ['northDeg NaN', { ...base, northDeg: NaN }],
      ['lat 91', { ...base, location: { lat: 91, lon: 0 } }],
      ['lon -181', { ...base, location: { lat: 0, lon: -181 } }],
    ]
    it.each(bad)('%s', (_n, v) => {
      expect(projectSchema.safeParse(v).success).toBe(false)
    })
    it('accepts valid boundary data', () => {
      const ok = { ...base, location: { lat: -90, lon: 180 }, plot: { kind: 'polygon', points: tri }, shadeObjects: [shade], plants: [{ ...plant, plantedYear: 20 }, { ...plant, id: 'q', heightOverrideM: 3, widthOverrideM: null }], settings: { ...base.settings, year: 20 } }
      expect(projectSchema.safeParse(ok).success).toBe(true)
    })
  })
  it('pointInPlot rect', () => {
    const plot = createProject('x').plot
    expect(pointInPlot(plot, { x: 5, y: 5 })).toBe(true)
    expect(pointInPlot(plot, { x: 11, y: 5 })).toBe(false)
  })
  it('pointInPlot polygon', () => {
    const plot = { kind: 'polygon' as const, points: [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 0, y: 10 }] }
    expect(pointInPlot(plot, { x: 10 / 3, y: 10 / 3 })).toBe(true)
    expect(pointInPlot(plot, { x: 8, y: 8 })).toBe(false)
  })
  it('plotBounds', () => {
    expect(plotBounds({ kind: 'rect', widthM: 4, lengthM: 6 })).toEqual({ widthM: 4, lengthM: 6 })
    expect(plotBounds({ kind: 'polygon', points: [{ x: 1, y: 2 }, { x: 5, y: 2 }, { x: 1, y: 9 }] })).toEqual({ widthM: 4, lengthM: 7 })
  })
  it('veggie-beds garden type parses', () => {
    const p = { ...createProject('v'), gardenType: 'veggie-beds' as const }
    expect(projectSchema.parse(p).gardenType).toBe('veggie-beds')
  })
  it('bed with name and perennial round-trips', () => {
    const bed = { id: 'b', kind: 'bed' as const, x: 2, y: 2, widthM: 1.2, lengthM: 2.4, rotationDeg: 0, heightM: 0.3, canopy: null, name: 'Bed A', perennial: true }
    const p = { ...createProject('v'), shadeObjects: [bed] }
    expect(projectSchema.parse(p).shadeObjects[0]).toEqual(bed)
  })
  it('old shade object without name parses', () => {
    const old = { id: 'b', kind: 'bed' as const, x: 2, y: 2, widthM: 1, lengthM: 1, rotationDeg: 0, heightM: 0.3, canopy: null }
    const out = projectSchema.parse({ ...createProject('v'), shadeObjects: [old] }).shadeObjects[0]!
    expect(out.name).toBeUndefined()
    expect(out.perennial).toBeUndefined()
  })
})
