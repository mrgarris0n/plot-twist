import { variantOf, type Layer, type PlantRecord } from '../model/plants'
import type { PlacedPlant } from '../model/project'

export const INITIAL_FRACTION = 0.1
export const YEAR_SAMPLES = [0, 1, 2, 3, 5, 7, 10, 15, 20] as const
/** Plants shorter than this cast no meaningful shade and are left out of the scene. */
export const MIN_SHADING_HEIGHT_M = 0.5

/**
 * Modelling assumption (not plant data): typical years to reach ~95 % of mature size, by layer,
 * used when a plant has no sourced growth speed. Analogous to CANOPY_TRANSMISSION.unknown.
 */
export const TYPICAL_YEARS_TO_MATURITY: Record<Layer, number> = {
  canopy: 20,
  'sub-canopy': 10,
  shrub: 4,
  herbaceous: 2,
  'ground-cover': 2,
  root: 1,
  climber: 5,
}

/** `growthKnown` is false when yearsToMaturity is the layer's typical value rather than sourced data. */
export type EffectiveSize = { matureHeightM: number; matureWidthM: number; yearsToMaturity: number; growthKnown: boolean; minSpacingM: number | null }

/** Mature size of a placed plant: its chosen (else default) variant, with the plant's own overrides winning. */
export function effectiveSize(pp: PlacedPlant, rec: PlantRecord): EffectiveSize {
  const v = variantOf(rec, pp.variantId)
  return {
    matureHeightM: pp.heightOverrideM ?? v.matureHeightM,
    matureWidthM: pp.widthOverrideM ?? v.matureWidthM,
    yearsToMaturity: v.yearsToMaturity ?? TYPICAL_YEARS_TO_MATURITY[rec.layer],
    growthKnown: v.yearsToMaturity !== null,
    minSpacingM: v.minSpacingM,
  }
}

/**
 * Size `age` years after planting (age = year − plantedYear). Not yet planted (age < 0) → 0 × 0.
 * Growth is exponential toward mature size, reaching 95 % at yearsToMaturity.
 */
export function sizeAt(s: EffectiveSize, age: number): { heightM: number; widthM: number } {
  if (age < 0) return { heightM: 0, widthM: 0 }
  const ytm = s.yearsToMaturity
  if (ytm <= 0) return { heightM: s.matureHeightM, widthM: s.matureWidthM }
  const k = Math.log(18) / ytm
  const f = 1 - (1 - INITIAL_FRACTION) * Math.exp(-k * age)
  return { heightM: s.matureHeightM * f, widthM: s.matureWidthM * f }
}
