import { describe, expect, it } from 'vitest'
import { createProject, type Climate } from '../../model/project'
import { fixtureLibrary, fixturePlant } from '../../test/fixtures'
import { climateIssue, climateWarnings, grownAsAnnual } from './climate'
import { place } from './test-helpers'

const avocado = fixturePlant({ id: 'avocado', commonNames: ['Avocado'], minWinterC: -2 })
const cold: Climate = { source: 'manual', minWinterC: -15, lastFrostDoy: null, firstFrostDoy: null, frostFree: false }

describe('climateIssue', () => {
  it('too cold for avocado', () => {
    expect(climateIssue(avocado, cold, 'metric')).toBe('Too cold here for Avocado. Winters reach about −15 °C.')
  })
  it('imperial units', () => {
    expect(climateIssue(avocado, cold, 'imperial')).toContain('5 °F')
  })
  it('unknown climate → null; hardy plant → null', () => {
    expect(climateIssue(avocado, null, 'metric')).toBeNull()
    expect(climateIssue(avocado, { ...cold, minWinterC: null }, 'metric')).toBeNull()
    expect(climateIssue({ ...avocado, minWinterC: -20 }, cold, 'metric')).toBeNull()
  })
  it('annual → no cold warning', () => {
    expect(climateIssue({ ...avocado, annual: true }, cold, 'metric')).toBeNull()
  })
  it('climateWarnings keys by placed plant', () => {
    const p = createProject('t')
    p.climate = cold
    p.plants.push(place('a1', 'avocado', 0, 0))
    expect(climateWarnings(p, fixtureLibrary(avocado))).toMatchObject([{ key: 'climate:a1', type: 'climate', severity: 'warning', plantIds: ['a1'] }])
  })
})

describe('grownAsAnnual', () => {
  const bean = fixturePlant({ id: 'bean', annual: true })
  it('annual where winter brings frost', () => {
    expect(grownAsAnnual(bean, cold)).toBe(true)
  })
  it('not in a frost-free garden, with unknown climate, or for a perennial', () => {
    expect(grownAsAnnual(bean, { ...cold, frostFree: true })).toBe(false)
    expect(grownAsAnnual(bean, null)).toBe(false)
    expect(grownAsAnnual(avocado, cold)).toBe(false)
  })
})
