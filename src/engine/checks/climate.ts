import { plantName, type PlantLibrary, type PlantRecord } from '../../model/plants'
import type { Climate, Project, Units } from '../../model/project'
import { formatTemp } from '../../model/units'
import { en } from '../../strings/en'
import type { Warning } from './types'

/** Plain message when winters here are colder than the plant survives; null when fine or unknown.
 *  Annuals are sown again each year, so winter cold doesn't count against them. */
export function climateIssue(rec: PlantRecord, climate: Climate | null, units: Units): string | null {
  if (rec.annual || !climate || climate.minWinterC === null) return null
  if (climate.minWinterC >= rec.minWinterC) return null
  return en.warnings.climateCold(plantName(rec), formatTemp(climate.minWinterC, units))
}

export function climateWarnings(project: Project, library: PlantLibrary): Warning[] {
  const units = project.settings.units
  const out: Warning[] = []
  for (const pp of project.plants) {
    const rec = library.byId.get(pp.plantId)
    if (!rec) continue
    const message = climateIssue(rec, project.climate, units)
    if (!message) continue
    out.push({
      key: `climate:${pp.id}`,
      type: 'climate',
      severity: 'warning',
      plantIds: [pp.id],
      startYear: 0,
      message,
      detail: en.details.warning.climate(formatTemp(rec.minWinterC, units), formatTemp(project.climate!.minWinterC!, units)),
      fix: null,
    })
  }
  return out
}

/** An annual in a garden with winter frost: frost ends it, so it is planted again each year. False when the climate is unknown. */
export function grownAsAnnual(rec: PlantRecord, climate: Climate | null): boolean {
  return rec.annual === true && climate !== null && !climate.frostFree
}
