import type { Climate } from '../../model/project'

/** Rough rule: clear-sky hours reduced by warm-half-year cloud cover. Null when cloud cover is unknown. */
export function realSunHours(clearSkyHours: number, climate: Climate | null): number | null {
  const pct = climate?.cloudWarmPct
  if (pct === null || pct === undefined) return null
  return clearSkyHours * (1 - pct / 100)
}
