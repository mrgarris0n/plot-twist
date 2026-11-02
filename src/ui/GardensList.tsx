import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'

import { listProjects, useStorageStatus } from '../storage/db'
import { uniqueName } from '../storage/names'
import { useStore } from '../state/store'
import { en } from '../strings/en'
import { useLang } from '../strings/useLang'
import { CreditsButton } from './CreditsDialog'
import { createGarden, importGarden } from './gardenActions'
import { GardensDialog } from './GardensDialog'
import { HU_HERO_AVAILABLE } from './landing'
import { Modal } from './Modal'
import { SettingsMenu } from './SettingsMenu'
import { AlphaNotice } from './AlphaNotice'

type Entry = { id: string; name: string; updatedAt: string }

export default function GardensList() {
  const lang = useLang()
  const heroPrefix = lang === 'hu' && HU_HERO_AVAILABLE ? 'hero-hu' : 'hero'
  const openProject = useStore((s) => s.openProject)
  const unavailable = useStorageStatus((s) => s.unavailable)
  const [items, setItems] = useState<Entry[]>([])
  const [naming, setNaming] = useState(false)
  const [browsing, setBrowsing] = useState(false)
  const [newName, setNewName] = useState<string>(en.gardens.newGardenName)
  const [error, setError] = useState<string | null>(null)

  const fileInput = useRef<HTMLInputElement>(null)

  const refresh = useCallback(async () => {
    try {
      setItems(await listProjects())
    } catch (e) {
      console.error('Could not list gardens', e)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const create = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    const r = await createGarden(newName, items)
    if ('error' in r) return setError(r.error)
    openProject(r.project)
  }

  const importFile = async (file: File | undefined) => {
    if (fileInput.current) fileInput.current.value = ''
    if (!file) return
    setError(null)
    const r = await importGarden(file, items)
    if ('error' in r) return setError(r.error)
    openProject(r.project)
  }

  return (
    <main className="landing">
      <AlphaNotice />
      <section className="hero">
        <h1 className="hero-title">
          <picture>
            <source media="(max-width: 900px)" srcSet={`/landing/${heroPrefix}-1200.webp`} />
            <img src={`/landing/${heroPrefix}-2000.webp`} alt={en.landing.heroAlt} width={2000} height={1116} />
          </picture>
        </h1>
        <nav className="hero-nav">
          <CreditsButton label={en.credits.aboutLink} className="hero-about" />
          <SettingsMenu showUnits={false} />
        </nav>
        <div className="hero-actions">
          <button type="button" className="hero-primary" onClick={() => { setNewName(uniqueName(en.gardens.newGardenName, items)); setError(null); setNaming(true) }}>
            {en.gardens.newGarden}
          </button>
          {items.length > 0 && (
            <button type="button" className="hero-secondary" onClick={() => { setError(null); setBrowsing(true) }}>{en.gardens.openGarden}</button>
          )}
          <button type="button" className="hero-secondary" onClick={() => fileInput.current?.click()}>{en.import.button}</button>
        </div>
      </section>
      <input
        ref={fileInput}
        type="file"
        accept=".json,.plottwist.json,.terragrid.json"
        hidden
        data-testid="import-input"
        onChange={(e) => void importFile(e.target.files?.[0])}
      />
      {(unavailable || (error && !naming && !browsing)) && (
        <div className="landing-messages">
          {unavailable && <p role="alert" className="banner">{en.gardens.storageUnavailable}</p>}
          {error && !naming && !browsing && <p role="alert">{error}</p>}
        </div>
      )}
      {browsing && <GardensDialog onClose={() => { setBrowsing(false); setError(null) }} onChanged={refresh} />}
      {naming && (
        <Modal labelledBy="new-garden-title" className="new-garden-dialog" onClose={() => { setNaming(false); setError(null) }}>
          <form onSubmit={create}>
            <h2 id="new-garden-title">{en.gardens.newGarden}</h2>
            <label>
              {en.gardens.nameLabel}
              <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} data-autofocus />
            </label>
            {error && <p role="alert" className="field-error">{error}</p>}
            <div className="dialog-actions">
              <button type="button" onClick={() => { setNaming(false); setError(null) }}>{en.gardens.cancel}</button>
              <button type="submit" className="primary">{en.gardens.create}</button>
            </div>
          </form>
        </Modal>
      )}
    </main>
  )
}
