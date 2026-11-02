import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { createProject } from '../../model/project'
import { useStore } from '../../state/store'
import { en } from '../../strings/en'
import { SoilPanel } from './SoilPanel'

beforeEach(() => {
  const p = createProject('T')
  p.location = { lat: 47.5, lon: 19.04 }
  useStore.getState().openProject(p)
})
afterEach(() => vi.unstubAllGlobals())

it('looks up, offers the result and stores it on Use this', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => Response.json({ available: true, ph: 6.4, sandPct: 40, siltPct: 40, clayPct: 20 })))
  render(<SoilPanel />)
  expect(screen.getByText(en.soil.looking)).toBeInTheDocument()
  fireEvent.click(await screen.findByText(en.soil.use))
  expect(useStore.getState().project?.soil).toMatchObject({ source: 'lookup', texture: 'loamy' })
})

it('falls back to manual choices when lookup fails', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('offline') }))
  render(<SoilPanel />)
  expect(await screen.findByText(en.soil.lookupFailed)).toBeInTheDocument()
  fireEvent.click(screen.getByRole('radio', { name: en.soil.texture.clay }))
  fireEvent.click(screen.getByRole('radio', { name: en.soil.acidity.acidic }))
  await waitFor(() => expect(useStore.getState().project?.soil).toMatchObject({ source: 'manual', texture: 'clay', phMin: 4.5, phMax: 6.0 }))
})

it('drops the old suggestion as soon as the pin moves', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => Response.json({ available: true, ph: 6.4, sandPct: 40, siltPct: 40, clayPct: 20 })))
  render(<SoilPanel />)
  await screen.findByText(en.soil.use)
  vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})))
  act(() => useStore.getState().setLocation({ lat: 10, lon: 10 }))
  expect(screen.queryByText(en.soil.use)).not.toBeInTheDocument()
  expect(screen.getByText(en.soil.looking)).toBeInTheDocument()
})

it('keeps looked-up soil when the already-chosen texture is clicked again', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => Response.json({ available: true, ph: 6.4, sandPct: 40, siltPct: 40, clayPct: 20 })))
  render(<SoilPanel />)
  fireEvent.click(await screen.findByText(en.soil.use))
  fireEvent.click(screen.getByRole('radio', { name: en.soil.texture.loamy }))
  expect(useStore.getState().project?.soil).toMatchObject({ source: 'lookup', texture: 'loamy' })
  fireEvent.click(screen.getByRole('radio', { name: en.soil.texture.clay }))
  expect(useStore.getState().project?.soil).toMatchObject({ source: 'manual', texture: 'clay' })
})
