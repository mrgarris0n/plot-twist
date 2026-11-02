import { afterEach, describe, expect, it, vi } from 'vitest'
import { set } from 'idb-keyval'

import { createProject } from '../model/project'
import { useStore } from '../state/store'
import { deleteProject, listProjects, loadProject, saveProject, startAutosave } from './db'

afterEach(() => {
  vi.useRealTimers()
  useStore.getState().closeProject()
})

describe('storage', () => {
  it('round-trips a project', async () => {
    const p = createProject('Round trip')
    await saveProject(p)
    expect(await loadProject(p.id)).toEqual(p)
  })

  it('lists newest first and deletes', async () => {
    const a = { ...createProject('Old'), updatedAt: '2020-01-01T00:00:00.000Z' }
    const b = { ...createProject('New'), updatedAt: '2030-01-01T00:00:00.000Z' }
    await saveProject(a)
    await saveProject(b)
    const names = (await listProjects()).map((x) => x.name).filter((n) => n === 'Old' || n === 'New')
    expect(names).toEqual(['New', 'Old'])
    await deleteProject(b.id)
    expect(await loadProject(b.id)).toBeNull()
    expect((await listProjects()).some((x) => x.id === b.id)).toBe(false)
  })

  it('treats corrupted values as missing', async () => {
    await set('project:bad', { nonsense: true })
    expect(await loadProject('bad')).toBeNull()
    expect((await listProjects()).some((x) => x.id === 'bad')).toBe(false)
  })

  it('autosaves once, debounced, for rapid updates', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    const stop = startAutosave()
    const p = createProject('Auto')
    useStore.getState().openProject(p)
    useStore.getState().setLocation({ lat: 1, lon: 2 })
    useStore.getState().setNorth(10)
    useStore.getState().setNorth(20)
    await vi.advanceTimersByTimeAsync(400)
    expect(await loadProject(p.id)).toBeNull()
    await vi.advanceTimersByTimeAsync(200)
    vi.useRealTimers()
    await vi.waitFor(async () => expect((await loadProject(p.id))?.northDeg).toBe(20))
    stop()
  })

  it('flushes the pending save when the project is closed', async () => {
    const stop = startAutosave()
    const p = createProject('Flush')
    useStore.getState().openProject(p)
    useStore.getState().setNorth(30)
    useStore.getState().closeProject()
    await vi.waitFor(async () => expect((await loadProject(p.id))?.northDeg).toBe(30))
    stop()
  })

  it('flushes the pending save when stopped and when the tab is hidden', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    let stop = startAutosave()
    const p = createProject('Stop')
    useStore.getState().openProject(p)
    useStore.getState().setNorth(40)
    stop()
    vi.useRealTimers()
    await vi.waitFor(async () => expect((await loadProject(p.id))?.northDeg).toBe(40))

    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    stop = startAutosave()
    useStore.getState().setNorth(50)
    const hidden = vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden')
    document.dispatchEvent(new Event('visibilitychange'))
    hidden.mockRestore()
    vi.useRealTimers()
    await vi.waitFor(async () => expect((await loadProject(p.id))?.northDeg).toBe(50))
    stop()
  })
})
