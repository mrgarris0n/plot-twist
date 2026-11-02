import { validateLibrary, type PlantLibrary, plantName, variantLabel, variantOf } from '../model/plants'

function load(): PlantLibrary {
  const files = import.meta.glob('/data/plants/*.json', { eager: true, import: 'default' })
  const records: unknown[] = []
  for (const [path, content] of Object.entries(files)) {
    if (!Array.isArray(content)) throw new Error(`Plant data ${path} must be an array of plant records`)
    records.push(...content)
  }
  const result = validateLibrary(records)
  if (!result.ok) throw new Error(`Invalid plant data:\n${result.errors.join('\n')}`)
  return result.library
}

export const library: PlantLibrary = load()

export { variantOf, variantLabel, plantName }
