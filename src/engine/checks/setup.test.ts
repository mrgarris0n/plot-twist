import { expect, it } from 'vitest'
import { createProject } from '../../model/project'
import { en } from '../../strings/en'
import { setupWarnings } from './setup'

it('warns about an unfinished setup and names the steps left', () => {
  const p = createProject('t')
  p.location = { lat: 47.5, lon: 19 }
  const [w] = setupWarnings(p)
  expect(w?.message).toBe(en.warnings.setupIncomplete)
  expect(w?.detail).toBe(en.details.warning.setupMissing([en.setup.plot, en.setup.soil, en.setup.gardenType, en.setup.shadeObjects].join(', ')))
})

it('is silent once every step is done', () => {
  const p = createProject('t')
  Object.assign(p, { gardenType: 'food-forest', location: { lat: 47.5, lon: 19 }, plotConfirmed: true, shadeObjectsConfirmed: true })
  p.soil = { source: 'manual', phMin: null, phMax: null, texture: null, drainage: null }
  expect(setupWarnings(p)).toEqual([])
})
