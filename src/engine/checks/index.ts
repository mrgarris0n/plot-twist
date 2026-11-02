import type { PlantLibrary } from '../../model/plants'
import type { Project } from '../../model/project'
import { balanceHints } from './balance'
import { setupWarnings } from './setup'
import { companions } from '../../data/companions'
import { climateWarnings } from './climate'
import { companionWarnings } from './companions'
import { crowdingWarnings } from './crowding'
import { lightWarnings } from './light'
import { suggestSpots } from '../suggest'
import { layoutOf } from '../presence'
import { rotationWarnings } from './rotation'
import { soilWarnings } from './soil'
import { waterWarnings } from './water'
import type { Warning, WarningType } from './types'

export type { Warning } from './types'
export { LIGHT_NEED_HOURS } from './types'
export { lightWarnings } from './light'
export { crowdingWarnings, crownOverlapFraction, similarHeight } from './crowding'
export { soilIssue, soilWarnings } from './soil'
export { climateIssue, climateWarnings, grownAsAnnual } from './climate'
export { waterIssue, waterWarnings, WARM_RAIN_NEED_MM } from './water'
export { rotationWarnings } from './rotation'
export { companionWarnings, NEIGHBOUR_GAP_M } from './companions'
export { realSunHours } from './cloud'
export { balanceHints } from './balance'

const TYPE_ORDER: WarningType[] = ['setup', 'light', 'crowding', 'soil', 'climate', 'water', 'rotation', 'companion', 'balance']

/** Every current warning and hint, minus dismissed keys, ordered by type then key. */
export function analyze(full: Project, library: PlantLibrary): Warning[] {
  const project = layoutOf(full, library)
  const dismissed = new Set(project.dismissedWarnings)
  const light = lightWarnings(project, library)
    .filter((w) => !dismissed.has(w.key))
    .map((w): Warning => {
      const spots = suggestSpots(project, library, w.plantIds[0]!)
      return spots.length ? { ...w, fix: { kind: 'move', spots } } : w
    })
  return [
    ...setupWarnings(full),
    ...light,
    ...crowdingWarnings(project, library),
    ...soilWarnings(project, library),
    ...climateWarnings(project, library),
    ...waterWarnings(project, library),
    ...rotationWarnings(full, library),
    ...companionWarnings(project, library, companions),
    ...balanceHints(project, library),
  ]
    .filter((w) => !dismissed.has(w.key))
    .sort((a, b) => TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type) || (a.key < b.key ? -1 : a.key > b.key ? 1 : 0))
}
