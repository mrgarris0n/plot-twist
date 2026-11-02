import { describe, expect, it } from 'vitest'
import { createProject, type Climate, type PlacedPlant, type Project } from '../model/project'
import { buildCalendar, ruleMonths, subSeasonMonth, undatedTasks } from './calendar'
import { fixtureLibrary, fixturePlant } from '../test/fixtures'

const apple = fixturePlant({
  id: 'apple', commonNames: ['Apple'], firstHarvestYears: 3,
  calendar: [
    { task: 'prune', from: 'late-winter', to: 'late-winter' },
    { task: 'harvest', from: 'early-autumn', to: 'mid-autumn' },
  ],
})
const lib = fixtureLibrary(apple)
const placed = (id: string, plantId = 'apple', plantedYear = 0): PlacedPlant => ({ id, plantId, variantId: null, x: 0, y: 0, plantedYear, heightOverrideM: null, widthOverrideM: null })
const proj = (plants: PlacedPlant[], extra: Partial<Project> = {}): Project => ({ ...createProject('t'), plants, ...extra })
const climate = (o: Partial<Climate>): Climate => ({ source: 'manual', minWinterC: null, lastFrostDoy: null, firstFrostDoy: null, frostFree: false, ...o })

describe('subSeasonMonth', () => {
  it('maps north and south', () => {
    expect(subSeasonMonth('late-winter', false)).toBe(2)
    expect(subSeasonMonth('late-winter', true)).toBe(8)
    expect(subSeasonMonth('early-spring', false)).toBe(3)
  })
})

describe('ruleMonths', () => {
  it('wraps across the year end', () => {
    expect(ruleMonths({ task: 'prune', from: 'late-autumn', to: 'late-winter' }, false, null)).toEqual([11, 12, 1, 2])
  })
  it('uses frost dates, or null without them', () => {
    const rule = { task: 'plant', frost: 'last', offsetWeeks: 2 } as const
    expect(ruleMonths(rule, false, climate({ lastFrostDoy: 110 }))).toEqual([5])
    expect(ruleMonths(rule, false, climate({ lastFrostDoy: 110, frostFree: true }))).toBeNull()
    expect(ruleMonths(rule, false, climate({}))).toBeNull()
    expect(ruleMonths(rule, false, null)).toBeNull()
  })
  it('wraps frost dates past the year end', () => {
    expect(ruleMonths({ task: 'harvest', frost: 'first', offsetWeeks: 4 }, false, climate({ firstFrostDoy: 350 }))).toEqual([1])
  })
})

describe('buildCalendar', () => {
  it('waits for the first harvest year', () => {
    const p = proj([placed('a')])
    expect(buildCalendar(p, lib, 2).some((j) => j.task === 'harvest')).toBe(false)
    expect(buildCalendar(p, lib, 3).some((j) => j.task === 'harvest')).toBe(true)
  })
  it('groups two apples into one job', () => {
    const jobs = buildCalendar(proj([placed('a'), placed('b')]), lib, 0).filter((j) => j.task === 'prune')
    expect(jobs).toHaveLength(1)
    expect(jobs[0]!.text).toContain('2 apple trees')
    expect(jobs[0]!.placedId).toBe('a')
  })
  it('says a single tree in the singular', () => {
    expect(buildCalendar(proj([placed('a')]), lib, 0)[0]!.text).toBe('Prune the apple tree')
  })
  it('flips the prune month in the southern hemisphere', () => {
    const prune = (lat: number) => buildCalendar(proj([placed('a')], { location: { lat, lon: 0 } }), lib, 0).find((j) => j.task === 'prune')!.month
    expect(prune(48)).toBe(2)
    expect(prune(-33.9)).toBe(8)
  })
  it('lists frost-dependent tasks as undated when frost dates are missing', () => {
    const tomato = fixturePlant({ id: 'tom', commonNames: ['Tomato'], layer: 'herbaceous', calendar: [{ task: 'plant', frost: 'last', offsetWeeks: 1 }] })
    const p = proj([placed('t', 'tom')])
    const l = fixtureLibrary(tomato)
    expect(buildCalendar(p, l, 0)).toEqual([])
    expect(undatedTasks(p, l, 0)).toEqual([{ plantId: 'tom', task: 'plant', name: 'Tomato' }])
    // planting is only due in the planting year, so a later year has nothing undated
    expect(undatedTasks(p, l, 1)).toEqual([])
  })
})

describe('buildCalendar by planting year', () => {
  const lib2 = fixtureLibrary(fixturePlant({
    id: 'apple', commonNames: ['Apple'],
    calendar: [{ task: 'plant', from: 'early-spring', to: 'early-spring' }, { task: 'prune', from: 'late-winter', to: 'late-winter' }],
  }))
  const p = proj([placed('a', 'apple', 5)])
  const tasks = (y: number) => buildCalendar(p, lib2, y).map((j) => j.task)
  it('has no jobs before planting', () => expect(tasks(2)).toEqual([]))
  it('plants only in the planting year', () => {
    expect(tasks(5)).toContain('plant')
    expect(tasks(6)).toEqual(['prune'])
  })
  it('replants an annual every year unless the garden is frost-free', () => {
    const lib3 = fixtureLibrary(fixturePlant({ id: 'pea', commonNames: ['Pea'], annual: true, calendar: [{ task: 'plant', from: 'early-spring', to: 'early-spring' }] }))
    const frosty: Climate = { source: 'manual', minWinterC: -10, lastFrostDoy: 100, firstFrostDoy: 290, frostFree: false }
    const peaTasks = (climate: Climate | null, y: number) => buildCalendar(proj([placed('p', 'pea', 2)], { climate }), lib3, y).map((j) => j.task)
    expect(peaTasks(frosty, 4)).toEqual(['plant'])
    expect(peaTasks(null, 4)).toEqual(['plant'])
    expect(peaTasks({ ...frosty, frostFree: true }, 4)).toEqual([])
    expect(peaTasks(frosty, 1)).toEqual([])
  })
})

describe('veggie beds calendar', () => {
  const tom = fixturePlant({ id: 'tom', commonNames: ['Tomato'], layer: 'herbaceous', annual: true, calendar: [{ task: 'plant', frost: 'last', offsetWeeks: 1 }] })
  const l = fixtureLibrary(tom)
  const p = proj([placed('a', 'tom', 0)], { gardenType: 'veggie-beds', climate: climate({ lastFrostDoy: 100, firstFrostDoy: 290, frostFree: false }) })
  it('has no jobs for last year\'s annual and a plant job in its own year', () => {
    expect(buildCalendar(p, l, 1)).toEqual([])
    expect(buildCalendar(p, l, 0).map((j) => j.task)).toEqual(['plant'])
  })
})
