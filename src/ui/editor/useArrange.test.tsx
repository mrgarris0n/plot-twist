import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createProject, type PlacedPlant } from '../../model/project'
import { useStore } from '../../state/store'
import { en } from '../../strings/en'

const ghost: PlacedPlant = { id: 'ghost-1', plantId: 'white-clover', variantId: null, x: 1, y: 1, plantedYear: 0, heightOverrideM: null, widthOverrideM: null }
let reply: { resolve: (g: PlacedPlant[]) => void; reject: (e: unknown) => void }
const arrange = vi.fn(() => new Promise<PlacedPlant[]>((resolve, reject) => { reply = { resolve, reject } }))
vi.mock('../../worker/client', () => ({ engine: { arrange: () => arrange() } }))
import { useArrange } from './useArrange'

beforeEach(() => {
  arrange.mockClear()
  useStore.getState().openProject(createProject('Test'))
})

async function start() {
  const hook = renderHook(() => useArrange())
  let done!: Promise<void>
  act(() => { done = hook.result.current.run() })
  expect(hook.result.current.busy).toBe(true)
  return { hook, done }
}

describe('useArrange', () => {
  it('applies the result, also after a view change meanwhile', async () => {
    const { hook, done } = await start()
    act(() => { useStore.getState().setYear(5) })
    await act(async () => { reply.resolve([ghost]); await done })
    expect(useStore.getState().ghosts).toEqual([ghost])
    expect(hook.result.current.busy).toBe(false)
  })
  it('drops the result when the plan was edited meanwhile', async () => {
    const { done } = await start()
    act(() => { useStore.getState().placePlant('apple', { x: 2, y: 2 }) })
    await act(async () => { reply.resolve([ghost]); await done })
    expect(useStore.getState().ghosts).toEqual([])
  })
  it('shows the empty note until the plan changes', async () => {
    const { hook, done } = await start()
    await act(async () => { reply.resolve([]); await done })
    expect(hook.result.current.message).toBe(en.arrange.empty)
    act(() => { useStore.getState().placePlant('apple', { x: 2, y: 2 }) })
    expect(hook.result.current.message).toBeNull()
  })
  it('a worker failure shows a plain message and is logged', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { hook, done } = await start()
    await act(async () => { reply.reject(new Error('boom')); await done })
    expect(hook.result.current.message).toBe(en.arrange.failed)
    expect(hook.result.current.busy).toBe(false)
    expect(log).toHaveBeenCalled()
    log.mockRestore()
  })
})
