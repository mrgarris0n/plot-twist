import { projectSchema, type Project } from '../model/project'
import { en } from '../strings/en'

export const MAX_IMPORT_BYTES = 5 * 1024 * 1024

export function slug(name: string): string {
  // Accents are dropped (é → e); letters from any script are kept.
  const s = name.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '')
  return s || 'garden'
}

export function exportProject(p: Project): { filename: string; blob: Blob } {
  return {
    filename: `${slug(p.name)}.plottwist.json`,
    blob: new Blob([JSON.stringify(p, null, 2)], { type: 'application/json' }),
  }
}

/** Always assigns a fresh id so an import never overwrites an existing garden. createdAt/updatedAt are kept from the file. */
export function parseProjectFile(text: string): { ok: true; project: Project } | { ok: false; error: string } {
  if (text.length > MAX_IMPORT_BYTES) return { ok: false, error: en.import.notJson }
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    return { ok: false, error: en.import.notJson }
  }
  if (raw && typeof raw === 'object' && typeof (raw as { schemaVersion?: unknown }).schemaVersion === 'number' && (raw as { schemaVersion: number }).schemaVersion > 1) {
    return { ok: false, error: en.import.newer }
  }
  const parsed = projectSchema.safeParse(raw)
  if (!parsed.success) return { ok: false, error: en.import.notJson }
  return { ok: true, project: { ...parsed.data, id: crypto.randomUUID() } }
}
