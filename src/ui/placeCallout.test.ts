import { describe, expect, it } from 'vitest'
import { placeCallout } from './placeCallout'

const size = { w: 280, h: 200 }
const bounds = { w: 1000, h: 700 }

describe('placeCallout', () => {
  it('sits right of and level with the plant when there is room', () => {
    expect(placeCallout({ x: 100, y: 100 }, size, bounds)).toEqual({ left: 124, top: 80 })
  })
  it('flips to the left near the right edge', () => {
    const p = placeCallout({ x: 900, y: 100 }, size, bounds)
    expect(p.left).toBe(900 - 24 - 280)
    expect(p.top).toBe(80)
  })
  it('flips upward near the bottom edge', () => {
    const p = placeCallout({ x: 100, y: 650 }, size, bounds)
    expect(p.top).toBe(650 + 20 - 200)
    expect(p.left).toBe(124)
  })
  it('never leaves the bounds, even when flipped', () => {
    const p = placeCallout({ x: 990, y: 695 }, size, bounds)
    expect(p.left + size.w).toBeLessThanOrEqual(bounds.w)
    expect(p.top + size.h).toBeLessThanOrEqual(bounds.h)
  })
  it('clamps to the top-left when larger than the bounds', () => {
    expect(placeCallout({ x: 50, y: 50 }, { w: 400, h: 400 }, { w: 300, h: 300 })).toEqual({ left: 8, top: 8 })
  })
})

describe('placeCallout avoiding rects', () => {
  const controls = { left: 0, top: 600, w: 400, h: 100 }
  it('takes another placement when the first would cover a control area', () => {
    // below-right at (124, 580..780) is cut off by bounds anyway; use a roomy anchor so only the avoid rect blocks it
    const p = placeCallout({ x: 100, y: 450 }, size, bounds, [controls])
    expect(p).toEqual({ left: 124, top: 450 + 20 - 200 })
  })
  it('falls back to the least-overlapping placement, inside bounds, when all are blocked', () => {
    const wall = { left: 0, top: 0, w: 1000, h: 700 }
    const p = placeCallout({ x: 500, y: 350 }, size, bounds, [wall])
    expect(p.left).toBeGreaterThanOrEqual(8)
    expect(p.top).toBeGreaterThanOrEqual(8)
    expect(p.left + size.w).toBeLessThanOrEqual(bounds.w)
    expect(p.top + size.h).toBeLessThanOrEqual(bounds.h)
  })
  it('handles an anchor at the top-left corner', () => {
    expect(placeCallout({ x: 0, y: 0 }, size, bounds)).toEqual({ left: 24, top: 8 })
  })
})
