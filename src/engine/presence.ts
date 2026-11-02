import type { PlantLibrary, PlantRecord } from '../model/plants'
import type { PlacedPlant, Project } from '../model/project'
import { YEAR_SAMPLES } from './growth'
import { inCycle } from './rotationCycle'

/** Age that makes sizeAt return full size: an annual in a veggie bed is fully grown in its year. */
export const MATURE_AGE = 100

/** Seasonal (replanted every year) in a veggie-beds garden: flagged annual, or in the rotation cycle (rotating means replanting). */
export const seasonalInBeds = (project: Pick<Project, 'gardenType'>, rec: PlantRecord | undefined): boolean =>
  project.gardenType === 'veggie-beds' && (rec?.annual === true || inCycle(rec?.rotationGroup))
const annualInBeds = seasonalInBeds

/** Whether the placed plant exists in `year`. Annuals in a veggie-beds garden live only in their planting year. */
export function isPresent(project: Pick<Project, 'gardenType'>, rec: PlantRecord | undefined, pp: PlacedPlant, year: number): boolean {
  return annualInBeds(project, rec) ? year === pp.plantedYear : year >= pp.plantedYear
}

/** Age to feed sizeAt: −1 when absent, MATURE_AGE for a present veggie-bed annual, else year − plantedYear (as always). */
export function ageAt(project: Pick<Project, 'gardenType'>, rec: PlantRecord | undefined, pp: PlacedPlant, year: number): number {
  if (project.gardenType !== 'veggie-beds') return year - pp.plantedYear
  if (!isPresent(project, rec, pp, year)) return -1
  return annualInBeds(project, rec) ? MATURE_AGE : year - pp.plantedYear
}

/** Years the long-range checks look at: a veggie-bed annual lives only in its planting year, so that year alone; else the usual samples. */
export function yearsToCheck(project: Pick<Project, 'gardenType'>, rec: PlantRecord | undefined, pp: PlacedPlant): readonly number[] {
  return annualInBeds(project, rec) ? [pp.plantedYear] : YEAR_SAMPLES
}

/** The years to check in which the placed plant exists, each with the age to feed sizeAt. */
export function presentYears(project: Pick<Project, 'gardenType'>, rec: PlantRecord | undefined, pp: PlacedPlant): { year: number; age: number }[] {
  return yearsToCheck(project, rec, pp).flatMap((year) => {
    const age = ageAt(project, rec, pp, year)
    return age < 0 ? [] : [{ year, age }]
  })
}

/** The project as it stands in `year`: a veggie-beds garden keeps only the plants present then; a food forest is returned as is. */
export function layoutOf(project: Project, library: PlantLibrary, year: number = project.settings.year): Project {
  if (project.gardenType !== 'veggie-beds') return project
  return { ...project, plants: project.plants.filter((pp) => isPresent(project, library.byId.get(pp.plantId), pp, year)) }
}
