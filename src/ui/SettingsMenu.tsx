import { Settings } from 'lucide-react'
import { useRef } from 'react'
import { useStore } from '../state/store'
import { en } from '../strings/en'
import { setLang, type Lang } from '../strings/lang'
import { useLang } from '../strings/useLang'
import { useDismiss } from './useDismiss'
import { useLangCarriedState } from './useLangCarried'
import { feedbackHref } from './alpha'

const LANGS: Lang[] = ['en', 'hu']

/** Settings popover: language always; units only inside a garden (`showUnits`). */
export function SettingsMenu({ showUnits = true }: { showUnits?: boolean }) {
  const units = useStore((s) => s.project?.settings.units)
  const setUnits = useStore((s) => s.setUnits)
  const lang = useLang()
  const [open, setOpen] = useLangCarriedState('settings.open', false)
  const ref = useRef<HTMLDetailsElement>(null)
  useDismiss(ref, open, () => setOpen(false))
  if (showUnits && !units) return null
  return (
    <details className="settings-menu" ref={ref} open={open} onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary className="icon-button tip tip-below tip-end" aria-label={en.settings.button} data-tip={en.settings.button}>
        <Settings aria-hidden="true" size={18} />
      </summary>
      <div className="settings-panel">
        {showUnits && units && (
          <fieldset>
            <legend>{en.settings.units}</legend>
            <label>
              <input type="radio" name="units" checked={units === 'metric'} onChange={() => setUnits('metric')} /> {en.settings.metric}
            </label>
            <label>
              <input type="radio" name="units" checked={units === 'imperial'} onChange={() => setUnits('imperial')} /> {en.settings.imperial}
            </label>
          </fieldset>
        )}
        <fieldset>
          <legend>{en.settings.language}</legend>
          {LANGS.map((l) => (
            <label key={l}>
              <input type="radio" name="language" checked={lang === l} onChange={() => setLang(l)} /> <span lang={l}>{en.settings.langNames[l]}</span>
            </label>
          ))}
        </fieldset>
        <a href={feedbackHref(__BUILD__, navigator.userAgent)} target="_blank" rel="noopener">{en.alpha.app.feedback}</a>
      </div>
    </details>
  )
}
