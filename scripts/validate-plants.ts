import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { validateLibrary } from '../src/model/plants.ts'
import { validateCompanions } from '../src/model/companions.ts'

const dir = join(import.meta.dirname, '..', 'data', 'plants')
const records: unknown[] = []
const errors: string[] = []
for (const file of readdirSync(dir).filter((f) => f.endsWith('.json')).sort()) {
  try {
    const content: unknown = JSON.parse(readFileSync(join(dir, file), 'utf8'))
    if (Array.isArray(content)) records.push(...content)
    else errors.push(`${file}: must contain an array of plant records`)
  } catch (e) {
    errors.push(`${file}: ${e instanceof Error ? e.message : String(e)}`)
  }
}
const result = validateLibrary(records)
if (!result.ok) errors.push(...result.errors)
let pairCount = 0
if (result.ok) {
  try {
    const companionsRaw: unknown = JSON.parse(readFileSync(join(dir, '..', 'companions.json'), 'utf8'))
    const pairs = validateCompanions(companionsRaw, result.library)
    if (pairs.ok) pairCount = pairs.pairs.length
    else errors.push(...pairs.errors)
  } catch (e) {
    errors.push(`companions.json: ${e instanceof Error ? e.message : String(e)}`)
  }
}
if (errors.length > 0) {
  console.error(errors.join('\n'))
  process.exit(1)
}
console.log(`Plant data OK: ${records.length} plants, ${pairCount} companion pairs`)
