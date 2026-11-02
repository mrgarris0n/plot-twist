import { describe, expect, it } from 'vitest'
import { createProject, type Project } from '../model/project'
import { analyze } from './checks'
import { place } from './checks/test-helpers'
import { fixtureLibrary, fixturePlant } from '../test/fixtures'
import { effectiveSize, sizeAt } from './growth'
import { ageAt, isPresent, layoutOf } from './presence'

const potato = fixturePlant({ id: 'potato', commonNames: ['Potato'], layer: 'herbaceous', annual: true, variants: [{ id: 'a', label: 'A', matureHeightM: 0.6, matureWidthM: 0.5, yearsToMaturity: 1, minSpacingM: null }] })
const tomato = fixturePlant({ id: 'tomato', commonNames: ['Tomato'], layer: 'herbaceous', annual: true, sunNeed: 'full', variants: [{ id: 'a', label: 'A', matureHeightM: 1.5, matureWidthM: 0.6, yearsToMaturity: 1, minSpacingM: null }] })
const rhubarb = fixturePlant({ id: 'rhubarb', commonNames: ['Rhubarb'], layer: 'herbaceous', annual: false })
const onion = fixturePlant({ id: 'onion', commonNames: ['Onion'], layer: 'herbaceous', annual: null, rotationGroup: 'roots' })
const lib = fixtureLibrary(potato, tomato, rhubarb, onion)
const gardenOf = (gardenType: Project['gardenType']): Project => ({ ...createProject('t'), gardenType })

describe('presence', () => {
  it('veggie beds: a rotated crop without annual flag is seasonal', () => {
    const p = gardenOf('veggie-beds')
    const pp = place('a', 'onion', 1, 1, { plantedYear: 1 })
    expect(isPresent(p, onion, pp, 0)).toBe(false)
    expect(isPresent(p, onion, pp, 1)).toBe(true)
    expect(isPresent(p, onion, pp, 2)).toBe(false)
    expect(ageAt(p, onion, pp, 1)).toBe(100)
  })
  it('food forest: an onion without annual flag still carries over', () => {
    const p = gardenOf('food-forest')
    const pp = place('a', 'onion', 1, 1, { plantedYear: 1 })
    expect(isPresent(p, onion, pp, 4)).toBe(true)
    expect(ageAt(p, onion, pp, 4)).toBe(3)
  })
  it('food forest: annual present in later years, age unchanged', () => {
    const p = gardenOf('food-forest')
    const pp = place('a', 'potato', 1, 1)
    expect(isPresent(p, potato, pp, 3)).toBe(true)
    expect(ageAt(p, potato, pp, 3)).toBe(3)
    expect(ageAt(p, potato, pp, -2)).toBe(-2)
  })
  it('veggie beds: annual only in its planting year', () => {
    const p = gardenOf('veggie-beds')
    const pp = place('a', 'potato', 1, 1, { plantedYear: 1 })
    expect(isPresent(p, potato, pp, 0)).toBe(false)
    expect(isPresent(p, potato, pp, 1)).toBe(true)
    expect(isPresent(p, potato, pp, 2)).toBe(false)
    expect(ageAt(p, potato, pp, 2)).toBe(-1)
  })
  it('veggie beds: annual is full size in its year', () => {
    const p = gardenOf('veggie-beds')
    const pp = place('a', 'potato', 1, 1)
    const size = effectiveSize(pp, potato)
    expect(sizeAt(size, ageAt(p, potato, pp, 0)).heightM).toBeCloseTo(size.matureHeightM, 1)
    expect(Math.abs(sizeAt(size, ageAt(p, potato, pp, 0)).widthM - size.matureWidthM)).toBeLessThan(size.matureWidthM * 0.05)
  })
  it('veggie beds: perennial carries over', () => {
    const p = gardenOf('veggie-beds')
    const pp = place('a', 'rhubarb', 1, 1)
    expect(isPresent(p, rhubarb, pp, 4)).toBe(true)
    expect(ageAt(p, rhubarb, pp, 4)).toBe(4)
    expect(isPresent(p, rhubarb, pp, -1)).toBe(false)
  })
  it('layoutOf returns the same object for food forest', () => {
    const p = gardenOf('food-forest')
    p.plants.push(place('a', 'potato', 1, 1))
    expect(layoutOf(p, lib)).toBe(p)
  })
  it('layoutOf keeps only plants present in the year for veggie beds', () => {
    const p = gardenOf('veggie-beds')
    p.plants.push(place('a', 'potato', 1, 1), place('b', 'rhubarb', 2, 2), place('c', 'potato', 3, 3, { plantedYear: 1 }))
    expect(layoutOf(p, lib, 1).plants.map((x) => x.id)).toEqual(['b', 'c'])
    expect(layoutOf(p, lib).plants.map((x) => x.id)).toEqual(['a', 'b'])
  })
  it("analyze ignores last year's annuals in a veggie-beds garden", () => {
    const p = gardenOf('veggie-beds')
    p.climate = { source: 'manual', minWinterC: -40, lastFrostDoy: null, firstFrostDoy: null, frostFree: false }
    p.plants.push(place('t1', 'tomato', 5, 5), place('t2', 'tomato', 5.1, 5))
    p.settings.year = 0
    expect(analyze(p, lib).some((w) => w.type === 'crowding')).toBe(true)
    p.settings.year = 1
    expect(analyze(p, lib).some((w) => w.plantIds.includes('t1'))).toBe(false)
  })
})

describe('veggie annuals outside the sampled years', () => {
  const veggie = (year: number, plantedYear: number) => {
    const p = gardenOf('veggie-beds')
    p.climate = { source: 'manual', minWinterC: -40, lastFrostDoy: null, firstFrostDoy: null, frostFree: false }
    p.settings.year = year
    p.plants.push(place('t1', 'tomato', 5, 5, { plantedYear }), place('t2', 'tomato', 5.1, 5, { plantedYear }))
    return p
  }
  it('warns about crowding for tomatoes planted in year 4, viewed in year 4', () => {
    expect(analyze(veggie(4, 4), lib).some((w) => w.type === 'crowding')).toBe(true)
  })
  it('warns about light for a shaded annual planted in year 6', () => {
    const p = gardenOf('veggie-beds')
    p.location = { lat: 47.5, lon: 19.04 }
    p.plot = { kind: 'rect', widthM: 20, lengthM: 20 }
    p.shadeObjects.push({ id: 'house', kind: 'house', x: 10, y: 14, rotationDeg: 0, widthM: 20, lengthM: 8, heightM: 7, canopy: null })
    p.settings.year = 6
    p.plants.push(place('t1', 'tomato', 10, 8, { plantedYear: 6 }))
    expect(analyze(p, lib).some((w) => w.type === 'light' && w.plantIds.includes('t1'))).toBe(true)
  })
  it('judges a veggie annual at mature size through analyze', () => {
    // 0.3 m apart, mature width 0.6 m: overlap 50 %. A year-0 sapling (10 % size) would not crowd.
    const p = veggie(0, 0)
    p.plants[1]!.x = 5.3
    expect(analyze(p, lib).some((w) => w.type === 'crowding' && w.startYear === 0)).toBe(true)
  })
})
