import { useState } from 'react'
import type { Warning } from '../../engine/checks/types'
import type { Project } from '../../model/project'
import { engine } from '../../worker/client'
import { useEngineResultFor } from './useEngineResult'

const NONE: Warning[] = []
const requestAnalyze = (p: Project) => engine.analyze(p)

/** Current warnings and hints, refreshed 300 ms after the last change. `current` is false while the result predates the latest edit. */
export function useWarnings(project: Project | null): { warnings: Warning[]; current: boolean } {
  const stable = useStableAcrossView(project)
  const { value, forProject } = useEngineResultFor(stable, stable !== null, 300, requestAnalyze, NONE)
  return { warnings: value, current: forProject === stable }
}

/** True when only view settings (settings.*) differ: every other top-level reference is identical. */
function onlyViewDiffers(a: Project, b: Project): boolean {
  // A veggie garden's checks depend on the viewed year, so a year change is a real change there.
  if (a.gardenType === 'veggie-beds' && a.settings.year !== b.settings.year) return false
  return (Object.keys(a) as (keyof Project)[]).every((k) => k === 'settings' || a[k] === b[k]) && Object.keys(a).length === Object.keys(b).length
}

/** Warnings evaluate every year, so view-only changes keep the previous project object (no re-analysis). */
function useStableAcrossView(project: Project | null): Project | null {
  const [base, setBase] = useState(project)
  const same = project !== null && base !== null && onlyViewDiffers(project, base)
  if (project !== base && !same) setBase(project)
  return same ? base : project
}
