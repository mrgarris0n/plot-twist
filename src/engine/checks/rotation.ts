import type { PlantLibrary } from '../../model/plants'
import type { Project } from '../../model/project'
import { en } from '../../strings/en'
import { bedName } from '../beds'
import { annualsByBed, inCycle, ROTATION_CYCLE, ROTATION_GAP_YEARS } from '../rotation'
import type { Warning } from './types'

/** A cycle group that returns to a bed within ROTATION_GAP_YEARS of growing there. Needs the full project, since earlier years' plants are history. */
export function rotationWarnings(project: Project, library: PlantLibrary): Warning[] {
  if (project.gardenType !== 'veggie-beds') return []
  const year = project.settings.year
  const groupsByBed = (y: number) => {
    const m = new Map<string, { name: string; groups: Map<string, string[]> }>()
    for (const { pp, bed } of annualsByBed(project, library, y)) {
      const g = library.byId.get(pp.plantId)?.rotationGroup
      if (!bed || !inCycle(g)) continue
      const e = m.get(bed.id) ?? { name: bedName(bed) ?? en.rotation.thisBed, groups: new Map() }
      e.groups.set(g, [...(e.groups.get(g) ?? []), pp.id])
      m.set(bed.id, e)
    }
    return m
  }
  const now = groupsByBed(year)
  const past = [] as { y: number; beds: ReturnType<typeof groupsByBed> }[]
  for (let y = year - 1; y >= Math.max(0, year - ROTATION_GAP_YEARS); y--) past.push({ y, beds: groupsByBed(y) })
  const out: Warning[] = []
  for (const [bedId, { name, groups }] of now) {
    for (const group of ROTATION_CYCLE) {
      const ids = groups.get(group)
      const last = past.find((p) => p.beds.get(bedId)?.groups.has(group))
      if (!ids || !last) continue
      const ago = year - last.y
      out.push({
        key: `rotation:${bedId}:${group}`, type: 'rotation', severity: 'warning', plantIds: ids, startYear: year,
        message: en.warnings.rotation(group, name, ago, ROTATION_GAP_YEARS),
        detail: en.details.warning.rotation(en.rotation.reason(group, last.y, ROTATION_GAP_YEARS)),
        fix: null,
      })
    }
  }
  return out
}
