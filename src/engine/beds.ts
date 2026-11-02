import type { Point, Project, ShadeObject } from '../model/project'
import { en } from '../strings/en'

/** The bed's name as the user wrote it, or null when it has none (missing, or cleared to blank). */
export function bedName(bed: ShadeObject): string | null {
  return bed.name?.trim() || null
}

/** The topmost raised bed whose (rotated) rectangle contains `p`, or null. Same rotation convention as the shadow engine's box test. */
export function bedAt(project: Project, p: Point): ShadeObject | null {
  for (const o of [...project.shadeObjects].reverse()) {
    if (o.kind !== 'bed') continue
    const a = (o.rotationDeg * Math.PI) / 180
    const dx = p.x - o.x
    const dy = p.y - o.y
    const lx = dx * Math.cos(a) + dy * Math.sin(a)
    const ly = -dx * Math.sin(a) + dy * Math.cos(a)
    if (Math.abs(lx) <= o.widthM / 2 && Math.abs(ly) <= o.lengthM / 2) return o
  }
  return null
}

/** Points on a `step` grid in each bed's own frame where a plant of radius `r` fits wholly inside the bed's edges. */
export function bedSpots(project: Project, r: number, step = 0.25): Point[] {
  const out: Point[] = []
  for (const o of project.shadeObjects) {
    if (o.kind !== 'bed') continue
    const hx = o.widthM / 2 - r
    const hy = o.lengthM / 2 - r
    if (hx < 0 || hy < 0) continue
    // centre the grid on the bed so a narrow bed still gets its middle line
    for (let lx = -Math.floor(hx / step) * step; lx <= hx + 1e-9; lx += step) {
      for (let ly = -Math.floor(hy / step) * step; ly <= hy + 1e-9; ly += step) out.push(toWorld(o, { x: lx, y: ly }))
    }
  }
  return out
}

/** "Bed A" … "Bed Z", then "Bed 27" and up (in the active language): the first name not already used by a bed. */
export function nextBedName(project: Project): string {
  const used = new Set(project.shadeObjects.filter((o) => o.kind === 'bed').map((o) => o.name))
  for (let i = 0; ; i++) {
    const name = en.beds.defaultName(i < 26 ? String.fromCharCode(65 + i) : String(i + 1))
    if (!used.has(name)) return name
  }
}

/** A point in the bed's own frame: x along its width, y along its length, from its centre. Same rotation as `bedAt`. */
export function toLocal(bed: ShadeObject, p: Point): Point {
  const a = (bed.rotationDeg * Math.PI) / 180
  const dx = p.x - bed.x
  const dy = p.y - bed.y
  return { x: dx * Math.cos(a) + dy * Math.sin(a), y: -dx * Math.sin(a) + dy * Math.cos(a) }
}

/** The world point for a spot in the bed's own frame; the inverse of `toLocal`. */
export function toWorld(bed: ShadeObject, p: Point): Point {
  const a = (bed.rotationDeg * Math.PI) / 180
  return { x: bed.x + p.x * Math.cos(a) - p.y * Math.sin(a), y: bed.y + p.x * Math.sin(a) + p.y * Math.cos(a) }
}
