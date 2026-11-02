import type { SunNeed } from '../../model/plants'
import type { Point } from '../../model/project'

export type WarningType = 'light' | 'crowding' | 'soil' | 'climate' | 'water' | 'rotation' | 'companion' | 'balance' | 'setup'

export type Warning = {
  key: string // `${type}:${plantId}` or `crowding:${idA}:${idB}` (ids sorted); soil: `soil:${plantId}:acidity|texture|drainage`; water: `water:${plantId}`; rotation: `rotation:${bedId}:${group}`; companion: `companion:${idA}:${idB}` (placed-plant ids sorted); balance: `balance:nitrogen` | `balance:groundcover`; setup: `setup:incomplete`
  type: WarningType
  severity: 'warning' | 'hint'
  plantIds: string[]
  startYear: number | null // first YEAR_SAMPLES year the problem holds
  message: string // plain words, from en.warnings
  detail: string // may use technical terms; shown under Details
  fix: { kind: 'move'; spots: Point[] } | null // filled by Task 14
}

/** Minimum growing-season direct-sun hours per sun need. */
export const LIGHT_NEED_HOURS: Record<SunNeed, number> = { full: 6, part: 3, shade: 0 }
