import type { Climate, LatLon } from '../model/project'

// Binary layout: scripts/climate/README.md
export type ClimateGrid = { cols: number; rows: number; resDeg: number; data: Int16Array }

const HEADER = 16
const NO_DATA = -32768
const MAX_DIM = 4000

export function parseClimateGrid(buf: ArrayBuffer): ClimateGrid {
  if (buf.byteLength < HEADER) throw new Error('climate grid: too short')
  const dv = new DataView(buf)
  const magic = String.fromCharCode(dv.getUint8(0), dv.getUint8(1), dv.getUint8(2), dv.getUint8(3))
  if (magic !== 'TGCL') throw new Error('climate grid: bad magic')
  if (dv.getUint16(4, true) !== 2) throw new Error('climate grid: unsupported version')
  const cols = dv.getUint16(6, true)
  const rows = dv.getUint16(8, true)
  const resDeg = dv.getFloat32(10, true)
  if (cols < 1 || rows < 1 || cols > MAX_DIM || rows > MAX_DIM || !(resDeg > 0)) throw new Error('climate grid: bad header')
  if (buf.byteLength !== HEADER + cols * rows * 12) throw new Error('climate grid: wrong size')
  const data = new Int16Array(cols * rows * 6)
  for (let i = 0; i < data.length; i++) data[i] = dv.getInt16(HEADER + i * 2, true) // explicit little-endian
  return { cols, rows, resDeg, data }
}

const opt = (v: number) => (v === NO_DATA ? null : v)

function cellAt(g: ClimateGrid, row: number, col: number): Climate | null {
  if (row < 0 || row >= g.rows) return null
  const c = ((col % g.cols) + g.cols) % g.cols
  const i = (row * g.cols + c) * 6
  const t = g.data[i]!
  if (t === NO_DATA) return null
  const last = g.data[i + 1]!
  const first = g.data[i + 2]!
  const frostFree = last === -1 && first === -1
  const doy = (v: number) => (frostFree || v === NO_DATA || v < 1 ? null : v)
  return {
    source: 'lookup', minWinterC: t / 10, lastFrostDoy: doy(last), firstFrostDoy: doy(first), frostFree,
    rainYearMm: opt(g.data[i + 3]!), rainWarmMm: opt(g.data[i + 4]!), cloudWarmPct: opt(g.data[i + 5]!),
  }
}

export function climateAt(grid: ClimateGrid, loc: LatLon): Climate | null {
  const rowF = (90 - loc.lat) / grid.resDeg
  const colF = (loc.lon + 180) / grid.resDeg
  const row = Math.min(grid.rows - 1, Math.max(0, Math.floor(rowF)))
  const col = Math.min(grid.cols - 1, Math.max(0, Math.floor(colF)))
  const here = cellAt(grid, row, col)
  if (here) return here
  // sea: nearest land cell within one cell (by distance from the point to the cell centre;
  // a degree of longitude shrinks by cos(latitude), so column steps count for less towards the poles)
  const kx = Math.cos((loc.lat * Math.PI) / 180)
  let best: Climate | null = null
  let bestD = Infinity
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue
      const c = cellAt(grid, row + dr, col + dc)
      if (!c) continue
      const d = (row + dr + 0.5 - rowF) ** 2 + ((col + dc + 0.5 - colF) * kx) ** 2
      if (d < bestD) { best = c; bestD = d }
    }
  }
  return best
}

let gridPromise: Promise<ClimateGrid> | null = null

export function resetClimateCache(): void {
  gridPromise = null
}

function fetchGrid(): Promise<ClimateGrid> {
  gridPromise ??= (async () => {
    const res = await fetch('/climate/climate-v2.bin')
    if (!res.ok) throw new Error(`climate grid: HTTP ${res.status}`)
    return parseClimateGrid(await res.arrayBuffer())
  })().catch((e: unknown) => {
    gridPromise = null // let a later call retry
    throw e
  })
  return gridPromise
}

/** Missing file, network error or unreadable file all give null; the panel then asks for manual entry. */
export async function loadClimate(loc: LatLon): Promise<Climate | null> {
  try {
    return climateAt(await fetchGrid(), loc)
  } catch {
    return null
  }
}
