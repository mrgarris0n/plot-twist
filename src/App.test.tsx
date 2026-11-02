import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { clear } from 'idb-keyval'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// The canvas needs browser layout APIs jsdom lacks; it isn't what this test is about.
vi.mock('./ui/editor/EditorCanvas', async () => {
  const { en } = await import('./strings/en')
  // My gardens lives in the canvas's bottom bar.
  return { EditorCanvas: ({ onOpenGardens }: { onOpenGardens: () => void }) => <button type="button" onClick={onOpenGardens}>{en.editor.backToGardens}</button> }
})
import App from './App'
import { createProject } from './model/project'
import { useStore } from './state/store'
import { listProjects, saveProject } from './storage/db'
import { exportProject } from './storage/file'
import { en } from './strings/en'
import { setLang } from './strings/lang'

beforeEach(async () => {
  await clear()
  useStore.getState().closeProject()
})

describe('App', () => {
  it('opens on the landing page', () => {
    render(<App />)
    expect(screen.getByRole('heading', { level: 1, name: en.landing.heroAlt })).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('My gardens in the editor opens the gardens drawer and stays in the editor', async () => {
    const p = createProject('Back yard')
    await saveProject(p)
    useStore.getState().openProject(p)
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: en.editor.backToGardens }))
    const drawer = await screen.findByRole('region', { name: en.gardens.title })
    expect(await within(drawer).findByText(en.gardens.current)).toBeInTheDocument()
    fireEvent.click(within(drawer).getByRole('button', { name: en.setup.close }))
    expect(screen.queryByRole('region', { name: en.gardens.title })).toBeNull()
    expect(useStore.getState().project?.id).toBe(p.id)
    expect(screen.getByRole('heading', { level: 1, name: 'Back yard' })).toBeInTheDocument()
  })

  it('switching language keeps the open drawer and settings menu', async () => {
    const p = createProject('Back yard')
    await saveProject(p)
    useStore.getState().openProject(p)
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: en.editor.backToGardens }))
    await screen.findByRole('region', { name: en.gardens.title })
    fireEvent.click(screen.getByLabelText(en.settings.button))
    const settings = document.querySelector('details.settings-menu')!
    await waitFor(() => expect(settings).toHaveAttribute('open'))
    try {
      act(() => setLang('hu'))
      expect(await screen.findByRole('region', { name: en.gardens.title })).toBeInTheDocument()
      expect(screen.getByText(en.gardens.title, { selector: 'h2' })).toHaveTextContent('Kertjeim')
      expect(document.querySelector('details.settings-menu')).toHaveAttribute('open')
    } finally {
      act(() => setLang('en'))
    }
  })

  it('clicking another garden in the drawer opens it', async () => {
    const a = createProject('Back yard')
    const b = createProject('Allotment')
    await saveProject(a)
    await saveProject(b)
    useStore.getState().openProject(a)
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: en.editor.backToGardens }))
    const drawer = await screen.findByRole('region', { name: en.gardens.title })
    fireEvent.click(await within(drawer).findByRole('button', { name: /Allotment/ }))
    await waitFor(() => expect(useStore.getState().project?.id).toBe(b.id))
    expect(screen.queryByRole('region', { name: en.gardens.title })).toBeNull()
  })

  it('renaming the open garden renames it in the editor and in storage', async () => {
    const p = createProject('Back yard')
    await saveProject(p)
    useStore.getState().openProject(p)
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: en.editor.backToGardens }))
    const drawer = await screen.findByRole('region', { name: en.gardens.title })
    fireEvent.click(within((await within(drawer).findByText('Back yard')).closest('li')!).getByRole('button', { name: en.gardens.rename }))
    fireEvent.change(within(drawer).getByLabelText(en.gardens.nameLabel), { target: { value: 'Front yard' } })
    fireEvent.click(within(drawer).getByRole('button', { name: en.gardens.save }))
    await waitFor(async () => expect((await listProjects()).map((g) => g.name)).toEqual(['Front yard']))
    expect(useStore.getState().project?.name).toBe('Front yard')
  })

  it('New garden in the drawer creates, saves and opens it', async () => {
    const p = createProject('Back yard')
    await saveProject(p)
    useStore.getState().openProject(p)
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: en.editor.backToGardens }))
    const drawer = await screen.findByRole('region', { name: en.gardens.title })
    await within(drawer).findByText('Back yard')
    fireEvent.click(within(drawer).getByRole('button', { name: en.gardens.newGarden }))
    fireEvent.change(within(drawer).getByLabelText(en.gardens.nameLabel), { target: { value: 'Allotment' } })
    fireEvent.click(within(drawer).getByRole('button', { name: en.gardens.create }))
    await waitFor(() => expect(useStore.getState().project?.name).toBe('Allotment'))
    expect((await listProjects()).map((g) => g.name).sort()).toEqual(['Allotment', 'Back yard'])
  })

  it('Import in the drawer opens the imported garden', async () => {
    const p = createProject('Back yard')
    await saveProject(p)
    useStore.getState().openProject(p)
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: en.editor.backToGardens }))
    const drawer = await screen.findByRole('region', { name: en.gardens.title })
    const { filename, blob } = exportProject(createProject('Orchard'))
    const file = new File([await blob.text()], filename, { type: 'application/json' })
    fireEvent.change(within(drawer).getByTestId('drawer-import-input'), { target: { files: [file] } })
    await waitFor(() => expect(useStore.getState().project?.name).toBe('Orchard'))
  })

  it('deleting the open garden switches to the most recent other one and stays in the editor', async () => {
    const a = createProject('Back yard')
    const b = { ...createProject('Allotment'), updatedAt: '2020-01-01T00:00:00.000Z' }
    const c = { ...createProject('Orchard'), updatedAt: '2025-01-01T00:00:00.000Z' }
    for (const g of [a, b, c]) await saveProject(g)
    useStore.getState().openProject(a)
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: en.editor.backToGardens }))
    const drawer = await screen.findByRole('region', { name: en.gardens.title })
    fireEvent.click(within((await within(drawer).findByText('Back yard')).closest('li')!).getByRole('button', { name: en.gardens.delete }))
    await waitFor(() => expect(useStore.getState().project?.id).toBe(c.id))
    await waitFor(async () => expect((await listProjects()).map((g) => g.name)).toEqual(['Orchard', 'Allotment']))
    expect(screen.getByRole('region', { name: en.gardens.title })).toBeInTheDocument()
  })

  it('deleting the last garden goes to the start page', async () => {
    const p = createProject('Back yard')
    await saveProject(p)
    useStore.getState().openProject(p)
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: en.editor.backToGardens }))
    const drawer = await screen.findByRole('region', { name: en.gardens.title })
    fireEvent.click(within((await within(drawer).findByText('Back yard')).closest('li')!).getByRole('button', { name: en.gardens.delete }))
    await waitFor(() => expect(useStore.getState().project).toBeNull())
    expect(await listProjects()).toEqual([])
  })
})
