import { z } from 'zod'
import type { Drainage, SoilTexture } from './project.ts'
import { getLang } from '../strings/lang.ts'

export type Layer = 'canopy' | 'sub-canopy' | 'shrub' | 'herbaceous' | 'ground-cover' | 'root' | 'climber'
export type SunNeed = 'full' | 'part' | 'shade'
export type Role = 'nitrogen-fixer' | 'pollinator' | 'pest-repellent' | 'dynamic-accumulator'
export type SubSeason =
  | 'early-spring' | 'mid-spring' | 'late-spring'
  | 'early-summer' | 'mid-summer' | 'late-summer'
  | 'early-autumn' | 'mid-autumn' | 'late-autumn'
  | 'early-winter' | 'mid-winter' | 'late-winter'
export type CalendarTask = 'plant' | 'prune' | 'harvest'
/** Northern-hemisphere rules; hemisphere conversion happens in code. */
export type CalendarRule =
  | { task: CalendarTask; from: SubSeason; to: SubSeason }
  | { task: CalendarTask; frost: 'last' | 'first'; offsetWeeks: number }
export type SizeVariant = {
  id: string
  label: string
  /** Hungarian wording of `label`. Translated, so it needs no source. */
  labelHu?: string
  matureHeightM: number
  matureWidthM: number
  yearsToMaturity: number | null
  minSpacingM: number | null
}
/** Continents for where a plant comes from and where a source documents it as a garden plant. Central America and the Caribbean count as north-america. */
export type Region = 'europe' | 'asia' | 'africa' | 'north-america' | 'south-america' | 'oceania'
export type Source = { id: string; title: string; url: string; licence: string }
export type CompanionType = 'pest-repellency' | 'nutrient-sharing' | 'structural-support' | 'shade-provision' | 'allelopathy'
export type Companion = { plantId: string; score: number; type: CompanionType }
export type WaterLevel = 'low' | 'medium' | 'high'

/** Rotation cycle order (RHS): legumes -> brassicas -> potatoes (with tomatoes) -> roots (onions and roots). `any` fits anywhere. */
export type RotationGroup = 'potatoes' | 'legumes' | 'brassicas' | 'roots' | 'any'
export type PlantRecord = {
  id: string
  commonNames: string[]
  /** Hungarian common names, as a cited source gives them; the first is the display name. Absent or null: show the English name. */
  commonNamesHu?: string[] | null
  latinName: string
  family: string | null
  layer: Layer
  sunNeed: SunNeed
  leafHabit: 'deciduous' | 'evergreen' | null
  canopyDensity: 'dense' | 'light' | null
  variants: SizeVariant[] // >= 1; variants[0] is the default
  phMin: number | null
  phMax: number | null
  textures: SoilTexture[] | null
  drainage: Drainage[] | null
  minWinterC: number // required
  roles: Role[] | null
  edibleParts: string[] | null
  calendar: CalendarRule[] // >= 1
  firstHarvestYears: number | null
  companions: Companion[] | null
  pfafUrl: string | null
  /** Native range by continent, as a cited source states it. Absent or null: not known. */
  origin?: Region[] | null
  /** Continents where a cited source documents it as a garden or crop plant (e.g. an RHS profile → europe). */
  grownIn?: Region[] | null
  /** True when a cited source lists its life cycle as annual: it is sown or planted again each year where winter ends it. */
  annual?: boolean | null
  /** Water need as a cited source states it: a yearly-rain minimum in mm, or a coarse level. Absent or null: not known. */
  water?: { minRainMm: number } | { level: WaterLevel } | null
  /** Crop-rotation family as a cited source states it. Absent or null: not known, so no rotation check. */
  rotationGroup?: RotationGroup | null
  sources: Source[]
  /** Source ids per field. Keys: top-level field names, plus `variants.<variantId>` covering all fields of that variant. */
  fieldSources: Partial<Record<keyof PlantRecord | `variants.${string}`, string[]>>
}
/** The named variant, or the default (first) variant when `variantId` is null or unknown. */
export function variantOf(rec: PlantRecord, variantId: string | null): SizeVariant {
  return rec.variants.find((v) => v.id === variantId) ?? rec.variants[0]!
}
/** Display name: the first common name; in Hungarian the first Hungarian name when the record has one. */
export function plantName(rec: PlantRecord): string {
  if (getLang() === 'hu') return rec.commonNamesHu?.[0] ?? rec.commonNames[0]!
  return rec.commonNames[0]!
}
/** A size variant's label in the active language (English when it has no Hungarian one). */
export function variantLabel(v: SizeVariant): string {
  return getLang() === 'hu' ? v.labelHu ?? v.label : v.label
}
export type PlantLibrary = { byId: Map<string, PlantRecord>; all: PlantRecord[] }

