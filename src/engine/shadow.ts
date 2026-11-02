import { plotBounds, pointInPlot, type PlotShape, type Point } from '../model/project'
import { FLAT_GROUND, type Ground } from './slope'
import type { SunSample, Vec3 } from './sun'

/** A box is a ShadeObject in the scene: same centre, sizes and rotationDeg convention (see ShadeObject). */
export type Obstacle =
  | { kind: 'box'; id: string; cx: number; cy: number; widthM: number; lengthM: number; rotationDeg: number; heightM: number; zBase?: number; zSlope?: [number, number]; transmission: number }
  | { kind: 'crown'; id: string; cx: number; cy: number; radiusM: number; zBottom: number; zTop: number; transmission: number } // spheroid

const EPS = 1e-6

// Slab test of a ray against an axis-aligned interval pair per axis; true when the ray touches the box at t > EPS or starts inside.
function hitsBox(o: Vec3, d: Vec3, b: Extract<Obstacle, { kind: 'box' }>): boolean {
  const a = (b.rotationDeg * Math.PI) / 180
  const c = Math.cos(a)
  const s = Math.sin(a)
  const dx = o[0] - b.cx
  const dy = o[1] - b.cy
  // The box base follows the ground plane, so shear the ray by the plane's gradient (exact: linear in t) and test the unsheared box.
  const g = b.zSlope
  const oz = g ? o[2] - (g[0] * dx + g[1] * dy) : o[2]
  const dz = g ? d[2] - (g[0] * d[0] + g[1] * d[1]) : d[2]
  const lo: Vec3 = [dx * c + dy * s, -dx * s + dy * c, oz]
  const ld: Vec3 = [d[0] * c + d[1] * s, -d[0] * s + d[1] * c, dz]
  const zBase = b.zBase ?? 0
  const min = [-b.widthM / 2, -b.lengthM / 2, zBase]
  const max = [b.widthM / 2, b.lengthM / 2, zBase + b.heightM]
  let tNear = -Infinity
  let tFar = Infinity
  for (let i = 0; i < 3; i++) {
    const oi = lo[i]!
    const di = ld[i]!
    if (Math.abs(di) < 1e-12) {
      if (oi < min[i]! || oi > max[i]!) return false
      continue
    }
    let t1 = (min[i]! - oi) / di
    let t2 = (max[i]! - oi) / di
    if (t1 > t2) [t1, t2] = [t2, t1]
    tNear = Math.max(tNear, t1)
    tFar = Math.min(tFar, t2)
    if (tNear > tFar) return false
  }
  return tFar > EPS
}

function hitsCrown(o: Vec3, d: Vec3, k: Extract<Obstacle, { kind: 'crown' }>): boolean {
  const rv = (k.zTop - k.zBottom) / 2
  if (k.radiusM <= 0 || rv <= 0) return false
  // scale to a unit sphere
  const ox = (o[0] - k.cx) / k.radiusM
  const oy = (o[1] - k.cy) / k.radiusM
  const oz = (o[2] - (k.zBottom + k.zTop) / 2) / rv
  const dx = d[0] / k.radiusM
  const dy = d[1] / k.radiusM
  const dz = d[2] / rv
  if (ox * ox + oy * oy + oz * oz <= 1) return true
  const A = dx * dx + dy * dy + dz * dz
  const B = 2 * (ox * dx + oy * dy + oz * dz)
  const C = ox * ox + oy * oy + oz * oz - 1
  const disc = B * B - 4 * A * C
  if (A === 0 || disc < 0) return false
  const sq = Math.sqrt(disc)
  return (-B + sq) / (2 * A) > EPS
}

export function transmissionAlong(origin: Vec3, dir: Vec3, obstacles: Obstacle[], excludeId?: string): number {
  let t = 1
  for (const ob of obstacles) {
    if (ob.id === excludeId) continue
    if (ob.kind === 'box' ? hitsBox(origin, dir, ob) : hitsCrown(origin, dir, ob)) t *= ob.transmission
  }
  return t
}

