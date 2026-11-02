import { Pencil, Plus, Trash2, Upload } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'

import { deleteProject, listProjects, loadProject, saveProject, useStorageStatus } from '../storage/db'
import { nameTaken, uniqueName } from '../storage/names'
import { useStore } from '../state/store'
import { en } from '../strings/en'
import { formatDate } from '../strings/lang'
import { createGarden, importGarden } from './gardenActions'
import { Modal } from './Modal'
import { CloseButton } from './CloseButton'

type Entry = { id: string; name: string; updatedAt: string }

/**
 * The saved gardens: click one to open it, pencil to rename, bin to delete. `withActions` adds New garden and
 * Import (the editor's drawer; the start page has its own buttons for those).
 */
export function GardensPanel({ onOpened, onChanged, withActions = false }: { onOpened: () => void; onChanged?: () => void; withActions?: boolean }) {
  const openProject = useStore((s) => s.openProject)
  const currentId = useStore((s) => s.project?.id ?? null)
  const [items, setItems] = useState<Entry[] | null>(null)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [naming, setNaming] = useState(false)
  const [newName, setNewName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  const refresh = useCallback(async () => {
    try {
      setItems(await listProjects())
    } catch (e) {
      console.error('Could not list gardens', e)
      setItems([])
    }
    onChanged?.()
  }, [onChanged])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const open = async (id: string) => {
    setError(null)
    if (id === currentId) return onOpened()
    const p = await loadProject(id).catch(() => null)
    if (!p) return setError(en.gardens.loadFailed)
    openProject(p)
    onOpened()
  }

  const rename = async (e: FormEvent, id: string) => {
    e.preventDefault()
    const name = renameValue.trim()
    setError(null)
    if (!name) return setRenamingId(null)
    const saved = await listProjects().catch(() => items ?? [])
    if (nameTaken(name, saved, id)) return setError(en.gardens.nameTaken(name)) // form stays open to fix it
    setRenamingId(null)
    try {
      if (id === currentId) {
        // The open garden is saved from the editor's state, so rename it there too or autosave would undo this.
        useStore.getState().update((p) => { p.name = name })
        await saveProject(useStore.getState().project!)
      } else {
        const p = await loadProject(id).catch(() => null)
        if (!p) return setError(en.gardens.renameFailed)
        await saveProject({ ...p, name, updatedAt: new Date().toISOString() })
      }
    } catch (err) {
      console.error('Could not rename garden', err)
      useStorageStatus.setState({ unavailable: true })
    }
    await refresh()
  }

  const remove = async (g: Entry) => {
    if (!window.confirm(en.gardens.confirmDelete(g.name))) return
    if (g.id === currentId) {
      // Leave the open garden first: switching or closing flushes its pending autosave, which must land before the
      // delete. Move to the most recently changed other garden (the list is newest first); none left → start page.
      const next = (items ?? []).find((i) => i.id !== g.id)
      const p = next ? await loadProject(next.id).catch(() => null) : null
      if (p) openProject(p)
      else useStore.getState().closeProject()
    }
    await deleteProject(g.id).catch((err) => console.error('Could not delete garden', err))
    await refresh()
  }

  const opened = (r: Awaited<ReturnType<typeof createGarden>>) => {
    if ('error' in r) return setError(r.error)
    openProject(r.project)
    onOpened()
  }
  const create = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    opened(await createGarden(newName, items ?? []))
  }
  const importFile = async (file: File | undefined) => {
    if (fileInput.current) fileInput.current.value = ''
    if (!file) return
    setError(null)
    opened(await importGarden(file, items ?? []))
  }

  return (
    <div className="gardens-panel">
      {error && <p role="alert" className="field-error">{error}</p>}
      {items === null ? null : items.length === 0 ? (
        <p className="hint">{en.gardens.empty}</p>
      ) : (
        <ul>
          {items.map((g) => (
            <li key={g.id} aria-current={g.id === currentId || undefined}>
              {renamingId === g.id ? (
                <form onSubmit={(e) => void rename(e, g.id)}>
                  <input type="text" aria-label={en.gardens.nameLabel} value={renameValue} onChange={(e) => setRenameValue(e.target.value)} autoFocus />
                  <button type="submit">{en.gardens.save}</button>
                  <button type="button" onClick={() => setRenamingId(null)}>{en.gardens.cancel}</button>
                </form>
              ) : (
                <>
                  <button type="button" className="garden-open" onClick={() => void open(g.id)}>
                    <strong>{g.name}</strong>
                    <span className="hint">{g.id === currentId ? en.gardens.current : en.gardens.updated(formatDate(g.updatedAt))}</span>
                  </button>
                  <button type="button" className="icon-button tip tip-end" aria-label={en.gardens.rename} data-tip={en.gardens.rename}
                    onClick={() => { setRenamingId(g.id); setRenameValue(g.name) }}>
                    <Pencil aria-hidden="true" size={16} />
                  </button>
                  <button type="button" className="icon-button tip tip-end danger" aria-label={en.gardens.delete} data-tip={en.gardens.delete} onClick={() => void remove(g)}>
                    <Trash2 aria-hidden="true" size={16} />
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
      {withActions && (
        <div className="gardens-actions">
          {naming ? (
            <form onSubmit={(e) => void create(e)}>
              <input type="text" aria-label={en.gardens.nameLabel} value={newName} onChange={(e) => setNewName(e.target.value)} autoFocus />
              <button type="submit" className="primary">{en.gardens.create}</button>
              <button type="button" onClick={() => { setNaming(false); setError(null) }}>{en.gardens.cancel}</button>
            </form>
          ) : (
            <>
              <button type="button" onClick={() => { setNewName(uniqueName(en.gardens.newGardenName, items ?? [])); setError(null); setNaming(true) }}>
                <Plus aria-hidden="true" size={16} /> {en.gardens.newGarden}
              </button>
              <button type="button" onClick={() => fileInput.current?.click()}>
                <Upload aria-hidden="true" size={16} /> {en.import.button}
              </button>
            </>
          )}
          <input ref={fileInput} type="file" accept=".json,.plottwist.json,.terragrid.json" hidden data-testid="drawer-import-input"
            onChange={(e) => void importFile(e.target.files?.[0])} />
        </div>
      )}
    </div>
  )
}

/** The start page's "Open a garden" popup around the same list. */
export function GardensDialog({ onClose, onChanged }: { onClose: () => void; onChanged?: () => void }) {
  return (
    <Modal labelledBy="gardens-title" className="gardens-dialog" onClose={onClose}>
      <header className="dialog-head">
        <h2 id="gardens-title">{en.gardens.title}</h2>
        <CloseButton label={en.gardens.close} onClick={onClose} autoFocus />
      </header>
      <GardensPanel onOpened={onClose} onChanged={onChanged} />
    </Modal>
  )
}
