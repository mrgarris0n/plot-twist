import { describe, expect, it } from 'vitest'
import { createProject } from '../../model/project'
import { formatLength } from '../../model/units'
import { fixtureLibrary, fixturePlant } from '../../test/fixtures'
import { crowdingWarnings, crownOverlapFraction, similarHeight } from './crowding'
import { place } from './test-helpers'
import type { Layer } from '../../model/plants'

const rec = (id: string, name: string, layer: Layer, h: number, w: number, minSpacingM: number | null = null) =>
  fixturePlant({ id, commonNames: [name], layer, variants: [{ id: 'a', label: 'A', matureHeightM: h, matureWidthM: w, yearsToMaturity: 0, minSpacingM }] }) // 0 = full-grown from planting, so these tests exercise mature sizes

const lib = fixtureLibrary(
  rec('apple', 'Apple', 'canopy', 4, 4),
  rec('comfrey', 'Comfrey', 'herbaceous', 1, 0.9),
  rec('chives', 'Chives', 'herbaceous', 0.3, 0.3),
  rec('clover', 'White clover', 'ground-cover', 0.2, 0.5),
  rec('currant', 'Black currant', 'shrub', 1.5, 1.5),
  rec('hazel', 'Hazel', 'sub-canopy', 5, 3, 4.6),
)
const project = () => createProject('t')

describe('crowding helpers', () => {
  it('similarHeight uses 30 % of the taller plant', () => {
    expect(similarHeight(4, 3)).toBe(true)
    expect(similarHeight(4, 2.7)).toBe(false)
  })
  it('crownOverlapFraction is floored at 0 and finite at distance 0', () => {
    expect(crownOverlapFraction(2, 4, 4)).toBeCloseTo(0.5)
    expect(crownOverlapFraction(10, 4, 4)).toBe(0)
    expect(crownOverlapFraction(0, 4, 4)).toBe(1)
  })
})

describe('crowdingWarnings', () => {
  it('two apples 2 m apart crowd; key uses sorted ids', () => {
    const p = project()
    p.plants.push(place('b', 'apple', 2, 0), place('a', 'apple', 0, 0))
    const ws = crowdingWarnings(p, lib)
    expect(ws).toHaveLength(1)
    expect(ws[0]).toMatchObject({ key: 'crowding:a:b', type: 'crowding', severity: 'warning', plantIds: ['a', 'b'], startYear: 0, fix: null })
  })
  it('two apples 4 m apart do not crowd', () => {
    const p = project()
    p.plants.push(place('a', 'apple', 0, 0), place('b', 'apple', 4, 0))
    expect(crowdingWarnings(p, lib)).toEqual([])
  })
  it('rule (b): different layers of similar height crowd when crowns overlap', () => {
    const lib2 = fixtureLibrary(rec('plum', 'Plum', 'sub-canopy', 4, 4), rec('elder', 'Elder', 'shrub', 3.5, 3))
    const p = project()
    p.plants.push(place('p', 'plum', 0, 0), place('e', 'elder', 2.5, 0)) // overlap (2 + 1.5 − 2.5) / 3 = 0.33
    const ws = crowdingWarnings(p, lib2)
    expect(ws).toHaveLength(1)
    expect(ws[0]).toMatchObject({ key: 'crowding:e:p', startYear: 0 })
    expect(ws[0]!.detail).toContain('mature heights within 30%')
    p.plants[1]!.x = 3.5 // overlap 0
    expect(crowdingWarnings(p, lib2)).toEqual([])
  })
  it('a classic guild produces no warnings', () => {
    const p = project()
    p.plants.push(
      place('apple', 'apple', 10, 10),
      place('comfrey', 'comfrey', 11, 10),
      place('chives', 'chives', 9, 10.5),
      place('clover', 'clover', 10, 11.5),
      place('currant', 'currant', 12.2, 10),
    )
    expect(crowdingWarnings(p, lib)).toEqual([])
  })
  it('two hazels closer than their spacing warn by rule (c) from year 0', () => {
    const p = project()
    p.plants.push(place('h1', 'hazel', 0, 0), place('h2', 'hazel', 4, 0)) // crowns 3 m wide do not overlap
    const ws = crowdingWarnings(p, lib)
    expect(ws).toHaveLength(1)
    expect(ws[0]!.startYear).toBe(0)
    expect(ws[0]!.message).toContain(formatLength(4.6, 'metric'))
  })
  it('same point crowding: warning without NaN', () => {
    const p = project()
    p.plants.push(place('a', 'apple', 5, 5), place('b', 'apple', 5, 5))
    const ws = crowdingWarnings(p, lib)
    expect(ws).toHaveLength(1)
    expect(ws[0]!.message).not.toMatch(/NaN/)
    expect(ws[0]!.detail).not.toMatch(/NaN/)
  })
  it('names the first sampled year the crowns overlap too much', () => {
    const grow = fixtureLibrary(fixturePlant({ id: 'g', commonNames: ['Apple'], variants: [{ id: 'a', label: 'A', matureHeightM: 4, matureWidthM: 4, yearsToMaturity: 6, minSpacingM: null }] }))
    const p = project()
    p.plants.push(place('a', 'g', 0, 0), place('b', 'g', 2.5, 0))
    const [w] = crowdingWarnings(p, grow)
    expect(w!.startYear).toBeGreaterThan(0)
    expect(w!.message).toContain(`year ${w!.startYear}`)
  })
})
