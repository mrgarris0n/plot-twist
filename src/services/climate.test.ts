import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { climateAt, loadClimate, parseClimateGrid, resetClimateCache } from './climate'

const NO = -32768
// 4 cols x 2 rows, res 90 deg: col centres -135,-45,45,135; row centres 45, -45.
// Layout matches scripts/climate/README.md.
type Rec = [number, number, number, number, number, number]
function build(recs: Rec[], cols = 4, rows = 2, res = 90, version = 2): ArrayBuffer {
  const buf = new ArrayBuffer(16 + recs.length * 12)
  const dv = new DataView(buf)
  'TGCL'.split('').forEach((c, i) => dv.setUint8(i, c.charCodeAt(0)))
  dv.setUint16(4, version, true); dv.setUint16(6, cols, true); dv.setUint16(8, rows, true)
  dv.setFloat32(10, res, true); dv.setUint16(14, 0, true)
  recs.forEach((r, i) => r.forEach((v, j) => dv.setInt16(16 + i * 12 + j * 2, v, true)))
  return buf
}
const SEA: Rec = [NO, NO, NO, NO, NO, NO]
const grid = () =>
  parseClimateGrid(build([
    [-153, 105, 300, 640, 310, 72], SEA, [40, -1, -1, 800, 400, 50], SEA, // row 0 (lat 45)
    SEA, SEA, SEA, SEA, // row 1 (lat -45): all sea
  ]))

describe('parseClimateGrid', () => {
  it('reads the header', () => {
    const g = grid()
    expect([g.cols, g.rows, g.resDeg]).toEqual([4, 2, 90])
  })
  it('rejects version 1', () => {
    expect(() => parseClimateGrid(build([SEA, SEA, SEA, SEA, SEA, SEA, SEA, SEA], 4, 2, 90, 1))).toThrow()
  })
  it('throws on garbage', () => {
    expect(() => parseClimateGrid(new ArrayBuffer(8))).toThrow()
    expect(() => parseClimateGrid(new Uint8Array(40).buffer)).toThrow()
    expect(() => parseClimateGrid(build([[0, 0, 0, 0, 0, 0]], 4, 2))).toThrow() // truncated
  })
})

describe('climateAt', () => {
  it('returns a land cell', () => {
    expect(climateAt(grid(), { lat: 50, lon: -140 })).toEqual({ source: 'lookup', minWinterC: -15.3, lastFrostDoy: 105, firstFrostDoy: 300, frostFree: false, rainYearMm: 640, rainWarmMm: 310, cloudWarmPct: 72 })
  })
  it('uses a land neighbour for a sea cell', () => {
    expect(climateAt(grid(), { lat: 50, lon: -50 })?.minWinterC).toBe(-15.3) // col 1 is sea; col 0 is the nearer land cell
  })
  it('sea fallback returns all six values from one cell', () => {
    // col 0 is the nearer land cell to lon -50; col 2 is farther. Every field differs between cells.
    const g = parseClimateGrid(build([[-50, 90, 310, 900, 450, 40], SEA, [200, 120, 250, 300, 150, 90], SEA, SEA, SEA, SEA, SEA]))
    expect(climateAt(g, { lat: 50, lon: -50 })).toEqual({ source: 'lookup', minWinterC: -5, lastFrostDoy: 90, firstFrostDoy: 310, frostFree: false, rainYearMm: 900, rainWarmMm: 450, cloudWarmPct: 40 })
  })
  it('no-data rain gives null rain, other values kept', () => {
    const g = parseClimateGrid(build([[-153, 105, 300, NO, NO, 72], SEA, SEA, SEA, SEA, SEA, SEA, SEA]))
    expect(climateAt(g, { lat: 50, lon: -140 })).toEqual({ source: 'lookup', minWinterC: -15.3, lastFrostDoy: 105, firstFrostDoy: 300, frostFree: false, rainYearMm: null, rainWarmMm: null, cloudWarmPct: 72 })
  })
  it('frost-free cell', () => {
    expect(climateAt(grid(), { lat: 50, lon: 50 })).toEqual({ source: 'lookup', minWinterC: 4, lastFrostDoy: null, firstFrostDoy: null, frostFree: true, rainYearMm: 800, rainWarmMm: 400, cloudWarmPct: 50 })
  })
  it('null when no land within one cell', () => {
    const g = parseClimateGrid(build([[-100, 100, 300, 500, 250, 60], SEA, SEA, SEA, SEA, SEA, SEA, SEA]))
    expect(climateAt(g, { lat: -45, lon: 45 })).toBeNull()
    expect(climateAt(g, { lat: 45, lon: 45 })).toBeNull() // two columns from the only land cell
  })
  it('wraps across the antimeridian when looking for a neighbour', () => {
    const g = parseClimateGrid(build([[-100, 100, 300, 500, 250, 60], SEA, SEA, SEA, SEA, SEA, SEA, SEA]))
    expect(climateAt(g, { lat: 45, lon: 135 })?.minWinterC).toBe(-10) // col 3 is sea, col 0 is land across the seam
  })
  it('measures sea-to-land distance in ground distance, where longitude degrees are short', () => {
    // 10-degree grid; at 81 N a column step is only about 0.16 of a row step.
    const recs: Rec[] = Array.from({ length: 36 * 18 }, () => SEA)
    recs[3] = [-200, 100, 300, 500, 250, 60] // row 0, col 3: east neighbour, far in grid units but close on the ground
    recs[36 + 2] = [-100, 100, 300, 500, 250, 60] // row 1, col 2: south neighbour
    const g = parseClimateGrid(build(recs, 36, 18, 10))
    expect(climateAt(g, { lat: 81, lon: -157 })?.minWinterC).toBe(-20)
  })
  it('clamps at the poles and the antimeridian', () => {
    expect(() => climateAt(grid(), { lat: 90, lon: 180 })).not.toThrow()
    expect(() => climateAt(grid(), { lat: -90, lon: -180 })).not.toThrow()
    expect(climateAt(grid(), { lat: 90, lon: -180 })?.minWinterC).toBe(-15.3)
  })
})

describe('loadClimate', () => {
  beforeEach(() => resetClimateCache())
  afterEach(() => vi.unstubAllGlobals())
  it('fetches once and looks up', async () => {
    const f = vi.fn(async () => new Response(build([[-153, 105, 300, 640, 310, 72], SEA, SEA, SEA, SEA, SEA, SEA, SEA])))
    vi.stubGlobal('fetch', f)
    expect((await loadClimate({ lat: 50, lon: -140 }))?.minWinterC).toBe(-15.3)
    await loadClimate({ lat: 50, lon: -140 })
    expect(f).toHaveBeenCalledTimes(1)
    expect(f).toHaveBeenCalledWith('/climate/climate-v2.bin')
  })
  it('returns null on 404 and retries later', async () => {
    const f = vi.fn(async () => new Response('nope', { status: 404 }))
    vi.stubGlobal('fetch', f)
    expect(await loadClimate({ lat: 50, lon: -140 })).toBeNull()
    f.mockImplementation(async () => new Response(build([[-153, 105, 300, 640, 310, 72], SEA, SEA, SEA, SEA, SEA, SEA, SEA])))
    expect((await loadClimate({ lat: 50, lon: -140 }))?.minWinterC).toBe(-15.3)
  })
  it('returns null on network error or garbage', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('offline') }))
    expect(await loadClimate({ lat: 1, lon: 1 })).toBeNull()
    vi.stubGlobal('fetch', vi.fn(async () => new Response(new Uint8Array(40))))
    expect(await loadClimate({ lat: 1, lon: 1 })).toBeNull()
  })
})
