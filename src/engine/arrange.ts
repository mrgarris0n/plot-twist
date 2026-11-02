import type { PlantLibrary, PlantRecord } from '../model/plants'
import { pointInPlot, type PlacedPlant, type Point, type Project } from '../model/project'
import { climateIssue } from './checks/climate'
import { CROWD_OVERLAP_FRACTION, crownOverlapFraction, wouldCrowd } from './checks/crowding'
import { LIGHT_Z_FRACTION } from './checks/light'
import { soilIssue } from './checks/soil'
import { waterIssue } from './checks/water'
import { suitsRegion } from './region'
import { LIGHT_NEED_HOURS } from './checks/types'
import { effectiveSize, sizeAt, YEAR_SAMPLES } from './growth'
import { growingSeasonHours } from './scene'
import { crownClear, needsClearance, solidObjects } from './clearance'

type Slot = { climber: boolean; fits: (r: PlantRecord) => boolean }
const hasRole = (r: PlantRecord, ...roles: NonNullable<PlantRecord['roles']>) => roles.some((x) => r.roles?.includes(x) ?? false)
const groundCover: Slot = { climber: false, fits: (r) => r.layer === 'ground-cover' }
const SLOTS: Slot[] = [
  { climber: false, fits: (r) => ['shrub', 'herbaceous', 'ground-cover'].includes(r.layer) && hasRole(r, 'nitrogen-fixer') },
  { climber: false, fits: (r) => r.layer === 'shrub' },
  { climber: false, fits: (r) => r.layer === 'herbaceous' && hasRole(r, 'pest-repellent', 'pollinator') },
  groundCover,
  groundCover,
  { climber: true, fits: (r) => r.layer === 'climber' },
]
const ANGLES_DEG = Array.from({ length: 12 }, (_, i) => i * 30)
const RADIUS_FRACTIONS = [0.5, 0.8, 1.1, 1.4]
const CLIMBER_RING_M = 0.5
const CLIMBER_FOOT_M = 0.01 // a climber's base just has to be outside the wall it grows on
const COMPANION_RANGE_M = 3
const COMPANION_WEIGHT = 0.5
const DIVERSITY_BONUS = 0.3
const SCORE_EPS = 1e-9

type Position = Point & { angle: number; radius: number }

function ring(centre: Point, radius: number): Position[] {
  return ANGLES_DEG.map((angle) => {
    const a = (angle * Math.PI) / 180
    return { x: centre.x + radius * Math.cos(a), y: centre.y + radius * Math.sin(a), angle, radius }
  })
}

function companionScore(library: PlantLibrary, a: PlantRecord, otherId: string): number {
  return a.companions?.find((c) => c.plantId === otherId)?.score ?? library.byId.get(otherId)?.companions?.find((c) => c.plantId === a.id)?.score ?? 0
}

/**
 * Ghost plants filling a guild round each user tree (canopy or sub-canopy), slot by slot:
 * nitrogen fixer, shrub, herb, two ground covers and an optional climber. Deterministic; never changes the project.
 */
