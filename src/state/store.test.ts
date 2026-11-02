import { library } from '../data/library'
import { bedAt, toLocal } from '../engine/beds'
import { layoutOf } from '../engine/presence'
import { crownClear, solidObjects } from '../engine/clearance'
import { beforeEach, describe, expect, it } from 'vitest'
import { createProject } from '../model/project'
import type { PlacedPlant } from '../model/project'
import { SHADE_DEFAULTS, setupStatus, useStore } from './store'

const ghost = (id: string): PlacedPlant => ({ id, plantId: 'apple', variantId: null, x: 1, y: 1, plantedYear: 0, heightOverrideM: null, widthOverrideM: null })

beforeEach(() => {
  useStore.setState(useStore.getInitialState(), true)
})

describe('store', () => {
  it('setupStatus is all false for a new project, all true once set up', () => {
    const s = useStore.getState()
    s.openProject(createProject('x'))
    expect(Object.values(setupStatus(useStore.getState().project!)).every((v) => v === false)).toBe(true)
    const a = useStore.getState()
    a.setLocation({ lat: 1, lon: 2 })
    a.setPlot({ kind: 'rect', widthM: 5, lengthM: 5 })
    a.setSoil({ source: 'manual', phMin: 6, phMax: 7, texture: null, drainage: null })
    a.setGardenType('food-forest')
    a.addShadeObject('shed', { x: 2, y: 2 })
    expect(setupStatus(useStore.getState().project!)).toEqual({ location: true, plot: true, soil: true, gardenType: true, shadeObjects: true })
  })

  it('setSlope non-flat picks the sunny default', () => {
    const s = useStore.getState()
    s.openProject(createProject('x'))
    s.setSlope('strong')
    expect(useStore.getState().project!.slope).toEqual({ steepness: 'strong', facing: 'S' })
    s.setLocation({ lat: -33, lon: 18 })
    s.setSlope('gentle', 'E')
    expect(useStore.getState().project!.slope).toEqual({ steepness: 'gentle', facing: 'E' })
    s.setSlope('moderate')
    expect(useStore.getState().project!.slope).toEqual({ steepness: 'moderate', facing: 'E' })
    s.setSlope('flat')
    s.setSlope('strong')
    expect(useStore.getState().project!.slope).toEqual({ steepness: 'strong', facing: 'N' })
  })

  it('setting flat clears facing', () => {
    const s = useStore.getState()
    s.openProject(createProject('x'))
    s.setSlope('strong', 'W')
    s.setSlope('flat')
    expect(useStore.getState().project!.slope).toEqual({ steepness: 'flat', facing: null })
  })

  it('addShadeObject centres on point with defaults', () => {
    useStore.getState().openProject(createProject('x'))
    const id = useStore.getState().addShadeObject('house', { x: 3, y: 4 })
    const o = useStore.getState().project!.shadeObjects.find((s) => s.id === id)!
    expect(o).toMatchObject({ x: 3, y: 4, rotationDeg: 0, ...SHADE_DEFAULTS.house })
  })

  it('placePlant uses plantedYear 0 regardless of settings.year', () => {
    const s = useStore.getState()
    s.openProject(createProject('x'))
    s.setYear(10)
    const id = useStore.getState().placePlant('apple', { x: 1, y: 1 })
    const p = useStore.getState().project!.plants.find((q) => q.id === id)!
    expect(p).toMatchObject({ plantedYear: 0, variantId: null, heightOverrideM: null, widthOverrideM: null })
  })

  it('setYear clamps to 0..20', () => {
    useStore.getState().openProject(createProject('x'))
    useStore.getState().setYear(25)
    expect(useStore.getState().project!.settings.year).toBe(20)
    useStore.getState().setYear(-1)
    expect(useStore.getState().project!.settings.year).toBe(0)
    useStore.getState().setYear(NaN)
    expect(useStore.getState().project!.settings.year).toBe(0)
  })

  it('acceptGhost moves one ghost into plants with a fresh id', () => {
    const s = useStore.getState()
    s.openProject(createProject('x'))
    s.setGhosts([ghost('ghost-1'), ghost('ghost-2')])
    useStore.getState().acceptGhost('ghost-1')
    const st = useStore.getState()
    expect(st.ghosts.map((g) => g.id)).toEqual(['ghost-2'])
    expect(st.project!.plants).toHaveLength(1)
    expect(st.project!.plants[0]!.id.startsWith('ghost-')).toBe(false)
    useStore.getState().acceptAllGhosts()
    expect(useStore.getState().ghosts).toEqual([])
    expect(useStore.getState().project!.plants).toHaveLength(2)
  })

  it('content edits drop ghosts; view changes keep them', () => {
    const s = useStore.getState()
    s.openProject(createProject('x'))
    const id = s.placePlant('apple', { x: 1, y: 1 })
    useStore.getState().setGhosts([ghost('ghost-1'), ghost('ghost-2')])
    useStore.getState().setYear(5)
    useStore.getState().setSeason('autumn')
    useStore.getState().setUnits('imperial')
    expect(useStore.getState().ghosts.map((g) => g.id)).toEqual(['ghost-1', 'ghost-2'])
    useStore.getState().updatePlant(id, { x: 2 })
    expect(useStore.getState().ghosts).toEqual([])
  })

  it('acceptGhost keeps the other ghosts', () => {
    const s = useStore.getState()
    s.openProject(createProject('x'))
    s.setGhosts([ghost('ghost-1'), ghost('ghost-2'), ghost('ghost-3')])
    useStore.getState().acceptGhost('ghost-2')
    expect(useStore.getState().ghosts.map((g) => g.id)).toEqual(['ghost-1', 'ghost-3'])
    expect(useStore.getState().project!.plants).toHaveLength(1)
  })

  it('discardGhosts empties ghosts and keeps plants', () => {
    const s = useStore.getState()
    s.openProject(createProject('x'))
    s.placePlant('apple', { x: 1, y: 1 })
    useStore.getState().setGhosts([ghost('ghost-1')])
    useStore.getState().discardGhosts()
    expect(useStore.getState().ghosts).toEqual([])
    expect(useStore.getState().project!.plants).toHaveLength(1)
  })

  it('update bumps updatedAt and is a no-op without a project', async () => {
    useStore.getState().update(() => { throw new Error('should not run') })
    const p = createProject('x')
    p.updatedAt = '2000-01-01T00:00:00.000Z'
    useStore.getState().openProject(p)
    useStore.getState().update((q) => { q.name = 'y' })
    const after = useStore.getState().project!
    expect(after.name).toBe('y')
    expect(after.updatedAt).not.toBe('2000-01-01T00:00:00.000Z')
  })
})

