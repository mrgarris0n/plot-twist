import { useEffect, useRef, useState } from 'react'
import type { Project } from '../../model/project'

/**
 * Ask the engine worker about the current project, debounced; replies to superseded requests are discarded.
 * `request` must be a stable function. Any project edit (new object identity) triggers a refresh.
 */
export function useEngineResultFor<T>(project: Project | null, enabled: boolean, delayMs: number, request: (p: Project) => Promise<T>, empty: T): { value: T; forProject: Project | null } {
  const [result, setResult] = useState<{ value: T; forProject: Project | null }>({ value: empty, forProject: null })
  const counter = useRef(0)
  useEffect(() => {
    const id = ++counter.current
    if (!enabled || !project) {
      setResult({ value: empty, forProject: project })
      return
    }
    const timer = setTimeout(() => {
      request(project)
        .then((r) => {
          if (id === counter.current) setResult({ value: r, forProject: project })
        })
        .catch(() => {
          if (id === counter.current) setResult({ value: empty, forProject: project })
        })
    }, delayMs)
    return () => clearTimeout(timer)
  }, [project, enabled, delayMs, request, empty])
  return result
}

export function useEngineResult<T>(project: Project | null, enabled: boolean, delayMs: number, request: (p: Project) => Promise<T>, empty: T): T {
  return useEngineResultFor(project, enabled, delayMs, request, empty).value
}
