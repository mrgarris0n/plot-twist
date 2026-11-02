import { SETUP_ITEMS, setupStatus } from '../../model/setup'
import type { Project } from '../../model/project'
import { en } from '../../strings/en'
import type { Warning } from './types'

/** One warning while setup is unfinished: plants can't be added until then. Details name the steps left. */
export function setupWarnings(project: Project): Warning[] {
  const status = setupStatus(project)
  const missing = SETUP_ITEMS.filter((i) => !status[i])
  if (!missing.length) return []
  const steps = missing.map((i) => en.setup[i]).join(', ')
  return [{ key: 'setup:incomplete', type: 'setup', severity: 'warning', plantIds: [], startYear: null, message: en.warnings.setupIncomplete, detail: en.details.warning.setupMissing(steps), fix: null }]
}
