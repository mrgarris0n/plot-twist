import { CircleHelp } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { library } from '../data/library'
import { en } from '../strings/en'
import { Modal } from './Modal'
import { CloseButton } from './CloseButton'
import { feedbackHref } from './alpha'

type PlantSource = { title: string; url: string; licence: string }

/** Every distinct plant source in the library (same title and link counted once), sorted by title. */
function plantSources(): PlantSource[] {
  const seen = new Map<string, PlantSource>()
  for (const p of library.all) {
    for (const s of p.sources) seen.set(`${s.title}\n${s.url}`, { title: s.title, url: s.url, licence: s.licence })
  }
  return [...seen.values()].sort((a, b) => a.title.localeCompare(b.title))
}

export function CreditsDialog({ onClose }: { onClose: () => void }) {
  const sources = useMemo(plantSources, [])

  return (
    <Modal labelledBy="credits-title" className="credits-dialog" onClose={onClose}>
      <div>
        <header>
          <h2 id="credits-title">{en.credits.title}</h2>
          <CloseButton label={en.credits.close} onClick={onClose} autoFocus />
        </header>
        <p>{en.credits.about}</p>
        <h3>{en.credits.shortcutsHeading}</h3>
        <dl className="shortcuts">
          {en.credits.shortcuts.map(([keys, action]) => (
            <div key={keys}><dt><kbd>{keys}</kbd></dt><dd>{action}</dd></div>
          ))}
        </dl>
        <h3>{en.credits.creditsHeading}</h3>
        <p>{en.credits.intro}</p>
        <h3>{en.credits.mapHeading}</h3>
        <ul>
          <li>
            {en.credits.mapTiles}{en.credits.separator}
            <a href="https://openfreemap.org" target="_blank" rel="noopener">{en.credits.openFreeMap}</a>,{' '}
            <a href="https://openmaptiles.org" target="_blank" rel="noopener">{en.credits.openMapTiles}</a>
          </li>
          <li>
            {en.credits.mapData}{en.credits.separator}
            <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">{en.credits.osm}</a>
          </li>
          <li>{en.credits.geocoder}</li>
        </ul>
        <h3>{en.credits.soilHeading}</h3>
        <p>
          {en.credits.soil}{' '}
          <a href="https://soilgrids.org" target="_blank" rel="noopener">{en.credits.soilLink}</a>
        </p>
        <p className="hint">{en.credits.soilProcessed}</p>
        <h3>{en.credits.climateHeading}</h3>
        <p>
          <a href="https://cds.climate.copernicus.eu/datasets/sis-agroclimatic-indicators" target="_blank" rel="noopener">{en.credits.climateSource}</a>
          <br />
          <a href="https://cds.climate.copernicus.eu/datasets/reanalysis-era5-single-levels-monthly-means" target="_blank" rel="noopener">{en.credits.sunshineSource}</a>
          <br />
          {en.credits.climate}
        </p>
        <h3>{en.credits.plantsHeading}</h3>
        <p>{en.credits.plantsIntro}</p>
        <details>
          <summary>{en.credits.plantsToggle(sources.length)}</summary>
          <ul>
            {sources.map((s) => (
              <li key={`${s.title}\n${s.url}`}>
                <a href={s.url} target="_blank" rel="noopener">{s.title}</a> <span className="hint">({s.licence})</span>
              </li>
            ))}
          </ul>
        </details>
        <p className="hint">{en.credits.pfaf}</p>
        <p className="hint">{en.alpha.app.version(__BUILD__)}</p>
        <p>
          <a href={feedbackHref(__BUILD__, navigator.userAgent)} target="_blank" rel="noopener">{en.alpha.app.feedback}</a>
          {' · '}
          <a href="/privacy.html" target="_blank" rel="noopener">{en.credits.privacy}</a>
        </p>
      </div>
    </Modal>
  )
}

/** Opens the credits. `iconOnly` shows a ? icon with the label as tooltip (editor header); `label` and `className` restyle the text button (landing page). */
export function CreditsButton({ iconOnly = false, label = en.credits.open, className = 'credits-link' }: { iconOnly?: boolean; label?: string; className?: string }) {
  const [open, setOpen] = useState(false)
  const btn = useRef<HTMLButtonElement>(null)
  const close = () => {
    setOpen(false)
    btn.current?.focus()
  }
  return (
    <>
      {iconOnly ? (
        <button ref={btn} type="button" className="icon-button tip tip-below tip-end" aria-label={en.credits.open} data-tip={en.credits.open} onClick={() => setOpen(true)}>
          <CircleHelp aria-hidden="true" size={18} />
        </button>
      ) : (
        <button ref={btn} type="button" className={className} onClick={() => setOpen(true)}>{label}</button>
      )}
      {open && <CreditsDialog onClose={close} />}
    </>
  )
}
