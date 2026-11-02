import * as Comlink from 'comlink'
import type { PlacedPlant, Point, Project, Season } from '../model/project'
import type { SunGrid } from '../engine/shadow'
import type { Warning } from '../engine/checks/types'
import { getLang, type Lang } from '../strings/lang'

/** The worker's API: every method takes the UI language last, so warning wording matches the screen. */
export type EngineApi = {
  overlay(project: Project, season: Season, year: number, lang: Lang): Promise<SunGrid | null> // null without location
  analyze(project: Project, lang: Lang): Promise<Warning[]> // bundled plant library; dismissed warnings left out
  suggest(project: Project, placedId: string, lang: Lang): Promise<Point[]> // sunnier spots for one placed plant
  arrange(project: Project, lang: Lang): Promise<PlacedPlant[]> // ghost guild plants round each tree; [] without trees
}

/** What callers see: the same methods without the language argument; the client adds `getLang()`. */
export type EngineClient = { [K in keyof EngineApi]: EngineApi[K] extends (...a: [...infer A, Lang]) => infer R ? (...a: A) => R : never }

let remote: Comlink.Remote<EngineApi> | null = null
function get(): Comlink.Remote<EngineApi> {
  remote ??= Comlink.wrap<EngineApi>(new Worker(new URL('./engine.worker.ts', import.meta.url), { type: 'module' }))
  return remote
}

// Lazy: the Worker is only created on first call, so importing this in jsdom is safe.
export const engine: EngineClient = new Proxy({} as EngineClient, {
  get:
    (_t, prop) =>
    (...args: unknown[]) =>
      (Reflect.get(get(), prop) as (...a: unknown[]) => Promise<unknown>)(...args, getLang()),
})
