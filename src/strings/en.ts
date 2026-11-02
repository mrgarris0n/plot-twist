import { english, type Strings } from './english.js'
import { hungarian } from './hu.js'
import { getLang, type Lang } from './lang.js'

export { english }
export type { Strings, LightObstacle } from './english.js'

export const strings = (l: Lang): Strings => (l === 'hu' ? hungarian : english)

/**
 * The live strings: every read resolves against the active language, so call sites keep writing `en.x.y`.
 * Read it at render time, never at module level.
 */
export const en: Strings = new Proxy(english, {
  get: (_t, key) => Reflect.get(strings(getLang()), key),
  has: (_t, key) => Reflect.has(strings(getLang()), key),
  ownKeys: () => Reflect.ownKeys(strings(getLang())),
  getOwnPropertyDescriptor: (_t, key) => Reflect.getOwnPropertyDescriptor(strings(getLang()), key),
})
