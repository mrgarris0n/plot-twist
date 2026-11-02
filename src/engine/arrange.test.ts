import { describe, expect, it } from 'vitest'
import { library } from '../data/library'
import { createProject, type Project } from '../model/project'
import { autoArrange } from './arrange'
import { effectiveSize } from './growth'
import { CROWD_OVERLAP_FRACTION, crowdingWarnings, crownOverlapFraction } from './checks/crowding'
import { place } from './checks/test-helpers'
import { fixtureLibrary, fixturePlant } from '../test/fixtures'

function appleGarden(): Project {
  const p = createProject('t')
  p.location = { lat: 47.5, lon: 19.04 }
  p.plot = { kind: 'rect', widthM: 20, lengthM: 20 }
  p.soil = { source: 'manual', phMin: 6.5, phMax: 7, texture: 'loamy', drainage: 'normal' }
  p.climate = { source: 'manual', minWinterC: -15, lastFrostDoy: null, firstFrostDoy: null, frostFree: false }
  p.plants.push(place('apple-1', 'apple', 10, 10, { variantId: 'semi-dwarf' }))
  return p
}

describe('autoArrange', () => {
  it('fills a guild round a semi-dwarf apple without crowding', () => {
    const p = appleGarden()
    const ghosts = autoArrange(p, library)
    expect(ghosts.length).toBeGreaterThanOrEqual(4)
    const recs = ghosts.map((g) => library.byId.get(g.plantId)!)
    expect(recs.some((r) => r.roles?.includes('nitrogen-fixer'))).toBe(true)
    expect(recs.some((r) => r.layer === 'ground-cover')).toBe(true)
    for (const g of ghosts) {
      expect(g.id.startsWith('ghost-')).toBe(true)
      expect(g).toMatchObject({ variantId: null, plantedYear: 0, heightOverrideM: null, widthOverrideM: null })
    }
    expect(crowdingWarnings({ ...p, plants: [...p.plants, ...ghosts] }, library)).toEqual([])
  })
  it('guild plants do not share a spot', () => {
    const ghosts = autoArrange(appleGarden(), library).filter((g) => !['canopy', 'sub-canopy'].includes(library.byId.get(g.plantId)!.layer))
    const width = (g: (typeof ghosts)[number]) => effectiveSize(g, library.byId.get(g.plantId)!).matureWidthM
    for (let i = 0; i < ghosts.length; i++) {
      for (let j = i + 1; j < ghosts.length; j++) {
        const a = ghosts[i]!
        const b = ghosts[j]!
        expect(crownOverlapFraction(Math.hypot(a.x - b.x, a.y - b.y), width(a), width(b))).toBeLessThanOrEqual(CROWD_OVERLAP_FRACTION)
      }
    }
    expect(new Set(ghosts.map((g) => `${g.x},${g.y}`)).size).toBeGreaterThanOrEqual(3)
  })
  it('leaves user plants untouched and is deterministic', () => {
    const p = appleGarden()
    const before = structuredClone(p.plants)
    const a = autoArrange(p, library)
    expect(p.plants).toEqual(before)
    expect(autoArrange(p, library)).toEqual(a)
  })
  it('no trees → []', () => {
    const p = appleGarden()
    p.plants = [place('c', 'black-currant', 5, 5)]
    expect(autoArrange(p, library)).toEqual([])
  })
  it('skips a slot whose candidates all fail the climate check', () => {
    const lib = fixtureLibrary(
      fixturePlant({ id: 'apple', commonNames: ['Apple'], layer: 'canopy', minWinterC: -30 }),
      fixturePlant({ id: 'tender', commonNames: ['Tender bush'], layer: 'shrub', roles: ['nitrogen-fixer'], minWinterC: -5, sunNeed: 'part', variants: [{ id: 'a', label: 'A', matureHeightM: 1, matureWidthM: 1, yearsToMaturity: null, minSpacingM: null }] }),
      fixturePlant({ id: 'mat', commonNames: ['Mat'], layer: 'ground-cover', minWinterC: -30, sunNeed: 'part', variants: [{ id: 'a', label: 'A', matureHeightM: 0.2, matureWidthM: 0.5, yearsToMaturity: null, minSpacingM: null }] }),
    )
    const p = appleGarden()
    p.plants = [place('a', 'apple', 10, 10)]
    const ghosts = autoArrange(p, lib)
    expect(ghosts.map((g) => g.plantId)).toEqual(['mat', 'mat'])
  })
  it('the apple scenario runs in under 3 s', () => {
    const p = appleGarden()
    const t0 = performance.now()
    autoArrange(p, library)
    expect(performance.now() - t0).toBeLessThan(3000)
  })
})

describe('autoArrange water', () => {
  it('skips species with a water warning', () => {
    const small = [{ id: 'a', label: 'A', matureHeightM: 0.2, matureWidthM: 0.5, yearsToMaturity: 2, minSpacingM: null }]
    const tree = fixturePlant({ id: 'tree', commonNames: ['Tree'], layer: 'canopy' })
    const thirsty = fixturePlant({ id: 'thirsty', commonNames: ['Thirsty'], layer: 'ground-cover', variants: small, water: { level: 'high' } })
    const hardy = fixturePlant({ id: 'hardy', commonNames: ['Hardy'], layer: 'ground-cover', variants: small, water: { level: 'low' } })
    const lib = fixtureLibrary(tree, thirsty, hardy)
    const p = createProject('t')
    p.plot = { kind: 'rect', widthM: 20, lengthM: 20 }
    p.climate = { source: 'manual', minWinterC: null, lastFrostDoy: null, firstFrostDoy: null, frostFree: false, rainYearMm: 300, rainWarmMm: 100 }
    p.plants.push(place('t-1', 'tree', 10, 10))
    const ids = new Set(autoArrange(p, lib).map((g) => g.plantId))
    expect(ids.has('hardy')).toBe(true)
    expect(ids.has('thirsty')).toBe(false)
  })
})
