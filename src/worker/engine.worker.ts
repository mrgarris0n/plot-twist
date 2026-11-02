import * as Comlink from 'comlink'
import { autoArrange } from '../engine/arrange'
import { analyze } from '../engine/checks'
import { buildScene, OVERLAY_Z, seasonSamples } from '../engine/scene'
import { suggestSpots } from '../engine/suggest'
import { library } from '../data/library'
import { groundOf } from '../engine/slope'
import { sunHoursGrid } from '../engine/shadow'
import { setLang } from '../strings/lang'
import type { EngineApi } from './client'

export const api: EngineApi = {
  async overlay(project, season, year, lang) {
    setLang(lang)
    if (!project.location) return null
    return sunHoursGrid(project.plot, OVERLAY_Z, seasonSamples(project, season), buildScene(project, library, year, season), groundOf(project))
  },
  async analyze(project, lang) {
    setLang(lang)
    return analyze(project, library)
  },
  async suggest(project, placedId, lang) {
    setLang(lang)
    return suggestSpots(project, library, placedId)
  },
  async arrange(project, lang) {
    setLang(lang)
    return autoArrange(project, library)
  },
}

if (typeof document === 'undefined') Comlink.expose(api)
