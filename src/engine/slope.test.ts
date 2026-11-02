import { describe, expect, it } from 'vitest'
import { createProject } from '../model/project'
import type { Project, Slope } from '../model/project'
import { FLAT_GROUND, defaultFacing, groundOf } from './slope'
import { seasonDate, sunSamples } from './sun'

const withSlope = (slope: Slope | undefined, northDeg = 0): Project => ({ ...createProject('s'), slope, northDeg })
const dot = (a: number[], b: number[]) => a.reduce((s, v, i) => s + v * b[i], 0)

describe('slope ground', () => {
  it('flat and missing slope give FLAT_GROUND', () => {
    expect(groundOf(withSlope(undefined))).toBe(FLAT_GROUND)
    expect(groundOf(withSlope({ steepness: 'flat', facing: null }))).toBe(FLAT_GROUND)
    expect(FLAT_GROUND.normal).toEqual([0, 0, 1])
    expect(FLAT_GROUND.zAt({ x: 3, y: 4 })).toBe(0)
  })

  it('south-facing strong slope normal leans toward the noon sun', () => {
    const g = groundOf(withSlope({ steepness: 'strong', facing: 'S' }))
    const samples = sunSamples({ lat: 50, lon: 0 }, seasonDate('midsummer', 50), 0)
    const noon = samples.reduce((a, b) => (b.dir[2] > a.dir[2] ? b : a))
    expect(dot(noon.dir, g.normal)).toBeGreaterThan(noon.dir[2])
  })

  it('ground drops downhill', () => {
    const p = withSlope({ steepness: 'moderate', facing: 'S' })
    const g = groundOf(p)
    const cx = 5, cy = 5 // default 10 x 10 plot
    expect(g.zAt({ x: cx, y: cy })).toBeCloseTo(0, 12)
    expect(g.zAt({ x: cx, y: cy + 2 })).toBeLessThan(0)
    expect(g.zAt({ x: cx, y: cy - 2 })).toBeGreaterThan(0)
  })

  it('facing is true-north based', () => {
    const g0 = groundOf(withSlope({ steepness: 'strong', facing: 'S' }, 0))
    const g90 = groundOf(withSlope({ steepness: 'strong', facing: 'S' }, 90))
    // sunSamples convention: horizontal [sin a, -cos a]; rotating a by 90 maps [x, y] -> [-y, x]
    expect(g90.normal[0]).toBeCloseTo(-g0.normal[1], 10)
    expect(g90.normal[1]).toBeCloseTo(g0.normal[0], 10)
    expect(g90.normal[2]).toBeCloseTo(g0.normal[2], 10)
  })

  it('default facing is N south of the equator', () => {
    expect(defaultFacing(-33)).toBe('N')
    expect(defaultFacing(51)).toBe('S')
    expect(defaultFacing(null)).toBe('S')
  })
})