// z.number() already rejects NaN and ±Infinity (zod 4).
const num = z.number()
const nullNum = num.nullable()
const positive = num.gt(0)
const webUrl = z.url({ protocol: /^https?$/ })
const subSeason = z.enum([
  'early-spring', 'mid-spring', 'late-spring',
  'early-summer', 'mid-summer', 'late-summer',
  'early-autumn', 'mid-autumn', 'late-autumn',
  'early-winter', 'mid-winter', 'late-winter',
])
const task = z.enum(['plant', 'prune', 'harvest'])
const region = z.enum(['europe', 'asia', 'africa', 'north-america', 'south-america', 'oceania'])

export const sourceSchema = z.object({ id: z.string(), title: z.string(), url: webUrl, licence: z.string().min(1) }).strict()

export const plantRecordSchema = z.object({
  id: z.string().min(1),
  commonNames: z.array(z.string().min(1)).min(1),
  commonNamesHu: z.array(z.string().min(1)).min(1).nullable().optional(),
  latinName: z.string().min(1),
  family: z.string().nullable(),
  layer: z.enum(['canopy', 'sub-canopy', 'shrub', 'herbaceous', 'ground-cover', 'root', 'climber']),
  sunNeed: z.enum(['full', 'part', 'shade']),
  leafHabit: z.enum(['deciduous', 'evergreen']).nullable(),
  canopyDensity: z.enum(['dense', 'light']).nullable(),
  variants: z
    .array(
      z.object({
        id: z.string().min(1),
        label: z.string().min(1),
        labelHu: z.string().min(1).optional(),
        matureHeightM: positive,
        matureWidthM: positive,
        yearsToMaturity: num.min(0).nullable(), // 0: full size in the first season (annuals)
        minSpacingM: positive.nullable(),
      }).strict(),
    )
    .min(1),
  phMin: nullNum,
  phMax: nullNum,
  textures: z.array(z.enum(['sandy', 'loamy', 'clay', 'silty'])).nullable(),
  drainage: z.array(z.enum(['fast', 'normal', 'wet'])).nullable(),
  minWinterC: num,
  roles: z.array(z.enum(['nitrogen-fixer', 'pollinator', 'pest-repellent', 'dynamic-accumulator'])).nullable(),
  edibleParts: z.array(z.string()).nullable(),
  calendar: z
    .array(
      z.union([
        z.object({ task, from: subSeason, to: subSeason }).strict(),
        z.object({ task, frost: z.enum(['last', 'first']), offsetWeeks: num }).strict(),
      ]),
    )
    .min(1),
  firstHarvestYears: num.min(0).nullable(),
  companions: z
    .array(
      z.object({
        plantId: z.string(),
        score: num.min(-1).max(1),
        type: z.enum(['pest-repellency', 'nutrient-sharing', 'structural-support', 'shade-provision', 'allelopathy']),
      }).strict(),
    )
    .nullable(),
  pfafUrl: webUrl.nullable(),
  origin: z.array(region).min(1).nullable().optional(),
  grownIn: z.array(region).min(1).nullable().optional(),
  annual: z.boolean().nullable().optional(),
  water: z
    .union([
      z.object({ minRainMm: num.gt(0).max(5000) }).strict(),
      z.object({ level: z.enum(['low', 'medium', 'high']) }).strict(),
    ])
    .nullable()
    .optional(),
  rotationGroup: z.enum(['potatoes', 'legumes', 'brassicas', 'roots', 'any']).nullable().optional(),
  sources: z.array(sourceSchema),
  fieldSources: z.record(z.string(), z.array(z.string())),
}).strict() satisfies z.ZodType<PlantRecord>

