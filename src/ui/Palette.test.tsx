import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, expect, it, vi } from 'vitest'
import { library, plantName } from '../data/library'
import { createProject } from '../model/project'
import { useStore } from '../state/store'
import { en } from '../strings/en'
import { Palette } from './Palette'

const open = (gardenType: 'food-forest' | 'veggie-beds') => {
  const p = createProject('t')
  p.gardenType = gardenType
  useStore.getState().openProject(p)
}
const apple = () => plantName(library.byId.get('apple')!)
beforeEach(() => { useStore.getState().openProject(createProject('t')) })

it('veggie palette hides trees until toggled', () => {
  open('veggie-beds')
  render(<Palette readOnly={false} onClose={() => {}} />)
  fireEvent.click(screen.getByLabelText(en.palette.onlyFitting)) // show everything, regardless of fit
  expect(screen.queryByText(apple())).toBeNull()
  fireEvent.click(screen.getByLabelText(en.palette.showWoody))
  expect(screen.getByText(apple())).toBeInTheDocument()
})

it('food forest palette is unchanged: trees listed, no toggle', () => {
  open('food-forest')
  render(<Palette readOnly={false} onClose={() => {}} />)
  fireEvent.click(screen.getByLabelText(en.palette.onlyFitting))
  expect(screen.getByText(apple())).toBeInTheDocument()
  expect(screen.queryByLabelText(en.palette.showWoody)).toBeNull()
})

it('layer tabs show one layer at a time', () => {
  open('food-forest')
  render(<Palette readOnly={false} onClose={() => {}} />)
  fireEvent.click(screen.getByLabelText(en.palette.onlyFitting))
  fireEvent.click(screen.getByRole('tab', { name: en.layers.shrub }))
  expect(screen.getByRole('tab', { name: en.layers.shrub })).toHaveAttribute('aria-selected', 'true')
  expect(screen.queryByText(apple())).toBeNull()
  fireEvent.click(screen.getByRole('tab', { name: en.layers.canopy }))
  expect(screen.getByText(apple())).toBeInTheDocument()
})

it('closes with the close button and with Escape', () => {
  const onClose = vi.fn()
  render(<Palette readOnly={false} onClose={onClose} />)
  fireEvent.click(screen.getByRole('button', { name: en.contents.close }))
  fireEvent.keyDown(window, { key: 'Escape' })
  expect(onClose).toHaveBeenCalledTimes(2)
})
