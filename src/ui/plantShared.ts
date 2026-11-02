import type { Layer } from '../model/plants'

/** One calm colour per plant layer, defined once; shared by the plan, the plant list and suggested ghosts. */
export const LAYER_COLOR: Record<Layer, string> = {
  canopy: '#4f7f45',
  'sub-canopy': '#7aa35a',
  shrub: '#8a9a4a',
  herbaceous: '#b3b25a',
  'ground-cover': '#7fae8d',
  root: '#b58a5c',
  climber: '#a07ab0',
}

/** Drag data type for a plant dragged from the plant list onto the plan. */
export const PLANT_DRAG_TYPE = 'application/x-plottwist-plant'
