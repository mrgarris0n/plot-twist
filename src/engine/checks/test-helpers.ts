import type { PlacedPlant } from '../../model/project'

/** Test-only placed plant at (x, y), planted in year 0 with no overrides. */
export function place(id: string, plantId: string, x: number, y: number, o: Partial<PlacedPlant> = {}): PlacedPlant {
  return { id, plantId, variantId: null, x, y, plantedYear: 0, heightOverrideM: null, widthOverrideM: null, ...o }
}
