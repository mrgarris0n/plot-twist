import type { KeyboardEvent } from 'react'

const STEP: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }

/**
 * Keyboard for a role="radiogroup" of role="radio" buttons (WAI-ARIA radio group): arrow keys move to the next or
 * previous enabled radio and choose it, wrapping round; Home and End go to the first and last. Order is `data-order`
 * when the radios have it (the compass goes round clockwise), otherwise their order on the page.
 */
export function onRadioKeyDown(e: KeyboardEvent<HTMLElement>): void {
  const radios = [...e.currentTarget.querySelectorAll<HTMLElement>('[role=radio]:not(:disabled)')]
    .sort((a, b) => Number(a.dataset.order ?? 0) - Number(b.dataset.order ?? 0))
  const i = radios.indexOf(document.activeElement as HTMLElement)
  if (i < 0) return
  const step = STEP[e.key]
  const j = step !== undefined ? (i + step + radios.length) % radios.length : e.key === 'Home' ? 0 : e.key === 'End' ? radios.length - 1 : null
  if (j === null) return
  e.preventDefault()
  radios[j]!.focus()
  radios[j]!.click()
}

/** One tab stop per group: the checked radio, or the first one while none is checked. */
export function radioTabIndex(checked: boolean, first: boolean, anyChecked: boolean): 0 | -1 {
  return checked || (first && !anyChecked) ? 0 : -1
}
