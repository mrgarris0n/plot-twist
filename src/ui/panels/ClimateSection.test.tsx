import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { createProject } from '../../model/project'
import { resetClimateCache } from '../../services/climate'
import { useStore } from '../../state/store'
import { en } from '../../strings/en'
import { ClimateSection } from './ClimateSection'

// 1x1 grid, res 180 deg: one land cell, -15.3 C, last frost doy 105, first frost doy 300.
function oneCell(): ArrayBuffer {
  const buf = new ArrayBuffer(28)
  const dv = new DataView(buf)
  'TGCL'.split('').forEach((c, i) => dv.setUint8(i, c.charCodeAt(0)))
  dv.setUint16(4, 2, true); dv.setUint16(6, 1, true); dv.setUint16(8, 1, true); dv.setFloat32(10, 180, true)
  dv.setInt16(16, -153, true); dv.setInt16(18, 105, true); dv.setInt16(20, 300, true)
  dv.setInt16(22, 640, true); dv.setInt16(24, 310, true); dv.setInt16(26, 72, true)
  return buf
}

beforeEach(() => {
  resetClimateCache()
  const p = createProject('T')
  p.location = { lat: 47.5, lon: 19.04 }
  useStore.getState().openProject(p)
})
afterEach(() => vi.unstubAllGlobals())

it('fills climate from the grid and words it plainly', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => new Response(oneCell())))
  render(<ClimateSection />)
  expect(await screen.findByText('Coldest winter nights: about −15 °C')).toBeInTheDocument()
  expect(screen.getByText('Last spring frost: usually mid April')).toBeInTheDocument()
  expect(screen.getByText('First autumn frost: usually late October')).toBeInTheDocument()
  expect(useStore.getState().project?.climate).toMatchObject({ source: 'lookup', minWinterC: -15.3 })
})

it('shows rain and cloud lines from a looked-up climate', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => new Response(oneCell())))
  render(<ClimateSection />)
  expect(await screen.findByText(/^Rain: about \d+ mm a year, \d+ mm of it in the growing season$/)).toBeInTheDocument()
  expect(screen.getByText(/^Clouds block about \d+% of the sunshine in the growing season$/)).toBeInTheDocument()
})

it('asks for manual values when the grid is missing', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => new Response('', { status: 404 })))
  render(<ClimateSection />)
  expect(await screen.findByText(en.climate.lookupFailed)).toBeInTheDocument()
  fireEvent.change(screen.getByLabelText(new RegExp(en.climate.winterLowLabel)), { target: { value: '-12' } })
  await waitFor(() => expect(useStore.getState().project?.climate).toMatchObject({ source: 'manual', minWinterC: -12 }))
  fireEvent.change(screen.getByLabelText(`${en.climate.lastFrostLabel}: ${en.climate.monthLabel}`), { target: { value: '3' } })
  await waitFor(() => expect(useStore.getState().project?.climate?.lastFrostDoy).toBe(105)) // mid April
})

it('never overwrites a manual climate with a lookup', async () => {
  const fetchMock = vi.fn(async () => new Response(oneCell()))
  vi.stubGlobal('fetch', fetchMock)
  useStore.getState().setClimate({ source: 'manual', minWinterC: -5, lastFrostDoy: 90, firstFrostDoy: 310, frostFree: false })
  render(<ClimateSection />)
  expect(await screen.findByText('Coldest winter nights: about −5 °C')).toBeInTheDocument()
  expect(fetchMock).not.toHaveBeenCalled()
  expect(useStore.getState().project?.climate?.source).toBe('manual')
})

it('Edit turns a looked-up climate into a manual one', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => new Response(oneCell())))
  render(<ClimateSection />)
  fireEvent.click(await screen.findByText(en.climate.edit))
  fireEvent.change(screen.getByLabelText(new RegExp(en.climate.winterLowLabel)), { target: { value: '-8' } })
  await waitFor(() => expect(useStore.getState().project?.climate).toMatchObject({ source: 'manual', minWinterC: -8, lastFrostDoy: 105 }))
})

it('drops the old place climate when the new place has no lookup', async () => {
  const fetchMock = vi.fn()
    .mockResolvedValueOnce(new Response(oneCell()))
    .mockResolvedValue(new Response('', { status: 404 }))
  vi.stubGlobal('fetch', fetchMock)
  render(<ClimateSection />)
  expect(await screen.findByText('Coldest winter nights: about −15 °C')).toBeInTheDocument()
  resetClimateCache() // simulate the file failing on the next load
  act(() => useStore.getState().setLocation({ lat: -33, lon: 151 }))
  expect(await screen.findByText(en.climate.lookupFailed)).toBeInTheDocument()
  expect(useStore.getState().project?.climate).toBeNull()
  expect(screen.queryByText(/Coldest winter nights: about/)).toBeNull()
})

it('says rain is not known for a manual climate without it', () => {
  useStore.getState().setClimate({ source: 'manual', minWinterC: -10, lastFrostDoy: null, firstFrostDoy: null, frostFree: false, rainYearMm: null, rainWarmMm: null, cloudWarmPct: null })
  render(<ClimateSection />)
  expect(screen.getByText(en.climate.rainUnknown)).toBeInTheDocument()
})

it('an old looked-up climate without rain does not say "not known" while the refresh runs', async () => {
  let answer: (r: Response) => void = () => {}
  vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>((r) => { answer = r })))
  useStore.getState().setClimate({ source: 'lookup', minWinterC: -10, lastFrostDoy: null, firstFrostDoy: null, frostFree: false })
  render(<ClimateSection />)
  expect(screen.queryByText(en.climate.rainUnknown)).toBeNull()
  await act(async () => answer(new Response('', { status: 404 })))
  expect(await screen.findByText(en.climate.rainUnknown)).toBeInTheDocument()
})

it('keeps the data credit for looked-up rain after a manual edit', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => new Response(oneCell())))
  render(<ClimateSection />)
  fireEvent.click(await screen.findByText(en.climate.edit))
  fireEvent.change(screen.getByLabelText(new RegExp(en.climate.winterLowLabel)), { target: { value: '-8' } })
  await waitFor(() => expect(useStore.getState().project?.climate?.source).toBe('manual'))
  expect(screen.getByText(en.credits.climate)).toBeInTheDocument()
  expect(screen.queryByText(en.climate.typical)).toBeNull()
})
