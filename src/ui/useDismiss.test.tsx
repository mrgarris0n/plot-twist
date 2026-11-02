import { fireEvent, render, screen } from '@testing-library/react'
import { useRef, useState } from 'react'
import { expect, it } from 'vitest'
import { useDismiss } from './useDismiss'

function Menu() {
  const [open, setOpen] = useState(true)
  const ref = useRef<HTMLDivElement>(null)
  useDismiss(ref, open, () => setOpen(false))
  return (
    <>
      <div ref={ref}>{open ? <button type="button">inside</button> : 'closed'}</div>
      <button type="button">outside</button>
    </>
  )
}

it('stays open on a click inside', () => {
  render(<Menu />)
  fireEvent.pointerDown(screen.getByRole('button', { name: 'inside' }))
  expect(screen.getByRole('button', { name: 'inside' })).toBeInTheDocument()
})

it('closes on a click outside', () => {
  render(<Menu />)
  fireEvent.pointerDown(screen.getByRole('button', { name: 'outside' }))
  expect(screen.getByText('closed')).toBeInTheDocument()
})

it('closes on Escape wherever focus is', () => {
  render(<Menu />)
  fireEvent.keyDown(document.body, { key: 'Escape' })
  expect(screen.getByText('closed')).toBeInTheDocument()
})
