import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { library } from '../data/library'
import type { PlacedPlant, ShadeObject } from '../model/project'
import { en } from '../strings/en'
import { GardenContents } from './GardenContents'

const rec = library.all[0]!
const plant = { id: 'p1', plantId: rec.id, x: 2, y: 3 } as PlacedPlant
const shed = { id: 's1', kind: 'shed', x: 5, y: 5, widthM: 2, lengthM: 2, rotationDeg: 0, heightM: 2, canopy: null } as ShadeObject

describe('GardenContents', () => {
  it('lists plants and objects and picks the clicked one', () => {
    const onPick = vi.fn()
    render(<GardenContents plants={[plant]} objects={[shed]} selectedId="s1" onPick={onPick} onClose={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: rec.commonNames[0] }))
    expect(onPick).toHaveBeenCalledWith(plant)
    const shedButton = screen.getByRole('button', { name: en.editor.kind.shed })
    expect(shedButton).toHaveAttribute('aria-current', 'true')
    fireEvent.click(shedButton)
    expect(onPick).toHaveBeenCalledWith(shed)
  })

  it('says so when the garden is empty', () => {
    render(<GardenContents plants={[]} objects={[]} selectedId={null} onPick={() => {}} onClose={() => {}} />)
    expect(screen.getByText(en.contents.empty)).toBeInTheDocument()
  })
})

it('Escape closes the contents list', () => {
  const onClose = vi.fn()
  render(<GardenContents plants={[]} objects={[]} selectedId={null} onPick={() => {}} onClose={onClose} />)
  fireEvent.keyDown(window, { key: 'Escape' })
  expect(onClose).toHaveBeenCalledOnce()
})
