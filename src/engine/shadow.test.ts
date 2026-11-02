import { describe, expect, it } from 'vitest'
import { transmissionAlong, sunHoursAt, sunEnergyAt, openFlatEnergy, sunHoursGrid, gridCellSize, type Obstacle } from './shadow'
import { FLAT_GROUND, type Ground } from './slope'
import { dayLightHours, seasonDate, sunSamples } from './sun'

const bp = { lat: 47.5, lon: 19 }
const sydney = { lat: -33.9, lon: 151.2 }
const wall: Obstacle = { kind: 'box', id: 'w', cx: 5, cy: 5, widthM: 10, lengthM: 0.3, rotationDeg: 0, heightM: 2, transmission: 0 }
const winter = (loc: { lat: number; lon: number }, north = 0) => sunSamples(loc, seasonDate('midwinter', loc.lat), north)

describe('shadow', () => {
  it('open sky equals day length', () => {
    const s = winter(bp)
    expect(sunHoursAt({ x: 5, y: 4 }, 0, s, [])).toBeCloseTo(dayLightHours(s), 6)
  })
  it('wall shades north side in winter', () => {
    const s = winter(bp)
    const open = dayLightHours(s)
    expect(sunHoursAt({ x: 5, y: 4 }, 0, s, [wall])).toBeLessThan(open * 0.5)
    expect(sunHoursAt({ x: 5, y: 6 }, 0, s, [wall])).toBeGreaterThan(open * 0.9)
  })
  it('wall shadow follows rotation', () => {
    const s = winter(bp, 180)
    const open = dayLightHours(s)
    expect(sunHoursAt({ x: 5, y: 6 }, 0, s, [wall])).toBeLessThan(open * 0.5)
    expect(sunHoursAt({ x: 5, y: 4 }, 0, s, [wall])).toBeGreaterThan(open * 0.9)
  })
  it('southern hemisphere wall shades south side', () => {
    const s = winter(sydney)
    const open = dayLightHours(s)
    expect(sunHoursAt({ x: 5, y: 6 }, 0, s, [wall])).toBeLessThan(open * 0.5)
    expect(sunHoursAt({ x: 5, y: 4 }, 0, s, [wall])).toBeGreaterThan(open * 0.9)
  })
  const crown: Obstacle = { kind: 'crown', id: 'c', cx: 0, cy: 0, radiusM: 3, zBottom: 2, zTop: 6, transmission: 0.3 }
  const up = [{ dir: [0, 0, 1] as [number, number, number], hours: 1 }]
  it('crown passes partial light', () => {
    expect(sunHoursAt({ x: 0, y: 0 }, 0, up, [crown])).toBeCloseTo(0.3, 6)
  })
  it('excludeId skips own crown', () => {
    expect(sunHoursAt({ x: 0, y: 0 }, 0, up, [crown], 'c')).toBe(1)
  })
  it('grid marks outside cells NaN', () => {
    const plot = { kind: 'polygon' as const, points: [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 0, y: 10 }] }
    const g = sunHoursGrid(plot, 0, up, [])
    expect(g.cellM).toBe(0.5)
    expect(Number.isNaN(g.hours[(g.rows - 1) * g.cols + g.cols - 1]!)).toBe(true)
    expect(g.hours[0]).toBe(1)
  })
  it('cell size grows for big plots', () => {
    expect(gridCellSize({ kind: 'rect', widthM: 100, lengthM: 100 })).toBe(1)
  })
  describe('rotated boxes and parallel rays', () => {
    const box = (rotationDeg: number): Obstacle => ({ ...(wall as Extract<Obstacle, { kind: 'box' }>), rotationDeg })
    it('90 deg wall runs along y', () => {
      const w = [box(90)]
      expect(transmissionAlong([3, 8, 0.5], [1, 0, 0], w)).toBe(0) // y=8 is inside the wall's length
      expect(transmissionAlong([3, 12, 0.5], [1, 0, 0], w)).toBe(1) // passes beside it
      expect(transmissionAlong([3, 8, 0.5], [1, 0, 0], [box(0)])).toBe(1) // unrotated wall would miss
    })
    it('30 deg rotation is clockwise on screen (y down)', () => {
      const w = [box(30)]
      // wall centreline passes through (5 + 4cos30, 5 + 4sin30) = (8.464, 7)
      expect(transmissionAlong([8.464, 5.5, 1], [0, 1, 0], w)).toBe(0)
      expect(transmissionAlong([8.464, 4.5, 1], [0, -1, 0], w)).toBe(1) // counter-clockwise wall would be hit here
    })
    it('rays with zero direction components', () => {
      const w = [box(0)]
      expect(transmissionAlong([-2, 5, 1], [1, 0, 0], w)).toBe(0)
      expect(transmissionAlong([-2, 6, 1], [1, 0, 0], w)).toBe(1) // parallel to slab, outside in y
      expect(transmissionAlong([-2, 5, 3], [1, 0, 0], w)).toBe(1) // parallel to slab, above in z
    })
  })
  describe('sloped ground', () => {
    // downhill toward north (-y), pivoting about y = 5
    const northSlope = (deg: number): Ground => {
      const t = (deg * Math.PI) / 180
      return { normal: [0, -Math.sin(t), Math.cos(t)], zAt: (p) => Math.tan(t) * (p.y - 5) }
    }
    const plot = { kind: 'rect' as const, widthM: 10, lengthM: 10 }
    it('FLAT_GROUND passed explicitly gives an equal grid', () => {
      const s = winter(bp)
      const a = sunHoursGrid(plot, 0.3, s, [wall])
      const b = sunHoursGrid(plot, 0.3, s, [wall], FLAT_GROUND)
      expect(Array.from(b.hours)).toEqual(Array.from(a.hours))
    })
    it('steep north slope in midwinter at 60N gets no sun', () => {
      const northFacing = northSlope(20.25)
      const h = sunHoursAt({ x: 5, y: 5 }, 0, winter({ lat: 60, lon: 10 }), [], undefined, northFacing)
      expect(h).toBe(0)
      expect(Number.isNaN(h)).toBe(false)
    })
    it('shadow stretches downhill', () => {
      // At 47.5N in spring the wall's shadow falls north, so the downhill slope here faces north
      const northFacing = northSlope(12.5)
      const s = sunSamples(bp, seasonDate('spring', bp.lat), 0)
      const open = dayLightHours(s)
      const shadedNorth = (g: Ground) => {
        const grid = sunHoursGrid(plot, 0.3, s, [{ ...wall, heightM: 3, zBase: g.zAt({ x: 5, y: 5 }) }], g)
        let n = 0
        for (let row = 0; row < grid.rows; row++)
          for (let col = 0; col < grid.cols; col++) if ((row + 0.5) * grid.cellM < 5 && grid.hours[row * grid.cols + col]! < open * 0.5) n++
        return n
      }
      expect(shadedNorth(northFacing)).toBeGreaterThan(shadedNorth(FLAT_GROUND))
    })
  })
})

