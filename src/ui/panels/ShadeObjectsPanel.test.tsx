import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import { createProject } from '../../model/project'
import { useStore } from '../../state/store'
import { en } from '../../strings/en'
import { ShadeObjectsPanel } from './ShadeObjectsPanel'

const show = (gardenType: 'food-forest' | 'veggie-beds') => {
  const p = createProject('t')
  p.gardenType = gardenType
  useStore.getState().openProject(p)
  render(<ShadeObjectsPanel readOnly={false} />)
}

it('drawer offers the bed under Beds in a veggie garden', () => {
  show('veggie-beds')
  expect(screen.getByRole('heading', { name: en.shadeObjects.beds })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: en.editor.add.bed })).toBeInTheDocument()
})

it('drawer has no beds in a food forest', () => {
  show('food-forest')
  expect(screen.queryByRole('heading', { name: en.shadeObjects.beds })).toBeNull()
  expect(screen.queryByRole('button', { name: en.editor.add.bed })).toBeNull()
})
