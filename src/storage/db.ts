import { del, entries, get, set } from 'idb-keyval'
import { create } from 'zustand'

import { projectSchema, type Project } from '../model/project'
import { useStore } from '../state/store'

const PREFIX = 'project:'
const AUTOSAVE_MS = 500
const key = (id: string) => `${PREFIX}${id}`

/** True when saving to this browser has failed (private mode, storage blocked). */
export const useStorageStatus = create<{ unavailable: boolean }>()(() => ({ unavailable: false }))
const setUnavailable = (unavailable: boolean) => useStorageStatus.setState({ unavailable })

export async function saveProject(p: Project): Promise<void> {
  await set(key(p.id), p)
}

export async function loadProject(id: string): Promise<Project | null> {
  const parsed = projectSchema.safeParse(await get(key(id)))
  return parsed.success ? parsed.data : null
}

export async function listProjects(): Promise<{ id: string; name: string; updatedAt: string }[]> {
  const all = await entries()
  const out: { id: string; name: string; updatedAt: string }[] = []
  for (const [k, v] of all) {
    if (typeof k !== 'string' || !k.startsWith(PREFIX)) continue
    const parsed = projectSchema.safeParse(v)
    if (parsed.success) out.push({ id: parsed.data.id, name: parsed.data.name, updatedAt: parsed.data.updatedAt })
  }
  return out.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : a.updatedAt > b.updatedAt ? -1 : 0))
}

export async function deleteProject(id: string): Promise<void> {
  await del(key(id))
}

/** Probe once at startup; sets the storage banner flag on failure. */
export async function probeStorage(): Promise<boolean> {
  try {
    await set('probe', 1)
    const ok = (await get('probe')) === 1
    await del('probe')
    setUnavailable(!ok)
    return ok
  } catch (e) {
    console.error('IndexedDB unavailable', e)
    setUnavailable(true)
    return false
  }
}

/** Save the open project (debounced) whenever it changes; flushes on pagehide, when the tab is hidden, when switching away and on stop. */
export function startAutosave(): () => void {
  let pending: Project | null = null
  let timer: ReturnType<typeof setTimeout> | undefined

  const flush = () => {
    if (timer !== undefined) clearTimeout(timer)
    timer = undefined
    const p = pending
    pending = null
    if (!p) return
    saveProject(p).then(
      () => setUnavailable(false),
      (e) => {
        console.error('Autosave failed', e)
        setUnavailable(true)
      },
    )
  }

  const unsubscribe = useStore.subscribe((state, prev) => {
    if (state.project === prev.project) return
    if (pending && state.project?.id !== pending.id) flush()
    if (!state.project) return
    pending = state.project
    if (timer !== undefined) clearTimeout(timer)
    timer = setTimeout(flush, AUTOSAVE_MS)
  })
  // Mobile browsers may discard a hidden tab without firing pagehide.
  const onVisibility = () => { if (document.visibilityState === 'hidden') flush() }
  window.addEventListener('pagehide', flush)
  document.addEventListener('visibilitychange', onVisibility)

  return () => {
    unsubscribe()
    window.removeEventListener('pagehide', flush)
    document.removeEventListener('visibilitychange', onVisibility)
    flush()
  }
}