export function autoArrange(project: Project, library: PlantLibrary): PlacedPlant[] {
  const isTree = (pp: PlacedPlant) => {
    const layer = library.byId.get(pp.plantId)?.layer
    return layer === 'canopy' || layer === 'sub-canopy'
  }
  const trees = project.plants.filter(isTree)
  if (trees.length === 0) return []

  const species = [...library.all]
    .filter((r) => climateIssue(r, project.climate, project.settings.units) === null && soilIssue(r, project.soil) === null && suitsRegion(r, project.location) && waterIssue(r, project.climate, project.settings.units) === null)
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
  const solids = solidObjects(project)
  /** Inside the plot, with the mature crown clear of buildings, walls, fences and hedges (climbers may touch them). */
  const usable = (p: Point, rec: PlantRecord, widthM: number) =>
    pointInPlot(project.plot, p) && (needsClearance(rec.layer) ? crownClear(solids, p, widthM / 2) : crownClear(solids, p, CLIMBER_FOOT_M))

  // Shading comes from user plants and shade objects only, so light is memoised across the whole call.
  const memo = new Map<string, number>()
  const hours = (p: Point, z: number, year: number, excludeId: string) => {
    const key = `${p.x},${p.y},${Math.round(z * 2) / 2},${year}`
    let h = memo.get(key)
    if (h === undefined) {
      h = growingSeasonHours(project, library, p, z, year, excludeId)
      memo.set(key, h)
    }
    return h
  }
  /** Light part of the score, or null when the plant would not get the sun it needs in some sampled year. */
  const lightScore = (rec: PlantRecord, ghost: PlacedPlant): number | null => {
    if (!project.location) return 0 // light unknown: check skipped
    const need = LIGHT_NEED_HOURS[rec.sunNeed]
    const size = effectiveSize(ghost, rec)
    let score = Infinity
    for (const year of YEAR_SAMPLES) {
      const h = hours(ghost, LIGHT_Z_FRACTION * sizeAt(size, year - ghost.plantedYear).heightM, year, ghost.id)
      if (h < need) return null
      score = Math.min(score, Math.min(1, (h - need) / Math.max(need, 1)))
    }
    return score
  }

  /** Guild plants never share a spot: crowns of non-tree plants may overlap at most CROWD_OVERLAP_FRACTION, whatever their layer or height. */
  const sharesSpot = (ghost: PlacedPlant, widthM: number, others: PlacedPlant[]) =>
    others.some((o) => {
      if (isTree(o)) return false
      const rec = library.byId.get(o.plantId)
      if (!rec) return false
      return crownOverlapFraction(Math.hypot(o.x - ghost.x, o.y - ghost.y), widthM, effectiveSize(o, rec).matureWidthM) > CROWD_OVERLAP_FRACTION
    })

  const ghosts: PlacedPlant[] = []
  for (const tree of trees) {
    const treeRec = library.byId.get(tree.plantId)!
    const R = effectiveSize(tree, treeRec).matureWidthM / 2
    const main = RADIUS_FRACTIONS.flatMap((f) => ring(tree, f * R))
    const withClimberRing = [...main, ...ring(tree, CLIMBER_RING_M)]
    const byAngleThenRadius = (a: Position, b: Position) => a.angle - b.angle || a.radius - b.radius
    main.sort(byAngleThenRadius)
    withClimberRing.sort(byAngleThenRadius)
    const usedInGuild = new Set<string>()

    for (const slot of SLOTS) {
      const others: Project = { ...project, plants: [...project.plants, ...ghosts] }
      const id = `ghost-${ghosts.length + 1}`
      let best: { ghost: PlacedPlant; score: number } | null = null
      for (const rec of species) {
        if (!slot.fits(rec)) continue
        const diversity = usedInGuild.has(rec.id) ? -DIVERSITY_BONUS : DIVERSITY_BONUS
        const widthM = rec.variants[0]!.matureWidthM
        for (const pos of slot.climber ? withClimberRing : main) {
          if (!usable(pos, rec, widthM)) continue
          const ghost: PlacedPlant = { id, plantId: rec.id, variantId: null, x: pos.x, y: pos.y, plantedYear: project.gardenType === 'veggie-beds' ? project.settings.year : 0, heightOverrideM: null, widthOverrideM: null }
          if (sharesSpot(ghost, widthM, others.plants) || wouldCrowd(others, library, ghost)) continue
          const light = lightScore(rec, ghost)
          if (light === null) continue
          let companions = companionScore(library, rec, tree.plantId)
          for (const g of ghosts) {
            if (Math.hypot(g.x - pos.x, g.y - pos.y) <= COMPANION_RANGE_M) companions += companionScore(library, rec, g.plantId)
          }
          const score = light + COMPANION_WEIGHT * companions + diversity
          if (!best || score > best.score + SCORE_EPS) best = { ghost, score }
        }
      }
      if (best) {
        ghosts.push(best.ghost)
        usedInGuild.add(best.ghost.plantId)
      }
    }
  }
  return ghosts
}
