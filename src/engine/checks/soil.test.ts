import { afterEach, describe, expect, it } from 'vitest'
import { createProject, type Soil } from '../../model/project'
import { en } from '../../strings/en'
import { setLang } from '../../strings/lang'
import { fixtureLibrary, fixturePlant } from '../../test/fixtures'
import { soilIssue, soilWarnings } from './soil'
import { place } from './test-helpers'

const blueberry = fixturePlant({ id: 'blueberry', commonNames: ['Blueberry'], layer: 'shrub', phMin: 4.5, phMax: 5.5, textures: ['sandy', 'loamy'], drainage: ['normal'] })
const neutral: Soil = { source: 'manual', phMin: 6.0, phMax: 7.5, texture: null, drainage: null }

describe('soilIssue', () => {
  it('blueberry on neutral soil', () => {
    const m = soilIssue(blueberry, neutral)
    expect(m).toBe(en.warnings.soilAcidity('Blueberry', 'acidic', 'neutral'))
    expect(m).toBe('Blueberries need acidic soil. Yours is neutral.')
  })
  it('same plain class on both sides names the direction', () => {
    const fussy = { ...blueberry, phMin: 6.0, phMax: 6.3 }
    expect(soilIssue(fussy, { ...neutral, phMin: 6.8, phMax: 7.4 })).toBe(en.warnings.soilAcidityCloser('Blueberry', 'more'))
    expect(soilIssue({ ...fussy, phMin: 7.0, phMax: 7.4 }, { ...neutral, phMin: 6.0, phMax: 6.5 })).toBe(en.warnings.soilAcidityCloser('Blueberry', 'less'))
  })
  it('unknown soil or unknown plant range → null', () => {
    expect(soilIssue(blueberry, null)).toBeNull()
    expect(soilIssue({ ...blueberry, phMin: null }, neutral)).toBeNull()
  })
  it('clay outside the plant textures', () => {
    const m = soilIssue(blueberry, { source: 'manual', phMin: null, phMax: null, texture: 'clay', drainage: null })
    expect(m).toBe(en.warnings.soilTexture('Blueberry', 'clay'))
  })
  it('matching soil → null', () => {
    expect(soilIssue(blueberry, { source: 'manual', phMin: 5, phMax: 5.2, texture: 'sandy', drainage: 'normal' })).toBeNull()
  })
})

describe('soilWarnings', () => {
  it('one warning per mismatching sub-check', () => {
    const p = createProject('t')
    p.soil = { source: 'manual', phMin: 6, phMax: 7.5, texture: 'clay', drainage: 'wet' }
    p.plants.push(place('b1', 'blueberry', 1, 1))
    const ws = soilWarnings(p, fixtureLibrary(blueberry))
    expect(ws.map((w) => w.key)).toEqual(['soil:b1:acidity', 'soil:b1:texture', 'soil:b1:drainage'])
    expect(ws.every((w) => w.type === 'soil' && w.severity === 'warning' && w.startYear === 0)).toBe(true)
    expect(ws[2]!.message).toBe(en.warnings.soilDrainage('Blueberry', 'wet'))
  })
})

describe('acidity detail', () => {
  afterEach(() => setLang('en'))
  const detail = () => {
    const p = createProject('t')
    p.soil = { source: 'manual', phMin: 6, phMax: 7.5, texture: null, drainage: null }
    p.plants.push(place('b1', 'blueberry', 1, 1))
    return soilWarnings(p, fixtureLibrary(blueberry))[0]!.detail
  }
  it('keeps the decimal point in English', () => {
    expect(detail()).toBe('Plant pH 4.5–5.5; site pH 6–7.5.')
  })
  it('uses a decimal comma in Hungarian', () => {
    setLang('hu')
    expect(detail()).toBe('A növény pH-igénye 4,5–5,5; a kert talajának pH-ja 6–7,5.')
  })
})
