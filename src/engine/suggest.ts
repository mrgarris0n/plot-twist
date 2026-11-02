import type { PlantLibrary } from '../model/plants'
import { plotBounds, pointInPlot, type Point, type Project } from '../model/project'
import { bedSpots } from './beds'
import { crownClear, needsClearance, solidObjects } from './clearance'
import { LIGHT_Z_FRACTION } from './checks/light'
import { wouldCrowd } from './checks/crowding'
import { LIGHT_NEED_HOURS } from './checks/types'
import { effectiveSize, sizeAt } from './growth'
import { presentYears } from './presence'
import { growingSeasonHours } from './scene'

/**
 * Up to `max` nearby spots where the placed plant would get the sun it needs in every sampled year from planting,
 * without crowding a neighbour. Nearest to its current position first, within 15 m. A food forest searches a 1 m
 * grid (cell centres), spots at least max(2 m, mature width) apart; a veggie-beds garden searches only inside beds
 * (25 cm grid, whole plant within the bed's edges), spots at least a mature width apart.
 */
const SEARCH_RADIUS_M = 15
const MIN_SPOT_GAP_M = 2

export function suggestSpots(project: Project, library: PlantLibrary, placedId: string, max = 2): Point[] {
  const pp = project.plants.find((p) => p.id === placedId)
  const rec = pp && library.byId.get(pp.plantId)
  if (!pp || !rec || !project.location) return []
  const need = LIGHT_NEED_HOURS[rec.sunNeed]
  if (need <= 0) return []
  const size = effectiveSize(pp, rec)
  // Sun is checked at the plant's light height in every year it exists; with none to check, no spot can be vouched for.
  const checks = presentYears(project, rec, pp).map(({ year, age }) => ({ year, z: LIGHT_Z_FRACTION * sizeAt(size, age).heightM }))
  if (!checks.length) return []
  const solids = solidObjects(project)
  const crownR = needsClearance(rec.layer) ? size.matureWidthM / 2 : 0.01 // climbers: base just outside
  const { widthM, lengthM } = plotBounds(project.plot)
  const veggie = project.gardenType === 'veggie-beds'

  const candidates: { p: Point; d: number }[] = []
  const consider = (p: Point, minMove: number) => {
    const d = Math.hypot(p.x - pp.x, p.y - pp.y)
    if (d < minMove || d > SEARCH_RADIUS_M || !pointInPlot(project.plot, p) || !crownClear(solids, p, crownR)) return
    candidates.push({ p, d })
  }
  if (veggie) {
    // Veggie beds: only spots inside a bed, with the whole plant inside its edges.
    for (const p of bedSpots(project, size.matureWidthM / 2)) consider(p, size.matureWidthM / 2)
  } else {
    for (let x = 0.5; x < widthM; x++) for (let y = 0.5; y < lengthM; y++) consider({ x, y }, 0.5)
  }
  candidates.sort((a, b) => a.d - b.d)

  const gap = veggie ? size.matureWidthM : Math.max(MIN_SPOT_GAP_M, size.matureWidthM)
  const out: Point[] = []
  for (const { p } of candidates) {
    if (out.some((o) => Math.hypot(o.x - p.x, o.y - p.y) < gap)) continue
    if (wouldCrowd(project, library, { ...pp, x: p.x, y: p.y })) continue
    if (!checks.every(({ year, z }) => growingSeasonHours(project, library, p, z, year, pp.id) >= need)) continue
    out.push(p)
    if (out.length >= max) break
  }
  return out
}
