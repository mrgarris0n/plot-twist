import { describe, expect, it } from 'vitest'
import { english } from './english'
import { hungarian } from './hu'
import { SAMPLES } from './samples'

type Leaf = { path: string; en: unknown; hu: unknown }

/** Walks both trees together; every English leaf is paired with the Hungarian value at the same path. */
function pairs(en: unknown, hu: unknown, path = '', out: Leaf[] = []): Leaf[] {
  if (en && typeof en === 'object') {
    for (const [k, v] of Object.entries(en)) {
      const next = hu && typeof hu === 'object' ? (hu as Record<string, unknown>)[k] : undefined
      pairs(v, next, path ? `${path}.${k}` : k, out)
    }
  } else out.push({ path, en, hu })
  return out
}

const leaves = pairs(english, hungarian)

// Strings that are the same in both languages: names, symbols, and cited source titles.
const SAME_OK = new Set([
  'Plot Twist',
  'English',
  'Language / Nyelv',
  // key names are printed on the keys, the same in both languages
  'Delete / Backspace',
  'Esc',
  'Magyar',
  'OpenFreeMap',
  '© OpenMapTiles',
  'ISRIC SoilGrids',
  'Copernicus Climate Change Service — Agroclimatic indicators (CC BY 4.0)',
  'Copernicus Climate Change Service — ERA5 monthly averaged data on single levels (CC BY 4.0)',
])
const NO_WORDS = /^[^A-Za-z]*$/ // separators, ranges like "90–110%"

// Common English words that never occur in Hungarian copy.
const ENGLISH_WORD = /\b(the|and|your|you|with|this|that|are|of|from|not|can't|isn't|don't)\b/i

describe('hungarian', () => {
  it('every key exists with a non-empty value', () => {
    expect(leaves.length).toBeGreaterThan(300)
    for (const { path, en, hu } of leaves) {
      expect(typeof hu, path).toBe(typeof en)
      if (typeof hu === 'string') expect(hu.length, path).toBeGreaterThan(0)
    }
    // No extra keys either.
    const sorted = (ls: Leaf[]) => ls.map((l) => l.path).sort()
    expect(sorted(pairs(hungarian, english))).toEqual(sorted(leaves))
  })

  it('builders take the same number of arguments', () => {
    for (const { path, en, hu } of leaves) {
      if (typeof en === 'function') expect((hu as (...a: unknown[]) => unknown).length, path).toBe(en.length)
    }
  })

  it('no English left', () => {
    const strings = leaves.filter((l) => typeof l.hu === 'string') as { path: string; en: string; hu: string }[]
    const same = strings.filter(({ en, hu }) => hu === en && !SAME_OK.has(hu) && !NO_WORDS.test(hu))
    expect(same).toEqual([])
    const english = strings.filter(({ hu }) => !SAME_OK.has(hu) && ENGLISH_WORD.test(hu))
    expect(english).toEqual([])
  })

  it('no English words in builder output', () => {
    const get = (root: unknown, path: string) => path.split('.').reduce<unknown>((o, k) => (o as Record<string, unknown>)[k], root)
    const found: string[] = []
    for (const [path, sets] of Object.entries(SAMPLES)) {
      const fn = get(hungarian, path) as (...a: unknown[]) => string
      for (const args of sets) {
        // The sample arguments are English (names, soil words); only the builder's own wording is checked.
        const own = args.reduce<string>((text, a) => (typeof a === 'string' ? text.split(a).join('') : text), fn(...args))
        if (ENGLISH_WORD.test(own)) found.push(`${path}: ${own}`)
      }
    }
    expect(found).toEqual([])
  })

  it('keeps the language names fixed', () => {
    expect(hungarian.settings.langNames).toEqual(english.settings.langNames)
  })
})
