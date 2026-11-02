import { fireEvent, render } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { WarningsList } from './WarningsList'

it('Escape closes the warnings list', () => {
  const onClose = vi.fn()
  render(<WarningsList warnings={[]} onPick={() => {}} onClose={onClose} />)
  fireEvent.keyDown(window, { key: 'Escape' })
  expect(onClose).toHaveBeenCalledOnce()
})
