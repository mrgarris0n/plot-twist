import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { en } from '../../strings/en'
import { setLang } from '../../strings/lang'
import { library } from '../../data/library'
import { createProject } from '../../model/project'
import { useStore } from '../../state/store'
import { LengthField, PlantedYearField, SelectionPanel } from './SelectionPanel'

vi.mock('../../data/companions', () => {
  const s = (id: string, title: string, url: string) => [{ id, title, url, licence: 'CC' }]
  return {
    companions: [
      { a: 'apple', b: 'pea', effect: 'good', reason: 'Pea helps apples.', sources: [...s('g', 'Good source', 'https://good.example.org'), ...s('g2', 'Second source', 'https://second.example.org')] },
      { a: 'garlic', b: 'apple', effect: 'bad', reason: 'Garlic hurts apples.', sources: s('b', 'Bad source', 'https://bad.example.org') },
    ],
  }
})

it('reverts an invalid draft on blur, shows the error, and does not commit', () => {
  const onCommit = vi.fn()
  render(<LengthField label="Width" valueM={5} units="metric" disabled={false} onCommit={onCommit} />)
  const input = screen.getByLabelText('Width') as HTMLInputElement
  const original = input.value
  fireEvent.change(input, { target: { value: 'abc' } })
  fireEvent.blur(input)
  expect(input.value).toBe(original)
  expect(screen.getByText(en.selection.invalidLength)).toBeInTheDocument()
  expect(onCommit).not.toHaveBeenCalled()
})

it('keeps the draft and error on Enter with invalid text', () => {
  render(<LengthField label="Width" valueM={5} units="metric" disabled={false} onCommit={vi.fn()} />)
  const input = screen.getByLabelText('Width') as HTMLInputElement
  fireEvent.change(input, { target: { value: 'abc' } })
  fireEvent.keyDown(input, { key: 'Enter' })
  expect(input.value).toBe('abc')
  expect(screen.getByText(en.selection.invalidLength)).toBeInTheDocument()
})

it('lets the planting year be cleared and retyped, committing only whole valid years', () => {
  const onCommit = vi.fn()
  render(<PlantedYearField year={3} disabled={false} onCommit={onCommit} />)
  const input = screen.getByLabelText(en.plant.plantedYear) as HTMLInputElement
  fireEvent.change(input, { target: { value: '' } })
  expect(input.value).toBe('')
  expect(onCommit).not.toHaveBeenCalled()
  fireEvent.change(input, { target: { value: '7' } })
  expect(onCommit).toHaveBeenLastCalledWith(7)
  fireEvent.change(input, { target: { value: '' } })
  fireEvent.blur(input)
  expect(input.value).toBe('3')
})

it('says an annual is grown as an annual where winter brings frost', () => {
  const p = createProject('t')
  p.climate = { source: 'manual', minWinterC: -10, lastFrostDoy: 100, firstFrostDoy: 290, frostFree: false }
  useStore.getState().openProject(p)
  useStore.getState().select(useStore.getState().placePlant('pea', { x: 2, y: 2 }))
  const { unmount } = render(<SelectionPanel readOnly={false} />)
  expect(screen.getByText(en.plant.grownAsAnnual)).toBeInTheDocument()
  expect(screen.getByText(en.details.annual)).toBeInTheDocument()
  expect(screen.queryByText(en.details.hardiness)).not.toBeInTheDocument()
  unmount()
  useStore.getState().select(useStore.getState().placePlant('apple', { x: 8, y: 8 }))
  render(<SelectionPanel readOnly={false} />)
  expect(screen.queryByText(en.plant.grownAsAnnual)).not.toBeInTheDocument()
})

let origWater: unknown
beforeEach(() => { origWater = (library.byId.get('apple') as { water?: unknown }).water })
afterEach(() => { (library.byId.get('apple') as { water?: unknown }).water = origWater })

function placeApple(opts: { location: boolean; cloud: number | null; units?: 'metric' | 'imperial'; water?: unknown }) {
  const p = createProject('t')
  if (opts.location) p.location = { lat: 47.5, lon: 19.04 }
  p.settings.units = opts.units ?? 'metric'
  p.climate = { source: 'manual', minWinterC: -10, lastFrostDoy: 100, firstFrostDoy: 290, frostFree: false, rainYearMm: 640, rainWarmMm: 310, cloudWarmPct: opts.cloud }
  useStore.getState().openProject(p)
  const rec = library.byId.get('apple') as { water?: unknown }
  rec.water = opts.water
  useStore.getState().select(useStore.getState().placePlant('apple', { x: 2, y: 2 }))
  const r = render(<SelectionPanel readOnly={false} />)
  openDetails(r.container)
  return r
}

