import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { validateLibrary } from '../model/plants'
import { library, plantName, variantOf } from './library'

const dir = join(process.cwd(), 'data/plants')
const records = readdirSync(dir)
  .filter((f) => f.endsWith('.json'))
  .flatMap((f) => JSON.parse(readFileSync(join(dir, f), 'utf8')) as unknown[])

describe('plant data files', () => {
  it('validate and hold at least 8 plants', () => {
    const r = validateLibrary(records)
    expect(r.ok ? [] : r.errors).toEqual([])
    expect(r.ok && r.library.all.length).toBeGreaterThanOrEqual(8)
  })
})

describe('library', () => {
  it('loads the seed plants', () => {
    expect(library.all.length).toBeGreaterThanOrEqual(8)
    for (const id of ['apple', 'hazel', 'black-currant', 'comfrey', 'chives', 'white-clover', 'siberian-pea-shrub', 'grape']) {
      expect(library.byId.has(id)).toBe(true)
    }
  })
  it('variantOf returns the named variant, else the default', () => {
    const apple = library.byId.get('apple')!
    expect(variantOf(apple, 'standard').id).toBe('standard')
    expect(variantOf(apple, null)).toBe(apple.variants[0])
    expect(variantOf(apple, 'nope')).toBe(apple.variants[0])
  })
  it('plantName is the first common name', () => {
    expect(plantName(library.byId.get('apple')!)).toBe(library.byId.get('apple')!.commonNames[0])
  })
})
