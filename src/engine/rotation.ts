import type { PlantLibrary, RotationGroup } from '../model/plants'
import type { PlacedPlant, Point, Project, ShadeObject } from '../model/project'
import { bedAt, bedName } from './beds'
import { en } from '../strings/en'
import { effectiveSize } from './growth'
import { isPresent, seasonalInBeds } from './presence'
import { inCycle, ROTATION_CYCLE } from './rotationCycle'

export { ROTATION_CYCLE, inCycle } from './rotationCycle'
/** A group may not return to a bed within this many years of growing there. */
export const ROTATION_GAP_YEARS = 3

/** The group that should follow `g` in a bed. `any` has no successor and comes back unchanged. */
export function nextGroup(g: RotationGroup): RotationGroup {
  const i = ROTATION_CYCLE.indexOf(g)
  return i < 0 ? g : ROTATION_CYCLE[(i + 1) % ROTATION_CYCLE.length]!
}

/** Annuals present in `year`, each with the bed it sits in (null when outside every bed). */
export function annualsByBed(project: Project, library: PlantLibrary, year: number): { pp: PlacedPlant; bed: ShadeObject | null }[] {
  const out: { pp: PlacedPlant; bed: ShadeObject | null }[] = []
  for (const pp of project.plants) {
    const rec = library.byId.get(pp.plantId)
    if (!rec || !seasonalInBeds(project, rec) || !isPresent(project, rec, pp, year)) continue
    out.push({ pp, bed: bedAt(project, pp) })
  }
  return out
}

/** Majority cycle group among the bed's annuals in `year`; ties go to the earliest in the cycle; null when none. */
export function bedGroup(project: Project, library: PlantLibrary, bedId: string, year: number): RotationGroup | null {
  const counts = new Map<RotationGroup, number>()
  for (const { pp, bed } of annualsByBed(project, library, year)) {
    if (bed?.id !== bedId) continue
    const g = library.byId.get(pp.plantId)?.rotationGroup
    if (inCycle(g)) counts.set(g, (counts.get(g) ?? 0) + 1)
  }
  let best: RotationGroup | null = null
  for (const g of ROTATION_CYCLE) if ((counts.get(g) ?? 0) > (best ? counts.get(best)! : 0)) best = g
  return best
}

const toLocal = (bed: ShadeObject, p: Point): Point => {
  const a = (bed.rotationDeg * Math.PI) / 180
  const dx = p.x - bed.x
  const dy = p.y - bed.y
  return { x: dx * Math.cos(a) + dy * Math.sin(a), y: -dx * Math.sin(a) + dy * Math.cos(a) }
}
const toWorld = (bed: ShadeObject, l: Point): Point => {
  const a = (bed.rotationDeg * Math.PI) / 180
  return { x: bed.x + l.x * Math.cos(a) - l.y * Math.sin(a), y: bed.y + l.x * Math.sin(a) + l.y * Math.cos(a) }
}

const byName = (a: ShadeObject, b: ShadeObject) => (bedName(a) ?? a.id).localeCompare(bedName(b) ?? b.id, 'en', { numeric: true })

/** `fromBed` is the bed's name, or null when the plant was not in a bed. */
export type NotPlaced = { plantId: string; fromBed: string | null }

/**
 * Proposal for year + 1: every bed's crops shift one step along the cycle by moving to the bed that
 * should receive them. Nothing is dropped silently; what cannot be placed comes back in `notPlaced`.
 * Annuals outside any bed, in perennial beds, or of unknown or fits-anywhere group stay at the same spot.
 */
export function suggestNextYear(project: Project, library: PlantLibrary, year: number): { plants: PlacedPlant[]; notPlaced: NotPlaced[] } {
  const beds = project.shadeObjects.filter((o) => o.kind === 'bed').sort(byName)
  const annuals = annualsByBed(project, library, year)
  const groupOf = (pp: PlacedPlant) => library.byId.get(pp.plantId)?.rotationGroup
  const plants: PlacedPlant[] = []
  const notPlaced: NotPlaced[] = []

  const collides = (pp: PlacedPlant, at: Point): boolean => {
    const rec = library.byId.get(pp.plantId)!
    const a = effectiveSize(pp, rec)
    return plants.some((q) => {
      const b = effectiveSize(q, library.byId.get(q.plantId)!)
      const mins = [a.minSpacingM, b.minSpacingM].filter((m): m is number => m !== null)
      const need = mins.length ? Math.max(...mins) : (a.matureWidthM + b.matureWidthM) / 2
      return Math.hypot(q.x - at.x, q.y - at.y) < need
    })
  }
  const place = (pp: PlacedPlant, at: Point, fromBed: string | null) => {
    if (collides(pp, at)) notPlaced.push({ plantId: pp.plantId, fromBed })
    else plants.push({ ...pp, id: crypto.randomUUID(), x: at.x, y: at.y, plantedYear: year + 1 })
  }

  // Targets: bed -> the group it should grow next year.
  const targets = beds
    .filter((b) => !b.perennial)
    .map((b) => ({ bed: b, group: ((g) => (g ? nextGroup(g) : null))(bedGroup(project, library, b.id, year)) }))
    .filter((t): t is { bed: ShadeObject; group: RotationGroup } => t.group !== null)

  for (const group of ROTATION_CYCLE) {
    const sources = beds.filter((b) => !b.perennial && bedGroup(project, library, b.id, year) === group)
    const dests = targets.filter((t) => t.group === group).map((t) => t.bed)
    sources.forEach((src, i) => {
      const dest = dests[i]
      for (const { pp, bed } of annuals) {
        if (bed?.id !== src.id || !inCycle(groupOf(pp))) continue
        if (!dest) { notPlaced.push({ plantId: pp.plantId, fromBed: bedName(src) ?? en.rotation.thisBed }); continue }
        const l = toLocal(src, pp)
        place(pp, toWorld(dest, { x: (l.x / src.widthM) * dest.widthM, y: (l.y / src.lengthM) * dest.lengthM }), bedName(src) ?? en.rotation.thisBed)
      }
    })
  }

  // Fits-anywhere and unknown-group crops, and any annual in a perennial bed or outside beds, stay put.
  for (const { pp, bed } of annuals) {
    if (bed && !bed.perennial && inCycle(groupOf(pp))) continue
    place(pp, { x: pp.x, y: pp.y }, bed ? (bedName(bed) ?? en.rotation.thisBed) : null)
  }
  return { plants, notPlaced }
}
