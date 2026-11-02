import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, expect, it } from 'vitest'
import { createProject } from '../../model/project'
import { useDraft } from '../../state/polygonDraft'
import { useStore } from '../../state/store'
import { en } from '../../strings/en'
import { PlotPanel } from './PlotPanel'

beforeEach(() => {
  const p = createProject('T')
  p.location = { lat: 47.5, lon: 19.04 }
  useStore.getState().openProject(p)
})

it('shows Flat selected for an old project', () => {
  render(<PlotPanel readOnly={false} />)
  expect(screen.getByRole('radio', { name: en.plot.steepness.flat })).toHaveAttribute('aria-checked', 'true')
  expect(screen.queryByRole('radiogroup', { name: en.plot.facingLabel })).not.toBeInTheDocument()
})

it('choosing Strong shows the compass with South checked', () => {
  render(<PlotPanel readOnly={false} />)
  fireEvent.click(screen.getByRole('radio', { name: en.plot.steepness.strong }))
  expect(screen.getByRole('radio', { name: en.plot.steepness.strong })).toHaveAttribute('aria-checked', 'true')
  expect(screen.getByRole('radio', { name: en.plot.facing.S })).toHaveAttribute('aria-checked', 'true')
  expect(screen.getByRole('radio', { name: en.plot.facing.N })).toHaveAttribute('aria-checked', 'false')
})

it('choosing North-east updates the store', () => {
  render(<PlotPanel readOnly={false} />)
  fireEvent.click(screen.getByRole('radio', { name: en.plot.steepness.gentle }))
  fireEvent.click(screen.getByRole('radio', { name: en.plot.facing.NE }))
  expect(useStore.getState().project?.slope).toEqual({ steepness: 'gentle', facing: 'NE' })
})

it('choosing Flat hides the compass', () => {
  render(<PlotPanel readOnly={false} />)
  fireEvent.click(screen.getByRole('radio', { name: en.plot.steepness.moderate }))
  fireEvent.click(screen.getByRole('radio', { name: en.plot.steepness.flat }))
  expect(screen.queryByRole('radiogroup', { name: en.plot.facingLabel })).not.toBeInTheDocument()
  expect(useStore.getState().project?.slope).toEqual({ steepness: 'flat', facing: null })
})

it('read-only disables the slope controls', () => {
  useStore.getState().setSlope('strong')
  render(<PlotPanel readOnly />)
  expect(screen.getByRole('radio', { name: en.plot.steepness.flat })).toBeDisabled()
  expect(screen.getByRole('radio', { name: en.plot.facing.E })).toBeDisabled()
})

it('drops the outline being drawn when the panel closes', () => {
  const { unmount } = render(<PlotPanel readOnly={false} />)
  fireEvent.click(screen.getByRole('button', { name: en.plot.drawShape }))
  expect(useDraft.getState().draft).not.toBeNull()
  unmount()
  expect(useDraft.getState().draft).toBeNull()
})

it('drops the outline being drawn when another garden opens', () => {
  render(<PlotPanel readOnly={false} />)
  fireEvent.click(screen.getByRole('button', { name: en.plot.drawShape }))
  act(() => useStore.getState().openProject(createProject('Other')))
  expect(useDraft.getState().draft).toBeNull()
})

it('arrow keys go round the compass clockwise and set the facing', () => {
  render(<PlotPanel readOnly={false} />)
  fireEvent.click(screen.getByRole('radio', { name: en.plot.steepness.strong }))
  const s = screen.getByRole('radio', { name: en.plot.facing.S })
  expect(s).toHaveAttribute('tabindex', '0')
  s.focus()
  fireEvent.keyDown(s, { key: 'ArrowRight' })
  expect(screen.getByRole('radio', { name: en.plot.facing.SW })).toHaveFocus()
  expect(useStore.getState().project?.slope?.facing).toBe('SW')
})

it('arrow keys change the steepness', () => {
  render(<PlotPanel readOnly={false} />)
  const flat = screen.getByRole('radio', { name: en.plot.steepness.flat })
  flat.focus()
  fireEvent.keyDown(flat, { key: 'ArrowDown' })
  expect(useStore.getState().project?.slope?.steepness).toBe('gentle')
  expect(screen.getByRole('radio', { name: en.plot.steepness.gentle })).toHaveFocus()
})
