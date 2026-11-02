import { afterEach, describe, expect, it, vi } from 'vitest'
import { detectLang, getLang, initLang, setLang } from './lang'

afterEach(() => {
  vi.unstubAllGlobals()
  localStorage.clear()
  setLang('en')
  localStorage.clear()
})

describe('detectLang', () => {
  it('follows the first browser language', () => {
    expect(detectLang(['hu-HU', 'en'])).toBe('hu')
    expect(detectLang(['en-GB', 'hu'])).toBe('en')
    expect(detectLang([])).toBe('en')
  })
})

describe('setLang', () => {
  it('persists and sets html lang', () => {
    setLang('hu')
    expect(getLang()).toBe('hu')
    expect(localStorage.getItem('plottwist.lang')).toBe('hu')
    expect(document.documentElement.lang).toBe('hu')
  })
})

describe('initLang', () => {
  it('prefers the stored choice, else the browser language', () => {
    localStorage.setItem('plottwist.lang', 'hu')
    initLang()
    expect(getLang()).toBe('hu')
    localStorage.clear()
    vi.stubGlobal('navigator', { languages: ['hu-HU'] })
    initLang()
    expect(getLang()).toBe('hu')
  })

  it('storage blocked: default language, no throw', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('blocked')
      },
      setItem: () => {
        throw new Error('blocked')
      },
    })
    expect(() => initLang()).not.toThrow()
    expect(getLang()).toBe('en')
    expect(() => setLang('hu')).not.toThrow()
    expect(getLang()).toBe('hu')
  })
})
