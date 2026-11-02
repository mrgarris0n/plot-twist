import { describe, expect, it } from 'vitest'
import { createProject } from '../../model/project'
import { SHADE_DEFAULTS } from '../../state/store'
import { en } from '../../strings/en'
import { fixtureLibrary, fixturePlant } from '../../test/fixtures'
import { growingSeasonHours } from '../scene'
import { lightWarnings } from './light'
import { place } from './test-helpers'

const size = (h: number, w: number, ytm: number | null = 0) => [{ id: 'a', label: 'A', matureHeightM: h, matureWidthM: w, yearsToMaturity: ytm, minSpacingM: null }]
const fig = fixturePlant({ id: 'fig', commonNames: ['Fig'], layer: 'sub-canopy', sunNeed: 'full', variants: size(2, 2) })
const walnut = fixturePlant({ id: 'walnut', commonNames: ['Walnut'], layer: 'canopy', sunNeed: 'full', variants: size(20, 20, 15) })
const fern = fixturePlant({ id: 'fern', commonNames: ['Fern'], layer: 'herbaceous', sunNeed: 'shade', variants: size(0.6, 0.6) })
const lib = fixtureLibrary(fig, walnut, fern)

function budapest() {
  const p = createProject('t')
  p.location = { lat: 47.5, lon: 19.04 }
  p.plot = { kind: 'rect', widthM: 20, lengthM: 20 }
  return p
}
// Plot frame: y grows southward when north is screen-up, so "north of" means smaller y.
// The house is a long 7 m house (20 m east–west) so morning and evening sun cannot reach round its ends.
function withHouse() {
  const p = budapest()
  p.shadeObjects.push({ id: 'house', kind: 'house', x: 10, y: 14, rotationDeg: 0, ...SHADE_DEFAULTS.house, widthM: 20 }) // north wall at y = 10
  return p
}

describe('lightWarnings', () => {
  it('fig 2 m north of a 7 m house warns from year 0 with a plain message', () => {
    const p = withHouse()
    p.plants.push(place('f1', 'fig', 10, 8))
    const ws = lightWarnings(p, lib)
    expect(ws).toHaveLength(1)
    const w = ws[0]!
    expect(w).toMatchObject({ key: 'light:f1', type: 'light', severity: 'warning', plantIds: ['f1'], startYear: 0, fix: null })
    const h = growingSeasonHours(p, lib, { x: 10, y: 8 }, 0.75 * 2, 0, 'f1')
    expect(h).toBeLessThan(6)
    expect(w.message).toBe(en.warnings.lightNow('Fig', 'full', h, { name: 'House', isPlant: false }))
    expect(w.message).toContain('because the house shades it')
    expect(w.message).toContain('6+')
  })
  it('fig in the open gets no warning', () => {
    const p = budapest()
    p.plants.push(place('f1', 'fig', 10, 8))
    expect(lightWarnings(p, lib)).toEqual([])
  })
  it('names the walnut that grows over the fig later', () => {
    // A tall (8 m) fig: low plants keep getting morning and evening sun under a single high crown.
    const p = budapest()
    p.plants.push(place('w1', 'walnut', 10, 12), place('f1', 'fig', 10, 8, { heightOverrideM: 8 }))
    const ws = lightWarnings(p, lib)
    const w = ws.find((x) => x.key === 'light:f1')
    expect(w).toBeDefined()
    expect(w!.startYear).toBeGreaterThan(0)
    expect(w!.message.toLowerCase()).toContain('walnut')
  })
  it('a fig planted in year 3 under a grown walnut names the walnut from its first year', () => {
    const p = budapest()
    p.plants.push(place('w1', 'walnut', 10, 12), place('f1', 'fig', 10, 8, { heightOverrideM: 8, plantedYear: 3 }))
    const w = lightWarnings(p, lib).find((x) => x.key === 'light:f1')!
    expect(w.startYear).toBe(3)
    expect(w.message).toContain('because the walnut shades it')
  })
  it('with two blockers names the one whose removal adds the most sun', () => {
    const p = withHouse()
    // A shed listed first, just east of the fig: it shades the fig a little, the long house much more.
    p.shadeObjects.unshift({ id: 'shed', kind: 'shed', x: 13, y: 8, rotationDeg: 0, ...SHADE_DEFAULTS.shed })
    p.plants.push(place('f1', 'fig', 10, 8))
    const z = 0.75 * 2
    const hours = growingSeasonHours(p, lib, { x: 10, y: 8 }, z, 0, 'f1')
    const gain = (id: string) => growingSeasonHours({ ...p, shadeObjects: p.shadeObjects.filter((o) => o.id !== id) }, lib, { x: 10, y: 8 }, z, 0, 'f1') - hours
    expect(gain('shed')).toBeGreaterThan(0)
    expect(gain('house')).toBeGreaterThan(gain('shed'))
    expect(lightWarnings(p, lib)[0]!.message).toContain('because the house shades it')
  })
  it('a shade plant in deep shade gets no warning', () => {
    const p = withHouse()
    p.plants.push(place('n1', 'fern', 10, 9.6))
    expect(lightWarnings(p, lib)).toEqual([])
  })
  it('no location means no light warnings', () => {
    const p = withHouse()
    p.location = null
    p.plants.push(place('f1', 'fig', 10, 8))
    expect(lightWarnings(p, lib)).toEqual([])
  })
})
