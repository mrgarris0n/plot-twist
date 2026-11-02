import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import { setLang } from '../strings/lang'
import { useLang } from '../strings/useLang'
import { useLangCarriedRef, useLangCarriedState } from './useLangCarried'

function Counter() {
  const [n, setN] = useLangCarriedState('test.n', 0)
  const moved = useLangCarriedRef('test.moved', false)
  return <button type="button" onClick={() => { moved.current = true; setN(n + 1) }}>{`${n} ${moved.current}`}</button>
}
// Keyed by language like App.tsx.
function Page() {
  return <Counter key={useLang()} />
}

afterEach(() => setLang('en'))

it('keeps state across the language remount', () => {
  render(<Page />)
  fireEvent.click(screen.getByRole('button'))
  fireEvent.click(screen.getByRole('button'))
  act(() => setLang('hu'))
  expect(screen.getByRole('button')).toHaveTextContent('2 true')
})

it('starts fresh after any other unmount', () => {
  const first = render(<Page />)
  fireEvent.click(screen.getByRole('button'))
  first.unmount()
  render(<Page />)
  expect(screen.getByRole('button')).toHaveTextContent('0 false')
})

it('hands the state over once', () => {
  const first = render(<Page />)
  fireEvent.click(screen.getByRole('button'))
  act(() => setLang('hu'))
  first.unmount()
  render(<Page />)
  expect(screen.getByRole('button')).toHaveTextContent('0 false')
})