/** True when the sun is above the local ground surface (always, on flat ground, for samples above the horizon). */
export function sunFacesGround(dir: Vec3, ground: Ground): boolean {
  if (ground === FLAT_GROUND) return true
  const n = ground.normal
  return dir[0] * n[0] + dir[1] * n[1] + dir[2] * n[2] > 0
}

export function sunHoursAt(p: Point, z: number, samples: readonly SunSample[], obstacles: Obstacle[], excludeId?: string, ground: Ground = FLAT_GROUND): number {
  const origin: Vec3 = [p.x, p.y, ground.zAt(p) + z]
  let h = 0
  for (const s of samples) {
    if (!sunFacesGround(s.dir, ground)) continue
    h += s.hours * transmissionAlong(origin, s.dir, obstacles, excludeId)
  }
  return h
}

/** Energy an open, flat, unshaded spot gets over the samples: the reference that strength is measured against. */
export function openFlatEnergy(samples: readonly SunSample[]): number {
  let e = 0
  for (const s of samples) e += s.hours * s.dir[2]
  return e
}

// How squarely the sun hits the ground: 0 when it is behind the surface, 1 when overhead of a flat spot.
function incidence(dir: Vec3, ground: Ground): number {
  const n = ground.normal
  return Math.max(0, dir[0] * n[0] + dir[1] * n[1] + dir[2] * n[2])
}

/** Sun energy at a point: hours weighted by how squarely the sun hits the ground and by what filters through obstacles. */
export function sunEnergyAt(p: Point, z: number, samples: readonly SunSample[], obstacles: Obstacle[], excludeId?: string, ground: Ground = FLAT_GROUND): number {
  const origin: Vec3 = [p.x, p.y, ground.zAt(p) + z]
  let e = 0
  for (const s of samples) {
    const c = incidence(s.dir, ground)
    if (c <= 0) continue
    e += s.hours * c * transmissionAlong(origin, s.dir, obstacles, excludeId)
  }
  return e
}

// hours: direct-sun hours; strength: energy as a share of an open flat spot (1 = same). NaN for cells outside plot.
export type SunGrid = { cellM: number; cols: number; rows: number; hours: Float32Array; strength: Float32Array }

export function gridCellSize(plot: PlotShape): number {
  const { widthM, lengthM } = plotBounds(plot)
  let cell = 0.5
  while (Math.ceil(widthM / cell) * Math.ceil(lengthM / cell) > 10000) cell += 0.5
  return cell
}

export function sunHoursGrid(plot: PlotShape, z: number, samples: readonly SunSample[], obstacles: Obstacle[], ground: Ground = FLAT_GROUND): SunGrid {
  const { widthM, lengthM } = plotBounds(plot)
  const cellM = gridCellSize(plot)
  const cols = Math.max(1, Math.ceil(widthM / cellM))
  const rows = Math.max(1, Math.ceil(lengthM / cellM))
  const hours = new Float32Array(cols * rows)
  const strength = new Float32Array(cols * rows)
  const reference = openFlatEnergy(samples)
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const p = { x: (col + 0.5) * cellM, y: (row + 0.5) * cellM }
      const i = row * cols + col
      if (!pointInPlot(plot, p)) {
        hours[i] = NaN
        strength[i] = NaN
        continue
      }
      // one transmission per sample feeds both sums
      const origin: Vec3 = [p.x, p.y, ground.zAt(p) + z]
      let h = 0
      let e = 0
      for (const s of samples) {
        if (!sunFacesGround(s.dir, ground)) continue
        const t = transmissionAlong(origin, s.dir, obstacles)
        h += s.hours * t
        e += s.hours * incidence(s.dir, ground) * t
      }
      hours[i] = h
      strength[i] = reference > 0 ? e / reference : 0
    }
  }
  return { cellM, cols, rows, hours, strength }
}
