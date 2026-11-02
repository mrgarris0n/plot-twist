import { useEffect, useRef, useState, type Dispatch, type MutableRefObject, type SetStateAction } from 'react'
import { langStore } from '../strings/lang'

/**
 * A language switch remounts the page (App.tsx) so every string is rebuilt. State that says where the user is
 * (zoom, open panels, toggles) is handed across that remount by key; any other unmount drops it as usual.
 */
const carried = new Map<string, unknown>()

const carriedOr = <T,>(key: string, initial: T): T => (carried.has(key) ? (carried.get(key) as T) : initial)

// Saved when the language changes, before React renders the new tree (cleanups at unmount would run too late).
function useCarry(key: string, ref: { current: unknown }) {
  useEffect(() => {
    carried.delete(key) // taken: only the remount right after a switch gets it
    return langStore.subscribe((s, prev) => { if (s.lang !== prev.lang) carried.set(key, ref.current) })
  }, [key, ref])
}

/** useState that survives the language remount. */
export function useLangCarriedState<T>(key: string, initial: T): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => carriedOr(key, initial))
  const latest = useRef(value)
  useEffect(() => { latest.current = value }, [value])
  useCarry(key, latest)
  return [value, setValue]
}

/** useRef that survives the language remount. */
export function useLangCarriedRef<T>(key: string, initial: T): MutableRefObject<T> {
  const ref = useRef<T>(carriedOr(key, initial))
  useCarry(key, ref)
  return ref
}
