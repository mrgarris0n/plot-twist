import { describe, expect, it } from 'vitest'
import { canopyHitRadius, fitView, gridStep, plotToScreen, screenToPlot, type View, zoomAt } from './geometry'

const v: View = { pxPerM: 20, offsetX: 30, offsetY: -12 }

describe('geometry', () => {
  it('round-trips plot and screen points', () => {
    const p = { x: 3.7, y: 8.25 }
    const q = screenToPlot(plotToScreen(p, v), v)
    expect(q.x).toBeCloseTo(p.x, 9)
    expect(q.y).toBeCloseTo(p.y, 9)
  })

  it('zoomAt keeps the screen point on the same plot point', () => {
    const s = { x: 210, y: 130 }
    const before = screenToPlot(s, v)
    const after = screenToPlot(s, zoomAt(v, s, 1.7))
    expect(after.x).toBeCloseTo(before.x, 9)
    expect(after.y).toBeCloseTo(before.y, 9)
  })

  it('clamps zoom between 5 and 200 px per metre', () => {
    expect(zoomAt(v, { x: 0, y: 0 }, 100).pxPerM).toBe(200)
    expect(zoomAt(v, { x: 0, y: 0 }, 0.001).pxPerM).toBe(5)
  })

  it('fits a 20x10 plot into 800x600 at 90% of the width, centred', () => {
    const f = fitView({ kind: 'rect', widthM: 20, lengthM: 10 }, 800, 600)
    expect(f.pxPerM).toBe(36)
    expect(f.offsetX).toBeCloseTo(40, 9)
    expect(f.offsetY).toBeCloseTo(120, 9)
  })
})

describe('canopyHitRadius', () => {
  it('keeps small crowns fully clickable with a minimum target', () => {
    expect(canopyHitRadius(0)).toBe(0.15)
    expect(canopyHitRadius(0.5)).toBe(0.5)
  })
  it('limits big crowns to a core near the trunk', () => {
    expect(canopyHitRadius(1)).toBe(0.6)
    expect(canopyHitRadius(4)).toBeCloseTo(1.2)
    expect(canopyHitRadius(4)).toBeLessThan(4)
  })
})

describe('gridStep', () => {
  it('keeps the 1 m and 5 m grids at normal zoom', () => {
    expect(gridStep(20)).toBe(1)
    expect(gridStep(10)).toBe(1)
    expect(gridStep(4)).toBe(5)
  })
  it('coarsens on huge plots so lines stay at least 10 px apart', () => {
    expect(gridStep(1)).toBe(10)
    expect(gridStep(0.5)).toBe(50)
    expect(gridStep(0.05)).toBe(100)
  })
})
