import { afterEach, describe, expect, it } from 'vitest'
import { setLang } from '../strings/lang'
import { library, plantName } from '../data/library'
import { filterPlants, fitsHere, paletteMarks } from './palette-filter'
import { fixturePlant } from '../test/fixtures'
import { createProject } from '../model/project'

const q = { text: '', layer: null, fitsHere: null } as const
const names = (r: ReturnType<typeof filterPlants>) => r.map(plantName)

describe('filterPlants', () => {
  it('finds black currant by "currant"', () => {
    expect(names(filterPlants(library.all, { ...q, text: 'currant' })).join(' ').toLowerCase()).toContain('black currant')
  })
  it('layer filter excludes apple', () => {
    const r = filterPlants(library.all, { ...q, layer: 'shrub' })
    expect(r.length).toBeGreaterThan(0)
    expect(r.every((p) => p.layer === 'shrub')).toBe(true)
    expect(r.some((p) => p.id.includes('apple'))).toBe(false)
  })
  it('ignores accents on both sides', () => {
    const hu = (text: string) => filterPlants(library.all, { ...q, text }).map((p) => p.id)
    expect(hu('korte')).toContain('pear')
    expect(hu('Körte')).toContain('pear')
    expect(hu('dio')).toContain('english-walnut')
  })
  it('matches Latin names', () => {
    expect(filterPlants(library.all, { ...q, text: 'malus' }).some((p) => p.id.includes('apple'))).toBe(true)
  })
  it('empty query returns all sorted by common name', () => {
    const r = names(filterPlants(library.all, q))
    expect(r).toHaveLength(library.all.length)
    expect(r).toEqual([...r].sort((a, b) => a.localeCompare(b)))
  })
})

describe('filterPlants fitsHere', () => {
  it('keeps apple on neutral loam and drops blueberry', () => {
    const apple = library.byId.get('apple')!
    const blueberry = fixturePlant({ id: 'blueberry', commonNames: ['Blueberry'], layer: 'shrub', phMin: 4.5, phMax: 5.5 })
    const project = createProject('t')
    project.soil = { source: 'manual', phMin: 6.0, phMax: 7.5, texture: 'loamy', drainage: null }
    project.climate = { source: 'manual', minWinterC: -15, lastFrostDoy: null, firstFrostDoy: null, frostFree: false }
    const r = filterPlants([apple, blueberry], { ...q, fitsHere: { project } })
    expect(r.map((p) => p.id)).toEqual(['apple'])
  })
  it('drops plants too tender for the winters', () => {
    const avocado = fixturePlant({ id: 'avocado', commonNames: ['Avocado'], minWinterC: -2 })
    const project = createProject('t')
    project.climate = { source: 'manual', minWinterC: -15, lastFrostDoy: null, firstFrostDoy: null, frostFree: false }
    expect(filterPlants([avocado], { ...q, fitsHere: { project } })).toEqual([])
    expect(filterPlants([avocado], { ...q, fitsHere: null })).toHaveLength(1)
  })
})

describe('filterPlants fitsHere region', () => {
  it('hides an American-only native for a garden in Budapest, keeps it in New York', () => {
    const nativeUS = { ...fixturePlant(), id: 'us-native', origin: ['north-america'], grownIn: null, fieldSources: { ...fixturePlant().fieldSources, origin: ['s'] } } as ReturnType<typeof fixturePlant>
    const mk = (lat: number, lon: number) => ({ ...createProject('R'), location: { lat, lon } })
    expect(filterPlants([nativeUS], { ...q, fitsHere: { project: mk(47.5, 19.04) } })).toHaveLength(0)
    expect(filterPlants([nativeUS], { ...q, fitsHere: { project: mk(40.7, -74) } })).toHaveLength(1)
  })
})

describe('paletteMarks', () => {
  const dry = () => {
    const project = createProject('t')
    project.climate = { source: 'manual', minWinterC: null, lastFrostDoy: null, firstFrostDoy: null, frostFree: false, rainYearMm: 300, rainWarmMm: 100 }
    return project
  }
  const thirsty = fixturePlant({ id: 'rice', commonNames: ['Rice'], water: { level: 'high' } })
  it('marks a thirsty plant in a dry garden', () => {
    expect(paletteMarks(thirsty, dry())).toEqual(['water'])
  })
  it('no mark when unknown', () => {
    expect(paletteMarks(fixturePlant({ id: 'x', water: null }), dry())).toEqual([])
    const project = dry()
    project.climate = { source: 'manual', minWinterC: null, lastFrostDoy: null, firstFrostDoy: null, frostFree: false }
    expect(paletteMarks(thirsty, project)).toEqual([])
  })
  it('marked plants still pass fitsHere', () => {
    const project = dry()
    expect(paletteMarks(thirsty, project)).toEqual(['water'])
    expect(fitsHere(thirsty, project)).toBe(true)
    expect(filterPlants([thirsty], { ...q, fitsHere: { project } })).toHaveLength(1)
  })
})

describe('filterPlants veggie default', () => {
  const tree = fixturePlant({ id: 't', commonNames: ['Apple'], layer: 'canopy' })
  const herb = fixturePlant({ id: 'h', commonNames: ['Basil'], layer: 'herbaceous' })
  const root = fixturePlant({ id: 'r', commonNames: ['Carrot'], layer: 'root' })
  const shrub = fixturePlant({ id: 's', commonNames: ['Currant'], layer: 'shrub' })
  it('veggie palette hides trees until toggled', () => {
    const all = [tree, herb, root, shrub]
    expect(names(filterPlants(all, { ...q, veggieOnly: true }))).toEqual(['Basil', 'Carrot'])
    expect(names(filterPlants(all, { ...q, veggieOnly: false }))).toHaveLength(4)
    expect(names(filterPlants(all, q))).toHaveLength(4)
  })
})

describe('filterPlants language', () => {
  afterEach(() => setLang('en'))
  const f = fixturePlant({ id: 'x', commonNames: ['Apple'], latinName: 'Malus domestica', commonNamesHu: ['Alma', 'Almafa'] })
  it('search matches Hungarian and English names', () => {
    for (const lang of ['en', 'hu'] as const) {
      setLang(lang)
      for (const text of ['alma', 'almafa', 'apple', 'malus']) expect(filterPlants([f], { ...q, text })).toHaveLength(1)
      expect(filterPlants([f], { ...q, text: 'pear' })).toHaveLength(0)
    }
  })
})
