import { describe, expect, it } from 'vitest'
import { normalizePolygon, normalizeWithOffset, polygonBounds, polygonProblem, polygonValid, snapPoint } from './polygon'

const sq = (s: number) => [{ x: 0, y: 0 }, { x: s, y: 0 }, { x: s, y: s }, { x: 0, y: s }]

describe('polygon', () => {
  it('snaps to half metres', () => {
    expect(snapPoint({ x: 1.26, y: 0.74 })).toEqual({ x: 1.5, y: 0.5 })
    expect(snapPoint({ x: 1.26, y: 0.74 }, 1)).toEqual({ x: 1, y: 1 })
  })
  it('accepts a triangle and a square', () => {
    expect(polygonValid([{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 0, y: 4 }])).toBe(true)
    expect(polygonValid(sq(3))).toBe(true)
  })
  it('rejects a bow-tie', () => {
    expect(polygonValid([{ x: 0, y: 0 }, { x: 4, y: 4 }, { x: 4, y: 0 }, { x: 0, y: 4 }])).toBe(false)
  })
  it('rejects too few points, tiny area and collinear points', () => {
    expect(polygonValid([{ x: 0, y: 0 }, { x: 4, y: 0 }])).toBe(false)
    expect(polygonValid(sq(1))).toBe(false)
    expect(polygonValid([{ x: 0, y: 0 }, { x: 2, y: 0 }, { x: 4, y: 0 }])).toBe(false)
    expect(polygonProblem([{ x: 0, y: 0 }, { x: 2, y: 0 }, { x: 4, y: 0 }])).toBe('small')
    expect(polygonProblem([{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 2, y: 0 }])).toBe('small')
  })
  it('rejects edges that overlap or touch non-neighbours', () => {
    // fold-back along the same line
    expect(polygonValid([{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 3 }])).toBe(false)
    // vertex touching a non-adjacent edge
    expect(polygonValid([{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 4, y: 4 }, { x: 2, y: 0 }, { x: 0, y: 4 }])).toBe(false)
  })
  it('rejects non-finite points and repeated corners', () => {
    expect(polygonValid([{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: NaN, y: 4 }])).toBe(false)
    expect(polygonValid([{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 4, y: 0 }, { x: 4, y: 4 }])).toBe(false)
  })
  it('normalizes so the bbox starts at 0,0', () => {
    const pts = [{ x: -2, y: 3 }, { x: 4, y: 3 }, { x: 1, y: 9 }]
    expect(normalizePolygon(pts)).toEqual([{ x: 0, y: 0 }, { x: 6, y: 0 }, { x: 3, y: 6 }])
    expect(polygonBounds(pts)).toEqual({ minX: -2, minY: 3, widthM: 6, lengthM: 6 })
  })
  it('reports why a shape is not allowed', () => {
    expect(polygonProblem([{ x: 0, y: 0 }, { x: 4, y: 0 }])).toBe('few')
    expect(polygonProblem([{ x: 0, y: 0 }, { x: 4, y: 4 }, { x: 4, y: 0 }, { x: 0, y: 4 }])).toBe('crossing')
    expect(polygonProblem(sq(1))).toBe('small')
    expect(polygonProblem(sq(3))).toBeNull()
  })
  it('returns the shift that re-anchors the plot', () => {
    const r = normalizeWithOffset([{ x: -2, y: 3 }, { x: 4, y: 3 }, { x: 1, y: 9 }])
    expect(r.shift).toEqual({ x: 2, y: -3 })
    expect(r.points[0]).toEqual({ x: 0, y: 0 })
  })
})
