import { afterEach, describe, expect, it } from 'vitest'
import { plantName, validateLibrary, variantLabel, type PlantRecord } from './plants'
import { setLang } from '../strings/lang'

function fixture(over: Partial<PlantRecord> = {}): PlantRecord {
  return {
    id: 'apple',
    commonNames: ['Apple'],
    latinName: 'Malus domestica',
    family: null,
    layer: 'canopy',
    sunNeed: 'full',
    leafHabit: null,
    canopyDensity: null,
    variants: [{ id: 'standard', label: 'Standard', matureHeightM: 6, matureWidthM: 6, yearsToMaturity: null, minSpacingM: null }],
    phMin: 6,
    phMax: 7,
    textures: null,
    drainage: null,
    minWinterC: -34.4,
    roles: null,
    edibleParts: null,
    calendar: [{ task: 'prune', from: 'late-winter', to: 'early-spring' }],
    firstHarvestYears: null,
    companions: null,
    pfafUrl: null,
    sources: [{ id: 's1', title: 'Test source', url: 'https://example.org', licence: 'Test' }],
    fieldSources: {
      commonNames: ['s1'],
      latinName: ['s1'],
      layer: ['s1'],
      sunNeed: ['s1'],
      phMin: ['s1'],
      phMax: ['s1'],
      minWinterC: ['s1'],
      calendar: ['s1'],
      'variants.standard': ['s1'],
    },
    ...over,
  }
}

function errorsOf(records: unknown[]): string[] {
  const r = validateLibrary(records)
  if (r.ok) throw new Error('expected validation to fail')
  return r.errors
}

describe('validateLibrary', () => {
  it('accepts a valid fixture', () => {
    const r = validateLibrary([fixture()])
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.library.all).toHaveLength(1)
      expect(r.library.byId.get('apple')?.latinName).toBe('Malus domestica')
    }
  })

  it('rejects sizes that are zero or negative, and negative maturity years', () => {
    const v = fixture().variants[0]!
    for (const bad of [{ matureWidthM: 0 }, { matureHeightM: -1 }, { minSpacingM: 0 }, { yearsToMaturity: -1 }]) {
      expect(validateLibrary([fixture({ variants: [{ ...v, ...bad }] })]).ok).toBe(false)
    }
    expect(validateLibrary([fixture({ variants: [{ ...v, yearsToMaturity: 0 }] })]).ok).toBe(true) // annuals: full size in year one
    expect(validateLibrary([fixture({ firstHarvestYears: -1 })]).ok).toBe(false)
  })

  it('rejects source and PFAF links that are not web addresses', () => {
    const src = fixture().sources[0]!
    expect(validateLibrary([fixture({ sources: [{ ...src, url: 'example.org' }] })]).ok).toBe(false)
    expect(validateLibrary([fixture({ sources: [{ ...src, url: 'javascript:alert(1)' }] })]).ok).toBe(false)
    expect(validateLibrary([fixture({ pfafUrl: 'not a url' })]).ok).toBe(false)
    expect(validateLibrary([fixture({ pfafUrl: 'https://pfaf.org/user/Plant.aspx?LatinName=Malus+domestica' })]).ok).toBe(true)
  })

  it('accepts water minRainMm', () => {
    expect(validateLibrary([fixture({ water: { minRainMm: 600 }, fieldSources: { ...fixture().fieldSources, water: ['s1'] } })]).ok).toBe(true)
  })

  it('accepts water level', () => {
    expect(validateLibrary([fixture({ water: { level: 'high' }, fieldSources: { ...fixture().fieldSources, water: ['s1'] } })]).ok).toBe(true)
  })

  it('rejects water with both keys', () => {
    const f = { ...fixture(), water: { minRainMm: 600, level: 'high' }, fieldSources: { ...fixture().fieldSources, water: ['s1'] } }
    expect(validateLibrary([f]).ok).toBe(false)
  })

  it("rejects water level 'very-high'", () => {
    const f = { ...fixture(), water: { level: 'very-high' }, fieldSources: { ...fixture().fieldSources, water: ['s1'] } }
    expect(validateLibrary([f]).ok).toBe(false)
  })

  it('rejects water minRainMm out of range', () => {
    for (const v of [0, 5001]) {
      const f = { ...fixture(), water: { minRainMm: v }, fieldSources: { ...fixture().fieldSources, water: ['s1'] } }
      expect(validateLibrary([f]).ok).toBe(false)
    }
  })

  it('accepts rotationGroup', () => {
    expect(validateLibrary([fixture({ rotationGroup: 'brassicas', fieldSources: { ...fixture().fieldSources, rotationGroup: ['s1'] } })]).ok).toBe(true)
  })

  it('rotationGroup without fieldSources fails validation', () => {
    const errors = errorsOf([fixture({ rotationGroup: 'legumes' })])
    expect(errors.some((e) => e.includes('apple') && e.includes('rotationGroup'))).toBe(true)
  })

  it('water without fieldSources fails validation', () => {
    const errors = errorsOf([fixture({ water: { level: 'low' } })])
    expect(errors.some((e) => e.includes('apple') && e.includes('water'))).toBe(true)
  })

  it('rejects a missing minWinterC and names plant and field', () => {
    const { minWinterC: _omit, ...rest } = fixture()
    const errors = errorsOf([rest])
    expect(errors.some((e) => e.includes('apple') && e.includes('minWinterC'))).toBe(true)
  })

  it('rejects an unknown key (typo)', () => {
    const errors = errorsOf([{ ...fixture(), phmin: 6 }])
    expect(errors.some((e) => e.includes('apple') && e.includes('phmin'))).toBe(true)
  })

  it('rejects an empty calendar', () => {
    const errors = errorsOf([fixture({ calendar: [] })])
    expect(errors.some((e) => e.includes('apple') && e.includes('calendar'))).toBe(true)
  })

  it('rejects a non-null field with no source', () => {
    const f = fixture()
    delete f.fieldSources.phMin
    expect(errorsOf([f])).toContain('apple: phMin has no source')
  })

  it('rejects a variant with no source', () => {
    const f = fixture()
    delete f.fieldSources['variants.standard']
    expect(errorsOf([f])).toContain('apple: variants.standard has no source')
  })

  it('rejects a fieldSources id that is not in sources', () => {
    const errors = errorsOf([fixture({ fieldSources: { ...fixture().fieldSources, phMin: ['nope'] } })])
    expect(errors.some((e) => e.includes('apple') && e.includes('phMin') && e.includes('nope'))).toBe(true)
  })

  it('rejects duplicate plant ids', () => {
    const errors = errorsOf([fixture(), fixture()])
    expect(errors.some((e) => e.includes('duplicate') && e.includes('apple'))).toBe(true)
  })

  it('rejects a companion that is not in the library', () => {
    const f = fixture({
      companions: [{ plantId: 'ghost', score: 0.5, type: 'pest-repellency' }],
      fieldSources: { ...fixture().fieldSources, companions: ['s1'] },
    })
    expect(errorsOf([f]).some((e) => e.includes('ghost'))).toBe(true)
  })

  it('rejects a companion score outside -1..1', () => {
    const f = fixture({
      companions: [{ plantId: 'apple', score: 1.5, type: 'pest-repellency' }],
      fieldSources: { ...fixture().fieldSources, companions: ['s1'] },
    })
    expect(errorsOf([f]).some((e) => e.includes('score'))).toBe(true)
  })

  it('rejects phMin greater than phMax', () => {
    const errors = errorsOf([fixture({ phMin: 7.5, phMax: 6 })])
    expect(errors.some((e) => e.includes('apple') && e.includes('phMin'))).toBe(true)
  })

  it('accepts a companion that exists in the library', () => {
    const other = fixture({ id: 'hazel' })
    const f = fixture({
      companions: [{ plantId: 'hazel', score: 0.5, type: 'nutrient-sharing' }],
      fieldSources: { ...fixture().fieldSources, companions: ['s1'] },
    })
    expect(validateLibrary([f, other]).ok).toBe(true)
  })
})

