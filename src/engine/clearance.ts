import type { Layer } from '../model/plants'
import type { Point, Project, ShadeObject } from '../model/project'

/** Buildings, walls, fences and hedges: crowns may not grow into them. Existing trees are hosts, not obstacles; beds are ground, not obstacles. */
export function solidObjects(project: Pick<Project, 'shadeObjects'>): ShadeObject[] {
  return project.shadeObjects.filter((o) => o.kind !== 'tree' && o.kind !== 'bed')
}

/** Climbers grow up walls and fences, so they are the one layer allowed against a solid. */
export function needsClearance(layer: Layer): boolean {
  return layer !== 'climber'
}

const toLocal = (o: ShadeObject, p: Point): Point => {
  const a = (o.rotationDeg * Math.PI) / 180
  const dx = p.x - o.x
  const dy = p.y - o.y
  return { x: dx * Math.cos(a) + dy * Math.sin(a), y: -dx * Math.sin(a) + dy * Math.cos(a) }
}
const toWorld = (o: ShadeObject, l: Point): Point => {
  const a = (o.rotationDeg * Math.PI) / 180
  return { x: o.x + l.x * Math.cos(a) - l.y * Math.sin(a), y: o.y + l.x * Math.sin(a) + l.y * Math.cos(a) }
}

const EPS = 1e-6

/** Where a crown of radius r centred at c must move to just clear o, or null when it already does. */
function pushOut(o: ShadeObject, c: Point, r: number): Point | null {
  const l = toLocal(o, c)
  const hw = o.widthM / 2
  const hl = o.lengthM / 2
  const inside = Math.abs(l.x) <= hw && Math.abs(l.y) <= hl // on the edge counts as inside: no outward direction otherwise
  if (inside) {
    // Leave through the nearest side.
    const toX = hw - Math.abs(l.x)
    const toY = hl - Math.abs(l.y)
    const out = toX <= toY
      ? { x: Math.sign(l.x || 1) * (hw + r + EPS), y: l.y }
      : { x: l.x, y: Math.sign(l.y || 1) * (hl + r + EPS) }
    return toWorld(o, out)
  }
  const qx = Math.max(-hw, Math.min(hw, l.x))
  const qy = Math.max(-hl, Math.min(hl, l.y))
  const d = Math.hypot(l.x - qx, l.y - qy)
  if (d >= r) return null
  const k = (r + EPS) / d
  return toWorld(o, { x: qx + (l.x - qx) * k, y: qy + (l.y - qy) * k })
}

/** True when a crown of radius r centred at c overlaps none of the solids. */
export function crownClear(solids: ShadeObject[], c: Point, r: number): boolean {
  return solids.every((o) => pushOut(o, c, r) === null)
}

const MAX_PUSHES = 20
const SEARCH_STEP_M = 0.25
const SEARCH_MAX_M = 30
const SEARCH_ANGLES = 24

/**
 * The nearest point to `c` where a crown of radius r clears every solid: `c` itself when it already does,
 * else pushed out of the objects it overlaps, else (wedged between objects) the closest free point on
 * widening rings. Returns `c` unchanged if nothing within 30 m is free.
 */
export function clearSpot(solids: ShadeObject[], c: Point, r: number): Point {
  if (r <= 0 || crownClear(solids, c, r)) return c
  let p = c
  for (let i = 0; i < MAX_PUSHES; i++) {
    const hit = solids.map((o) => pushOut(o, p, r)).find((q) => q !== null)
    if (!hit) return p
    p = hit
  }
  for (let d = SEARCH_STEP_M; d <= SEARCH_MAX_M; d += SEARCH_STEP_M) {
    for (let k = 0; k < SEARCH_ANGLES; k++) {
      const a = (k / SEARCH_ANGLES) * Math.PI * 2
      const q = { x: c.x + d * Math.cos(a), y: c.y + d * Math.sin(a) }
      if (crownClear(solids, q, r)) return q
    }
  }
  return c
}

export type Crown = Point & { r: number }

/**
 * Where to put a solid object moved to `at` so it overlaps none of the crowns: the object is
 * nudged away from each crown it hits (the crown stays put). Returns `at` when nothing overlaps.
 */
export function clearObjectSpot(o: ShadeObject, at: Point, crowns: Crown[]): Point {
  let p = at
  for (let i = 0; i < MAX_PUSHES; i++) {
    const moved = { ...o, x: p.x, y: p.y }
    const hit = crowns.map((c) => ({ c, q: pushOut(moved, c, c.r) })).find((h) => h.q !== null)
    if (!hit) return p
    p = { x: p.x - (hit.q!.x - hit.c.x), y: p.y - (hit.q!.y - hit.c.y) }
  }
  return p
}