/** Top-level fields exempt from the "needs a source" rule (`variants` is covered per variant). */
const UNSOURCED_FIELDS = new Set(['id', 'sources', 'fieldSources', 'pfafUrl', 'variants'])

function isPresent(value: unknown): boolean {
  return value !== null && value !== undefined
}

function checkRecord(rec: PlantRecord, errors: string[]): void {
  const sourceIds = new Set<string>()
  for (const s of rec.sources) {
    if (sourceIds.has(s.id)) errors.push(`${rec.id}: duplicate source id "${s.id}"`)
    sourceIds.add(s.id)
  }
  const variantIds = new Set<string>()
  for (const v of rec.variants) {
    if (variantIds.has(v.id)) errors.push(`${rec.id}: duplicate variant id "${v.id}"`)
    variantIds.add(v.id)
  }
  if (rec.phMin !== null && rec.phMax !== null && rec.phMin > rec.phMax) {
    errors.push(`${rec.id}: phMin (${rec.phMin}) is greater than phMax (${rec.phMax})`)
  }
  for (const [key, ids] of Object.entries(rec.fieldSources)) {
    const known = key in rec || (key.startsWith('variants.') && variantIds.has(key.slice('variants.'.length)))
    if (!known || key === 'variants') errors.push(`${rec.id}: fieldSources has unknown key "${key}"`)
    for (const id of ids ?? []) {
      if (!sourceIds.has(id)) errors.push(`${rec.id}: fieldSources.${key} refers to unknown source "${id}"`)
    }
  }
  for (const [field, value] of Object.entries(rec)) {
    if (UNSOURCED_FIELDS.has(field) || !isPresent(value)) continue
    const ids = (rec.fieldSources as Record<string, string[] | undefined>)[field]
    if (!ids || ids.length === 0) errors.push(`${rec.id}: ${field} has no source`)
  }
  for (const v of rec.variants) {
    const ids = (rec.fieldSources as Record<string, string[] | undefined>)[`variants.${v.id}`]
    if (!ids || ids.length === 0) errors.push(`${rec.id}: variants.${v.id} has no source`)
  }
}

export function validateLibrary(
  records: unknown[],
): { ok: true; library: PlantLibrary } | { ok: false; errors: string[] } {
  const errors: string[] = []
  const parsed: PlantRecord[] = []
  records.forEach((raw, i) => {
    const rawId = (raw as { id?: unknown } | null)?.id
    const label = typeof rawId === 'string' && rawId ? rawId : `record[${i}]`
    const result = plantRecordSchema.safeParse(raw)
    if (!result.success) {
      for (const issue of result.error.issues) {
        errors.push(`${label}: ${issue.path.length ? issue.path.join('.') : '(record)'} ${issue.message}`)
      }
      return
    }
    parsed.push(result.data)
  })

  const byId = new Map<string, PlantRecord>()
  for (const rec of parsed) {
    if (byId.has(rec.id)) errors.push(`${rec.id}: duplicate plant id`)
    else byId.set(rec.id, rec)
  }
  for (const rec of parsed) {
    checkRecord(rec, errors)
    for (const c of rec.companions ?? []) {
      if (!byId.has(c.plantId)) errors.push(`${rec.id}: companion plantId "${c.plantId}" is not in the library`)
    }
  }
  if (errors.length > 0) return { ok: false, errors }
  return { ok: true, library: { byId, all: parsed } }
}
