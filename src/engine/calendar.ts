import type { CalendarRule, CalendarTask, PlantLibrary, PlantRecord, SubSeason } from '../model/plants'
import { plantName } from '../model/plants'
import type { Climate, PlacedPlant, Project } from '../model/project'
import { isPresent } from './presence'
import { en } from '../strings/en'

export type CalendarJob = { month: number /*1–12*/; task: CalendarTask; placedId: string; plantId: string; text: string }

const SEASON_ORDER: SubSeason[] = [
  'early-spring', 'mid-spring', 'late-spring',
  'early-summer', 'mid-summer', 'late-summer',
  'early-autumn', 'mid-autumn', 'late-autumn',
  'early-winter', 'mid-winter', 'late-winter',
]
const TASK_ORDER: CalendarTask[] = ['plant', 'prune', 'harvest']
const MONTH_STARTS = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334] // non-leap, day-of-year offsets

/** Northern: early-spring is March … late-winter is February. Southern shifts by six months. */
export function subSeasonMonth(s: SubSeason, southern: boolean): number {
  const north = ((2 + SEASON_ORDER.indexOf(s)) % 12) + 1
  return southern ? ((north + 5) % 12) + 1 : north
}

function doyMonth(doy: number): number {
  const d = (((Math.round(doy) - 1) % 365) + 365) % 365 // 0..364
  let m = 11
  while (MONTH_STARTS[m]! > d) m--
  return m + 1
}

/** Months a rule applies (a seasonal range wraps across the year end); null when frost dates are needed but unknown. */
export function ruleMonths(rule: CalendarRule, southern: boolean, climate: Climate | null): number[] | null {
  if ('frost' in rule) {
    if (!climate || climate.frostFree) return null
    const doy = rule.frost === 'last' ? climate.lastFrostDoy : climate.firstFrostDoy
    if (doy === null) return null
    return [doyMonth(doy + rule.offsetWeeks * 7)]
  }
  const from = subSeasonMonth(rule.from, southern)
  const to = subSeasonMonth(rule.to, southern)
  const months = [from]
  for (let m = from; m !== to; ) {
    m = (m % 12) + 1
    months.push(m)
  }
  return months
}

/** Years since planting, or −1 when the plant does not exist in `year` (an annual in a veggie bed is planted fresh, age 0). */
function calendarAge(project: Project, rec: PlantRecord, pl: PlacedPlant, year: number): number {
  return isPresent(project, rec, pl, year) ? year - pl.plantedYear : -1
}

/** Whether a plant `age` years after planting has this job at all: planting only in its first year (every year for an
 *  annual, unless the garden is known to be frost-free), harvest once old enough. */
function ruleDue(rule: CalendarRule, rec: PlantRecord, age: number, climate: Climate | null): boolean {
  if (age < 0) return false
  const replanted = rec.annual === true && !climate?.frostFree
  if (rule.task === 'plant' && age !== 0 && !replanted) return false
  if (rule.task === 'harvest' && age < (rec.firstHarvestYears ?? 0)) return false
  return true
}

/** Plant species and task due in `year` whose date cannot be worked out because frost dates are missing. */
export function undatedTasks(project: Project, library: PlantLibrary, year: number): { plantId: string; task: CalendarTask; name: string }[] {
  const southern = (project.location?.lat ?? 0) < 0
  const seen = new Set<string>()
  const out: { plantId: string; task: CalendarTask; name: string }[] = []
  for (const pl of project.plants) {
    const rec = library.byId.get(pl.plantId)
    if (!rec) continue
    for (const rule of rec.calendar) {
      const key = `${pl.plantId}|${rule.task}`
      if (seen.has(key) || !ruleDue(rule, rec, calendarAge(project, rec, pl, year), project.climate) || ruleMonths(rule, southern, project.climate) !== null) continue
      seen.add(key)
      out.push({ plantId: pl.plantId, task: rule.task, name: plantName(rec) })
    }
  }
  return out
}

export function buildCalendar(project: Project, library: PlantLibrary, year: number): CalendarJob[] {
  const southern = (project.location?.lat ?? 0) < 0
  type Group = { month: number; task: CalendarTask; plantId: string; name: string; isTree: boolean; ids: string[] }
  const groups = new Map<string, Group>()
  for (const pl of project.plants) {
    const rec = library.byId.get(pl.plantId)
    if (!rec) continue
    const age = calendarAge(project, rec, pl, year)
    for (const rule of rec.calendar) {
      if (!ruleDue(rule, rec, age, project.climate)) continue
      const months = ruleMonths(rule, southern, project.climate)
      if (!months) continue
      for (const month of months) {
        const key = `${pl.plantId}|${rule.task}|${month}`
        const g = groups.get(key)
        if (g) g.ids.push(pl.id)
        else groups.set(key, { month, task: rule.task, plantId: pl.plantId, name: plantName(rec), isTree: rec.layer === 'canopy' || rec.layer === 'sub-canopy', ids: [pl.id] })
      }
    }
  }
  return [...groups.values()]
    .sort((a, b) => a.month - b.month || TASK_ORDER.indexOf(a.task) - TASK_ORDER.indexOf(b.task) || a.name.localeCompare(b.name))
    .map((g) => ({ month: g.month, task: g.task, placedId: g.ids[0]!, plantId: g.plantId, text: en.calendar.job(g.task, g.name, g.ids.length, g.isTree) }))
}
