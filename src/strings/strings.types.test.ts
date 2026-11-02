import { expect, it } from 'vitest'
import { english, type Strings } from './english'

it('Strings accepts different wording (compile-time check via tsc -b)', () => {
  const other: Strings = { ...english, settings: { ...english.settings, button: 'Beállítások' } }
  expect(other.settings.button).toBe('Beállítások')
})