/** The sun figures are only worked out while Details is open. */
function openDetails(container: HTMLElement) {
  const details = container.querySelector('details.plant-details') as HTMLDetailsElement
  details.open = true
  fireEvent(details, new Event('toggle'))
}

it('shows a USDA water need in inches when imperial', () => {
  placeApple({ location: true, cloud: 50, units: 'imperial', water: { minRainMm: 762 } })
  expect(screen.getByText(en.details.waterNeed)).toBeInTheDocument()
  expect(screen.getByText('30 in a year (USDA)')).toBeInTheDocument()
})

it('shows Water need not known for a plant without water', () => {
  placeApple({ location: true, cloud: 50, water: null })
  expect(screen.getByText('Water need not known')).toBeInTheDocument()
})

it('shows real sunshine when cloud is known', () => {
  placeApple({ location: true, cloud: 50 })
  expect(screen.getByText(/About \d+(\.\d)? h of real sunshine/)).toBeInTheDocument()
})

it('hides it when cloud is unknown', () => {
  placeApple({ location: true, cloud: null })
  expect(screen.queryByText(/real sunshine/)).not.toBeInTheDocument()
})

it('shows more real sunshine with less cloud', () => {
  const hours = (cloud: number) => {
    const { unmount } = placeApple({ location: true, cloud })
    const m = screen.getByText(/About \d+ h of real sunshine/).textContent!.match(/\d+/)!
    unmount()
    return Number(m[0])
  }
  expect(hours(0)).toBeGreaterThan(hours(50))
})

it('shows sun strength when location is known', () => {
  placeApple({ location: true, cloud: null })
  expect(screen.getByText(/Sun strength: about \d+% of an open flat spot/)).toBeInTheDocument()
})

it('hides it without location', () => {
  placeApple({ location: false, cloud: 50 })
  expect(screen.queryByText(/Sun strength/)).not.toBeInTheDocument()
})

it('shows nothing for an annual selected in a year it is not present (veggie beds)', () => {
  const p = createProject('t')
  p.gardenType = 'veggie-beds'
  useStore.getState().openProject(p)
  useStore.getState().select(useStore.getState().placePlant('pea', { x: 2, y: 2 }))
  const { unmount } = render(<SelectionPanel readOnly={false} />)
  expect(screen.queryByText(en.selection.nothing)).toBeNull()
  unmount()
  useStore.getState().setYear(1)
  render(<SelectionPanel readOnly={false} />)
  expect(screen.getByText(en.selection.nothing)).toBeInTheDocument()
})

it('details list good and bad companions with sources', () => {
  const p = createProject('t')
  p.gardenType = 'veggie-beds'
  useStore.getState().openProject(p)
  useStore.getState().select(useStore.getState().placePlant('apple', { x: 2, y: 2 }))
  render(<SelectionPanel readOnly={false} />)
  expect(screen.getByText(en.details.goodNeighbours)).toBeInTheDocument()
  expect(screen.getByText(en.details.keepApart)).toBeInTheDocument()
  expect(screen.getByText(/Pea helps apples\./)).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Good source' })).toHaveAttribute('href', 'https://good.example.org')
  expect(screen.getByRole('link', { name: 'Bad source' })).toHaveAttribute('href', 'https://bad.example.org')
})

it('food-forest plant details have no companion lists', () => {
  useStore.getState().openProject(createProject('t'))
  useStore.getState().select(useStore.getState().placePlant('apple', { x: 2, y: 2 }))
  render(<SelectionPanel readOnly={false} />)
  expect(screen.queryByText(en.details.goodNeighbours)).toBeNull()
  expect(screen.queryByText(en.details.keepApart)).toBeNull()
})

it('several source links in a companion list are separated', () => {
  const p = createProject('t')
  p.gardenType = 'veggie-beds'
  useStore.getState().openProject(p)
  useStore.getState().select(useStore.getState().placePlant('apple', { x: 2, y: 2 }))
  const { container } = render(<SelectionPanel readOnly={false} />)
  const li = container.querySelector('li a[href="https://good.example.org"]')!.closest('li')!
  expect(li.textContent).toContain('Good source, Second source')
})

const veggieWithBed = () => {
  const p = createProject('t')
  p.gardenType = 'veggie-beds'
  useStore.getState().openProject(p)
  const id = useStore.getState().addShadeObject('bed', { x: 3, y: 3 })
  useStore.getState().select(id)
  return id
}