describe('store removal clears references', () => {
  it('removeShadeObject clears selection and highlight of that object only', () => {
    const s = useStore.getState()
    s.openProject(createProject('x'))
    const a = useStore.getState().addShadeObject('shed', { x: 1, y: 1 })
    const b = useStore.getState().addShadeObject('wall', { x: 2, y: 2 })
    useStore.getState().select(a)
    useStore.getState().setHighlight(a)
    useStore.getState().removeShadeObject(b)
    expect(useStore.getState().selectedId).toBe(a)
    useStore.getState().removeShadeObject(a)
    expect(useStore.getState().selectedId).toBeNull()
    expect(useStore.getState().highlightId).toBeNull()
  })

  it('removePlant clears selection', () => {
    useStore.getState().openProject(createProject('x'))
    const id = useStore.getState().placePlant('apple', { x: 1, y: 1 })
    useStore.getState().select(id)
    useStore.getState().removePlant(id)
    expect(useStore.getState().selectedId).toBeNull()
  })

  describe('setLocation and looked-up data', () => {
    const climate = (source: 'lookup' | 'manual') => ({ source, minWinterC: -5, lastFrostDoy: 100, firstFrostDoy: 300, frostFree: false })
    const soil = (source: 'lookup' | 'manual' | 'test') => ({ source, phMin: 6, phMax: 7, texture: null, drainage: null })
    const setup = (cs: 'lookup' | 'manual', ss: 'lookup' | 'manual' | 'test') => {
      const s = useStore.getState()
      s.openProject(createProject('x'))
      s.setLocation({ lat: 1, lon: 2 })
      s.setClimate(climate(cs))
      s.setSoil(soil(ss))
    }
    it('clears looked-up climate and soil when the location changes', () => {
      setup('lookup', 'lookup')
      useStore.getState().setLocation({ lat: 3, lon: 4 })
      expect(useStore.getState().project).toMatchObject({ climate: null, soil: null })
    })
    it('keeps manual climate and manual or test soil', () => {
      setup('manual', 'manual')
      useStore.getState().setLocation({ lat: 3, lon: 4 })
      expect(useStore.getState().project?.climate?.source).toBe('manual')
      expect(useStore.getState().project?.soil?.source).toBe('manual')
      setup('manual', 'test')
      useStore.getState().setLocation({ lat: 5, lon: 6 })
      expect(useStore.getState().project?.soil?.source).toBe('test')
    })
    it('clears rain and cloud from a manual climate when the location moves, keeping the manual values', () => {
      setup('manual', 'manual')
      useStore.getState().setClimate({ ...climate('manual'), rainYearMm: 640, rainWarmMm: 310, cloudWarmPct: 40 })
      useStore.getState().setLocation({ lat: 3, lon: 4 })
      expect(useStore.getState().project?.climate).toMatchObject({ source: 'manual', minWinterC: -5, lastFrostDoy: 100, rainYearMm: null, rainWarmMm: null, cloudWarmPct: null })
    })
    it('keeps both when the location is unchanged', () => {
      setup('lookup', 'lookup')
      useStore.getState().setLocation({ lat: 1, lon: 2 })
      expect(useStore.getState().project).toMatchObject({ climate: { source: 'lookup' }, soil: { source: 'lookup' } })
    })
  })
})

