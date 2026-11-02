import { afterEach, describe, expect, it } from 'vitest'
import { soilWarnings } from '../engine/checks/soil'
import { fixtureLibrary, fixturePlant } from '../test/fixtures'
import { place } from '../engine/checks/test-helpers'
import { createProject } from '../model/project'
import { setLang } from '../strings/lang'
import { describeSoil } from './soil'

const ENGLISH_SOIL = /\b(sandy|loamy|clay|silty|acidic|slightly|neutral|alkaline|unknown|fast|normal|wet)\b/i

afterEach(() => setLang('en'))

describe('soil wording in Hungarian', () => {
  it('describes the soil without English words', () => {
    setLang('hu')
    expect(describeSoil({ source: 'lookup', phMin: 6.4, phMax: 6.4, texture: 'loamy', drainage: null })).toBe('vályogos, enyhén savanyú')
    for (const ph of [5.0, 6.4, 7.0, 7.5, 8.2]) {
      for (const texture of ['sandy', 'loamy', 'clay', 'silty', null] as const) {
        expect(describeSoil({ source: 'lookup', phMin: ph, phMax: ph, texture, drainage: null })).not.toMatch(ENGLISH_SOIL)
      }
    }
    expect(describeSoil({ source: 'manual', phMin: null, phMax: null, texture: null, drainage: null })).not.toMatch(ENGLISH_SOIL)
  })

  it('keeps English words out of the soil detail lines', () => {
    setLang('hu')
    const fussy = fixturePlant({ id: 'fussy', commonNames: ['Áfonya'], layer: 'shrub', textures: ['sandy', 'loamy'], drainage: ['normal'] })
    const project = { ...createProject('Kert'), soil: { source: 'manual' as const, phMin: null, phMax: null, texture: 'clay' as const, drainage: 'wet' as const }, plants: [place('p1', 'fussy', 1, 1)] }
    const warnings = soilWarnings(project, fixtureLibrary(fussy))
    expect(warnings).toHaveLength(2)
    for (const w of warnings) {
      expect(w.message).not.toMatch(ENGLISH_SOIL)
      expect(w.detail).not.toMatch(ENGLISH_SOIL)
    }
  })
})
