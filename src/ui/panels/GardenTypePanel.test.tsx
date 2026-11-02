import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, expect, it } from 'vitest'
import { createProject } from '../../model/project'
import { useStore } from '../../state/store'
import { en } from '../../strings/en'
import { GardenTypePanel } from './GardenTypePanel'

beforeEach(() => {
  useStore.getState().openProject(createProject('t'))
})

it('veggie beds can be chosen', () => {
  render(<GardenTypePanel />)
  const veg = screen.getByRole('radio', { name: new RegExp(en.gardenType.vegBeds) })
  expect(veg).toBeEnabled()
  expect(screen.getByText(en.gardenType.vegBedsHint)).toBeInTheDocument()
  fireEvent.click(veg)
  expect(useStore.getState().project!.gardenType).toBe('veggie-beds')
  expect(veg).toHaveAttribute('aria-checked', 'true')
  expect(screen.getByRole('radio', { name: new RegExp(en.gardenType.orchard) })).toBeDisabled()
})
