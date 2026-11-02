import { companionReason, type CompanionPair } from '../../model/companions'
import { plantName, type PlantLibrary } from '../../model/plants'
import type { Project } from '../../model/project'
import { en } from '../../strings/en'
import { bedAt } from '../beds'
import { effectiveSize, sizeAt } from '../growth'
import { ageAt } from '../presence'
import type { Warning } from './types'

/** Two plants in one bed are neighbours when the space between their edges is at most this. */
export const NEIGHBOUR_GAP_M = 0.5
/** Float slack, so plants placed exactly NEIGHBOUR_GAP_M apart count as neighbours. */
const EPS = 1e-9

const pairKey = (a: string, b: string) => (a < b ? `${a}\n${b}` : `${b}\n${a}`)

/** Sourced good and bad pairings among plants sitting side by side in the same bed this year. */
export function companionWarnings(project: Project, library: PlantLibrary, pairs: CompanionPair[]): Warning[] {
  if (project.gardenType !== 'veggie-beds' || !pairs.length) return []
  const year = project.settings.year
  const byPlants = new Map(pairs.map((p) => [pairKey(p.a, p.b), p]))
  const items = project.plants.flatMap((pp) => {
    const rec = library.byId.get(pp.plantId)
    const bed = bedAt(project, pp)
    if (!rec || !bed) return []
    const age = ageAt(project, rec, pp, year)
    if (age < 0) return []
    return [{ pp, rec, bedId: bed.id, widthM: sizeAt(effectiveSize(pp, rec), age).widthM }]
  })
  const out: Warning[] = []
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const a = items[i]!
      const b = items[j]!
      if (a.bedId !== b.bedId) continue
      const pair = byPlants.get(pairKey(a.rec.id, b.rec.id))
      if (!pair) continue
      const gap = Math.hypot(a.pp.x - b.pp.x, a.pp.y - b.pp.y) - (a.widthM + b.widthM) / 2
      if (gap > NEIGHBOUR_GAP_M + EPS) continue
      const [first, second] = a.pp.id < b.pp.id ? [a, b] : [b, a]
      const names = [plantName(first.rec), plantName(second.rec)] as const
      out.push({
        key: `companion:${first.pp.id}:${second.pp.id}`, type: 'companion',
        severity: pair.effect === 'bad' ? 'warning' : 'hint',
        plantIds: [first.pp.id, second.pp.id], startYear: year,
        message: pair.effect === 'bad' ? en.warnings.companionBad(...names) : en.warnings.companionGood(...names),
        detail: en.details.warning.companion(companionReason(pair)),
        fix: null,
      })
    }
  }
  return out
}
