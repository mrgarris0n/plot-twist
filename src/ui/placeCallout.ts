export type Pt = { x: number; y: number }
export type Box = { w: number; h: number }
export type Rect = { left: number; top: number; w: number; h: number }

const GAP = 24
const RISE = 20
const MARGIN = 8

function overlap(a: Rect, b: Rect): number {
  const w = Math.min(a.left + a.w, b.left + b.w) - Math.max(a.left, b.left)
  const h = Math.min(a.top + a.h, b.top + b.h) - Math.max(a.top, b.top)
  return w > 0 && h > 0 ? w * h : 0
}

/**
 * Top-left of a callout of `size` beside `anchor`, kept inside `bounds` and clear of `avoid` rects.
 * Tries below-right, below-left, above-right, above-left; if none fits, takes the least overlap.
 */
export function placeCallout(anchor: Pt, size: Box, bounds: Box, avoid: Rect[] = []): { left: number; top: number } {
  const clamp = (v: number, span: number, limit: number) => Math.max(MARGIN, Math.min(v, limit - span - MARGIN))
  let best: { left: number; top: number } | null = null
  let bestOverlap = Infinity
  for (const above of [false, true]) {
    for (const leftSide of [false, true]) {
      const rawLeft = leftSide ? anchor.x - GAP - size.w : anchor.x + GAP
      const rawTop = above ? anchor.y + RISE - size.h : anchor.y - RISE
      const roomX = leftSide ? rawLeft >= MARGIN : rawLeft + size.w + MARGIN <= bounds.w
      const roomY = above ? rawTop >= MARGIN : rawTop + size.h + MARGIN <= bounds.h
      const left = clamp(rawLeft, size.w, bounds.w)
      const top = clamp(rawTop, size.h, bounds.h)
      const rect = { left, top, w: size.w, h: size.h }
      const hit = avoid.reduce((sum, a) => sum + overlap(rect, a), 0)
      if (roomX && roomY && hit === 0) return { left, top }
      // Placements that do not fit are penalised so a clear-but-cramped one is not preferred over a roomy one.
      const score = hit + (roomX && roomY ? 0 : 1)
      if (score < bestOverlap) { bestOverlap = score; best = { left, top } }
    }
  }
  return best!
}