describe('sun strength', () => {
  const plot = { kind: 'rect' as const, widthM: 10, lengthM: 10 }
  const slopeGround = (nx: number, ny: number): Ground => {
    const nz = Math.sqrt(1 - nx * nx - ny * ny)
    return { normal: [nx, ny, nz], zAt: () => 0 }
  }
  it('open flat grid cells have strength 1', () => {
    const s = winter(bp)
    const g = sunHoursGrid(plot, 0, s, [])
    for (const v of g.strength) expect(v).toBeCloseTo(1, 9)
  })
  it('strength is NaN outside the plot', () => {
    const tri = { kind: 'polygon' as const, points: [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 0, y: 10 }] }
    const g = sunHoursGrid(tri, 0, winter(bp), [])
    expect(g.strength.some((v) => Number.isNaN(v))).toBe(true)
    expect(g.strength.some((v) => v > 0.99)).toBe(true)
  })
  it('strength is 0 when the reference is 0', () => {
    const g = sunHoursGrid(plot, 0, [], [])
    for (const v of g.strength) expect(v).toBe(0)
  })
  it('strength is never negative on a steep pole-facing slope', () => {
    const loc = { lat: 60, lon: 10 }
    const s = winter(loc)
    const g = sunHoursGrid(plot, 0, s, [], slopeGround(0, 0.35))
    const finite = Array.from(g.strength).filter((v) => !Number.isNaN(v))
    expect(finite.length).toBeGreaterThan(0)
    for (const v of finite) expect(v).toBeGreaterThanOrEqual(0)
  })
  it('shade lowers strength', () => {
    const s = winter(bp)
    const g = sunHoursGrid(plot, 0, s, [wall])
    const shaded = g.strength[Math.floor(4 / g.cellM) * g.cols + 5]!
    const open = g.strength[Math.floor(8 / g.cellM) * g.cols + 5]!
    expect(shaded).toBeLessThan(open)
  })
  it('low sun counts less than hours on flat ground', () => {
    const s = winter(bp)
    const p = { x: 5, y: 5 }
    expect(sunEnergyAt(p, 0, s, []) / sunHoursAt(p, 0, s, [])).toBeLessThan(1)
    expect(sunEnergyAt(p, 0, s, []) / openFlatEnergy(s)).toBeCloseTo(1, 9)
  })
})
