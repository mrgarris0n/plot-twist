import { describe, expect, it } from 'vitest'
import type { CompanionPair } from '../../model/companions'
import { createProject, type Project } from '../../model/project'
import { en } from '../../strings/en'
import { fixtureLibrary, fixturePlant } from '../../test/fixtures'
import { analyze } from './index'
import { companionWarnings, NEIGHBOUR_GAP_M } from './companions'
import { place } from './test-helpers'

const crop = (id: string, name: string) =>
  fixturePlant({ id, commonNames: [name], annual: true, variants: [{ id: 'a', label: 'A', matureHeightM: 0.5, matureWidthM: 0.4, yearsToMaturity: 1, minSpacingM: null }] })
const lib = fixtureLibrary(crop('tom', 'Tomato'), crop('fen', 'Fennel'), crop('bas', 'Basil'))
const src = [{ id: 's', title: 'T', url: 'https://x.org', licence: 'CC' }]
const bad: CompanionPair = { a: 'tom', b: 'fen', effect: 'bad', reason: 'Fennel stunts tomatoes.', sources: src }
const good: CompanionPair = { a: 'bas', b: 'tom', effect: 'good', reason: 'Basil deters pests.', sources: src }
const bed = { id: 'b', kind: 'bed' as const, x: 0, y: 0, widthM: 4, lengthM: 6, rotationDeg: 0, heightM: 0.3, canopy: null, name: 'Bed A' }

function garden(...plants: ReturnType<typeof place>[]): Project {
  const p = createProject('t')
  p.gardenType = 'veggie-beds'
  p.shadeObjects = [bed]
  p.plants = plants
  return p
}

describe('companionWarnings', () => {
  it('bad pair in the same bed side by side warns', () => {
    const w = companionWarnings(garden(place('1', 'tom', 0, 0), place('2', 'fen', 0.5, 0)), lib, [bad])
    expect(w).toHaveLength(1)
    expect(w[0]).toMatchObject({ key: 'companion:1:2', type: 'companion', severity: 'warning', plantIds: ['1', '2'], fix: null })
    expect(w[0]!.message).toBe(en.warnings.companionBad('Tomato', 'Fennel'))
    expect(w[0]!.detail).toContain('Fennel stunts tomatoes.')
  })
  it('good pair gives a hint', () => {
    const w = companionWarnings(garden(place('2', 'tom', 0, 0), place('1', 'bas', 0.5, 0)), lib, [good])
    expect(w).toHaveLength(1)
    expect(w[0]).toMatchObject({ key: 'companion:1:2', severity: 'hint' })
    expect(w[0]!.message).toBe(en.warnings.companionGood('Basil', 'Tomato'))
  })
  it('plants in different beds are not neighbours', () => {
    const p = garden(place('1', 'tom', 0, 0), place('2', 'fen', 10, 0))
    p.shadeObjects.push({ ...bed, id: 'c', x: 10 })
    expect(companionWarnings(p, lib, [bad])).toEqual([])
  })
  it('far apart in one bed are not neighbours', () => {
    // widths 0.4: centres 0.4 + gap apart
    expect(companionWarnings(garden(place('1', 'tom', 0, 0), place('2', 'fen', 0.4 + NEIGHBOUR_GAP_M + 0.1, 0)), lib, [bad])).toEqual([])
    expect(companionWarnings(garden(place('1', 'tom', 0, 0), place('2', 'fen', 0.4 + NEIGHBOUR_GAP_M, 0)), lib, [bad])).toHaveLength(1)
  })
  it('no notes in a food-forest garden', () => {
    const p = garden(place('1', 'tom', 0, 0), place('2', 'fen', 0.5, 0))
    p.gardenType = 'food-forest'
    expect(companionWarnings(p, lib, [bad])).toEqual([])
  })
  it("last year's plant is not a neighbour", () => {
    const p = garden(place('1', 'tom', 0, 0, { plantedYear: 1 }), place('2', 'fen', 0.5, 0, { plantedYear: 0 }))
    p.settings.year = 1
    expect(companionWarnings(p, lib, [bad])).toEqual([])
    expect(analyze(p, lib).filter((w) => w.type !== 'setup')).toEqual([]) // this garden's setup isn't finished
  })
  it('a plant with no pairs gives no note', () => {
    expect(companionWarnings(garden(place('1', 'tom', 0, 0), place('2', 'fen', 0.5, 0)), lib, [])).toEqual([])
  })
})
