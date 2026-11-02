import { fireEvent, render, screen } from '@testing-library/react'
import { act } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createProject } from '../model/project'
import { useStore } from '../state/store'
import { en } from '../strings/en'
import { SetupMenu } from './SetupMenu'

const ITEMS = ['location', 'plot', 'soil', 'gardenType', 'shadeObjects'] as const
const openMenu = (onOpen = () => {}) => {
  render(<SetupMenu onOpen={onOpen} onExpand={() => {}} />)
  fireEvent.click(screen.getByRole('button', { name: en.setup.progress(0, 5) }))
}

beforeEach(() => {
  useStore.getState().openProject(createProject('Test'))
})

describe('SetupMenu', () => {
  it('Escape closes the menu and puts focus back on the Setup button', () => {
    openMenu()
    screen.getByRole('button', { name: `${en.setup.plot} (${en.setup.todo})` }).focus()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('group', { name: en.setup.title })).toBeNull()
    expect(screen.getByRole('button', { name: en.setup.progress(0, 5) })).toHaveFocus()
  })

  it('shows progress and five unticked steps on a fresh project', () => {
    openMenu()
    for (const k of ITEMS) {
      expect(screen.getByRole('button', { name: `${en.setup[k]} (${en.setup.todo})` })).toBeInTheDocument()
    }
  })

  it('ticks location after setLocation and counts it', () => {
    openMenu()
    act(() => useStore.getState().setLocation({ lat: 47.5, lon: 19.04 }))
    expect(screen.getByRole('button', { name: `${en.setup.location} (${en.setup.done})` })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: en.setup.progress(1, 5) })).toBeInTheDocument()
  })

  it('opens a step on click and closes the menu', () => {
    const onOpen = vi.fn()
    openMenu(onOpen)
    fireEvent.click(screen.getByRole('button', { name: `${en.setup.soil} (${en.setup.todo})` }))
    expect(onOpen).toHaveBeenCalledWith('soil')
    expect(screen.queryByRole('group', { name: en.setup.title })).toBeNull()
  })

  it('shows a tick instead of a count once every step is done', () => {
    render(<SetupMenu onOpen={() => {}} onExpand={() => {}} />)
    act(() => {
      const s = useStore.getState()
      s.setLocation({ lat: 1, lon: 1 })
      s.setPlot({ kind: 'rect', widthM: 10, lengthM: 10 })
      s.setSoil({ source: 'manual', phMin: null, phMax: null, texture: null, drainage: null })
      s.setGardenType('food-forest')
      s.confirmShadeObjects()
    })
    fireEvent.click(screen.getByRole('button', { name: en.setup.button }))
    expect(screen.getAllByRole('button', { name: new RegExp(`\\(${en.setup.done}\\)$`) })).toHaveLength(5)
  })
})
