import type { Point } from '../../model/project'

/** A drawn plot must enclose more than this. */
export const MIN_AREA_M2 = 1

export function snapPoint(p: Point, stepM = 0.5): Point {
  // + 0 turns -0 into 0
  return { x: Math.round(p.x / stepM) * stepM + 0, y: Math.round(p.y / stepM) * stepM + 0 }
}

export function polygonBounds(points: Point[]): { minX: number; minY: number; widthM: number; lengthM: number } {
  const xs = points.map((p) => p.x)
  const ys = points.map((p) => p.y)
  const minX = Math.min(...xs)
  const minY = Math.min(...ys)
  return { minX, minY, widthM: Math.max(...xs) - minX, lengthM: Math.max(...ys) - minY }
}

/** Translate so the bounding box starts at (0,0). */
export function normalizePolygon(points: Point[]): Point[] {
  if (points.length === 0) return []
  const { minX, minY } = polygonBounds(points)
  return points.map((p) => ({ x: p.x - minX + 0, y: p.y - minY + 0 }))
}

function cross(o: Point, a: Point, b: Point): number {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x)
}

function onSegment(a: Point, b: Point, p: Point): boolean {
  return Math.min(a.x, b.x) <= p.x && p.x <= Math.max(a.x, b.x) && Math.min(a.y, b.y) <= p.y && p.y <= Math.max(a.y, b.y)
}

/** True when the closed segments touch or cross anywhere, including collinear overlap. */
function segmentsTouch(a: Point, b: Point, c: Point, d: Point): boolean {
  const d1 = cross(a, b, c)
  const d2 = cross(a, b, d)
  const d3 = cross(c, d, a)
  const d4 = cross(c, d, b)
  if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) return true
  return (d1 === 0 && onSegment(a, b, c)) || (d2 === 0 && onSegment(a, b, d)) || (d3 === 0 && onSegment(c, d, a)) || (d4 === 0 && onSegment(c, d, b))
}

export type PolygonProblem = 'few' | 'crossing' | 'small'

/** Why the outline can't be a plot, or null when it can. */
export function polygonProblem(points: Point[]): PolygonProblem | null {
  const n = points.length
  if (n < 3) return 'few'
  if (points.some((p) => !Number.isFinite(p.x) || !Number.isFinite(p.y))) return 'crossing'
  let area2 = 0
  for (let i = 0; i < n; i++) {
    const a = points[i]!
    const b = points[(i + 1) % n]!
    if (a.x === b.x && a.y === b.y) return 'crossing'
    area2 += a.x * b.y - b.x * a.y
  }
  // All corners on one line encloses nothing: that is a size problem, not crossing edges.
  if (points.every((p) => cross(points[0]!, points[1]!, p) === 0)) return 'small'
  for (let i = 0; i < n; i++) {
    const a = points[i]!
    const b = points[(i + 1) % n]!
    // Neighbouring edges share a corner; they only conflict if they fold back along one line.
    const c = points[(i + 2) % n]!
    if (cross(a, b, c) === 0 && (b.x - a.x) * (c.x - b.x) + (b.y - a.y) * (c.y - b.y) < 0) return 'crossing'
    for (let j = i + 2; j < n; j++) {
      if (i === 0 && j === n - 1) continue
      if (segmentsTouch(a, b, points[j]!, points[(j + 1) % n]!)) return 'crossing'
    }
  }
  return Math.abs(area2) / 2 <= MIN_AREA_M2 ? 'small' : null
}

export function polygonValid(points: Point[]): boolean {
  return polygonProblem(points) === null
}

/** Normalized points plus the shift that moves everything else in the plot frame with them. */
export function normalizeWithOffset(points: Point[]): { points: Point[]; shift: Point } {
  const { minX, minY } = polygonBounds(points)
  return { points: normalizePolygon(points), shift: { x: -minX + 0, y: -minY + 0 } }
}
