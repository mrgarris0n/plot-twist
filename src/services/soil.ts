import type { LatLon, Soil, SoilTexture } from '../model/project'
import { en } from '../strings/en'

export type AcidityWord = 'acidic' | 'slightly acidic' | 'neutral' | 'slightly alkaline' | 'alkaline'

export const ACIDITY_RANGES: Record<'acidic' | 'neutral' | 'alkaline', { phMin: number; phMax: number }> = {
  acidic: { phMin: 4.5, phMax: 6.0 },
  neutral: { phMin: 6.0, phMax: 7.5 },
  alkaline: { phMin: 7.5, phMax: 8.5 },
}

export function acidityWord(ph: number): AcidityWord {
  if (ph < 5.5) return 'acidic'
  if (ph < 6.5) return 'slightly acidic'
  if (ph <= 7.3) return 'neutral'
  if (ph <= 7.8) return 'slightly alkaline'
  return 'alkaline'
}

// USDA texture triangle, folded into the four gardener-facing classes.
export function textureClass(sandPct: number, siltPct: number, clayPct: number): SoilTexture {
  const total = sandPct + siltPct + clayPct
  const [sand, silt, clay] = total > 0 ? [sandPct, siltPct, clayPct].map((v) => (v / total) * 100) : [sandPct, siltPct, clayPct]
  if (silt + 1.5 * clay < 15) return 'sandy' // sand
  if (silt + 2 * clay < 30) return 'sandy' // loamy sand
  if (clay >= 40) return 'clay' // silty clay, clay
  if (clay >= 35 && sand > 45) return 'clay' // sandy clay
  if (clay >= 27) return sand <= 20 ? 'silty' : 'loamy' // silty clay loam, clay loam, sandy clay loam
  if (silt >= 50) return 'silty' // silt loam
  return 'loamy' // sandy loam, loam, sandy clay loam
}

export function roundCoord(v: number): number {
  return Number((Math.round(v / 0.0025) * 0.0025).toFixed(4))
}

type SoilResponse = { available: boolean; ph?: number; sandPct?: number; siltPct?: number; clayPct?: number }

export async function lookupSoil(loc: LatLon, signal?: AbortSignal): Promise<Soil | null> {
  try {
    const q = new URLSearchParams({ lat: String(roundCoord(loc.lat)), lon: String(roundCoord(loc.lon)) })
    const res = await fetch(`/api/soil?${q}`, { signal })
    if (!res.ok) return null
    const d = (await res.json()) as SoilResponse
    if (!d.available || d.ph === undefined || d.sandPct === undefined || d.siltPct === undefined || d.clayPct === undefined) return null
    return { source: 'lookup', phMin: d.ph, phMax: d.ph, texture: textureClass(d.sandPct, d.siltPct, d.clayPct), drainage: null }
  } catch {
    return null
  }
}

export function describeSoil(s: Soil): string {
  const texture = s.texture ? en.soil.textureWord[s.texture] : en.soil.unknown
  const acidity = s.phMin !== null && s.phMax !== null ? en.soil.acidityWord[acidityWord((s.phMin + s.phMax) / 2)] : en.soil.unknown
  return `${texture}, ${acidity}`
}
