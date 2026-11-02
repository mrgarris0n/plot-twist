import { plotBounds } from '../model/project'
import type { Facing, Point, Project, Steepness } from '../model/project'
import type { Vec3 } from './sun'

export const SLOPE_DEG: Record<Steepness, number> = { flat: 0, gentle: 4, moderate: 6.75, strong: 12.5, veryStrong: 20.25 }
export const FACING_DEG: Record<Facing, number> = { N: 0, NE: 45, E: 90, SE: 135, S: 180, SW: 225, W: 270, NW: 315 }

export type Ground = { normal: Vec3; zAt(p: Point): number; gradient?: [number, number] } // z in metres relative to the plot centre; normal points up out of the ground

export const FLAT_GROUND: Ground = { normal: [0, 0, 1], zAt: () => 0, gradient: [0, 0] }

// The sunniest facing: toward the equator (S in the north, N in the south)
export function defaultFacing(lat: number | null): Facing {
  return lat !== null && lat < 0 ? 'N' : 'S'
}

export function groundOf(project: Project): Ground {
  const slope = project.slope
  if (!slope || slope.steepness === 'flat' || slope.facing === null) return FLAT_GROUND
  const theta = (SLOPE_DEG[slope.steepness] * Math.PI) / 180
  const beta = ((FACING_DEG[slope.facing] + project.northDeg) * Math.PI) / 180
  // downhill direction, same convention as sunSamples: [sin a, -cos a]
  const h0 = Math.sin(beta)
  const h1 = -Math.cos(beta)
  const { widthM, lengthM } = plotBounds(project.plot)
  const cx = widthM / 2
  const cy = lengthM / 2
  const tan = Math.tan(theta)
  return {
    normal: [h0 * Math.sin(theta), h1 * Math.sin(theta), Math.cos(theta)],
    zAt: (p) => -tan * ((p.x - cx) * h0 + (p.y - cy) * h1),
    gradient: [-tan * h0, -tan * h1], // d(zAt)/d(x, y)
  }
}
