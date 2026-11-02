import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { library, plantName } from '../data/library'
import { createProject } from '../model/project'
import { useStore } from '../state/store'
import { en } from '../strings/en'
import { Toolbar } from './Toolbar'

beforeEach(() => {
  useStore.getState().openProject(createProject('Test'))
})

const props = { sunView: 'hours' as const, onSunView: () => {}, showSun: true, onToggleSun: () => {}, warningCount: 0, onToggleWarnings: () => {}, contentsCount: 2, onToggleCalendar: () => {}, onOpenPlants: () => {}, onOpenSetup: () => {}, onOpenGardens: () => {}, onCloseDrawer: () => {} }

describe('Toolbar', () => {
  it('shows the sun key in the Show sun tooltip', () => {
    render(<Toolbar {...props} onToggleContents={() => {}} />)
    expect(screen.queryByRole('tooltip')).toBeNull()
    const sun = screen.getByRole('button', { name: en.overlay.showSun })
    expect(sun).toHaveAttribute('aria-pressed', 'true')
    fireEvent.focus(sun)
    const tip = screen.getByRole('tooltip')
    expect(tip).toHaveTextContent(en.overlay.sunOn)
    expect(screen.getByRole('list', { name: en.overlay.legendLabel })).toBeInTheDocument()
    expect(sun).toHaveAttribute('aria-describedby', tip.id)
    fireEvent.keyDown(sun, { key: 'Escape' })
    expect(screen.queryByRole('tooltip')).toBeNull()
  })

  it('toggles the sun view with one button', () => {
    const onToggleSun = vi.fn()
    render(<Toolbar {...props} showSun={false} onToggleSun={onToggleSun} onToggleContents={() => {}} />)
    const sun = screen.getByRole('button', { name: en.overlay.showSun })
    expect(sun).toHaveAttribute('aria-pressed', 'false')
    fireEvent.click(sun)
    expect(onToggleSun).toHaveBeenCalledWith(true)
  })

  it('steps one season per click and wraps from winter to spring', () => {
    useStore.getState().setSeason('spring')
    render(<Toolbar {...props} onToggleContents={() => {}} />)
    const order = ['spring', 'midsummer', 'autumn', 'midwinter', 'spring'] as const
    for (let i = 0; i < 4; i++) {
      const cur = order[i]!, next = order[i + 1]!
      fireEvent.click(screen.getByRole('button', { name: en.overlay.seasonButton(en.overlay.season[cur], en.overlay.season[next]) }))
      expect(useStore.getState().project?.settings.season).toBe(next)
    }
  })

  it('shows notices in the message area above the bar', () => {
    render(<Toolbar {...props} onToggleContents={() => {}} notices={[en.overlay.needLocation]} />)
    expect(screen.getByRole('status')).toHaveTextContent(en.overlay.needLocation)
  })

  it('opens the garden list', () => {
    const onToggleContents = vi.fn()
    render(<Toolbar {...props} onToggleContents={onToggleContents} />)
    fireEvent.click(screen.getByRole('button', { name: en.contents.button(2) }))
    expect(onToggleContents).toHaveBeenCalled()
  })
})

describe('Toolbar add menu', () => {
  it('opens the add list from the bar and adds the picked object', () => {
    render(<Toolbar {...props} onToggleContents={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: en.editor.addMenu }))
    fireEvent.click(screen.getByRole('button', { name: en.editor.objects }))
    fireEvent.click(screen.getByRole('button', { name: en.editor.add.shed }))
    expect(useStore.getState().project?.shadeObjects.map((o) => o.kind)).toEqual(['shed'])
    expect(screen.queryByRole('button', { name: en.editor.add.shed })).toBeNull()
  })

  it('Hours/Strength switch appears only with the sun view on and a location', () => {
    const { rerender } = render(<Toolbar {...props} onToggleContents={() => {}} />)
    expect(screen.queryByRole('button', { name: en.overlay.viewStrength })).toBeNull() // no location
    const p = createProject('Loc')
    p.location = { lat: 47.5, lon: 19.04 }
    act(() => useStore.getState().openProject(p))
    rerender(<Toolbar {...props} onToggleContents={() => {}} />)
    expect(screen.getByRole('button', { name: en.overlay.viewHours })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: en.overlay.viewStrength })).toHaveAttribute('aria-pressed', 'false')
    rerender(<Toolbar {...props} showSun={false} onToggleContents={() => {}} />)
    expect(screen.queryByRole('button', { name: en.overlay.viewStrength })).toBeNull()
  })

  it('clicking Strength calls the view callback', () => {
    const onSunView = vi.fn()
    const p = createProject('Loc')
    p.location = { lat: 47.5, lon: 19.04 }
    act(() => useStore.getState().openProject(p))
    render(<Toolbar {...props} onSunView={onSunView} onToggleContents={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: en.overlay.viewStrength }))
    expect(onSunView).toHaveBeenCalledWith('strength')
  })
})

describe('Suggest next year', () => {
  const veggie = () => {
    const p = createProject('V')
    p.gardenType = 'veggie-beds'
    useStore.getState().openProject(p)
  }
  it('Suggest next year shown only in veggie gardens; disabled at year 20', () => {
    const { unmount } = render(<Toolbar {...props} onToggleContents={() => {}} />)
    expect(screen.queryByRole('button', { name: en.rotation.suggest })).toBeNull()
    unmount()
    veggie()
    render(<Toolbar {...props} onToggleContents={() => {}} />)
    expect(screen.getByRole('button', { name: en.rotation.suggest })).toBeEnabled()
    act(() => useStore.getState().setYear(20))
    expect(screen.getByRole('button', { name: en.rotation.suggest })).toBeDisabled()
  })

  it('moves to the next year, confirms before replacing annuals, and shows what was not placed', () => {
    veggie()
    const put = (id: string, year: number) => useStore.getState().update((p) => {
      p.plants.push({ id, plantId: 'pea', variantId: null, x: 1, y: 1, plantedYear: year, heightOverrideM: null, widthOverrideM: null })
    })
    put('a', 0)
    put('b', 0) // same spot: the second cannot be placed
    render(<Toolbar {...props} onToggleContents={() => {}} />)
    const ask = vi.spyOn(window, 'confirm')
    fireEvent.click(screen.getByRole('button', { name: en.rotation.suggest }))
    expect(ask).not.toHaveBeenCalled() // year 1 had no annuals
    expect(useStore.getState().project!.settings.year).toBe(1)
    expect(screen.getByRole('status')).toHaveTextContent(en.rotation.notPlaced(en.rotation.notPlacedItem(1, plantName(library.byId.get('pea')!), null)))
    // going back and suggesting again: year 1 now has annuals, so ask first
    act(() => useStore.getState().setYear(0))
    ask.mockReturnValue(false)
    fireEvent.click(screen.getByRole('button', { name: en.rotation.suggest }))
    expect(ask).toHaveBeenCalledWith(en.rotation.confirmReplace)
    expect(useStore.getState().project!.settings.year).toBe(0)
    ask.mockRestore()
  })
})
