import { act, fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { library } from '../data/library'
import { en } from '../strings/en'
import { CreditsButton, CreditsDialog } from './CreditsDialog'

describe('CreditsDialog', () => {
  it('names every outside service and dataset', () => {
    render(<CreditsDialog onClose={() => {}} />)
    const dialog = screen.getByRole('dialog', { name: en.credits.title })
    expect(dialog).toHaveTextContent('ISRIC SoilGrids (CC BY 4.0)')
    expect(dialog).toHaveTextContent('OpenFreeMap')
    expect(dialog).toHaveTextContent('© OpenStreetMap contributors')
    expect(dialog).toHaveTextContent('Photon')
    expect(dialog).toHaveTextContent('Copernicus')
    expect(dialog).toHaveTextContent('Agroclimatic indicators')
    expect(dialog).toHaveTextContent('ERA5')
    expect(dialog).toHaveTextContent('solar radiation')
    expect(dialog).toHaveTextContent('PFAF')
  })

  it('closes on a backdrop click but not on a click inside', () => {
    const onClose = vi.fn()
    render(<CreditsDialog onClose={onClose} />)
    const dialog = screen.getByRole('dialog', { name: en.credits.title })
    fireEvent.click(screen.getByText(en.credits.intro))
    expect(onClose).not.toHaveBeenCalled()
    vi.spyOn(dialog, 'getBoundingClientRect').mockReturnValue(new DOMRect(100, 100, 400, 300))
    fireEvent.click(dialog, { clientX: 300, clientY: 200 }) // dialog padding: inside the box
    expect(onClose).not.toHaveBeenCalled()
    fireEvent.click(dialog, { clientX: 20, clientY: 20 })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('lists every distinct plant source title once, linked to its url', () => {
    render(<CreditsDialog onClose={() => {}} />)
    const sources = new Map<string, string>()
    for (const p of library.all) for (const s of p.sources) sources.set(`${s.title}|${s.url}`, s.url)
    expect(sources.size).toBeGreaterThan(5)
    const anchors = [...screen.getByRole('dialog').querySelectorAll('a')]
    for (const key of sources.keys()) {
      const [title, url] = key.split('|') as [string, string]
      expect(anchors.some((l) => l.textContent === title && l.getAttribute('href') === url)).toBe(true)
    }
    const listed = anchors.filter((l) => sources.has(`${l.textContent}|${l.getAttribute('href')}`))
    expect(listed.length).toBe(sources.size)
  })

  it('opens as a native modal, focuses Close, and closes on cancel (Escape) or the button', () => {
    const showModal = vi.spyOn(HTMLDialogElement.prototype, 'showModal')
    const onClose = vi.fn()
    render(<CreditsDialog onClose={onClose} />)
    expect(showModal).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: en.credits.close })).toHaveFocus()
    const cancel = new Event('cancel', { cancelable: true })
    screen.getByRole('dialog').dispatchEvent(cancel)
    expect(cancel.defaultPrevented).toBe(true)
    expect(onClose).toHaveBeenCalledTimes(1)
    fireEvent.click(screen.getByRole('button', { name: en.credits.close }))
    expect(onClose).toHaveBeenCalledTimes(2)
    showModal.mockRestore()
  })
})

describe('CreditsButton', () => {
  it('opens the dialog and returns focus on close', () => {
    render(<CreditsButton />)
    const btn = screen.getByRole('button', { name: en.credits.open })
    fireEvent.click(btn)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    act(() => { screen.getByRole('dialog').dispatchEvent(new Event('cancel', { cancelable: true })) })
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(btn).toHaveFocus()
  })
})

describe('CreditsButton icon', () => {
  it('keeps the label as the name of the ? icon', () => {
    render(<CreditsButton iconOnly />)
    expect(screen.getByRole('button', { name: en.credits.open })).toHaveAttribute('data-tip', en.credits.open)
  })
})
