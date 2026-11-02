import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { clear } from 'idb-keyval'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { createProject } from '../model/project'
import { useStore } from '../state/store'
import { listProjects, saveProject } from '../storage/db'
import { en } from '../strings/en'
import { setLang } from '../strings/lang'
import GardensList from './GardensList'

const landing = vi.hoisted(() => ({ available: false }))
vi.mock('./landing', () => ({
  get HU_HERO_AVAILABLE() {
    return landing.available
  },
}))

afterEach(() => {
  setLang('en')
  landing.available = false
})

beforeEach(async () => {
  await clear()
  useStore.getState().closeProject()
  await saveProject(createProject('My garden'))
  await saveProject(createProject('Back yard'))
})

const names = async () => (await listProjects()).map((g) => g.name).sort()

it('suggests a free default name and refuses a taken one', async () => {
  render(<GardensList />)
  await screen.findByRole('button', { name: en.gardens.openGarden })
  fireEvent.click(screen.getByText(en.gardens.newGarden))
  const input = screen.getByLabelText(en.gardens.nameLabel) as HTMLInputElement
  expect(input.value).toBe('My garden 2')
  fireEvent.change(input, { target: { value: ' back yard ' } })
  fireEvent.click(screen.getByText(en.gardens.create))
  expect(await screen.findByText(en.gardens.nameTaken('back yard'))).toBeInTheDocument()
  expect(useStore.getState().project).toBeNull()
  expect(await names()).toEqual(['Back yard', 'My garden'])
})

it('refuses renaming to another garden’s name but allows a case change of its own', async () => {
  render(<GardensList />)
  await screen.findByRole('button', { name: en.gardens.openGarden })
  fireEvent.click(screen.getByRole('button', { name: en.gardens.openGarden }))
  fireEvent.click(within((await screen.findByText('Back yard')).closest('li')!).getByRole('button', { name: en.gardens.rename }))
  const input = screen.getByLabelText(en.gardens.nameLabel)
  fireEvent.change(input, { target: { value: 'MY GARDEN' } })
  fireEvent.click(screen.getByText(en.gardens.save))
  expect(await screen.findByText(en.gardens.nameTaken('MY GARDEN'))).toBeInTheDocument()
  expect(screen.getByLabelText(en.gardens.nameLabel)).toBeInTheDocument() // form stays open
  fireEvent.change(input, { target: { value: 'BACK YARD' } })
  fireEvent.click(screen.getByText(en.gardens.save))
  await waitFor(async () => expect(await names()).toEqual(['BACK YARD', 'My garden']))
})

it('numbers an imported garden whose name is taken', async () => {
  render(<GardensList />)
  await screen.findByRole('button', { name: en.gardens.openGarden })
  const file = new File([JSON.stringify(createProject('Back yard'))], 'back-yard.terragrid.json', { type: 'application/json' })
  fireEvent.change(screen.getByTestId('import-input'), { target: { files: [file] } })
  await waitFor(() => expect(useStore.getState().project?.name).toBe('Back yard 2'))
  expect(await names()).toEqual(['Back yard', 'Back yard 2', 'My garden'])
})

it('names a new garden in a popup, and Cancel closes it without creating anything', async () => {
  render(<GardensList />)
  await screen.findByRole('button', { name: en.gardens.openGarden })
  expect(screen.queryByRole('dialog')).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: en.gardens.newGarden }))
  const dialog = screen.getByRole('dialog', { name: en.gardens.newGarden })
  expect(within(dialog).getByLabelText(en.gardens.nameLabel)).toHaveFocus()
  fireEvent.click(within(dialog).getByRole('button', { name: en.gardens.cancel }))
  expect(screen.queryByRole('dialog')).toBeNull()
  expect(await names()).toEqual(['Back yard', 'My garden'])
})

it('creates and opens the garden from the popup', async () => {
  render(<GardensList />)
  await screen.findByRole('button', { name: en.gardens.openGarden })
  fireEvent.click(screen.getByRole('button', { name: en.gardens.newGarden }))
  const dialog = screen.getByRole('dialog', { name: en.gardens.newGarden })
  fireEvent.change(within(dialog).getByLabelText(en.gardens.nameLabel), { target: { value: 'Front yard' } })
  fireEvent.click(within(dialog).getByRole('button', { name: en.gardens.create }))
  await waitFor(() => expect(useStore.getState().project?.name).toBe('Front yard'))
})

it('the About link opens the about popup', async () => {
  render(<GardensList />)
  await screen.findByRole('button', { name: en.gardens.openGarden })
  fireEvent.click(screen.getByRole('button', { name: en.credits.aboutLink }))
  const dialog = screen.getByRole('dialog', { name: en.credits.title })
  expect(within(dialog).getByText(en.credits.about)).toBeInTheDocument()
})

it('Open a garden lists the saved gardens in a popup, and clicking one opens it', async () => {
  render(<GardensList />)
  fireEvent.click(await screen.findByRole('button', { name: en.gardens.openGarden }))
  const dialog = screen.getByRole('dialog', { name: en.gardens.title })
  expect(await within(dialog).findByText('My garden')).toBeInTheDocument()
  fireEvent.click(within(dialog).getByRole('button', { name: /Back yard/ }))
  await waitFor(() => expect(useStore.getState().project?.name).toBe('Back yard'))
})

it('the gardens list is not shown on the page itself', async () => {
  render(<GardensList />)
  await screen.findByRole('button', { name: en.gardens.openGarden })
  expect(screen.queryByText('Back yard')).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: en.gardens.openGarden }))
  fireEvent.click(within(screen.getByRole('dialog', { name: en.gardens.title })).getByRole('button', { name: en.gardens.close }))
  expect(screen.queryByRole('dialog')).toBeNull()
})

it('no Open a garden button without saved gardens', async () => {
  await clear()
  render(<GardensList />)
  await screen.findByRole('button', { name: en.gardens.newGarden })
  await waitFor(() => expect(screen.queryByRole('button', { name: en.gardens.openGarden })).toBeNull())
})

it('landing page shows the settings menu with language only', async () => {
  render(<GardensList />)
  await screen.findByRole('button', { name: en.gardens.openGarden })
  expect(screen.getByRole('button', { name: en.credits.aboutLink })).toBeInTheDocument()
  expect(screen.getByLabelText(en.settings.button)).toBeInTheDocument()
  expect(screen.getByText(en.settings.language)).toBeInTheDocument()
  expect(screen.queryByText(en.settings.units)).toBeNull()
})

const heroFiles = (c: HTMLElement) => [c.querySelector('source')!.getAttribute('srcset'), c.querySelector('img')!.getAttribute('src')]

it('Hungarian hero falls back to the English image while HU_HERO_AVAILABLE is false', () => {
  setLang('hu')
  const { container } = render(<GardensList />)
  expect(heroFiles(container)).toEqual(['/landing/hero-1200.webp', '/landing/hero-2000.webp'])
})

it('uses hero-hu files when true', () => {
  landing.available = true
  setLang('hu')
  const { container } = render(<GardensList />)
  expect(heroFiles(container)).toEqual(['/landing/hero-hu-1200.webp', '/landing/hero-hu-2000.webp'])
})

it('English keeps the English hero even when the Hungarian files exist', () => {
  landing.available = true
  const { container } = render(<GardensList />)
  expect(heroFiles(container)).toEqual(['/landing/hero-1200.webp', '/landing/hero-2000.webp'])
})
