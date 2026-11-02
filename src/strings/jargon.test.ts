import { afterEach, describe, expect, it } from 'vitest'
import { en, english } from './en'
import { hungarian } from './hu'
import { setLang } from './lang'
import { SAMPLES } from './samples'

const JARGON = /\b(pH|azimuth|altitude|declination|allelopath\w*|transmission|transmittance|reanalysis|rootstock|cultivar|taxonom\w*|Fabaceae|Rosaceae|SoilGrids|ERA5)\b/i
// The Hungarian counterparts (word starts, so suffixed forms match too). Names like ERA5 are caught by JARGON.
const JARGON_HU = /(?<![\p{L}\d])(azimut|napmagasság|deklináció|allelopát|transzmisszi|transzmittanci|reanalízis|alany|kultivár|taxonóm|evapotransz|WFDEI)/iu

function collect(value: unknown, path: string, out: { path: string; text: string }[]): void {
  if (typeof value === 'string') out.push({ path, text: value })
  else if (typeof value === 'function') {
    const sets = SAMPLES[path]
    if (!sets) throw new Error(`No sample arguments for builder en.${path}`)
    for (const args of sets) out.push({ path, text: String((value as (...a: unknown[]) => unknown)(...args)) })
  } else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) collect(v, path ? `${path}.${k}` : k, out)
  }
}

function mainScreen(): { path: string; text: string }[] {
  const out: { path: string; text: string }[] = []
  const { details: _details, credits: _credits, ...main } = en
  collect(main, '', out)
  return out
}

describe('main-screen strings', () => {
  it('use no jargon outside details and credits', () => {
    const out = mainScreen()
    expect(out.length).toBeGreaterThan(50)
    expect(out.filter((s) => JARGON.test(s.text))).toEqual([])
  })
})

describe('main-screen strings in Hungarian', () => {
  afterEach(() => setLang('en'))

  it('use no jargon outside details and credits', () => {
    setLang('hu')
    const out = mainScreen()
    expect(out.length).toBeGreaterThan(50)
    expect(out.filter((s) => JARGON.test(s.text) || JARGON_HU.test(s.text))).toEqual([])
  })

  it('builders do not return the English wording', () => {
    const get = (root: unknown, path: string) => path.split('.').reduce<unknown>((o, k) => (o as Record<string, unknown>)[k], root)
    const same: string[] = []
    for (const [path, sets] of Object.entries(SAMPLES)) {
      const enFn = get(english, path) as (...a: unknown[]) => string
      const huFn = get(hungarian, path) as (...a: unknown[]) => string
      for (const args of sets) if (huFn(...args) === enFn(...args)) same.push(`${path}(${JSON.stringify(args)})`)
    }
    // Pass-through builders only show the reason they are given.
    expect(same.filter((s) => !/^details\.warning\.(companion|rotation)\(/.test(s))).toEqual([])
  })
})

describe('not-placed wording', () => {
  it('keeps name casing and counts without plurals', () => {
    expect(en.rotation.notPlacedItem(2, 'Tomato', 'Bed B')).toBe('Tomato × 2 from Bed B')
    expect(en.rotation.notPlacedItem(1, 'Swiss chard', 'Bed A')).toBe('Swiss chard from Bed A')
    expect(en.rotation.notPlacedItem(1, 'Pea', null)).toBe('Pea from outside the beds')
  })
})
