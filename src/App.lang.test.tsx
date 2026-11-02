import { act, render } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { setLang } from './strings/lang'

afterEach(() => setLang('en'))

it('switching language re-renders the app', async () => {
  const mounts = vi.fn()
  vi.doMock('./ui/GardensList', async () => {
    const React = await import('react')
    return { default: () => (React.useEffect(mounts, []), null) }
  })
  const { default: App } = await import('./App')
  render(<App />)
  expect(mounts).toHaveBeenCalledTimes(1)
  act(() => setLang('hu'))
  expect(mounts).toHaveBeenCalledTimes(2)
  vi.doUnmock('./ui/GardensList')
})
