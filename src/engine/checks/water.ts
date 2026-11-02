import { plantName, type PlantLibrary, type PlantRecord, type WaterLevel } from '../../model/plants'
import type { Climate, Project, Units } from '../../model/project'
import { formatRain } from '../../model/units'
import { en } from '../../strings/en'
import type { Warning } from './types'

/** Warm-half-year rain (mm) below which a plant of this water level is short of water; null = never. */
export const WARM_RAIN_NEED_MM: Record<WaterLevel, number | null> = { high: 450, medium: 250, low: null }

/** Need and site rain, with a decimal when whole numbers would read the same. */
function rainPair(needMm: number, siteMm: number, units: Units): [string, string] {
  const need = formatRain(needMm, units)
  const site = formatRain(siteMm, units)
  return need === site ? [formatRain(needMm, units, true), formatRain(siteMm, units, true)] : [need, site]
}

function waterCheck(rec: PlantRecord, climate: Climate | null, units: Units): { message: string; detail: string } | null {
  const water = rec.water
  if (!water || !climate) return null
  const name = plantName(rec)
  const message = en.warnings.waterShort(name)
  if ('minRainMm' in water) {
    const site = climate.rainYearMm
    if (site === null || site === undefined || site >= water.minRainMm) return null
    return { message, detail: en.details.warning.waterNumber(...rainPair(water.minRainMm, site, units)) }
  }
  const need = WARM_RAIN_NEED_MM[water.level]
  const site = climate.rainWarmMm
  if (need === null || site === null || site === undefined || site >= need) return null
  return { message, detail: en.details.warning.waterLevel(en.details.waterLevel[water.level].toLowerCase(), ...rainPair(need, site, units)) }
}

/** Plain message when the plant needs more rain than falls here; null when fine or unknown. */
export function waterIssue(rec: PlantRecord, climate: Climate | null, units: Units): string | null {
  return waterCheck(rec, climate, units)?.message ?? null
}

export function waterWarnings(project: Project, library: PlantLibrary): Warning[] {
  const out: Warning[] = []
  for (const pp of project.plants) {
    const rec = library.byId.get(pp.plantId)
    if (!rec) continue
    const c = waterCheck(rec, project.climate, project.settings.units)
    if (!c) continue
    out.push({ key: `water:${pp.id}`, type: 'water', severity: 'warning', plantIds: [pp.id], startYear: 0, message: c.message, detail: c.detail, fix: null })
  }
  return out
}