describe('Hungarian names and labels', () => {
  afterEach(() => setLang('en'))
  const hu = (over: Partial<PlantRecord> = {}) =>
    fixture({ commonNamesHu: ['Alma', 'Almafa'], fieldSources: { ...fixture().fieldSources, commonNamesHu: ['s1'] }, ...over })

  it('plantName uses the sourced Hungarian name in Hungarian', () => {
    setLang('hu')
    expect(plantName(hu())).toBe('Alma')
    setLang('en')
    expect(plantName(hu())).toBe('Apple')
  })
  it('plantName falls back to English without commonNamesHu', () => {
    setLang('hu')
    expect(plantName(fixture())).toBe('Apple')
    expect(plantName(fixture({ commonNamesHu: null }))).toBe('Apple')
  })
  it('commonNamesHu without fieldSources fails validation', () => {
    expect(errorsOf([fixture({ commonNamesHu: ['Alma'] })]).join('\n')).toContain('commonNamesHu has no source')
    expect(validateLibrary([hu()]).ok).toBe(true)
  })
  it('variantLabel follows the language and falls back to English', () => {
    const v = { ...fixture().variants[0]!, labelHu: 'Szokásos' }
    expect(variantLabel(v)).toBe('Standard')
    setLang('hu')
    expect(variantLabel(v)).toBe('Szokásos')
    expect(variantLabel({ ...v, labelHu: undefined })).toBe('Standard')
  })
  it('every variant has labelHu', async () => {
    const { library } = await import('../data/library')
    for (const p of library.all) for (const v of p.variants) expect(v.labelHu, `${p.id}.${v.id}`).toBeTruthy()
  })
})
