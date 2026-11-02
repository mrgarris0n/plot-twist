import type { Project } from './project'

/** The five garden setup steps, in the order the setup menu lists them. */
export type SetupItem = 'location' | 'plot' | 'soil' | 'gardenType' | 'shadeObjects'
export const SETUP_ITEMS: SetupItem[] = ['location', 'plot', 'soil', 'gardenType', 'shadeObjects']

export function setupStatus(p: Project): Record<SetupItem, boolean> {
  return {
    location: p.location !== null,
    plot: p.plotConfirmed,
    soil: p.soil !== null,
    gardenType: p.gardenType !== null,
    shadeObjects: p.shadeObjectsConfirmed || p.shadeObjects.length > 0,
  }
}

/** Plants are added only once every setup step is done: the checks behind them need the site. */
export const setupComplete = (p: Project): boolean => Object.values(setupStatus(p)).every(Boolean)
