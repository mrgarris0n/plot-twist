import { plantName, type PlantLibrary, type PlantRecord } from '../../model/plants'
import type { Project, Soil } from '../../model/project'
import { en } from '../../strings/en'
import type { Warning } from './types'

type SoilCheck = 'acidity' | 'texture' | 'drainage'
type AcidityClass = 'acidic' | 'neutral' | 'alkaline'

/** Plain acidity class of a pH value: acidic below 6.0, alkaline above 7.5, else neutral. */
function acidityClass(ph: number): AcidityClass {
  if (ph < 6.0) return 'acidic'
  if (ph > 7.5) return 'alkaline'
  return 'neutral'
}

/** Every soil mismatch between plant and site; sub-checks with unknown data on either side are skipped. */
function soilIssues(rec: PlantRecord, soil: Soil | null): { check: SoilCheck; message: string; detail: string }[] {
  if (!soil) return []
  const name = plantName(rec)
  const out: { check: SoilCheck; message: string; detail: string }[] = []
  if (rec.phMin !== null && rec.phMax !== null && soil.phMin !== null && soil.phMax !== null) {
    const overlaps = rec.phMin <= soil.phMax && soil.phMin <= rec.phMax
    if (!overlaps) {
      const needs = acidityClass((rec.phMin + rec.phMax) / 2)
      const yours = acidityClass((soil.phMin + soil.phMax) / 2)
      out.push({
        check: 'acidity',
        message: needs !== yours ? en.warnings.soilAcidity(name, needs, yours) : en.warnings.soilAcidityCloser(name, rec.phMax < soil.phMin ? 'more' : 'less'),
        detail: en.details.warning.acidity(rec.phMin, rec.phMax, soil.phMin, soil.phMax),
      })
    }
  }
  if (rec.textures !== null && soil.texture !== null && !rec.textures.includes(soil.texture)) {
    out.push({ check: 'texture', message: en.warnings.soilTexture(name, soil.texture), detail: en.details.warning.texture(rec.textures.map((t) => en.soil.textureWord[t]).join(', '), en.soil.textureWord[soil.texture]) })
  }
  if (rec.drainage !== null && soil.drainage !== null && !rec.drainage.includes(soil.drainage)) {
    out.push({ check: 'drainage', message: en.warnings.soilDrainage(name, soil.drainage), detail: en.details.warning.drainage(rec.drainage.map((d) => en.soil.drainageWord[d]).join(', '), en.soil.drainageWord[soil.drainage]) })
  }
  return out
}

/** First soil problem for this plant in plain words, or null (also when unknown either side). */
export function soilIssue(rec: PlantRecord, soil: Soil | null): string | null {
  return soilIssues(rec, soil)[0]?.message ?? null
}

export function soilWarnings(project: Project, library: PlantLibrary): Warning[] {
  const out: Warning[] = []
  for (const pp of project.plants) {
    const rec = library.byId.get(pp.plantId)
    if (!rec) continue
    for (const issue of soilIssues(rec, project.soil)) {
      out.push({ key: `soil:${pp.id}:${issue.check}`, type: 'soil', severity: 'warning', plantIds: [pp.id], startYear: 0, message: issue.message, detail: issue.detail, fix: null })
    }
  }
  return out
}
