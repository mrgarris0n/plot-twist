import { create } from 'zustand'
import { library } from '../data/library'
import { bedAt, nextBedName, toLocal, toWorld } from '../engine/beds'
import { suggestNextYear, type NotPlaced } from '../engine/rotation'
import { seasonalInBeds } from '../engine/presence'
import { clearObjectSpot, clearSpot, needsClearance, solidObjects, type Crown } from '../engine/clearance'
import { effectiveSize } from '../engine/growth'
import { defaultFacing } from '../engine/slope'
export { SETUP_ITEMS, setupComplete, setupStatus, type SetupItem } from '../model/setup'

import type { Climate, Facing, LatLon, PlacedPlant, PlotShape, Point, Project, Season, ShadeKind, ShadeObject, Soil, Steepness, Units } from '../model/project'


export const SHADE_DEFAULTS: Record<ShadeKind, Pick<ShadeObject, 'widthM' | 'lengthM' | 'heightM' | 'canopy'>> = {
  house: { widthM: 10, lengthM: 8, heightM: 7, canopy: null },
  shed: { widthM: 3, lengthM: 2, heightM: 2.5, canopy: null },
  wall: { widthM: 5, lengthM: 0.3, heightM: 2, canopy: null },
  fence: { widthM: 5, lengthM: 0.1, heightM: 1.8, canopy: null },
  hedge: { widthM: 5, lengthM: 1, heightM: 2, canopy: null },
  tree: { widthM: 6, lengthM: 6, heightM: 8, canopy: 'dense' },
  bed: { widthM: 1.2, lengthM: 2.4, heightM: 0.3, canopy: null },
}


type Store = {
  project: Project | null
  selectedId: string | null
  ghosts: PlacedPlant[]
  highlightId: string | null
  openProject(p: Project): void
  closeProject(): void
  update(fn: (p: Project) => void): void
  setLocation(l: LatLon): void
  setPlot(s: PlotShape): void
  setPlotShape(s: PlotShape, shift: Point): void
  setNorth(deg: number): void
  setSlope(steepness: Steepness, facing?: Facing): void
  setSoil(s: Soil): void
  setClimate(c: Climate): void
  setGardenType(t: 'food-forest' | 'veggie-beds'): void
  /** Moves to the next year with a rotation suggestion: replaces that year's annuals and returns the crops that could not be placed. */
  applyNextYear(): NotPlaced[]
  addShadeObject(kind: ShadeKind, at: Point): string
  updateShadeObject(id: string, patch: Partial<ShadeObject>): void
  removeShadeObject(id: string): void
  confirmShadeObjects(): void
  placePlant(plantId: string, at: Point, variantId?: string | null): string
  updatePlant(id: string, patch: Partial<PlacedPlant>): void
  removePlant(id: string): void
  /** Copies a plant or object `offsetM` right and down (a bed copy gets a new name and no plants); the copy's id, or null. */
  duplicate(id: string, offsetM?: number): string | null
  dismissWarning(key: string): void
  select(id: string | null): void
  setHighlight(id: string | null): void
  setYear(y: number): void
  setSeason(s: Season): void
  setUnits(u: Units): void
  setGhosts(g: PlacedPlant[]): void
  acceptGhost(id: string): void
  acceptAllGhosts(): void
  discardGhosts(): void
}

/** Drop selection/highlight pointing at a removed item. */
/** Mature crown of a placed plant that must keep clear of solids, or null (climber, unknown plant). */
function clearanceCrown(pl: Pick<PlacedPlant, 'plantId' | 'variantId' | 'widthOverrideM' | 'heightOverrideM'> & Point): Crown | null {
  const rec = library.byId.get(pl.plantId)
  if (!rec || !needsClearance(rec.layer)) return null
  return { x: pl.x, y: pl.y, r: effectiveSize(pl as PlacedPlant, rec).matureWidthM / 2 }
}

/** Moves a plant so its mature crown doesn't grow into a building, wall, fence or hedge. */
function keepPlantClear(p: Project, pl: PlacedPlant): void {
  const crown = clearanceCrown(pl)
  if (!crown) return
  const at = clearSpot(solidObjects(p), pl, crown.r)
  pl.x = at.x
  pl.y = at.y
}

function dropRefs(set: (p: Partial<Store>) => void, get: () => Store, id: string) {
  const { selectedId, highlightId } = get()
  if (selectedId === id) set({ selectedId: null })
  if (highlightId === id) set({ highlightId: null })
}

