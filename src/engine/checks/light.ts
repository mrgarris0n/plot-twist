import { plantName, type PlantLibrary } from '../../model/plants'
import type { PlacedPlant, Project } from '../../model/project'
import { formatLength } from '../../model/units'
import { en, type LightObstacle } from '../../strings/en'
import { effectiveSize, sizeAt } from '../growth'
import { presentYears } from '../presence'
import { buildScene, growingSeasonHours, seasonSamples } from '../scene'
import { sunFacesGround, transmissionAlong } from '../shadow'
import { groundOf } from '../slope'
import type { Vec3 } from '../sun'
import { LIGHT_NEED_HOURS, type Warning } from './types'

/** Height above ground at which a plant's light is measured, as a share of its height that year. */
export const LIGHT_Z_FRACTION = 0.75
const GROWING = ['spring', 'midsummer', 'autumn'] as const

/** Ids of scene obstacles (plant crowns and shade objects) that block any sun ray to the point. */
function blockers(project: Project, library: PlantLibrary, pp: PlacedPlant, z: number, year: number): Set<string> {
  const hit = new Set<string>()
  const ground = groundOf(project)
  const origin: Vec3 = [pp.x, pp.y, ground.zAt(pp) + z]
  for (const season of GROWING) {
    const samples = seasonSamples(project, season)
    for (const ob of buildScene(project, library, year, season)) {
      if (ob.id === pp.id || hit.has(ob.id)) continue
      if (samples.some((s) => sunFacesGround(s.dir, ground) && transmissionAlong(origin, s.dir, [ob]) < 1)) hit.add(ob.id)
    }
  }
  return hit
}

/** The obstacle whose removal gives the plant the most extra sun, or null when none helps. */
export function worstObstacle(project: Project, library: PlantLibrary, pp: PlacedPlant, z: number, year: number, hours: number): LightObstacle | null {
  let best: { obstacle: LightObstacle; gain: number } | null = null
  for (const id of blockers(project, library, pp, z, year)) {
    const without: Project = { ...project, plants: project.plants.filter((p) => p.id !== id), shadeObjects: project.shadeObjects.filter((o) => o.id !== id) }
    const gain = growingSeasonHours(without, library, pp, z, year, pp.id) - hours
    if (gain <= 0 || (best && gain <= best.gain)) continue
    const plant = project.plants.find((p) => p.id === id)
    const shade = project.shadeObjects.find((o) => o.id === id)
    const obstacleRec = plant ? library.byId.get(plant.plantId) : undefined
    if (obstacleRec) best = { obstacle: { name: plantName(obstacleRec), isPlant: true }, gain }
    else if (shade) best = { obstacle: { name: en.editor.kind[shade.kind], isPlant: false }, gain }
  }
  return best?.obstacle ?? null
}

/** Plants that get less growing-season sun than they need, from the first sampled year it happens. */
export function lightWarnings(project: Project, library: PlantLibrary): Warning[] {
  if (!project.location) return []
  const out: Warning[] = []
  for (const pp of project.plants) {
    const rec = library.byId.get(pp.plantId)
    if (!rec) continue
    const need = LIGHT_NEED_HOURS[rec.sunNeed]
    if (need <= 0) continue
    const size = effectiveSize(pp, rec)
    let firstHours: number | null = null
    for (const { year, age } of presentYears(project, rec, pp)) {
      const z = LIGHT_Z_FRACTION * sizeAt(size, age).heightM
      const hours = growingSeasonHours(project, library, pp, z, year, pp.id)
      const isFirst = firstHours === null
      firstHours ??= hours
      if (hours >= need) continue
      const name = plantName(rec)
      const obstacle = worstObstacle(project, library, pp, z, year, hours)
      const message = isFirst
        ? en.warnings.lightNow(name, rec.sunNeed, hours, obstacle)
        : en.warnings.lightLater(name, rec.sunNeed, firstHours, year, hours, obstacle)
      out.push({
        key: `light:${pp.id}`,
        type: 'light',
        severity: 'warning',
        plantIds: [pp.id],
        startYear: year,
        message,
        detail: en.details.warning.light(hours, need, year, formatLength(z, project.settings.units)),
        fix: null,
      })
      break
    }
  }
  return out
}
