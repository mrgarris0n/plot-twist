import { describe, expect, it } from 'vitest'
import { createProject } from '../../model/project'
import { fixtureLibrary, fixturePlant } from '../../test/fixtures'
import { analyze } from '.'
import { place } from './test-helpers'

const lib = fixtureLibrary(
  fixturePlant({ id: 'apple', commonNames: ['Apple'], layer: 'canopy', phMin: 6, phMax: 7, minWinterC: -30 }),
  fixturePlant({ id: 'currant', commonNames: ['Black currant'], layer: 'shrub', variants: [{ id: 'a', label: 'A', matureHeightM: 1.5, matureWidthM: 1.5, yearsToMaturity: null, minSpacingM: null }] }),
)

describe('analyze', () => {
  it('analyze tolerates empty setup', () => {
    const p = createProject('t')
    p.plants.push(place('a', 'apple', 5, 5), place('c1', 'currant', 1, 1), place('c2', 'currant', 9, 9))
    let ws: ReturnType<typeof analyze> = []
    expect(() => { ws = analyze(p, lib) }).not.toThrow()
    expect(ws.filter((w) => ['light', 'soil', 'climate'].includes(w.type))).toEqual([])
  })
  it('sorts by type then key and drops exactly the dismissed keys', () => {
    const p = createProject('t')
    p.climate = { source: 'manual', minWinterC: -40, lastFrostDoy: null, firstFrostDoy: null, frostFree: false }
    p.plants.push(place('b', 'apple', 5, 5), place('a', 'apple', 6, 5), place('c1', 'currant', 1, 1))
    const all = analyze(p, lib)
    expect(all.map((w) => w.key)).toEqual(['setup:incomplete', 'crowding:a:b', 'climate:a', 'climate:b', 'climate:c1', 'balance:groundcover', 'balance:nitrogen'])
    p.dismissedWarnings = ['climate:b']
    expect(analyze(p, lib).map((w) => w.key)).toEqual(all.map((w) => w.key).filter((k) => k !== 'climate:b'))
  })
})
