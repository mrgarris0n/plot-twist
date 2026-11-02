import { describe, expect, it } from 'vitest'
import type { RotationGroup } from '../../model/plants'
import { createProject, type Project } from '../../model/project'
import { en } from '../../strings/en'
import { fixtureLibrary, fixturePlant } from '../../test/fixtures'
import { ROTATION_GAP_YEARS } from '../rotation'
import { analyze } from './index'
import { rotationWarnings } from './rotation'
import { place } from './test-helpers'

const crop = (id: string, rotationGroup: RotationGroup) =>
  fixturePlant({ id, commonNames: [id], annual: true, rotationGroup, variants: [{ id: 'a', label: 'A', matureHeightM: 0.5, matureWidthM: 0.3, yearsToMaturity: 1, minSpacingM: null }] })
const lib = fixtureLibrary(crop('bra', 'brassicas'), crop('leg', 'legumes'), crop('any', 'any'))
const bed = { id: 'b', kind: 'bed' as const, x: 0, y: 0, widthM: 2, lengthM: 4, rotationDeg: 0, heightM: 0.3, canopy: null, name: 'Bed B' }

function garden(year: number, ...plants: ReturnType<typeof place>[]): Project {
  const p = createProject('t')
  p.gardenType = 'veggie-beds'
  p.shadeObjects = [bed]
  p.plants = plants
  p.settings.year = year
  return p
}

describe('rotationWarnings', () => {
  it('warns when brassicas return within 3 years', () => {
    const p = garden(1, place('1', 'bra', 0, 0, { plantedYear: 0 }), place('2', 'bra', 0.5, 0, { plantedYear: 1 }))
    const w = rotationWarnings(p, lib)
    expect(w).toHaveLength(1)
    expect(w[0]).toMatchObject({ key: 'rotation:b:brassicas', type: 'rotation', severity: 'warning', plantIds: ['2'], fix: null })
    expect(w[0]!.message).toBe(en.warnings.rotation('brassicas', 'Bed B', 1))
    expect(w[0]!.message).toContain(`Wait ${ROTATION_GAP_YEARS} years`)
    expect(rotationWarnings(garden(3, place('1', 'bra', 0, 0), place('2', 'bra', 0, 1, { plantedYear: 3 })), lib)).toHaveLength(1)
  })
  it('a bed whose name was cleared reads "this bed"', () => {
    const p = garden(1, place('1', 'bra', 0, 0, { plantedYear: 0 }), place('2', 'bra', 0.5, 0, { plantedYear: 1 }))
    p.shadeObjects = [{ ...bed, name: '  ' }]
    expect(rotationWarnings(p, lib)[0]!.message).toBe(en.warnings.rotation('brassicas', en.rotation.thisBed, 1, ROTATION_GAP_YEARS))
  })
  it('says how many more years to wait when the crop grew 2 or 3 years ago', () => {
    const w2 = rotationWarnings(garden(2, place('1', 'bra', 0, 0), place('2', 'bra', 0, 1, { plantedYear: 2 })), lib)
    expect(w2[0]!.message).toBe('Cabbage family grew in Bed B 2 years ago. Wait 2 more years before growing it here again.')
    const w3 = rotationWarnings(garden(3, place('1', 'bra', 0, 0), place('2', 'bra', 0, 1, { plantedYear: 3 })), lib)
    expect(w3[0]!.message).toBe('Cabbage family grew in Bed B 3 years ago. Wait 1 more year before growing it here again.')
  })
  it('none after 3 clear years', () => {
    expect(rotationWarnings(garden(4, place('1', 'bra', 0, 0), place('2', 'bra', 0, 1, { plantedYear: 4 })), lib)).toEqual([])
  })
  it('none for a different group or fits-anywhere', () => {
    expect(rotationWarnings(garden(1, place('1', 'bra', 0, 0), place('2', 'leg', 0, 1, { plantedYear: 1 })), lib)).toEqual([])
    expect(rotationWarnings(garden(1, place('1', 'any', 0, 0), place('2', 'any', 0, 1, { plantedYear: 1 })), lib)).toEqual([])
  })
  it('same group in a different bed does not warn', () => {
    const p = garden(1, place('1', 'bra', 0, 0), place('2', 'bra', 10, 0, { plantedYear: 1 }))
    p.shadeObjects.push({ ...bed, id: 'c', name: 'Bed C', x: 10 })
    expect(rotationWarnings(p, lib)).toEqual([])
  })
  it('bed with no annuals this year gives no warning', () => {
    expect(rotationWarnings(garden(1, place('1', 'bra', 0, 0)), lib)).toEqual([])
  })
  it('no rotation warning in year 0', () => {
    expect(rotationWarnings(garden(0, place('1', 'bra', 0, 0), place('2', 'bra', 0, 1)), lib)).toEqual([])
  })
  it('no rotation warning in a food-forest garden', () => {
    const p = garden(1, place('1', 'bra', 0, 0), place('2', 'bra', 0, 1, { plantedYear: 1 }))
    p.gardenType = 'food-forest'
    expect(rotationWarnings(p, lib)).toEqual([])
  })
  it('analyze sees earlier years even though it filters to the current one', () => {
    const p = garden(1, place('1', 'bra', 0, 0, { plantedYear: 0 }), place('2', 'bra', 0.5, 0, { plantedYear: 1 }))
    const w = analyze(p, lib).filter((x) => x.type === 'rotation')
    expect(w.map((x) => x.key)).toEqual(['rotation:b:brassicas'])
    p.dismissedWarnings = ['rotation:b:brassicas']
    expect(analyze(p, lib).filter((x) => x.type === 'rotation')).toEqual([])
  })
})
