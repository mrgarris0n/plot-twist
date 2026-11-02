import { plotBounds, type PlotShape, type Point } from '../../model/project'

export type View = { pxPerM: number; offsetX: number; offsetY: number }

export const MIN_PX_PER_M = 5
export const MAX_PX_PER_M = 200

export function plotToScreen(p: Point, v: View): Point {
  return { x: p.x * v.pxPerM + v.offsetX, y: p.y * v.pxPerM + v.offsetY }
}

export function screenToPlot(p: Point, v: View): Point {
  return { x: (p.x - v.offsetX) / v.pxPerM, y: (p.y - v.offsetY) / v.pxPerM }
}

/** Zoom by `factor`, keeping the plot point under `screen` fixed. */
export function zoomAt(v: View, screen: Point, factor: number): View {
  const pxPerM = Math.min(MAX_PX_PER_M, Math.max(MIN_PX_PER_M, v.pxPerM * factor))
  const anchor = screenToPlot(screen, v)
  return { pxPerM, offsetX: screen.x - anchor.x * pxPerM, offsetY: screen.y - anchor.y * pxPerM }
}

/** Fit the plot into a w x h viewport at 90 % fill, centred. */
export function fitView(plot: PlotShape, w: number, h: number): View {
  const { widthM, lengthM } = plotBounds(plot)
  if (widthM <= 0 || lengthM <= 0 || w <= 0 || h <= 0) return { pxPerM: 20, offsetX: w / 2, offsetY: h / 2 }
  const pxPerM = Math.min((0.9 * w) / widthM, (0.9 * h) / lengthM)
  return { pxPerM, offsetX: (w - widthM * pxPerM) / 2, offsetY: (h - lengthM * pxPerM) / 2 }
}

/** True when the plot point is on screen in a w x h viewport, with `margin` px to spare. */
export function isVisible(p: Point, v: View, w: number, h: number, margin = 24): boolean {
  const s = plotToScreen(p, v)
  return s.x >= margin && s.x <= w - margin && s.y >= margin && s.y <= h - margin
}

/** Pan (keeping the zoom) so the plot point is at the centre of a w x h viewport. */
export function centerOn(p: Point, v: View, w: number, h: number): View {
  return { ...v, offsetX: w / 2 - p.x * v.pxPerM, offsetY: h / 2 - p.y * v.pxPerM }
}

const CANOPY_FULL_HIT_M = 0.6
const CANOPY_CORE_FRACTION = 0.3

/**
 * Clickable radius of a crown (metres). Small crowns are clickable everywhere; a big crown
 * only near its trunk, so buildings and smaller plants under it stay easy to pick.
 */
export function canopyHitRadius(crownRadiusM: number): number {
  if (crownRadiusM <= CANOPY_FULL_HIT_M) return Math.max(crownRadiusM, 0.15)
  return Math.max(CANOPY_FULL_HIT_M, crownRadiusM * CANOPY_CORE_FRACTION)
}

const GRID_STEPS_M = [1, 5, 10, 50, 100]

/** Grid spacing in metres: the finest step whose lines stay at least 10 px apart at this zoom. */
export function gridStep(pxPerM: number): number {
  return GRID_STEPS_M.find((s) => s * pxPerM >= 10) ?? GRID_STEPS_M[GRID_STEPS_M.length - 1]!
}
