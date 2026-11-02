import { useStore } from 'zustand'
import { langStore, type Lang } from './lang'

/** React hook: the active language; re-renders on change. UI files only (the worker must not import this). */
export const useLang = (): Lang => useStore(langStore, (s) => s.lang)
