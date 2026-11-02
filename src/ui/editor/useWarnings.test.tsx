import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createProject } from '../../model/project'
import { useStore } from '../../state/store'

const analyze = vi.fn(async () => [])
vi.mock('../../worker/client', () => ({ engine: { analyze: (...a: unknown[]) => (analyze as (...x: unknown[]) => unknown)(...a) } }))
import { useWarnings } from './useWarnings'

beforeEach(() => {
  vi.useFakeTimers()
  analyze.mockClear()
  useStore.getState().openProject(createProject('Test'))
})
afterEach(() => vi.useRealTimers())

const settle = () => act(async () => { await vi.advanceTimersByTimeAsync(400) })

describe('useWarnings', () => {
  it('does not re-analyse on year/season/units changes and stays current', async () => {
    const { result } = renderHook(() => useWarnings(useStore((s) => s.project)))
    await settle()
    expect(analyze).toHaveBeenCalledTimes(1)
    act(() => { useStore.getState().setYear(5); useStore.getState().setSeason('autumn'); useStore.getState().setUnits('imperial') })
    expect(result.current.current).toBe(true)
    await settle()
    expect(analyze).toHaveBeenCalledTimes(1)
    expect(result.current.current).toBe(true)
  })
  it('re-analyses after a real edit', async () => {
    const { result } = renderHook(() => useWarnings(useStore((s) => s.project)))
    await settle()
    act(() => { useStore.getState().setNorth(45) })
    expect(result.current.current).toBe(false)
    await settle()
    expect(analyze).toHaveBeenCalledTimes(2)
    expect(result.current.current).toBe(true)
  })
  it('re-analyses on a year change in a veggie garden', async () => {
    const p = createProject('Veg')
    p.gardenType = 'veggie-beds'
    act(() => { useStore.getState().openProject(p) })
    const { result } = renderHook(() => useWarnings(useStore((s) => s.project)))
    await settle()
    const calls = analyze.mock.calls.length
    act(() => { useStore.getState().setYear(1) })
    expect(result.current.current).toBe(false)
    await settle()
    expect(analyze).toHaveBeenCalledTimes(calls + 1)
    expect(result.current.current).toBe(true)
  })
})
