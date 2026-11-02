import { describe, expect, it } from 'vitest'
import { createProject, pointInPlot } from '../model/project'
import { SHADE_DEFAULTS } from '../state/store'
import { place } from './checks/test-helpers'
import { fixtureLibrary, fixturePlant } from '../test/fixtures'
import { growingSeasonHours } from './scene'
import { YEAR_SAMPLES } from './growth'
import { suggestSpots } from './suggest'
import { analyze } from './checks'

const fig = fixturePlant({ id: 'fig', commonNames: ['Fig'], layer: 'sub-canopy', sunNeed: 'full', variants: [{ id: 'a', label: 'A', matureHeightM: 2, matureWidthM: 2, yearsToMaturity: null, minSpacingM: null }] })
const lib = fixtureLibrary(fig)

function base() {
  const p = createProject('t')
  p.location = { lat: 47.5, lon: 19.04 }
  p.plot = { kind: 'rect', widthM: 20, lengthM: 20 }
  return p
}
function withHouse() {
  const p = base()
  p.shadeObjects.push({ id: 'house', kind: 'house', x: 10, y: 14, rotationDeg: 0, ...SHADE_DEFAULTS.house, widthM: 20 })
  p.plants.push(place('f1', 'fig', 10, 8))
  return p
}

describe('suggestSpots', () => {
  it('finds sunny spots for a fig north of the house', () => {
    const p = withHouse()
    const spots = suggestSpots(p, lib, 'f1')
    expect(spots.length).toBeGreaterThanOrEqual(1)
    expect(spots.length).toBeLessThanOrEqual(2)
    for (const s of spots) {
      expect(pointInPlot(p.plot, s)).toBe(true)
      for (const year of YEAR_SAMPLES) expect(growingSeasonHours(p, lib, s, 0.75 * 2, year, 'f1')).toBeGreaterThanOrEqual(6)
    }
  })
  it('never suggests a point inside the house', () => {
    const p = withHouse()
    for (const s of suggestSpots(p, lib, 'f1', 50)) expect(s.y < 10 || s.y > 18).toBe(true)
  })
  it('returns nothing when the whole plot is shaded', () => {
    const p = base()
    p.shadeObjects.push({ id: 'big', kind: 'tree', x: 10, y: 10, rotationDeg: 0, widthM: 200, lengthM: 200, heightM: 3, canopy: 'dense' })
    p.plants.push(place('f1', 'fig', 10, 8))
    expect(suggestSpots(p, lib, 'f1')).toEqual([])
  })
  it('attaches the spots to the light warning', () => {
    const w = analyze(withHouse(), lib).find((x) => x.key === 'light:f1')!
    expect(w.fix?.kind).toBe('move')
    expect(w.fix?.spots.length).toBeGreaterThan(0)
  })
})

describe('suggestSpots spread and cost', () => {
  it('returned spots are at least max(2 m, mature width) apart', () => {
    const p = withHouse()
    const spots = suggestSpots(p, lib, 'f1', 3)
    expect(spots.length).toBeGreaterThanOrEqual(2)
    for (let i = 0; i < spots.length; i++)
      for (let j = i + 1; j < spots.length; j++) expect(Math.hypot(spots[i]!.x - spots[j]!.x, spots[i]!.y - spots[j]!.y)).toBeGreaterThanOrEqual(2)
  })
  it('analyze on a 30x30 plot with a house, 8 trees and 10 shaded plants finishes under 2 s', () => {
    const p = base()
    p.plot = { kind: 'rect', widthM: 30, lengthM: 30 }
    p.shadeObjects.push({ id: 'house', kind: 'house', x: 15, y: 15, rotationDeg: 0, ...SHADE_DEFAULTS.house, widthM: 24 })
    for (let i = 0; i < 8; i++) p.shadeObjects.push({ id: `t${i}`, kind: 'tree', x: 3 + (i % 4) * 8, y: i < 4 ? 4 : 26, rotationDeg: 0, ...SHADE_DEFAULTS.tree })
    for (let i = 0; i < 10; i++) p.plants.push(place(`f${i}`, 'fig', 3 + i * 2.5, 10))
    const t = performance.now()
    const ws = analyze(p, lib)
    expect(performance.now() - t).toBeLessThan(2000)
    expect(ws.filter((w) => w.type === 'light').length).toBeGreaterThan(0)
  })
})

describe('suggestSpots in a veggie-beds garden', () => {
  const bean = fixturePlant({ id: 'bean', commonNames: ['Bean'], layer: 'herbaceous', sunNeed: 'full', annual: true, variants: [{ id: 'a', label: 'A', matureHeightM: 1, matureWidthM: 0.4, yearsToMaturity: 0, minSpacingM: null }] })
  const vlib = fixtureLibrary(bean)
  const bed = (id: string, x: number, y: number) => ({ id, kind: 'bed' as const, name: id, perennial: false, x, y, rotationDeg: 0, widthM: 1.2, lengthM: 2.4, heightM: 0.3, canopy: null })
  function veggie() {
    const p = base()
    p.gardenType = 'veggie-beds'
    // a tall wall between the beds: its shadow falls north onto bed N, while bed S (south of it) stays in the open
    p.shadeObjects.push({ id: 'wall', kind: 'wall', x: 10, y: 8, rotationDeg: 0, ...SHADE_DEFAULTS.wall, widthM: 20, heightM: 4 })
    p.shadeObjects.push(bed('N', 8, 6), bed('S', 8, 14))
    p.plants.push(place('b1', 'bean', 8, 6))
    return p
  }
  const inside = (b: ReturnType<typeof bed>, s: { x: number; y: number }, r: number) =>
    Math.abs(s.x - b.x) <= b.widthM / 2 - r + 1e-9 && Math.abs(s.y - b.y) <= b.lengthM / 2 - r + 1e-9

  it('only suggests spots inside a bed, with the whole plant inside its edges', () => {
    const p = veggie()
    const spots = suggestSpots(p, vlib, 'b1', 20)
    expect(spots.length).toBeGreaterThan(0)
    const beds = p.shadeObjects.filter((o) => o.kind === 'bed') as ReturnType<typeof bed>[]
    for (const s of spots) expect(beds.some((b) => inside(b, s, 0.2))).toBe(true)
  })
  it('finds a spot in a narrow bed that the 1 m grid would miss', () => {
    const p = veggie()
    // the sunny bed sits off the 1 m grid's cell centres
    p.shadeObjects = p.shadeObjects.map((o) => (o.id === 'S' ? { ...o, x: 8.1, y: 14.1, widthM: 0.6 } : o))
    const S = p.shadeObjects.find((o) => o.id === 'S') as ReturnType<typeof bed>
    const spots = suggestSpots(p, vlib, 'b1', 5)
    expect(spots.some((s) => inside(S, s, 0.2))).toBe(true)
  })
})
