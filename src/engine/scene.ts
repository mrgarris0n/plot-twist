import type { PlantLibrary } from '../model/plants'
import { plotBounds, type Point, type Project, type Season } from '../model/project'
import { effectiveSize, MIN_SHADING_HEIGHT_M, sizeAt } from './growth'
import { ageAt } from './presence'
import { FLAT_GROUND, groundOf } from './slope'
import { openFlatEnergy, sunEnergyAt, sunHoursAt, type Obstacle } from './shadow'
import { seasonDate, sunSamples, type SunSample } from './sun'

export const SOLID_TRANSMISSION = 0
export const OVERLAY_Z = 0.3
export const CROWN_DEPTH_RATIO = 0.6
export const CANOPY_TRANSMISSION = { dense: 0.15, light: 0.5, unknown: 0.3, leafOff: 0.8 } as const

const sceneCache = new WeakMap<Project, WeakMap<object, Map<string, Obstacle[]>>>()
const NO_LIBRARY = {}

/** Obstacles for a year and season. Memoised per project object (projects are replaced, never mutated) and library; callers must not mutate the result. */
export function buildScene(project: Project, library: PlantLibrary | null, year: number, season: Season): Obstacle[] {
  let byLib = sceneCache.get(project)
  if (!byLib) sceneCache.set(project, (byLib = new WeakMap()))
  const libKey = library ?? NO_LIBRARY
  let byKey = byLib.get(libKey)
  if (!byKey) byLib.set(libKey, (byKey = new Map()))
  const key = `${year}|${season}`
  let scene = byKey.get(key)
  if (!scene) byKey.set(key, (scene = computeScene(project, library, year, season)))
  return scene
}

function computeScene(project: Project, library: PlantLibrary | null, year: number, season: Season): Obstacle[] {
  const ground = groundOf(project)
  const obstacles = project.shadeObjects.filter((o) => o.kind !== 'bed').map((o): Obstacle => {
    const base = ground.zAt({ x: o.x, y: o.y }) // ground height at the object's centre
    if (o.kind === 'tree') {
      return {
        kind: 'crown',
        id: o.id,
        cx: o.x,
        cy: o.y,
        radiusM: o.widthM / 2,
        zBottom: base + o.heightM * (1 - CROWN_DEPTH_RATIO),
        zTop: base + o.heightM,
        transmission: o.leafOff && season === 'midwinter' ? CANOPY_TRANSMISSION.leafOff : CANOPY_TRANSMISSION[o.canopy ?? 'unknown'],
      }
    }
    return { kind: 'box', id: o.id, cx: o.x, cy: o.y, widthM: o.widthM, lengthM: o.lengthM, rotationDeg: o.rotationDeg, heightM: o.heightM, ...(base !== 0 && { zBase: base }), ...(ground.gradient && ground !== FLAT_GROUND && { zSlope: ground.gradient }), transmission: SOLID_TRANSMISSION }
  })
  if (library) {
    for (const pp of project.plants) {
      const rec = library.byId.get(pp.plantId)
      if (!rec) continue
      const { heightM, widthM } = sizeAt(effectiveSize(pp, rec), ageAt(project, rec, pp, year))
      if (heightM < MIN_SHADING_HEIGHT_M) continue
      const transmission =
        rec.leafHabit === 'deciduous' && season === 'midwinter'
          ? CANOPY_TRANSMISSION.leafOff
          : CANOPY_TRANSMISSION[rec.canopyDensity ?? 'unknown']
      const base = ground.zAt(pp)
      obstacles.push({ kind: 'crown', id: pp.id, cx: pp.x, cy: pp.y, radiusM: widthM / 2, zBottom: base + heightM * (1 - CROWN_DEPTH_RATIO), zTop: base + heightM, transmission })
    }
  }
  return obstacles
}

/** Least recently used first; capped, since turning the north slider makes a new entry per angle. Shared arrays, so readonly. */
const cache = new Map<string, readonly SunSample[]>()
export const SEASON_SAMPLES_CACHE_SIZE = 64

export function seasonSamples(project: Project, season: Season): readonly SunSample[] {
  const loc = project.location
  if (!loc) return []
  const key = `${loc.lat},${loc.lon},${project.northDeg},${season}`
  let s = cache.get(key)
  if (s) cache.delete(key)
  else s = sunSamples(loc, seasonDate(season, loc.lat), project.northDeg)
  cache.set(key, s)
  if (cache.size > SEASON_SAMPLES_CACHE_SIZE) cache.delete(cache.keys().next().value!)
  return s
}

const GROWING: Season[] = ['spring', 'midsummer', 'autumn']

/** Mean direct-sun hours at a point and height across spring, midsummer and autumn. */
export function growingSeasonHours(project: Project, library: PlantLibrary | null, p: Point, z: number, year: number, excludeId?: string): number {
  const ground = groundOf(project)
  let sum = 0
  for (const season of GROWING) {
    sum += sunHoursAt(p, z, seasonSamples(project, season), buildScene(project, library, year, season), excludeId, ground)
  }
  return sum / GROWING.length
}

function growingStrength(project: Project, p: Point, z: number, scene: (season: Season) => Obstacle[], excludeId?: string): number | null {
  if (!project.location) return null
  const ground = groundOf(project)
  let energy = 0
  let reference = 0
  for (const season of GROWING) {
    const samples = seasonSamples(project, season)
    energy += sunEnergyAt(p, z, samples, scene(season), excludeId, ground)
    reference += openFlatEnergy(samples)
  }
  return reference > 0 ? energy / reference : 0
}

/** Sun energy at a point across spring, midsummer and autumn, as a share of an open flat spot at the same location. Null without a location. */
export function growingSeasonStrength(project: Project, library: PlantLibrary | null, p: Point, z: number, year: number, excludeId?: string): number | null {
  return growingStrength(project, p, z, (season) => buildScene(project, library, year, season), excludeId)
}

/** Growing-season strength at the plot centre with nothing casting shade: what the slope alone does. Null without a location. */
export function bareSlopeStrength(project: Project): number | null {
  const { widthM, lengthM } = plotBounds(project.plot)
  return growingStrength(project, { x: widthM / 2, y: lengthM / 2 }, 0, () => [])
}
