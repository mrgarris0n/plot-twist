import { z } from 'zod'

export type Units = 'metric' | 'imperial'
export type Season = 'spring' | 'midsummer' | 'autumn' | 'midwinter'
export type LatLon = { lat: number; lon: number }
export type Point = { x: number; y: number } // metres, plot frame: x right, y down (screen), origin top-left of plot bbox
export type PlotShape =
  | { kind: 'rect'; widthM: number; lengthM: number }
  | { kind: 'polygon'; points: Point[] }
export type SoilTexture = 'sandy' | 'loamy' | 'clay' | 'silty'
export type Drainage = 'fast' | 'normal' | 'wet'
export type Soil = { source: 'lookup' | 'manual' | 'test'; phMin: number | null; phMax: number | null; texture: SoilTexture | null; drainage: Drainage | null }
export type Climate = { source: 'lookup' | 'manual'; minWinterC: number | null; lastFrostDoy: number | null; firstFrostDoy: number | null; frostFree: boolean; rainYearMm?: number | null; rainWarmMm?: number | null; cloudWarmPct?: number | null }
export type ShadeKind = 'house' | 'shed' | 'wall' | 'fence' | 'hedge' | 'tree' | 'bed'
/**
 * x,y = centre; for 'tree' widthM = crown diameter. widthM runs along the object's local x axis and lengthM along its local y.
 * rotationDeg turns the local x axis to (cos θ, sin θ) in plot coordinates; with y pointing down that is clockwise on
 * screen, the same as a Konva node's rotation.
 */
export type ShadeObject = { id: string; kind: ShadeKind; x: number; y: number; widthM: number; lengthM: number; rotationDeg: number; heightM: number; canopy: 'dense' | 'light' | null; leafOff?: boolean; name?: string; perennial?: boolean }
export type PlacedPlant = { id: string; plantId: string; variantId: string | null; x: number; y: number; plantedYear: number; heightOverrideM: number | null; widthOverrideM: number | null }
export type Steepness = 'flat' | 'gentle' | 'moderate' | 'strong' | 'veryStrong'
export type Facing = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW'
export type Slope = { steepness: Steepness; facing: Facing | null } // facing = compass direction the ground faces going downhill; null only when flat
export type Project = {
  schemaVersion: 1; id: string; name: string; createdAt: string; updatedAt: string
  location: LatLon | null; plot: PlotShape; plotConfirmed: boolean; northDeg: number // clockwise angle of north from screen-up
  soil: Soil | null; climate: Climate | null; gardenType: 'food-forest' | 'veggie-beds' | null
  shadeObjects: ShadeObject[]; shadeObjectsConfirmed: boolean
  plants: PlacedPlant[]; dismissedWarnings: string[]
  settings: { units: Units; season: Season; year: number }
  slope?: Slope
}

// z.number() already rejects NaN and ±Infinity (zod 4).
const num = z.number()
const nullNum = num.nullable()
const pointSchema = z.object({ x: num, y: num })
/** Largest size (plot side, object or plant dimension) a saved garden may hold. */
export const MAX_SIZE_M = 1000
const size = num.gt(0).max(MAX_SIZE_M)
const yearIdx = z.number().int().min(0).max(20)

export const projectSchema: z.ZodType<Project> = z.object({
  schemaVersion: z.literal(1),
  id: z.string(),
  name: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  location: z.object({ lat: num.min(-90).max(90), lon: num.min(-180).max(180) }).nullable(),
  plot: z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('rect'), widthM: size, lengthM: size }),
    z.object({ kind: z.literal('polygon'), points: z.array(pointSchema).min(3) }),
  ]),
  plotConfirmed: z.boolean(),
  northDeg: num,
  soil: z
    .object({
      source: z.enum(['lookup', 'manual', 'test']),
      phMin: nullNum,
      phMax: nullNum,
      texture: z.enum(['sandy', 'loamy', 'clay', 'silty']).nullable(),
      drainage: z.enum(['fast', 'normal', 'wet']).nullable(),
    })
    .nullable(),
  climate: z
    .object({
      source: z.enum(['lookup', 'manual']),
      minWinterC: nullNum,
      lastFrostDoy: nullNum,
      firstFrostDoy: nullNum,
      frostFree: z.boolean(),
      rainYearMm: nullNum.optional(),
      rainWarmMm: nullNum.optional(),
      cloudWarmPct: nullNum.optional(),
    })
    .nullable(),
  gardenType: z.enum(['food-forest', 'veggie-beds']).nullable(),
  shadeObjects: z.array(
    z.object({
      id: z.string(),
      kind: z.enum(['house', 'shed', 'wall', 'fence', 'hedge', 'tree', 'bed']),
      x: num,
      y: num,
      widthM: size,
      lengthM: size,
      rotationDeg: num,
      heightM: size,
      canopy: z.enum(['dense', 'light']).nullable(),
      leafOff: z.boolean().optional(), // tree loses its leaves in winter
      name: z.string().optional(),
      perennial: z.boolean().optional(),
    }),
  ),
  shadeObjectsConfirmed: z.boolean(),
  plants: z.array(
    z.object({
      id: z.string(),
      plantId: z.string(),
      variantId: z.string().nullable(),
      x: num,
      y: num,
      plantedYear: yearIdx,
      heightOverrideM: size.nullable(),
      widthOverrideM: size.nullable(),
    }),
  ),
  dismissedWarnings: z.array(z.string()),
  settings: z.object({
    units: z.enum(['metric', 'imperial']),
    season: z.enum(['spring', 'midsummer', 'autumn', 'midwinter']),
    year: yearIdx,
  }),
  slope: z
    .object({
      steepness: z.enum(['flat', 'gentle', 'moderate', 'strong', 'veryStrong']),
      facing: z.enum(['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']).nullable(),
    })
    .refine((s) => (s.facing === null) === (s.steepness === 'flat'), { message: 'facing is null only when flat' })
    .optional(),
})

export function createProject(name: string): Project {
  const now = new Date().toISOString()
  return {
    schemaVersion: 1,
    id: crypto.randomUUID(),
    name,
    createdAt: now,
    updatedAt: now,
    location: null,
    plot: { kind: 'rect', widthM: 10, lengthM: 10 },
    plotConfirmed: false,
    northDeg: 0,
    soil: null,
    climate: null,
    gardenType: null,
    shadeObjects: [],
    shadeObjectsConfirmed: false,
    plants: [],
    dismissedWarnings: [],
    settings: { units: 'metric', season: 'midsummer', year: 0 },
  }
}

export function plotBounds(plot: PlotShape): { widthM: number; lengthM: number } {
  if (plot.kind === 'rect') return { widthM: plot.widthM, lengthM: plot.lengthM }
  if (plot.points.length === 0) return { widthM: 0, lengthM: 0 }
  const xs = plot.points.map((p) => p.x)
  const ys = plot.points.map((p) => p.y)
  return { widthM: Math.max(...xs) - Math.min(...xs), lengthM: Math.max(...ys) - Math.min(...ys) }
}

export function pointInPlot(plot: PlotShape, p: Point): boolean {
  if (plot.kind === 'rect') return p.x >= 0 && p.x <= plot.widthM && p.y >= 0 && p.y <= plot.lengthM
  const pts = plot.points
  let inside = false
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const a = pts[i]!
    const b = pts[j]!
    if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) inside = !inside
  }
  return inside
}
