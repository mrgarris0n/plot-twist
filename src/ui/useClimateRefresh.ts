import { useEffect, useRef } from 'react'
import type { Climate } from '../model/project'
import { loadClimate } from '../services/climate'
import { useStore } from '../state/store'

/** Stores a looked-up climate unless the project already holds exactly that. */
export function storeLookedUpClimate(c: Climate): void {
  const cur = useStore.getState().project?.climate
  if (!cur || JSON.stringify(cur) !== JSON.stringify(c)) useStore.getState().setClimate(c)
}

/**
 * Gardens saved before rain and cloud were looked up keep a looked-up climate without them.
 * Refresh such a climate once per opened project, without needing the Location drawer.
 * A failed lookup keeps the climate as it is.
 */
export function useClimateRefresh(): void {
  const id = useStore((s) => s.project?.id)
  const lat = useStore((s) => s.project?.location?.lat)
  const lon = useStore((s) => s.project?.location?.lon)
  const stale = useStore((s) => s.project?.climate?.source === 'lookup' && s.project.climate.rainYearMm === undefined)
  const tried = useRef<string | null>(null)

  useEffect(() => {
    if (!id || !stale || lat === undefined || lon === undefined || tried.current === id) return
    tried.current = id
    loadClimate({ lat, lon }).then((c) => {
      const cur = useStore.getState().project
      if (!c || cur?.id !== id || cur.climate?.source !== 'lookup') return
      storeLookedUpClimate(c)
    })
  }, [id, stale, lat, lon])
}
