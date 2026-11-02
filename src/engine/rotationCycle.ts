import type { RotationGroup } from '../model/plants'

/**
 * Crop-rotation order, read as "what grows in a bed next year": each group follows the one before it.
 * `any` is outside the cycle. Source: RHS, "Crop rotation" (https://www.rhs.org.uk/vegetables/crop-rotation),
 * four-year plan: legumes, brassicas, potatoes, onions and roots, then legumes again.
 */
export const ROTATION_CYCLE: RotationGroup[] = ['legumes', 'brassicas', 'potatoes', 'roots']

export const inCycle = (g: RotationGroup | null | undefined): g is RotationGroup => g != null && ROTATION_CYCLE.includes(g)
