import type { PlantLibrary, PlantRecord } from '../model/plants'

/** Test-only plant record with deterministic sizes (4 m × 4 m, 6 years to maturity). */
export function fixturePlant(o: Partial<PlantRecord> = {}): PlantRecord {
  return {
    id: 'x', commonNames: ['Fixture'], latinName: 'Fixtura', family: null, layer: 'canopy', sunNeed: 'full',
    leafHabit: 'deciduous', canopyDensity: 'dense',
    variants: [{ id: 'a', label: 'A', matureHeightM: 4, matureWidthM: 4, yearsToMaturity: 6, minSpacingM: null }],
    phMin: null, phMax: null, textures: null, drainage: null, minWinterC: -20, roles: null, edibleParts: null,
    calendar: [], firstHarvestYears: null, companions: null, pfafUrl: null, sources: [], fieldSources: {},
    ...o,
  }
}

export function fixtureLibrary(...recs: PlantRecord[]): PlantLibrary {
  return { byId: new Map(recs.map((r) => [r.id, r])), all: recs }
}
