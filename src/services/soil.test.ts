import { afterEach, describe, expect, it, vi } from 'vitest'
import { roundCoord as apiRoundCoord } from '../../api/soil'
import { acidityWord, describeSoil, lookupSoil, roundCoord, textureClass } from './soil'

afterEach(() => vi.unstubAllGlobals())

describe('textureClass', () => {
  it.each([
    [90, 5, 5, 'sandy'],
    [40, 40, 20, 'loamy'],
    [10, 70, 20, 'silty'],
    [20, 20, 60, 'clay'],
    [65, 15, 20, 'loamy'],
    [30, 35, 35, 'loamy'],
    [10, 50, 40, 'clay'],
    [60, 5, 35, 'clay'],
    [10, 55, 35, 'silty'],
    [10, 85, 5, 'silty'],
    [80, 10, 10, 'loamy'],
    [85, 10, 5, 'sandy'],
    [30, 50, 20, 'silty'],
    [45, 20, 35, 'loamy'],
    [46, 19, 35, 'clay'],
    [15, 55, 30, 'silty'],
  ] as const)('(%i,%i,%i) -> %s', (a, b, c, want) => expect(textureClass(a, b, c)).toBe(want))
})

describe('acidityWord', () => {
  it('maps ph to words', () => {
    expect(acidityWord(6.4)).toBe('slightly acidic')
    expect(acidityWord(7.0)).toBe('neutral')
    expect(acidityWord(5.0)).toBe('acidic')
    expect(acidityWord(7.5)).toBe('slightly alkaline')
    expect(acidityWord(8.2)).toBe('alkaline')
  })
})

it('roundCoord snaps to 0.0025', () => {
  expect(roundCoord(47.5012)).toBe(47.5)
  expect(roundCoord(19.0391)).toBe(19.04)
})

it('api and client roundCoord agree', () => {
  const inputs = [0, -0.00125, 0.00125, -0.001250001, 0.001249999, 0.00375, -0.00375, 47.50125, 47.501249, 19.04125, -33.86, -179.99875, 180, -180, 90, -90, 89.99875, 0.0025, -0.0025]
  for (let i = 0; i < 500; i++) inputs.push((Math.random() - 0.5) * 360)
  for (const v of inputs) expect(apiRoundCoord(v)).toBe(roundCoord(v))
})

describe('describeSoil', () => {
  it('describes known and unknown parts', () => {
    expect(describeSoil({ source: 'lookup', phMin: 6.4, phMax: 6.4, texture: 'loamy', drainage: null })).toBe('loamy, slightly acidic')
    expect(describeSoil({ source: 'manual', phMin: null, phMax: null, texture: null, drainage: null })).toBe('unknown, unknown')
  })
})

describe('lookupSoil', () => {
  const loc = { lat: 47.5, lon: 19.04 }
  const mock = (res: Response | Error) => {
    const f = vi.fn(async (_url: string) => { if (res instanceof Error) throw res; return res })
    vi.stubGlobal('fetch', f)
    return f
  }
  it('returns soil for an available response', async () => {
    const f = mock(Response.json({ available: true, ph: 6.4, sandPct: 40, siltPct: 40, clayPct: 20 }))
    expect(await lookupSoil(loc)).toEqual({ source: 'lookup', phMin: 6.4, phMax: 6.4, texture: 'loamy', drainage: null })
    expect(String(f.mock.calls[0][0])).toBe('/api/soil?lat=47.5&lon=19.04')
  })
  it('returns null when unavailable, failing or offline', async () => {
    mock(Response.json({ available: false }))
    expect(await lookupSoil(loc)).toBeNull()
    mock(Response.json({ available: false }, { status: 502 }))
    expect(await lookupSoil(loc)).toBeNull()
    mock(new TypeError('offline'))
    expect(await lookupSoil(loc)).toBeNull()
  })
})
