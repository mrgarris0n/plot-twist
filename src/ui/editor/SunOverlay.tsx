import type Konva from 'konva'
import { Shape } from 'react-konva'
import type { SunGrid } from '../../engine/shadow'
import type { Project } from '../../model/project'
import { bareSlopeStrength } from '../../engine/scene'
import { en } from '../../strings/en'
import { engine } from '../../worker/client'
import { useEngineResult } from './useEngineResult'

export type SunClass = 'full' | 'part' | 'shade'
export function sunClass(hours: number): SunClass {
  return hours >= 6 ? 'full' : hours >= 3 ? 'part' : 'shade'
}

export const SUN_COLORS: Record<SunClass, string> = { full: '#f6c026', part: '#fbe9a0', shade: '#6f86a8' }
export const SUN_OPACITY = 0.35

export type SunView = 'hours' | 'strength'

export type StrengthClass = 'more' | 'same' | 'less' | 'low'
/** Sun strength relative to an open flat spot: above 110% more, 90-110% same, 50-90% less, below 50% low. */
export function strengthClass(r: number): StrengthClass {
  return r > 1.1 ? 'more' : r >= 0.9 ? 'same' : r >= 0.5 ? 'less' : 'low'
}

export const STRENGTH_COLORS: Record<StrengthClass, string> = { more: '#b4400f', same: '#e8832a', less: '#f3c9a0', low: '#8a93a6' }

/** The legend's one-line effect of the slope alone, or null when the ground is flat or the location is unknown. */
export function slopeNoteOf(project: Project): string | null {
  const slope = project.slope
  if (!slope || slope.steepness === 'flat' || slope.facing === null) return null
  const r = bareSlopeStrength(project)
  if (r === null) return null
  const steep = en.overlay.steepWord[slope.steepness]
  const facing = en.overlay.facingWord[slope.facing]
  const pct = Math.round(Math.abs(r - 1) * 100)
  return pct === 0 ? en.overlay.slopeSame(steep, facing) : en.overlay.slopeGain(steep, facing, pct, r > 1)
}

const requestOverlay = (p: Project) => engine.overlay(p, p.settings.season, p.settings.year)

/** Request the sun grid for the current project/season/year (debounced, stale replies discarded). */
export function useSunGrid(project: Project | null, enabled: boolean): SunGrid | null {
  return useEngineResult(project, enabled && !!project?.location, 150, requestOverlay, null)
}

export function SunCells({ grid, view = 'hours' }: { grid: SunGrid; view?: SunView }) {
  return (
    <Shape
      listening={false}
      sceneFunc={(ctx: Konva.Context) => {
        const { cellM, cols, rows } = grid
        const values = view === 'strength' ? grid.strength : grid.hours
        const classes: string[] = view === 'strength' ? ['more', 'same', 'less', 'low'] : ['full', 'part', 'shade']
        const classOf = view === 'strength' ? strengthClass : sunClass
        const colors: Record<string, string> = view === 'strength' ? STRENGTH_COLORS : SUN_COLORS
        ctx.save()
        ctx.setAttr('globalAlpha', SUN_OPACITY)
        for (const cls of classes) {
          ctx.setAttr('fillStyle', colors[cls]!)
          ctx.beginPath()
          for (let r = 0; r < rows; r++) {
            for (let k = 0; k < cols; k++) {
              const v = values[r * cols + k]!
              if (Number.isNaN(v) || classOf(v) !== cls) continue
              ctx.rect(k * cellM, r * cellM, cellM, cellM)
            }
          }
          ctx.fill()
        }
        ctx.restore()
      }}
    />
  )
}

export function SunLegend({ cloudWarmPct, view, slopeNote }: { cloudWarmPct: number | null; view: SunView; slopeNote: string | null }) {
  const items: [string, string, string][] =
    view === 'strength'
      ? (['more', 'same', 'less', 'low'] as const).map((c) => [c, STRENGTH_COLORS[c], en.overlay.strength[c]])
      : [
          ['full', SUN_COLORS.full, en.overlay.full],
          ['part', SUN_COLORS.part, en.overlay.part],
          ['shade', SUN_COLORS.shade, en.overlay.shade],
        ]
  return (
    <ul className="sun-legend" aria-label={en.overlay.legendLabel}>
      {items.map(([cls, color, label]) => (
        <li key={cls}>
          <span className="swatch" style={{ background: color, opacity: SUN_OPACITY }} aria-hidden="true" /> {label}
        </li>
      ))}
      {view === 'strength' && <li className="hint">{en.overlay.strengthNote}</li>}
      {slopeNote !== null && <li className="hint">{slopeNote}</li>}
      {cloudWarmPct !== null && <li className="hint">{en.overlay.cloudNote(Math.round(cloudWarmPct))}</li>}
    </ul>
  )
}
