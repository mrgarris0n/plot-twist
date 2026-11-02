import { createStore } from 'zustand/vanilla'

export type Lang = 'en' | 'hu'

const KEY = 'plottwist.lang'

/** 'hu' when the browser's first preferred language is Hungarian, otherwise 'en'. */
export function detectLang(langs: readonly string[]): Lang {
  return langs[0]?.toLowerCase().startsWith('hu') ? 'hu' : 'en'
}

/** Vanilla store (no React), so the worker bundle stays free of it. The `useLang` hook lives in useLang.ts. */
export const langStore = createStore<{ lang: Lang }>(() => ({ lang: 'en' }))

export const getLang = (): Lang => langStore.getState().lang

function apply(l: Lang) {
  if (typeof document !== 'undefined') document.documentElement.lang = l
  langStore.setState({ lang: l })
}

/** Switch language: persists (main thread only), sets `<html lang>` and notifies listeners. */
export function setLang(l: Lang): void {
  apply(l)
  if (typeof document === 'undefined') return // worker: no storage
  try {
    localStorage.setItem(KEY, l)
  } catch {
    /* storage blocked: the choice lasts for this session only */
  }
}

/** Start-up: the stored choice, else the browser's language. Does not persist the detected default. */
export function initLang(): void {
  let stored: string | null = null
  try {
    stored = localStorage.getItem(KEY)
  } catch {
    /* blocked */
  }
  const nav = typeof navigator !== 'undefined' ? navigator.languages ?? [] : []
  apply(stored === 'en' || stored === 'hu' ? stored : detectLang(nav))
}

/** A number as text with a fixed count of decimals: a decimal comma in Hungarian, a point otherwise. No thousands grouping. */
export function formatNumber(n: number, digits: number, lang: Lang = getLang()): string {
  return localizeDecimal(n.toFixed(digits), lang)
}

/** Swaps the decimal point of an already formatted number for a comma in Hungarian. */
export function localizeDecimal(text: string, lang: Lang = getLang()): string {
  return lang === 'hu' ? text.replace('.', ',') : text
}

/** A stored date for display: "2026. 10. 23." in Hungarian, the browser's own format otherwise. */
export function formatDate(iso: string | number | Date): string {
  return new Date(iso).toLocaleDateString(getLang() === 'hu' ? 'hu-HU' : undefined)
}
