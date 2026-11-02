import { describe, expect, it } from 'vitest'
import type { ShadeObject } from '../model/project'
import { clearSpot, crownClear, solidObjects } from './clearance'

const box = (x: number, y: number, widthM: number, lengthM: number, rotationDeg = 0): ShadeObject =>
  ({ id: `b${x},${y}`, kind: 'house', x, y, widthM, lengthM, rotationDeg, heightM: 5, canopy: null })

describe('clearSpot', () => {
  const house = box(10, 10, 10, 8) // x 5..15, y 6..14

  it('leaves a crown that already clears alone', () => {
    expect(clearSpot([house], { x: 20, y: 10 }, 2)).toEqual({ x: 20, y: 10 })
  })

  it('pushes a crown overlapping a side out by just enough', () => {
    const p = clearSpot([house], { x: 16, y: 10 }, 2)
    expect(p.x).toBeCloseTo(17)
    expect(p.y).toBeCloseTo(10)
    expect(crownClear([house], p, 2)).toBe(true)
  })

  it('moves a crown dropped inside out through the nearest side', () => {
    const p = clearSpot([house], { x: 10, y: 13 }, 1)
    expect(p.y).toBeCloseTo(15)
    expect(crownClear([house], p, 1)).toBe(true)
  })

  it('pushes away from a corner diagonally', () => {
    const p = clearSpot([house], { x: 15.5, y: 14.5 }, 2)
    expect(Math.hypot(p.x - 15, p.y - 14)).toBeCloseTo(2)
  })

  it('respects rotation', () => {
    const wall = box(0, 0, 10, 0.3, 90) // runs along y
    expect(crownClear([wall], { x: 1, y: 0 }, 0.5)).toBe(true)
    expect(crownClear([wall], { x: 0.3, y: 0 }, 0.5)).toBe(false)
  })

  it('finds a free spot when wedged between two objects', () => {
    const a = box(0, 0, 4, 4)
    const b = box(5, 0, 4, 4) // 1 m gap between x 2 and 3
    const p = clearSpot([a, b], { x: 2.5, y: 0 }, 1)
    expect(crownClear([a, b], p, 1)).toBe(true)
  })
})

describe('clearSpot edge cases', () => {
  it('handles a crown centred exactly on an edge', () => {
    const house = box(10, 10, 10, 8)
    const p = clearSpot([house], { x: 15, y: 10 }, 2)
    expect(Number.isFinite(p.x) && Number.isFinite(p.y)).toBe(true)
    expect(crownClear([house], p, 2)).toBe(true)
  })

  it('a bed is ground, not a solid: a plant inside it stays put', () => {
    const bed: ShadeObject = { id: 'bed', kind: 'bed', x: 5, y: 5, widthM: 1.2, lengthM: 2.4, rotationDeg: 0, heightM: 0.3, canopy: null }
    expect(solidObjects({ shadeObjects: [bed] })).toEqual([])
    expect(clearSpot(solidObjects({ shadeObjects: [bed] }), { x: 5, y: 5 }, 0.3)).toEqual({ x: 5, y: 5 })
  })
})
