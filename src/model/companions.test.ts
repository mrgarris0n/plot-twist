import { afterEach, describe, expect, it } from 'vitest'
import type { PlantLibrary, PlantRecord } from './plants'
import { companionReason, companionsOf, validateCompanions, type CompanionPair } from './companions'
import { setLang } from '../strings/lang'

// validateCompanions only looks plants up by id, so a minimal library is enough.
const records = ['tomato', 'basil', 'fennel', 'carrot'].map((id) => ({ id }) as PlantRecord)
const lib: PlantLibrary = { all: records, byId: new Map(records.map((r) => [r.id, r])) }

const src = { id: 's1', title: 'RHS companion planting', url: 'https://example.org/c', licence: 'CC BY 4.0' }
const pair = (over: Partial<CompanionPair> = {}): CompanionPair => ({
  a: 'tomato', b: 'basil', effect: 'good', reason: 'Basil may deter pests.', sources: [src], ...over,
})

describe('validateCompanions', () => {
  it('accepts a valid pair', () => {
    const r = validateCompanions([pair()], lib)
    expect(r).toEqual({ ok: true, pairs: [pair()] })
  })
  it('rejects unknown plant ids', () => {
    const r = validateCompanions([pair({ b: 'nope' })], lib)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.errors.join()).toContain('nope')
  })
  it('rejects a === b', () => {
    expect(validateCompanions([pair({ b: 'tomato' })], lib).ok).toBe(false)
  })
  it('rejects empty sources', () => {
    expect(validateCompanions([pair({ sources: [] })], lib).ok).toBe(false)
  })
  it('rejects a duplicate unordered pair', () => {
    const r = validateCompanions([pair(), pair({ a: 'basil', b: 'tomato' })], lib)
    expect(r.ok).toBe(false)
  })
  it('rejects a pair listed as both good and bad', () => {
    const r = validateCompanions([pair(), pair({ a: 'basil', b: 'tomato', effect: 'bad' })], lib)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.errors.join()).toMatch(/both good and bad/)
  })
  it('rejects non-array input', () => {
    expect(validateCompanions({}, lib).ok).toBe(false)
  })
})

describe('companionsOf', () => {
  it('finds both directions', () => {
    const p1 = pair()
    const p2 = pair({ a: 'carrot', b: 'tomato' })
    const p3 = pair({ a: 'fennel', b: 'carrot', effect: 'bad' })
    expect(companionsOf([p1, p2, p3], 'tomato')).toEqual([p1, p2])
    expect(companionsOf([p1, p2, p3], 'fennel')).toEqual([p3])
  })
})

describe('companionReason', () => {
  afterEach(() => setLang('en'))
  it('follows the language and falls back to English', () => {
    const p = pair({ reasonHu: 'A bazsalikom elriaszthatja a kártevőket.' })
    expect(companionReason(p)).toBe('Basil may deter pests.')
    setLang('hu')
    expect(companionReason(p)).toBe('A bazsalikom elriaszthatja a kártevőket.')
    expect(companionReason(pair())).toBe('Basil may deter pests.')
  })
  it('every pair in the data has reasonHu', async () => {
    const { companions: companionPairs } = await import('../data/companions')
    expect(companionPairs.length).toBeGreaterThan(0)
    for (const p of companionPairs) expect(p.reasonHu, `${p.a}+${p.b}`).toBeTruthy()
  })
})
