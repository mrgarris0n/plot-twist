import { renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { createProject } from '../model/project'
import { resetClimateCache } from '../services/climate'
import { useStore } from '../state/store'
import { useClimateRefresh } from './useClimateRefresh'

function oneCell(): ArrayBuffer {
  const buf = new ArrayBuffer(28)
  const dv = new DataView(buf)
  'TGCL'.split('').forEach((c, i) => dv.setUint8(i, c.charCodeAt(0)))
  dv.setUint16(4, 2, true); dv.setUint16(6, 1, true); dv.setUint16(8, 1, true); dv.setFloat32(10, 180, true)
  dv.setInt16(16, -153, true); dv.setInt16(18, 105, true); dv.setInt16(20, 300, true)
  dv.setInt16(22, 640, true); dv.setInt16(24, 310, true); dv.setInt16(26, 72, true)
  return buf
}

const oldLookup = { source: 'lookup' as const, minWinterC: -5, lastFrostDoy: 100, firstFrostDoy: 300, frostFree: false }

function open(climate: Parameters<ReturnType<typeof useStore.getState>['setClimate']>[0]) {
  const p = createProject('T')
  p.location = { lat: 47.5, lon: 19.04 }
  p.climate = climate
  useStore.getState().openProject(p)
}

beforeEach(() => resetClimateCache())
afterEach(() => vi.unstubAllGlobals())

it('gives an old looked-up climate its rain values when the project opens', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => new Response(oneCell())))
  open(oldLookup)
  renderHook(() => useClimateRefresh())
  await waitFor(() => expect(useStore.getState().project?.climate).toMatchObject({ source: 'lookup', minWinterC: -15.3, rainYearMm: 640, rainWarmMm: 310, cloudWarmPct: 72 }))
})

it('leaves a manual climate alone', async () => {
  const f = vi.fn(async () => new Response(oneCell()))
  vi.stubGlobal('fetch', f)
  open({ ...oldLookup, source: 'manual' })
  renderHook(() => useClimateRefresh())
  await new Promise((r) => setTimeout(r, 20))
  expect(f).not.toHaveBeenCalled()
  expect(useStore.getState().project?.climate).toMatchObject({ source: 'manual', minWinterC: -5 })
})

it('keeps the climate when the fetch fails, and does not try again', async () => {
  const f = vi.fn(async () => new Response('', { status: 404 }))
  vi.stubGlobal('fetch', f)
  open(oldLookup)
  const { rerender } = renderHook(() => useClimateRefresh())
  await waitFor(() => expect(f).toHaveBeenCalledTimes(1))
  rerender()
  await new Promise((r) => setTimeout(r, 20))
  expect(f).toHaveBeenCalledTimes(1)
  expect(useStore.getState().project?.climate).toMatchObject({ source: 'lookup', minWinterC: -5 })
})

it('does not look up a lookup climate that already has rain', async () => {
  const f = vi.fn(async () => new Response(oneCell()))
  vi.stubGlobal('fetch', f)
  open({ ...oldLookup, rainYearMm: 500, rainWarmMm: 200, cloudWarmPct: 30 })
  renderHook(() => useClimateRefresh())
  await new Promise((r) => setTimeout(r, 20))
  expect(f).not.toHaveBeenCalled()
})