describe('setPlotShape', () => {
  const seed = () => {
    useStore.getState().openProject(createProject('t'))
    const o = useStore.getState().addShadeObject('shed', { x: 5, y: 5 })
    const pl = useStore.getState().placePlant('x', { x: 1, y: 2 })
    return { o, pl }
  }
  const tri = { kind: 'polygon' as const, points: [{ x: 0, y: 0 }, { x: 6, y: 0 }, { x: 3, y: 6 }] }
  it('shifts objects and plants with the plot', () => {
    const { o, pl } = seed()
    useStore.getState().setPlotShape(tri, { x: 2, y: -3 })
    const p = useStore.getState().project!
    expect(p.plot).toEqual(tri)
    expect(p.plotConfirmed).toBe(true)
    expect(p.shadeObjects.find((s) => s.id === o)).toMatchObject({ x: 7, y: 2 })
    expect(p.plants.find((s) => s.id === pl)).toMatchObject({ x: 3, y: -1 })
  })
  it('leaves them alone with a zero shift', () => {
    const { o, pl } = seed()
    useStore.getState().setPlotShape(tri, { x: 0, y: 0 })
    const p = useStore.getState().project!
    expect(p.shadeObjects.find((s) => s.id === o)).toMatchObject({ x: 5, y: 5 })
    expect(p.plants.find((s) => s.id === pl)).toMatchObject({ x: 1, y: 2 })
  })
})