/** View settings change the project shallowly (every other reference and updatedAt kept) so engine results stay valid. */
function setView(set: (p: Partial<Store>) => void, get: () => Store, patch: Partial<Project['settings']>) {
  const cur = get().project
  if (cur) set({ project: { ...cur, settings: { ...cur.settings, ...patch } } })
}

/** Veggie-bed plants are planted in the year being viewed; a food forest keeps the plant's own year. */
const viewedYear = (p: Project): { plantedYear?: number } => (p.gardenType === 'veggie-beds' ? { plantedYear: p.settings.year } : {})

export const useStore = create<Store>()((set, get) => ({
  project: null,
  selectedId: null,
  ghosts: [],
  highlightId: null,
  openProject: (p) => set({ project: p, selectedId: null, ghosts: [], highlightId: null }),
  closeProject: () => set({ project: null, selectedId: null, ghosts: [], highlightId: null }),
  update: (fn) => {
    const cur = get().project
    if (!cur) return
    const next = structuredClone(cur)
    fn(next)
    next.updatedAt = new Date().toISOString()
    // Suggestions were chosen against the old plan, so any content edit drops them.
    set({ project: next, ghosts: [] })
  },
  setLocation: (l) => get().update((p) => {
    const moved = p.location?.lat !== l.lat || p.location?.lon !== l.lon
    p.location = l
    // Looked-up values belong to the old place; manual and soil-test values are the gardener's own.
    if (moved && p.climate?.source === 'lookup') p.climate = null
    // Rain and cloud are always looked up, so a manual climate must not keep the old place's.
    else if (moved && p.climate) p.climate = { ...p.climate, rainYearMm: null, rainWarmMm: null, cloudWarmPct: null }
    if (moved && p.soil?.source === 'lookup') p.soil = null
  }),
  setPlot: (s) => get().update((p) => { p.plot = s; p.plotConfirmed = true }),
  setPlotShape: (s, shift) => get().update((p) => {
    p.plot = s
    p.plotConfirmed = true
    // Objects and plants keep their place relative to the plot outline.
    for (const o of p.shadeObjects) { o.x += shift.x; o.y += shift.y }
    for (const pl of p.plants) { pl.x += shift.x; pl.y += shift.y }
  }),
  setNorth: (deg) => get().update((p) => { p.northDeg = deg }),
  setSlope: (steepness, facing) => get().update((p) => {
    p.slope = steepness === 'flat'
      ? { steepness, facing: null }
      : { steepness, facing: facing ?? p.slope?.facing ?? defaultFacing(p.location?.lat ?? null) }
  }),
  setSoil: (s) => get().update((p) => { p.soil = s }),
  setClimate: (c) => get().update((p) => { p.climate = c }),
  setGardenType: (t) => get().update((p) => { p.gardenType = t }),
  applyNextYear: () => {
    const cur = get().project
    if (!cur || cur.settings.year >= 20) return []
    const year = cur.settings.year
    const { plants, notPlaced } = suggestNextYear(cur, library, year)
    const replaced = cur.plants.filter((pl) => pl.plantedYear === year + 1 && seasonalInBeds(cur, library.byId.get(pl.plantId))).map((pl) => pl.id)
    get().update((p) => {
      p.plants = [...p.plants.filter((pl) => !replaced.includes(pl.id)), ...plants]
      p.settings.year = year + 1
    })
    const { selectedId } = get()
    if (selectedId && replaced.includes(selectedId)) set({ selectedId: null })
    return notPlaced
  },
  addShadeObject: (kind, at) => {
    const id = crypto.randomUUID()
    get().update((p) => {
      const bed = kind === 'bed' ? { name: nextBedName(p), perennial: false } : {}
      p.shadeObjects.push({ id, kind, x: at.x, y: at.y, rotationDeg: 0, ...SHADE_DEFAULTS[kind], ...bed })
    })
    return id
  },
  updateShadeObject: (id, patch) =>
    get().update((p) => {
      const o = p.shadeObjects.find((s) => s.id === id)
      if (!o) return
      const moved = o.kind === 'bed' && (patch.x !== undefined || patch.y !== undefined)
      const differs = (a: number | undefined, b: number) => a !== undefined && Math.abs(a - b) > 1e-9
      const reshaped = o.kind === 'bed' && (differs(patch.rotationDeg, o.rotationDeg) || differs(patch.widthM, o.widthM) || differs(patch.lengthM, o.lengthM))
      // Plants whose centre is in the bed (before the change) travel with it, in every year.
      const inside = moved || reshaped ? p.plants.filter((pl) => bedAt(p, pl)?.id === id) : []
      const from = { x: o.x, y: o.y }
      const old = { ...o }
      Object.assign(o, patch)
      if (reshaped) {
        // Rotated or resized: each plant keeps its fractional spot along the bed's own axes.
        for (const pl of inside) {
          const l = toLocal(old, pl)
          const w = toWorld(o, { x: (l.x / old.widthM) * o.widthM, y: (l.y / old.lengthM) * o.lengthM })
          pl.x = w.x
          pl.y = w.y
        }
      } else {
        for (const pl of inside) { pl.x += o.x - from.x; pl.y += o.y - from.y }
      }
      // A moved solid stops short of plant crowns rather than pushing the plants. Beds carry their plants instead.
      if (o.kind !== 'tree' && o.kind !== 'bed' && (patch.x !== undefined || patch.y !== undefined)) {
        const crowns = p.plants.map(clearanceCrown).filter((c): c is Crown => c !== null)
        const at = clearObjectSpot(o, o, crowns)
        o.x = at.x
        o.y = at.y
      }
    }),
  removeShadeObject: (id) => {
    let doomed: string[] = []
    get().update((p) => {
      doomed = p.plants.filter((pl) => bedAt(p, pl)?.id === id).map((pl) => pl.id)
      p.shadeObjects = p.shadeObjects.filter((s) => s.id !== id)
      if (doomed.length > 0) p.plants = p.plants.filter((pl) => !doomed.includes(pl.id))
    })
    for (const gone of [id, ...doomed]) dropRefs(set, get, gone)
  },
  confirmShadeObjects: () => get().update((p) => { p.shadeObjectsConfirmed = true }),
  placePlant: (plantId, at, variantId = null) => {
    const id = crypto.randomUUID()
    get().update((p) => {
      const pl: PlacedPlant = { id, plantId, variantId, x: at.x, y: at.y, plantedYear: p.gardenType === 'veggie-beds' ? p.settings.year : 0, heightOverrideM: null, widthOverrideM: null }
      keepPlantClear(p, pl)
      p.plants.push(pl)
    })
    return id
  },
  updatePlant: (id, patch) =>
    get().update((p) => {
      const o = p.plants.find((s) => s.id === id)
      if (!o) return
      Object.assign(o, patch)
      if ('x' in patch || 'y' in patch || 'variantId' in patch || 'widthOverrideM' in patch) keepPlantClear(p, o)
    }),
  removePlant: (id) => {
    get().update((p) => { p.plants = p.plants.filter((s) => s.id !== id) })
    dropRefs(set, get, id)
  },
  duplicate: (id, offsetM = 1) => {
    const p0 = get().project
    if (!p0) return null
    const copyId = crypto.randomUUID()
    const pl = p0.plants.find((x) => x.id === id)
    const o = p0.shadeObjects.find((x) => x.id === id)
    if (!pl && !o) return null
    get().update((p) => {
      if (pl) {
        const copy = { ...pl, id: copyId, x: pl.x + offsetM, y: pl.y + offsetM }
        keepPlantClear(p, copy)
        p.plants.push(copy)
      } else if (o) {
        p.shadeObjects.push({ ...o, id: copyId, x: o.x + offsetM, y: o.y + offsetM, ...(o.kind === 'bed' ? { name: nextBedName(p) } : {}) })
      }
    })
    return copyId
  },
  dismissWarning: (key) =>
    get().update((p) => {
      if (!p.dismissedWarnings.includes(key)) p.dismissedWarnings.push(key)
    }),
  select: (id) => set({ selectedId: id }),
  setHighlight: (id) => set({ highlightId: id }),
  setYear: (y) => {
    if (Number.isFinite(y)) setView(set, get, { year: Math.min(20, Math.max(0, y)) })
  },
  setSeason: (s) => setView(set, get, { season: s }),
  setUnits: (u) => setView(set, get, { units: u }),
  setGhosts: (g) => set({ ghosts: g }),
  acceptGhost: (id) => {
    const g = get().ghosts.find((x) => x.id === id)
    if (!g || !get().project) return
    const rest = get().ghosts.filter((x) => x.id !== id)
    get().update((p) => { p.plants.push({ ...g, id: crypto.randomUUID(), ...viewedYear(p) }) })
    set({ ghosts: rest }) // the others were chosen alongside this one, so they stay valid
  },
  acceptAllGhosts: () => {
    const gs = get().ghosts
    if (!get().project) return
    get().update((p) => { for (const g of gs) p.plants.push({ ...g, id: crypto.randomUUID(), ...viewedYear(p) }) })
    set({ ghosts: [] })
  },
  discardGhosts: () => set({ ghosts: [] }),
}))
