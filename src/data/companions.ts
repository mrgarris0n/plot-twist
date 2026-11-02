import raw from '../../data/companions.json'
import { validateCompanions, type CompanionPair } from '../model/companions'
import { library } from './library'

function load(): CompanionPair[] {
  const result = validateCompanions(raw, library)
  if (!result.ok) throw new Error(`Invalid companion data:\n${result.errors.join('\n')}`)
  return result.pairs
}

export const companions: CompanionPair[] = load()
