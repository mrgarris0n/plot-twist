import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createProject } from '../model/project'
import { useStore } from '../state/store'
import { en } from '../strings/en'
import { AddMenu } from './AddMenu'

/** A garden with every setup step done, so plants can be added. */
const ready = (gardenType: 'food-forest' | 'veggie-beds') => {
  const p = createProject('t')
  Object.assign(p, { gardenType, location: { lat: 47.5, lon: 19 }, plotConfirmed: true, shadeObjectsConfirmed: true })
  p.soil = { source: 'manual', phMin: null, phMax: null, texture: null, drainage: null }
  return p
}
const open = (gardenType: 'food-forest' | 'veggie-beds', onPlants = () => {}, onExpand = () => {}, p = ready(gardenType)) => {
  useStore.getState().openProject(p)
  render(<AddMenu readOnly={false} onPlants={onPlants} onExpand={onExpand} />)
  fireEvent.click(screen.getByRole('button', { name: en.editor.addMenu }))
}
beforeEach(() => { useStore.getState().openProject(createProject('t')) })

describe('AddMenu', () => {
  it('lists only Plants and Objects until Objects is opened', () => {
    open('food-forest')
    const items = [...screen.getByRole('group', { name: en.editor.addMenu }).querySelectorAll('button')].map((b) => b.textContent?.trim())
    expect(items).toEqual([en.palette.title, en.editor.objects])
    fireEvent.click(screen.getByRole('button', { name: en.editor.objects }))
    expect(screen.getByRole('group', { name: en.editor.objects })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: en.editor.add.house })).toBeInTheDocument()
  })
  it('add menu offers Raised bed in veggie gardens only', () => {
    open('food-forest')
    fireEvent.click(screen.getByRole('button', { name: en.editor.objects }))
    expect(screen.queryByRole('button', { name: en.editor.add.bed })).toBeNull()
  })
  it('offers Raised bed in a veggie garden and adds one', () => {
    open('veggie-beds')
    fireEvent.click(screen.getByRole('button', { name: en.editor.objects }))
    fireEvent.click(screen.getByRole('button', { name: en.editor.add.bed }))
    expect(useStore.getState().project!.shadeObjects.map((o) => o.kind)).toEqual(['bed'])
  })
  it('offers Plants first, which opens the plant sheet and closes the menu', () => {
    const onPlants = vi.fn()
    open('food-forest', onPlants)
    const items = screen.getByRole('group', { name: en.editor.addMenu }).querySelectorAll('button')
    expect(items[0]).toHaveTextContent(en.palette.title)
    fireEvent.click(items[0]!)
    expect(onPlants).toHaveBeenCalledOnce()
    expect(screen.queryByRole('group', { name: en.editor.addMenu })).toBeNull()
  })
  it('opening the menu asks for the side drawer to close', () => {
    const onExpand = vi.fn()
    open('food-forest', () => {}, onExpand)
    expect(onExpand).toHaveBeenCalledOnce()
  })
  it('Plants is disabled until the setup is finished', () => {
    const p = createProject('t')
    p.gardenType = 'food-forest'
    open('food-forest', () => {}, () => {}, p)
    expect(screen.getByRole('button', { name: en.palette.title })).toBeDisabled()
    expect(screen.getByRole('button', { name: en.editor.objects })).toBeEnabled()
  })
})
