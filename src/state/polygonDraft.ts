import { create } from 'zustand'
import type { Point } from '../model/project'

/** The outline being drawn or edited on the plan; null when not drawing. */
type Draft = { points: Point[]; closed: boolean }

type DraftStore = {
  draft: Draft | null
  start(points?: Point[]): void
  addPoint(p: Point): void
  movePoint(i: number, p: Point): void
  removeLast(): void
  close(): void
  cancel(): void
}

export const useDraft = create<DraftStore>()((set, get) => ({
  draft: null,
  start: (points = []) => set({ draft: { points, closed: points.length >= 3 } }),
  addPoint: (p) => {
    const d = get().draft
    if (d && !d.closed) set({ draft: { ...d, points: [...d.points, p] } })
  },
  movePoint: (i, p) => {
    const d = get().draft
    if (d) set({ draft: { ...d, points: d.points.map((q, k) => (k === i ? p : q)) } })
  },
  removeLast: () => {
    const d = get().draft
    if (d && !d.closed) set({ draft: { ...d, points: d.points.slice(0, -1) } })
  },
  close: () => {
    const d = get().draft
    if (d && d.points.length >= 3) set({ draft: { ...d, closed: true } })
  },
  cancel: () => set({ draft: null }),
}))
