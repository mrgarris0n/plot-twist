import { describe, expect, it } from 'vitest'
import type { PlantRecord } from '../../model/plants'
import { createProject, type Climate } from '../../model/project'
import { en } from '../../strings/en'
import { fixtureLibrary, fixturePlant } from '../../test/fixtures'
import { waterIssue, waterWarnings } from './water'
import { place } from './test-helpers'

const base: Climate = { source: 'manual', minWinterC: null, lastFrostDoy: null, firstFrostDoy: null, frostFree: false }
const wet = (o: Partial<Climate>): Climate => ({ ...base, ...o })
const plant = (water: PlantRecord['water']) => fixturePlant({ id: 'p', commonNames: ['Rice'], water })

describe('waterIssue', () => {
  it('minRainMm above yearly rain → warning', () => {
    expect(waterIssue(plant({ minRainMm: 800 }), wet({ rainYearMm: 640 }), 'metric')).toBe(en.warnings.waterShort('Rice'))
  })
  it('minRainMm below yearly rain → none', () => {
    expect(waterIssue(plant({ minRainMm: 500 }), wet({ rainYearMm: 640 }), 'metric')).toBeNull()
  })
  it('level high below 450 warm mm → warning; at 450 → none', () => {
    expect(waterIssue(plant({ level: 'high' }), wet({ rainWarmMm: 449 }), 'metric')).not.toBeNull()
    expect(waterIssue(plant({ level: 'high' }), wet({ rainWarmMm: 450 }), 'metric')).toBeNull()
  })
  it('medium below 250 → warning; low never warns', () => {
    expect(waterIssue(plant({ level: 'medium' }), wet({ rainWarmMm: 249 }), 'metric')).not.toBeNull()
    expect(waterIssue(plant({ level: 'medium' }), wet({ rainWarmMm: 250 }), 'metric')).toBeNull()
    expect(waterIssue(plant({ level: 'low' }), wet({ rainWarmMm: 0, rainYearMm: 0 }), 'metric')).toBeNull()
  })
  it('number compares to yearly rain, level to warm-half rain', () => {
    const c = wet({ rainYearMm: 700, rainWarmMm: 200 })
    expect(waterIssue(plant({ minRainMm: 600 }), c, 'metric')).toBeNull()
    expect(waterIssue(plant({ level: 'high' }), c, 'metric')).not.toBeNull()
  })
  it('missing climate values → no warnings', () => {
    expect(waterIssue(plant({ minRainMm: 800 }), wet({}), 'metric')).toBeNull()
    expect(waterIssue(plant({ minRainMm: 800 }), wet({ rainYearMm: null }), 'metric')).toBeNull()
    expect(waterIssue(plant({ level: 'high' }), wet({ rainWarmMm: null }), 'metric')).toBeNull()
    expect(waterIssue(plant({ minRainMm: 800 }), null, 'metric')).toBeNull()
  })
  it('water null or absent → none', () => {
    expect(waterIssue(plant(null), wet({ rainYearMm: 1, rainWarmMm: 1 }), 'metric')).toBeNull()
    expect(waterIssue(plant(undefined), wet({ rainYearMm: 1, rainWarmMm: 1 }), 'metric')).toBeNull()
  })
})

describe('waterWarnings', () => {
  it('keys by placed plant', () => {
    const p = createProject('t')
    p.climate = wet({ rainYearMm: 640 })
    p.plants.push(place('r1', 'p', 1, 1), place('r2', 'p', 2, 2))
    const ws = waterWarnings(p, fixtureLibrary(plant({ minRainMm: 800 })))
    expect(ws.map((w) => w.key)).toEqual(['water:r1', 'water:r2'])
    expect(ws[0]).toMatchObject({ type: 'water', severity: 'warning', startYear: 0, fix: null, plantIds: ['r1'], message: en.warnings.waterShort('Rice') })
    expect(ws[0]!.detail).toContain('640 mm')
  })
  it('imperial rain in inches', () => {
    const p = createProject('t')
    p.settings.units = 'imperial'
    p.climate = wet({ rainYearMm: 640 })
    p.plants.push(place('r1', 'p', 1, 1))
    const d = waterWarnings(p, fixtureLibrary(plant({ minRainMm: 800 })))[0]!.detail
    expect(d).toMatch(/\d+ in\b/)
    expect(d).not.toContain('mm')
  })
  it('figures that round alike keep a decimal so they read differently', () => {
    const p = createProject('t')
    p.settings.units = 'imperial'
    p.climate = wet({ rainYearMm: 780 })
    p.plants.push(place('r1', 'p', 1, 1))
    // 800 mm = 31.5 in, 780 mm = 30.7 in: whole inches would read "31 in" and "31 in".
    expect(waterWarnings(p, fixtureLibrary(plant({ minRainMm: 800 })))[0]!.detail).toContain('31.5 in')
    p.settings.units = 'metric'
    p.climate = wet({ rainWarmMm: 449.6 })
    const d = waterWarnings(p, fixtureLibrary(plant({ level: 'high' })))[0]!.detail
    expect(d).toContain('450 mm')
    expect(d).toContain('449.6 mm')
  })
  it('level wording mentions the rule', () => {
    const p = createProject('t')
    p.climate = wet({ rainWarmMm: 200 })
    p.plants.push(place('r1', 'p', 1, 1))
    expect(waterWarnings(p, fixtureLibrary(plant({ level: 'high' })))[0]!.detail).toContain('April–September')
  })
})
