import { useState } from 'react'
import type { Project } from '../../model/project'
import { useStore } from '../../state/store'
import { en } from '../../strings/en'
import { engine } from '../../worker/client'
import { useLangCarriedState } from '../useLangCarried'

/** update() clones the whole project, so a shared plants array means no content edit since (view changes keep it). */
const sameContent = (a: Project | null, b: Project) => a !== null && a.id === b.id && a.plants === b.plants

/**
 * Runs Auto-arrange in the worker and hands the result to the store as ghosts. A result for a plan that has been
 * edited (or switched) meanwhile is dropped. `message` is the plain note to show, only while the plan is unchanged.
 */
export function useArrange(): { busy: boolean; message: string | null; run: () => Promise<void> } {
  const project = useStore((s) => s.project)
  const [busy, setBusy] = useState(false)
  // Which note, not its text, so it rewords itself after a language switch.
  const [note, setNote] = useLangCarriedState<{ kind: 'empty' | 'failed'; forProject: Project } | null>('arrange.note', null)
  const run = async () => {
    const arranged = useStore.getState().project
    if (!arranged || busy) return
    setBusy(true)
    setNote(null)
    try {
      const ghosts = await engine.arrange(arranged)
      const now = useStore.getState().project
      if (!sameContent(now, arranged)) return
      useStore.getState().setGhosts(ghosts)
      if (ghosts.length === 0) setNote({ kind: 'empty', forProject: now! })
    } catch (err) {
      console.error('Auto-arrange failed', err)
      setNote({ kind: 'failed', forProject: arranged })
    } finally {
      setBusy(false)
    }
  }
  const message = note && sameContent(project, note.forProject) ? en.arrange[note.kind] : null
  return { busy, message, run }
}
