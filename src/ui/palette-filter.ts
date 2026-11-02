import { plantName, type Layer, type PlantRecord } from '../model/plants'
import { getLang } from '../strings/lang'
import type { Project } from '../model/project'
import { climateIssue } from '../engine/checks/climate'
import { waterIssue } from '../engine/checks/water'
import { soilIssue } from '../engine/checks/soil'
import { suitsRegion } from '../engine/region'

/** The layers a veggie-beds garden lists by default; trees and shrubs show only when asked for. */
export const VEGGIE_LAYERS: readonly Layer[] = ['herbaceous', 'ground-cover', 'root', 'climber']

/** Lower-case with accents removed, so "korte" finds "Körte". */
export const fold = (s: string): string => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()

export type PaletteQuery = { text: string; layer: Layer | null; fitsHere: { project: Project } | null; veggieOnly?: boolean }

/** Palette filter: text (any common or Latin name), layer, and `fitsHere` (no known soil, climate or region mismatch for the project), sorted by first common name. */
export function filterPlants(all: PlantRecord[], q: PaletteQuery): PlantRecord[] {
  const t = fold(q.text.trim())
  return all
    .filter((p) => q.layer === null || p.layer === q.layer)
    .filter((p) => !q.veggieOnly || VEGGIE_LAYERS.includes(p.layer))
    .filter((p) => !q.fitsHere || fitsHere(p, q.fitsHere.project))
    .filter((p) => !t || fold(p.latinName).includes(t) || [...p.commonNames, ...(p.commonNamesHu ?? [])].some((n) => fold(n).includes(t)))
    .sort((a, b) => plantName(a).localeCompare(plantName(b), getLang()))
}

export function fitsHere(rec: PlantRecord, project: Project): boolean {
  return soilIssue(rec, project.soil) === null && climateIssue(rec, project.climate, project.settings.units) === null && suitsRegion(rec, project.location)
}

/** Notes shown beside a plant in the list. Nothing is hidden: marks never affect `fitsHere`. */
export function paletteMarks(rec: PlantRecord, project: Project): 'water'[] {
  return waterIssue(rec, project.climate, project.settings.units) === null ? [] : ['water']
}