describe('crowns keep clear of solids', () => {
  const tree = library.all.find((r) => r.layer === 'canopy')!
  const climber = library.all.find((r) => r.layer === 'climber')!
  const r = tree.variants[0]!.matureWidthM / 2
  const setup = () => {
    useStore.getState().openProject({ ...createProject('Clear'), plot: { kind: 'rect', widthM: 60, lengthM: 60 } })
    return useStore.getState().addShadeObject('house', { x: 30, y: 30 }) // 10 x 8: x 25..35, y 26..34
  }
  const crownsClear = () => {
    const p = useStore.getState().project!
    return p.plants.every((pl) => crownClear(solidObjects(p), pl, (library.byId.get(pl.plantId)!.variants[0]!.matureWidthM) / 2))
  }

  it('nudges a plant dropped against a house until its mature crown clears it', () => {
    setup()
    const id = useStore.getState().placePlant(tree.id, { x: 36, y: 30 })
    const pl = useStore.getState().project!.plants.find((p) => p.id === id)!
    expect(pl.x).toBeCloseTo(35 + r)
    expect(crownsClear()).toBe(true)
  })

  it('nudges a dragged plant too', () => {
    setup()
    const id = useStore.getState().placePlant(tree.id, { x: 5, y: 5 })
    useStore.getState().updatePlant(id, { x: 30, y: 33 })
    expect(crownsClear()).toBe(true)
  })

  it('stops a moved house short of a plant crown instead of moving the plant', () => {
    const house = setup()
    const id = useStore.getState().placePlant(tree.id, { x: 50, y: 30 })
    useStore.getState().updateShadeObject(house, { x: 45, y: 30 })
    const p = useStore.getState().project!
    expect(p.plants.find((x) => x.id === id)).toMatchObject({ x: 50, y: 30 })
    expect(crownsClear()).toBe(true)
  })

  it('lets climbers grow right against a wall', () => {
    setup()
    const id = useStore.getState().placePlant(climber.id, { x: 35.2, y: 30 })
    expect(useStore.getState().project!.plants.find((p) => p.id === id)).toMatchObject({ x: 35.2, y: 30 })
  })

  describe('beds', () => {
    const open = () => {
      useStore.getState().openProject(createProject('x'))
      return useStore.getState()
    }
    const plantAt = (x: number, y: number, year = 0): PlacedPlant => ({ id: `p${x}-${y}-${year}`, plantId: 'apple', variantId: null, x, y, plantedYear: year, heightOverrideM: null, widthOverrideM: null })

    it('new bed gets the next name', () => {
      const s = open()
      s.addShadeObject('bed', { x: 2, y: 2 })
      s.addShadeObject('bed', { x: 6, y: 6 })
      const beds = useStore.getState().project!.shadeObjects
      expect(beds.map((b) => b.name)).toEqual(['Bed A', 'Bed B'])
      expect(beds.every((b) => b.perennial === false)).toBe(true)
      expect(beds[0]).toMatchObject(SHADE_DEFAULTS.bed)
    })

    it('moving a bed moves plants of all years inside it', () => {
      const s = open()
      const id = s.addShadeObject('bed', { x: 3, y: 3 })
      useStore.getState().update((p) => { p.plants.push(plantAt(3, 3, 0), plantAt(3.2, 3.5, 2), plantAt(8, 8, 0)) })
      useStore.getState().updateShadeObject(id, { x: 5, y: 4 })
      const [a, b, c] = useStore.getState().project!.plants
      expect([a!.x, a!.y]).toEqual([5, 4])
      expect(b!.x).toBeCloseTo(5.2)
      expect(b!.y).toBeCloseTo(4.5)
      expect([c!.x, c!.y]).toEqual([8, 8])
    })

    it('moving a house moves no plants', () => {
      const s = open()
      const id = s.addShadeObject('house', { x: 3, y: 3 })
      useStore.getState().update((p) => { p.plants.push(plantAt(3, 3)) })
      useStore.getState().updateShadeObject(id, { x: 5, y: 4 })
      const pl = useStore.getState().project!.plants[0]!
      expect([pl.x, pl.y]).toEqual([3, 3])
    })

    it('removing a bed removes its plants', () => {
      const s = open()
      const id = s.addShadeObject('bed', { x: 3, y: 3 })
      useStore.getState().update((p) => { p.plants.push(plantAt(3, 3, 0), plantAt(3, 3.5, 1), plantAt(8, 8, 0)) })
      useStore.getState().removeShadeObject(id)
      expect(useStore.getState().project!.plants.map((q) => [q.x, q.y])).toEqual([[8, 8]])
    })

    it('removing a bed clears selection and highlight of its plants', () => {
      const s = open()
      const id = s.addShadeObject('bed', { x: 3, y: 3 })
      useStore.getState().update((p) => { p.plants.push(plantAt(3, 3, 0), plantAt(3, 3.5, 1)) })
      const [a, b] = useStore.getState().project!.plants.map((q) => q.id)
      useStore.getState().select(a!)
      useStore.getState().setHighlight(b!)
      useStore.getState().removeShadeObject(id)
      expect(useStore.getState().selectedId).toBeNull()
      expect(useStore.getState().highlightId).toBeNull()
    })
  })
  describe('applyNextYear', () => {
    const veggie = () => {
      const p = createProject('x')
      p.gardenType = 'veggie-beds'
      useStore.getState().openProject(p)
    }
    const pl = (id: string, plantId: string, x: number, y: number, year: number): PlacedPlant => ({ id, plantId, variantId: null, x, y, plantedYear: year, heightOverrideM: null, widthOverrideM: null })

    it('applyNextYear replaces existing annuals of year N+1 only', () => {
      veggie()
      useStore.getState().update((p) => {
        p.plants.push(pl('a', 'pea', 1, 1, 0), pl('old', 'radish', 5, 5, 1), pl('tree', 'apple', 9, 9, 1), pl('past', 'radish', 7, 7, 0))
      })
      useStore.getState().applyNextYear()
      const ids = useStore.getState().project!.plants.map((q) => q.id)
      expect(ids).not.toContain('old')
      expect(ids).toEqual(expect.arrayContaining(['a', 'tree', 'past']))
      const next = useStore.getState().project!.plants.filter((q) => q.plantedYear === 1 && q.id !== 'tree')
      expect(next.map((q) => q.plantId).sort()).toEqual(['pea', 'radish'])
    })

    it('applyNextYear replaces year+1 rotated crops without the annual flag', () => {
      veggie()
      useStore.getState().update((p) => { p.plants.push(pl('old', 'onion', 5, 5, 1)) })
      useStore.getState().applyNextYear()
      expect(useStore.getState().project!.plants.map((q) => q.id)).not.toContain('old')
    })

    it('applyNextYear moves to next year and returns notPlaced', () => {
      veggie()
      useStore.getState().update((p) => { p.plants.push(pl('a', 'pea', 1, 1, 0), pl('b', 'pea', 1, 1, 0)) })
      const notPlaced = useStore.getState().applyNextYear()
      expect(useStore.getState().project!.settings.year).toBe(1)
      expect(notPlaced).toEqual([{ plantId: 'pea', fromBed: null }])
    })
  })
})

