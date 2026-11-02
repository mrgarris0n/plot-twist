import type { PlantLibrary, PlantRecord } from '../../model/plants'
import type { Project } from '../../model/project'
import { en } from '../../strings/en'
import type { Warning } from './types'

const hint = (key: Warning['key'], message: string, detail: string): Warning =>
  ({ key, type: 'balance', severity: 'hint', plantIds: [], startYear: null, message, detail, fix: null })

/** Gentle layer-balance hints; only once the plan has ≥ 3 plants including a tree. */
export function balanceHints(project: Project, library: PlantLibrary): Warning[] {
  const recs = project.plants.map((pp) => library.byId.get(pp.plantId)).filter((r): r is PlantRecord => r !== undefined)
  if (recs.length < 3 || !recs.some((r) => r.layer === 'canopy' || r.layer === 'sub-canopy')) return []
  const out: Warning[] = []
  if (!recs.some((r) => r.roles?.includes('nitrogen-fixer'))) out.push(hint('balance:nitrogen', en.warnings.balanceNitrogen, en.details.warning.nitrogen))
  if (!recs.some((r) => r.layer === 'ground-cover')) out.push(hint('balance:groundcover', en.warnings.balanceGroundcover, en.details.warning.groundcover))
  return out
}
