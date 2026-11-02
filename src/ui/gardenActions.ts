import { createProject, type Project } from '../model/project'
import { listProjects, saveProject, useStorageStatus } from '../storage/db'
import { MAX_IMPORT_BYTES, parseProjectFile } from '../storage/file'
import { nameTaken, uniqueName } from '../storage/names'
import { en } from '../strings/en'

type Saved = { id: string; name: string }[]
export type GardenResult = { project: Project } | { error: string }

// Read the saved list fresh, so a garden made in another tab counts too; `fallback` is what the caller last listed.
const savedGardens = (fallback: Saved) => listProjects().catch(() => fallback)

/** Saves the project; a failed save flags storage as unavailable but still lets the garden open. */
async function save(project: Project): Promise<GardenResult> {
  try {
    await saveProject(project)
  } catch (err) {
    console.error('Could not save garden', err)
    useStorageStatus.setState({ unavailable: true })
  }
  return { project }
}

/** A new, saved garden, or an error when the name is already taken. */
export async function createGarden(name: string, fallback: Saved): Promise<GardenResult> {
  const n = name.trim() || en.gardens.newGardenName
  if (nameTaken(n, await savedGardens(fallback))) return { error: en.gardens.nameTaken(n) }
  return save(createProject(n))
}

/** A garden read from an exported file and saved under a free name, or an error for a file that isn't one. */
export async function importGarden(file: File, fallback: Saved): Promise<GardenResult> {
  if (file.size > MAX_IMPORT_BYTES) return { error: en.import.notJson }
  let text: string
  try {
    text = await file.text()
  } catch {
    return { error: en.import.notJson }
  }
  const r = parseProjectFile(text)
  if (!r.ok) return { error: r.error }
  return save({ ...r.project, name: uniqueName(r.project.name, await savedGardens(fallback)) })
}
