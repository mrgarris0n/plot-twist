import { fireEvent, render, screen } from '@testing-library/react'
import { act } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createProject } from '../model/project'
import { useStore } from '../state/store'
import { en } from '../strings/en'

vi.mock('./editor/EditorCanvas', () => ({
  EditorCanvas: ({ readOnly, onOpenSetup }: { readOnly: boolean; onOpenSetup: (item: 'soil') => void }) => (
    <div data-testid="canvas" data-readonly={String(readOnly)}>
      <button type="button" onClick={() => onOpenSetup('soil')}>open soil</button>
    </div>
  ),
}))
import EditorPage from './EditorPage'

function mockPhone(matches: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches, media: query, addEventListener: vi.fn(), removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia
}

beforeEach(() => {
  useStore.getState().openProject(createProject('Test'))
})
afterEach(() => { vi.restoreAllMocks() })

describe('EditorPage phone view', () => {
  it('shows the banner, makes the canvas read-only and opens no setup step', () => {
    mockPhone(true)
    render(<EditorPage />)
    expect(screen.getByText(en.phone.readOnly)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'open soil' }))
    expect(screen.queryByRole('region', { name: en.setup.soil })).toBeNull()
    expect(screen.getByTestId('canvas')).toHaveAttribute('data-readonly', 'true')
  })

  it('no banner on a wide screen; a setup step picked in the bar opens its drawer', () => {
    mockPhone(false)
    render(<EditorPage />)
    expect(screen.queryByText(en.phone.readOnly)).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'open soil' }))
    expect(screen.getByRole('region', { name: en.setup.soil })).toBeInTheDocument()
    expect(screen.getByTestId('canvas')).toHaveAttribute('data-readonly', 'false')
  })
})

describe('setup step footer', () => {
  it('Next walks the steps in order and Finish on the last one closes the drawer', () => {
    mockPhone(false)
    render(<EditorPage />)
    fireEvent.click(screen.getByRole('button', { name: 'open soil' }))
    fireEvent.click(screen.getByRole('button', { name: en.setup.next }))
    expect(screen.getByRole('region', { name: en.setup.gardenType })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: en.setup.next }))
    expect(screen.getByRole('region', { name: en.setup.shadeObjects })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: en.setup.next })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: en.setup.finish }))
    expect(screen.queryByRole('region', { name: en.setup.shadeObjects })).toBeNull()
  })
})

describe('units toggle', () => {
  it('changes a length shown in the selection panel', () => {
    mockPhone(false)
    const st = useStore.getState()
    const id = st.addShadeObject('tree', { x: 1, y: 1 })
    st.updateShadeObject(id, { widthM: 4, lengthM: 4 })
    st.select(id)
    render(<EditorPage />)
    expect(screen.getByLabelText(en.selection.crownWidth)).toHaveValue('4 m')
    fireEvent.click(screen.getByLabelText(en.settings.button))
    act(() => { fireEvent.click(screen.getByLabelText(en.settings.imperial)) })
    expect(screen.getByLabelText(en.selection.crownWidth)).toHaveValue('13 ft 1 in')
  })
})
