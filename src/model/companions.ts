import { z } from 'zod'
import { getLang } from '../strings/lang.ts'
import { sourceSchema, type PlantLibrary, type Source } from './plants.ts'

export type CompanionPair = {
  a: string
  b: string
  effect: 'good' | 'bad'
  reason: string
  /** Hungarian wording of `reason`. Translated, so it needs no source. */
  reasonHu?: string
  sources: Source[]
}

/** The pair's reason in the active language (English when it has no Hungarian one). */
export function companionReason(pair: CompanionPair): string {
  return getLang() === 'hu' ? pair.reasonHu ?? pair.reason : pair.reason
}

const pairSchema = z.object({
  a: z.string().min(1),
  b: z.string().min(1),
  effect: z.enum(['good', 'bad']),
  reason: z.string().min(1),
  reasonHu: z.string().min(1).optional(),
  sources: z.array(sourceSchema).min(1, 'needs at least one source'),
}).strict()

export function validateCompanions(
  raw: unknown,
  library: PlantLibrary,
): { ok: true; pairs: CompanionPair[] } | { ok: false; errors: string[] } {
  if (!Array.isArray(raw)) return { ok: false, errors: ['companions must be an array of pairs'] }
  const errors: string[] = []
  const pairs: CompanionPair[] = []
  const seen = new Map<string, CompanionPair['effect']>()
  raw.forEach((item, i) => {
    const r = pairSchema.safeParse(item)
    if (!r.success) {
      for (const issue of r.error.issues) {
        errors.push(`pair[${i}]: ${issue.path.length ? issue.path.join('.') : '(pair)'} ${issue.message}`)
      }
      return
    }
    const p = r.data
    const label = `${p.a}+${p.b}`
    let ok = true
    if (p.a === p.b) { errors.push(`${label}: a plant cannot pair with itself`); ok = false }
    for (const id of [p.a, p.b]) {
      if (!library.byId.has(id)) { errors.push(`${label}: unknown plant id "${id}"`); ok = false }
    }
    const key = [p.a, p.b].sort().join('|')
    const prior = seen.get(key)
    if (prior !== undefined) {
      errors.push(prior === p.effect ? `${label}: duplicate pair` : `${label}: listed as both good and bad`)
      ok = false
    } else seen.set(key, p.effect)
    if (ok) pairs.push(p)
  })
  return errors.length ? { ok: false, errors } : { ok: true, pairs }
}

export function companionsOf(pairs: CompanionPair[], plantId: string): CompanionPair[] {
  return pairs.filter((p) => p.a === plantId || p.b === plantId)
}
