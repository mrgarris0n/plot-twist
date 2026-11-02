import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { expect, it } from 'vitest'
import { onRadioKeyDown, radioTabIndex } from './radioGroup'

function Group({ items, order, disabled = [] }: { items: string[]; order?: number[]; disabled?: string[] }) {
  const [value, setValue] = useState<string | null>(null)
  return (
    <div role="radiogroup" aria-label="Pick" onKeyDown={onRadioKeyDown}>
      {items.map((it, i) => (
        <button key={it} type="button" role="radio" aria-checked={value === it} disabled={disabled.includes(it)}
          data-order={order?.[i]} tabIndex={radioTabIndex(value === it, i === 0, value !== null)} onClick={() => setValue(it)}>{it}</button>
      ))}
    </div>
  )
}
const radio = (name: string) => screen.getByRole('radio', { name })

it('has one tab stop: the first radio until one is checked, then the checked one', () => {
  render(<Group items={['a', 'b', 'c']} />)
  expect(radio('a')).toHaveAttribute('tabindex', '0')
  expect(radio('b')).toHaveAttribute('tabindex', '-1')
  fireEvent.click(radio('b'))
  expect(radio('a')).toHaveAttribute('tabindex', '-1')
  expect(radio('b')).toHaveAttribute('tabindex', '0')
})

it('arrow keys move, choose and wrap; Home and End jump; disabled radios are skipped', () => {
  render(<Group items={['a', 'b', 'c', 'd']} disabled={['c']} />)
  radio('a').focus()
  fireEvent.keyDown(radio('a'), { key: 'ArrowDown' })
  expect(radio('b')).toHaveFocus()
  expect(radio('b')).toHaveAttribute('aria-checked', 'true')
  fireEvent.keyDown(radio('b'), { key: 'ArrowRight' })
  expect(radio('d')).toHaveFocus()
  fireEvent.keyDown(radio('d'), { key: 'ArrowDown' })
  expect(radio('a')).toHaveFocus()
  fireEvent.keyDown(radio('a'), { key: 'ArrowUp' })
  expect(radio('d')).toHaveAttribute('aria-checked', 'true')
  fireEvent.keyDown(radio('d'), { key: 'Home' })
  expect(radio('a')).toHaveAttribute('aria-checked', 'true')
  fireEvent.keyDown(radio('a'), { key: 'End' })
  expect(radio('d')).toHaveAttribute('aria-checked', 'true')
})

it('follows data-order when given', () => {
  render(<Group items={['NW', 'N', 'NE']} order={[2, 0, 1]} />)
  radio('N').focus()
  fireEvent.keyDown(radio('N'), { key: 'ArrowRight' })
  expect(radio('NE')).toHaveFocus()
  fireEvent.keyDown(radio('NE'), { key: 'ArrowRight' })
  expect(radio('NW')).toHaveFocus()
})