describe('veggie beds: year and bed changes', () => {
  const veggie = () => {
    const p = createProject('x')
    p.gardenType = 'veggie-beds'
    useStore.getState().openProject(p)
  }
  const presentIn = (year: number) => {
    const p = useStore.getState().project!
    return layoutOf(p, library, year).plants.map((q) => q.id)
  }

  it('placePlant in a veggie garden at year 2 creates a plant present in year 2', () => {
    veggie()
    useStore.getState().setYear(2)
    const id = useStore.getState().placePlant('pea', { x: 2, y: 2 })
    const pl = useStore.getState().project!.plants.find((q) => q.id === id)!
    expect(pl.plantedYear).toBe(2)
    expect(presentIn(2)).toContain(id)
  })

  it('placePlant in a food forest keeps plantedYear 0', () => {
    useStore.getState().openProject(createProject('x'))
    useStore.getState().setYear(2)
    const id = useStore.getState().placePlant('apple', { x: 2, y: 2 })
    expect(useStore.getState().project!.plants.find((q) => q.id === id)!.plantedYear).toBe(0)
  })

  it('acceptGhost and acceptAllGhosts plant into the viewed year in a veggie garden', () => {
    veggie()
    useStore.getState().setYear(2)
    useStore.getState().setGhosts([ghost('g1'), ghost('g2')])
    useStore.getState().acceptGhost('g1')
    useStore.getState().acceptAllGhosts()
    const plants = useStore.getState().project!.plants
    expect(plants).toHaveLength(2)
    expect(plants.map((q) => q.plantedYear)).toEqual([2, 2])
  })

  it('acceptGhost in a food forest keeps the ghost year', () => {
    useStore.getState().openProject(createProject('x'))
    useStore.getState().setYear(2)
    useStore.getState().setGhosts([ghost('g1')])
    useStore.getState().acceptGhost('g1')
    expect(useStore.getState().project!.plants[0]!.plantedYear).toBe(0)
  })

  describe('bed rotate and resize carry plants', () => {
    const setup = () => {
      veggie()
      const id = useStore.getState().addShadeObject('bed', { x: 3, y: 3 })
      useStore.getState().updateShadeObject(id, { widthM: 1.2, lengthM: 2.4 })
      const mk = (pid: string, x: number, y: number, year: number): PlacedPlant => ({ id: pid, plantId: 'pea', variantId: null, x, y, plantedYear: year, heightOverrideM: null, widthOverrideM: null })
      useStore.getState().update((p) => { p.plants.push(mk('a', 3, 4, 0), mk('b', 3.5, 2, 1)) })
      return id
    }
    const bedOf = (id: string) => useStore.getState().project!.shadeObjects.find((s) => s.id === id)!
    const plant = (id: string) => useStore.getState().project!.plants.find((q) => q.id === id)!

    it('rotating 90 degrees keeps plants of every year inside the bed', () => {
      const id = setup()
      useStore.getState().updateShadeObject(id, { rotationDeg: 90 })
      for (const pid of ['a', 'b']) expect(bedAt(useStore.getState().project!, plant(pid))?.id).toBe(id)
      expect(plant('a').x).toBeCloseTo(2)
      expect(plant('a').y).toBeCloseTo(3)
    })

    it('resizing keeps plants inside at the same fractions', () => {
      const id = setup()
      const before = toLocal(bedOf(id), plant('b'))
      const f = { x: before.x / 1.2, y: before.y / 2.4 }
      useStore.getState().updateShadeObject(id, { x: 4, widthM: 2.4, lengthM: 1.2 })
      const after = toLocal(bedOf(id), plant('b'))
      expect(after.x / 2.4).toBeCloseTo(f.x)
      expect(after.y / 1.2).toBeCloseTo(f.y)
      expect(bedAt(useStore.getState().project!, plant('b'))?.id).toBe(id)
    })

    it('a plain move still carries plants by the delta', () => {
      const id = setup()
      useStore.getState().updateShadeObject(id, { x: 5, y: 4 })
      expect([plant('a').x, plant('a').y]).toEqual([5, 5])
    })
  })
})