it('bed editor renames and toggles perennial', () => {
  const id = veggieWithBed()
  render(<SelectionPanel readOnly={false} />)
  fireEvent.change(screen.getByLabelText(en.beds.name), { target: { value: 'Herb bed' } })
  fireEvent.click(screen.getByRole('checkbox', { name: en.beds.perennial }))
  const bed = useStore.getState().project!.shadeObjects.find((o) => o.id === id)!
  expect(bed.name).toBe('Herb bed')
  expect(bed.perennial).toBe(true)
})

it('deleting a bed with plants asks first', () => {
  const id = veggieWithBed()
  useStore.getState().placePlant('pea', { x: 3, y: 3 })
  render(<SelectionPanel readOnly={false} />)
  const ask = vi.spyOn(window, 'confirm').mockReturnValue(false)
  fireEvent.click(screen.getByRole('button', { name: en.selection.remove }))
  expect(ask).toHaveBeenCalledWith(en.beds.confirmDelete('Bed A', 1))
  expect(useStore.getState().project!.shadeObjects).toHaveLength(1)
  ask.mockReturnValue(true)
  fireEvent.click(screen.getByRole('button', { name: en.selection.remove }))
  expect(useStore.getState().project!.shadeObjects.find((o) => o.id === id)).toBeUndefined()
  expect(useStore.getState().project!.plants).toHaveLength(0)
  ask.mockRestore()
})

it('deleting an empty bed does not ask', () => {
  veggieWithBed()
  render(<SelectionPanel readOnly={false} />)
  const ask = vi.spyOn(window, 'confirm')
  fireEvent.click(screen.getByRole('button', { name: en.selection.remove }))
  expect(ask).not.toHaveBeenCalled()
  ask.mockRestore()
})

it('not-in-a-bed hint', () => {
  veggieWithBed()
  const out = useStore.getState().placePlant('pea', { x: 20, y: 20 })
  useStore.getState().select(out)
  const { unmount } = render(<SelectionPanel readOnly={false} />)
  expect(screen.getByText(en.beds.notInBed)).toBeInTheDocument()
  unmount()
  useStore.getState().select(useStore.getState().placePlant('pea', { x: 3, y: 3 }))
  const second = render(<SelectionPanel readOnly={false} />)
  expect(screen.queryByText(en.beds.notInBed)).toBeNull()
  second.unmount()
  // food forest: no hint
  const p = createProject('f')
  useStore.getState().openProject(p)
  useStore.getState().select(useStore.getState().placePlant('apple', { x: 20, y: 20 }))
  render(<SelectionPanel readOnly={false} />)
  expect(screen.queryByText(en.beds.notInBed)).toBeNull()
})

it('shows the pH range with a decimal comma in Hungarian', () => {
  const rec = library.byId.get('apple') as { phMin: number | null; phMax: number | null }
  const orig = [rec.phMin, rec.phMax]
  rec.phMin = 5.5
  rec.phMax = 7
  try {
    setLang('hu')
    placeApple({ location: false, cloud: null })
    expect(screen.getByText('5,5–7')).toBeInTheDocument()
  } finally {
    setLang('en')
    ;[rec.phMin, rec.phMax] = orig as [number | null, number | null]
  }
})

it('works out the sun figures only once Details is opened', () => {
  const p = createProject('t')
  p.location = { lat: 47.5, lon: 19 }
  p.climate = { source: 'manual', minWinterC: -10, lastFrostDoy: 100, firstFrostDoy: 290, frostFree: false, cloudWarmPct: 40 }
  useStore.getState().openProject(p)
  useStore.getState().select(useStore.getState().placePlant('apple', { x: 5, y: 5 }))
  const { container } = render(<SelectionPanel readOnly={false} />)
  expect(screen.queryByText(en.details.realSunLabel)).toBeNull()
  openDetails(container)
  expect(screen.getByText(en.details.realSunLabel)).toBeInTheDocument()
  expect(screen.getByText(/^About \d+ h of real sunshine$/)).toBeInTheDocument()
  expect(screen.getByText(/^Sun strength: about \d+% of an open flat spot$/)).toBeInTheDocument()
})

it('an existing tree can be marked as losing its leaves in winter', () => {
  useStore.getState().openProject(createProject('t'))
  const id = useStore.getState().addShadeObject('tree', { x: 1, y: 1 })
  useStore.getState().select(id)
  render(<SelectionPanel readOnly={false} />)
  const box = screen.getByLabelText(en.selection.leafOff) as HTMLInputElement
  expect(box.checked).toBe(false)
  fireEvent.click(box)
  expect(useStore.getState().project!.shadeObjects.find((o) => o.id === id)!.leafOff).toBe(true)
})
