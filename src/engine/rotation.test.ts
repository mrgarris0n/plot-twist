import { describe, expect, it } from 'vitest'
import type { RotationGroup } from '../model/plants'
import { createProject, type Project, type ShadeObject } from '../model/project'
import { bedAt } from './beds'
import { fixtureLibrary, fixturePlant } from '../test/fixtures'
import { bedGroup, nextGroup, suggestNextYear } from './rotation'
import { place } from './checks/test-helpers'

const crop = (id: string, rotationGroup: RotationGroup | null, o = {}) =>
  fixturePlant({ id, annual: true, rotationGroup, variants: [{ id: 'a', label: 'A', matureHeightM: 0.5, matureWidthM: 0.3, yearsToMaturity: 1, minSpacingM: null }], ...o })
const lib = fixtureLibrary(crop('pot', 'potatoes'), crop('leg', 'legumes'), crop('bra', 'brassicas'), crop('roo', 'roots'), crop('any', 'any'), crop('unk', null),
  crop('onion', 'roots', { annual: null }),
  fixturePlant({ id: 'tree', annual: false, rotationGroup: 'any' }))

const bed = (id: string, name: string, x: number, y: number, o: Partial<ShadeObject> = {}): ShadeObject =>
  ({ id, kind: 'bed', x, y, widthM: 2, lengthM: 4, rotationDeg: 0, heightM: 0.3, canopy: null, name, ...o })
const garden = (beds: ShadeObject[], ...plants: ReturnType<typeof place>[]): Project => {
  const p = createProject('t')
  p.gardenType = 'veggie-beds'
  p.shadeObjects = beds
  p.plants = plants
  return p
}
const four = () => [bed('a', 'Bed A', 0, 0), bed('b', 'Bed B', 5, 0), bed('c', 'Bed C', 10, 0), bed('d', 'Bed D', 15, 0)]

describe('nextGroup', () => {
  it('cycles legumes→brassicas→potatoes→roots→legumes', () => {
    expect(['legumes', 'brassicas', 'potatoes', 'roots'].map((g) => nextGroup(g as RotationGroup))).toEqual(['brassicas', 'potatoes', 'roots', 'legumes'])
  })
})

describe('bedGroup', () => {
  it('majority and tie-break', () => {
    const p = garden(four(), place('1', 'bra', 0, 0), place('2', 'bra', 0, 1), place('3', 'leg', 0, -1))
    expect(bedGroup(p, lib, 'a', 0)).toBe('brassicas')
    const t = garden(four(), place('1', 'roo', 0, 0), place('2', 'leg', 0, 1))
    expect(bedGroup(t, lib, 'a', 0)).toBe('legumes')
    expect(bedGroup(t, lib, 'b', 0)).toBeNull()
  })
  it('ignores any and perennials', () => {
    const p = garden(four(), place('1', 'any', 0, 0), place('2', 'any', 0, 1), place('3', 'tree', 0, -1), place('4', 'unk', 0.5, 0), place('5', 'roo', 0.5, 1))
    expect(bedGroup(p, lib, 'a', 0)).toBe('roots')
    expect(bedGroup(garden(four(), place('1', 'any', 0, 0), place('2', 'tree', 0, 1)), lib, 'a', 0)).toBeNull()
  })
})

