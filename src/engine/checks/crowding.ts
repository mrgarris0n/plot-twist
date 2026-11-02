import { plantName, type Layer, type PlantLibrary, type PlantRecord } from '../../model/plants'
import type { PlacedPlant, Project } from '../../model/project'
import { formatLength } from '../../model/units'
import { en } from '../../strings/en'
import { effectiveSize, sizeAt, type EffectiveSize } from '../growth'
import { ageAt, yearsToCheck } from '../presence'
import type { Warning } from './types'

export const CROWD_HEIGHT_SIMILARITY = 0.3
export const CROWD_OVERLAP_FRACTION = 0.25
const TREES: Layer[] = ['canopy', 'sub-canopy']

export function similarHeight(h1: number, h2: number): boolean {
  return Math.abs(h1 - h2) <= CROWD_HEIGHT_SIMILARITY * Math.max(h1, h2)
}

/** Share of the smaller crown's width covered by the other crown, in [0, 1]; 0 when either crown has no width. */
export function crownOverlapFraction(d: number, w1: number, w2: number): number {
  const smaller = Math.min(w1, w2)
  if (smaller <= 0) return 0
  return Math.min(1, Math.max(0, (w1 / 2 + w2 / 2 - d) / smaller))
}

type Entry = { pp: PlacedPlant; rec: PlantRecord; size: EffectiveSize }

function pairWarning(project: Project, a: Entry, b: Entry): Warning | null {
  const units = project.settings.units
  const d = Math.hypot(a.pp.x - b.pp.x, a.pp.y - b.pp.y)
  const nameA = plantName(a.rec)
  const nameB = plantName(b.rec)
  const base = { key: `crowding:${a.pp.id}:${b.pp.id}`, type: 'crowding' as const, severity: 'warning' as const, plantIds: [a.pp.id, b.pp.id], fix: null }

  // (c) two trees closer trunk-to-trunk than the larger known minimum spacing
  const spacings = [a.size.minSpacingM, b.size.minSpacingM].filter((s): s is number => s !== null)
  if (TREES.includes(a.rec.layer) && TREES.includes(b.rec.layer) && spacings.length > 0) {
    const minSpacing = Math.max(...spacings)
    if (d < minSpacing) {
      const dist = formatLength(minSpacing, units)
      return { ...base, startYear: 0, message: en.warnings.crowdingTrees(nameA, nameB, dist), detail: en.details.warning.spacing(formatLength(d, units), dist) }
    }
  }

  // (a) same layer or (b) similar mature height, with crowns overlapping too much
  const sameLayer = a.rec.layer === b.rec.layer
  if (!sameLayer && !similarHeight(a.size.matureHeightM, b.size.matureHeightM)) return null
  const years = [...new Set([...yearsToCheck(project, a.rec, a.pp), ...yearsToCheck(project, b.rec, b.pp)])].sort((x, y) => x - y)
  for (const year of years) {
    const wa = sizeAt(a.size, ageAt(project, a.rec, a.pp, year)).widthM
    const wb = sizeAt(b.size, ageAt(project, b.rec, b.pp, year)).widthM
    const overlap = crownOverlapFraction(d, wa, wb)
    if (overlap <= CROWD_OVERLAP_FRACTION) continue
    const ma = a.size.matureWidthM
    const mb = b.size.matureWidthM
    const leave = ma / 2 + mb / 2 - CROWD_OVERLAP_FRACTION * Math.min(ma, mb)
    return {
      ...base,
      startYear: year,
      message: en.warnings.crowding(nameA, nameB, year, formatLength(leave, units)),
      detail: en.details.warning.crowding(Math.round(overlap * 100), year, sameLayer, CROWD_OVERLAP_FRACTION * 100),
    }
  }
  return null
}

/** Pairs of plants that crowd each other (spec §4 rules a, b, c); one warning per pair. */
export function crowdingWarnings(project: Project, library: PlantLibrary): Warning[] {
  const entries: Entry[] = []
  for (const pp of project.plants) {
    const rec = library.byId.get(pp.plantId)
    if (rec) entries.push({ pp, rec, size: effectiveSize(pp, rec) })
  }
  entries.sort((x, y) => (x.pp.id < y.pp.id ? -1 : x.pp.id > y.pp.id ? 1 : 0))
  const out: Warning[] = []
  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const w = pairWarning(project, entries[i]!, entries[j]!)
      if (w) out.push(w)
    }
  }
  return out
}

/** True when `moved` (a plant at a hypothetical position) would crowd any other plant in the project. */
export function wouldCrowd(project: Project, library: PlantLibrary, moved: PlacedPlant): boolean {
  const rec = library.byId.get(moved.plantId)
  if (!rec) return false
  const me: Entry = { pp: moved, rec, size: effectiveSize(moved, rec) }
  for (const pp of project.plants) {
    if (pp.id === moved.id) continue
    const other = library.byId.get(pp.plantId)
    if (other && pairWarning(project, me, { pp, rec: other, size: effectiveSize(pp, other) })) return true
  }
  return false
}