describe('suggestNextYear', () => {
  it('suggest rotates onions that lack the annual flag', () => {
    const p = garden(four(), place('1', 'leg', 0.5, 1), place('2', 'onion', 10, 0.5), place('3', 'pot', 14.5, 1.5))
    const { plants } = suggestNextYear(p, lib, 0)
    const o = plants.find((q) => q.plantId === 'onion')!
    expect([o.x, o.y, o.plantedYear]).toEqual([15, 0.5, 1])
  })
  it('moves each group one step along', () => {
    const p = garden(four(), place('1', 'leg', 0.5, 1), place('2', 'bra', 5.5, -1), place('3', 'roo', 10, 0.5), place('4', 'pot', 14.5, 1.5))
    const { plants, notPlaced } = suggestNextYear(p, lib, 0)
    expect(notPlaced).toEqual([])
    const at = (id: string) => plants.find((q) => q.plantId === id)!
    // brassicas (B) -> A, potatoes (D) -> B, legumes (A) -> C, roots (C) -> D, keeping the offset inside the bed
    expect([at('bra').x, at('bra').y]).toEqual([0.5, -1])
    expect([at('pot').x, at('pot').y]).toEqual([4.5, 1.5])
    expect([at('leg').x, at('leg').y]).toEqual([10.5, 1])
    expect([at('roo').x, at('roo').y]).toEqual([15, 0.5])
    expect(plants.every((q) => q.plantedYear === 1)).toBe(true)
    expect(new Set([...plants.map((q) => q.id), '1', '2', '3', '4']).size).toBe(8)
  })
  it('keeps relative position in a rotated bed', () => {
    const beds = [bed('a', 'Bed A', 0, 0, { widthM: 2, lengthM: 4 }), bed('b', 'Bed B', 10, 0, { rotationDeg: 90, widthM: 4, lengthM: 2 })]
    // B (rotated 90°, 4 x 2) holds the brassica at local (1, 0.5): fractions (0.25, 0.25) => (0.5, 1) in A (2 x 4)
    const p = garden(beds, place('1', 'leg', 0, 0), place('2', 'bra', 10 - 0.5, 1))
    const { plants } = suggestNextYear(p, lib, 0)
    const bra = plants.find((q) => q.plantId === 'bra')!
    expect(bedAt(p, bra)?.id).toBe('a')
    expect(bra.x).toBeCloseTo(0.5, 6)
    expect(bra.y).toBeCloseTo(1, 6)
  })
  it('maps positions into a smaller bed and reports what does not fit', () => {
    const beds = [bed('a', 'Bed A', 0, 0, { widthM: 1, lengthM: 1 }), bed('b', 'Bed B', 5, 0, { widthM: 4, lengthM: 4 })]
    const p = garden(beds, place('1', 'leg', 0, 0), place('2', 'bra', 4.2, 0), place('3', 'bra', 4.0, 0), place('4', 'bra', 4.1, 0.1))
    const { plants, notPlaced } = suggestNextYear(p, lib, 0)
    // bed-centre fractions are about -0.2, -0.25 and -0.225: mapped into the 1 m bed the 0.3 m wide plants sit ~0.05 m apart, so only the first fits
    expect(plants.filter((q) => q.plantId === 'bra')).toHaveLength(1)
    expect(notPlaced.filter((n) => n.plantId === 'bra')).toEqual([{ plantId: 'bra', fromBed: 'Bed B' }, { plantId: 'bra', fromBed: 'Bed B' }])
  })
  it('leaves perennial beds and their plants alone', () => {
    const beds = [...four().slice(0, 2), bed('p', 'Bed P', 20, 0, { perennial: true })]
    const p = garden(beds, place('1', 'leg', 0, 0), place('2', 'bra', 5, 0), place('3', 'tree', 20, 0), place('4', 'roo', 20.5, 0))
    const { plants, notPlaced } = suggestNextYear(p, lib, 0)
    expect(plants.map((q) => q.plantId)).toEqual(['bra', 'roo']) // B's brassicas go to A; the annual in Bed P stays put
    expect(notPlaced).toEqual([{ plantId: 'leg', fromBed: 'Bed A' }]) // no bed is due legumes next year
  })
  it('keeps annuals in a perennial bed and reports any that collide', () => {
    const beds = [bed('p', 'Bed P', 20, 0, { perennial: true })]
    const p = garden(beds, place('3', 'tree', 20, 0), place('4', 'roo', 20.5, 0), place('5', 'roo', 20.55, 0), place('6', 'any', 19, 1))
    const { plants, notPlaced } = suggestNextYear(p, lib, 0)
    expect(plants.map((q) => [q.plantId, q.x, q.y, q.plantedYear])).toEqual([['roo', 20.5, 0, 1], ['any', 19, 1, 1]])
    expect(notPlaced).toEqual([{ plantId: 'roo', fromBed: 'Bed P' }])
  })
  it('keeps fits-anywhere crops in their bed', () => {
    const p = garden(four(), place('1', 'any', 0.3, 0.7), place('2', 'unk', -0.4, 1.2), place('4', 'any', 30, 30))
    const { plants } = suggestNextYear(p, lib, 0)
    const any = plants.find((q) => q.plantId === 'any')!
    expect([any.x, any.y, any.plantedYear]).toEqual([0.3, 0.7, 1])
    expect(plants.find((q) => q.plantId === 'unk')).toMatchObject({ x: -0.4, y: 1.2 })
    expect(plants.filter((q) => q.plantId === 'any')).toHaveLength(2) // the one outside any bed is carried too
  })
  it('carries annuals outside beds and reports any that collide', () => {
    const p = garden(four(), place('1', 'leg', 30, 30), place('2', 'bra', 40, 40), place('3', 'bra', 40.1, 40))
    const { plants, notPlaced } = suggestNextYear(p, lib, 0)
    expect(plants.map((q) => [q.plantId, q.x, q.y, q.plantedYear])).toEqual([['leg', 30, 30, 1], ['bra', 40, 40, 1]])
    expect(notPlaced).toEqual([{ plantId: 'bra', fromBed: null }])
  })
  it('reports fits-anywhere crops that collide with moved ones', () => {
    // B's brassicas land in A on top of the fits-anywhere crop
    const beds = [bed('a', 'Bed A', 0, 0), bed('b', 'Bed B', 5, 0)]
    const p = garden(beds, place('1', 'leg', 0, 0), place('2', 'bra', 5, 0), place('3', 'any', 0, 0.05))
    const { plants, notPlaced } = suggestNextYear(p, lib, 0)
    expect(plants.some((q) => q.plantId === 'any')).toBe(false)
    expect(notPlaced).toContainEqual({ plantId: 'any', fromBed: 'Bed A' })
  })
  it('two beds with the same group are paired by name', () => {
    // Bed 9 and Bed 10 hold legumes, Bed A and Bed B hold brassicas => brassicas go to Bed 9 (from A) and Bed 10 (from B).
    // The array is shuffled, and numeric order (9 before 10) differs from plain string order.
    const beds = [bed('a', 'Bed A', 10, 0), bed('n10', 'Bed 10', 5, 0), bed('b', 'Bed B', 15, 0), bed('n9', 'Bed 9', 0, 0)]
    const p = garden(beds, place('1', 'leg', 0, 0), place('2', 'leg', 5, 0), place('3', 'bra', 10, 1), place('4', 'bra', 15, -1))
    const { plants } = suggestNextYear(p, lib, 0)
    const bras = plants.filter((q) => q.plantId === 'bra').sort((a, b) => a.x - b.x)
    expect(bras.map((q) => [q.x, q.y])).toEqual([[0, 1], [5, -1]])
    expect(plants.filter((q) => q.plantId === 'leg')).toHaveLength(0)
  })
  it('sources with no target bed go to notPlaced', () => {
    // C and D are both brassicas but only A wants brassicas
    const p = garden(four(), place('1', 'leg', 0, 0), place('3', 'bra', 10, 0), place('4', 'bra', 15, 0))
    const { plants, notPlaced } = suggestNextYear(p, lib, 0)
    expect(plants).toHaveLength(1)
    expect(notPlaced).toContainEqual({ plantId: 'bra', fromBed: 'Bed D' })
  })
})
