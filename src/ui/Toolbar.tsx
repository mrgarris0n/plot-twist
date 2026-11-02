import { type ReactNode } from 'react'
import { CalendarDays, Download, Leaf, ListTree, Snowflake, Sprout, Sun, TreeDeciduous, Shuffle, TriangleAlert, WandSparkles, type LucideIcon } from 'lucide-react'
import type { NotPlaced } from '../engine/rotation'
import { seasonalInBeds } from '../engine/presence'
import { library, plantName } from '../data/library'
import type { Season } from '../model/project'
import { exportProject } from '../storage/file'
import { setupComplete, useStore, type SetupItem } from '../state/store'
import { en } from '../strings/en'
import { AddMenu } from './AddMenu'
import { SetupMenu } from './SetupMenu'
import { YearSlider } from './YearSlider'
import { useArrange } from './editor/useArrange'
import { useLangCarriedState } from './useLangCarried'
import { SunLegend, slopeNoteOf, type SunView } from './editor/SunOverlay'

const SEASONS: Season[] = ['spring', 'midsummer', 'autumn', 'midwinter']
const ICON = 18
const SEASON_ICON: Record<Season, LucideIcon> = { spring: Sprout, midsummer: TreeDeciduous, autumn: Leaf, midwinter: Snowflake }

/** The season after `s`, wrapping from mid-winter back to spring. */
export function nextSeason(s: Season): Season {
  return SEASONS[(SEASONS.indexOf(s) + 1) % SEASONS.length]!
}

/** "2 cabbages from Bed B, 1 pea from outside the beds": equal crops from the same bed are counted together. */
function describeNotPlaced(list: NotPlaced[]): string {
  const groups = new Map<string, { plantId: string; fromBed: string | null; n: number }>()
  for (const x of list) {
    const k = `${x.plantId}|${x.fromBed ?? ''}`
    const g = groups.get(k)
    if (g) g.n++
    else groups.set(k, { ...x, n: 1 })
  }
  return [...groups.values()].map((g) => {
    const rec = library.byId.get(g.plantId)
    return en.rotation.notPlacedItem(g.n, rec ? plantName(rec) : g.plantId, g.fromBed)
  }).join(', ')
}

type IconButtonProps = { label: string; onClick: () => void; disabled?: boolean; busy?: boolean; className?: string; tipBelow?: boolean; children: ReactNode }

/** A button that shows only an icon; its label is the accessible name and a hover/focus tooltip. */
export function IconButton({ label, onClick, disabled, busy, className, tipBelow = false, children }: IconButtonProps) {
  return (
    <button
      type="button"
      className={['icon-button', 'tip', tipBelow ? 'tip-below' : '', className ?? ''].filter(Boolean).join(' ')}
      aria-label={label}
      data-tip={label}
      disabled={disabled}
      aria-busy={busy}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

type Props = {
  sunView: SunView
  onSunView: (v: SunView) => void
  showSun: boolean
  onToggleSun: (on: boolean) => void
  warningCount: number
  onToggleWarnings: () => void
  contentsCount: number
  onToggleContents: () => void
  onToggleCalendar: () => void
  onOpenPlants: () => void
  onOpenSetup: (item: SetupItem) => void
  onOpenGardens: () => void
  /** A bar menu is opening: the side drawer would cover it. */
  onCloseDrawer: () => void
  /** Short messages shown just above the bar; they never move the bar itself. */
  notices?: string[]
  readOnly?: boolean
}

export function Toolbar({ sunView, onSunView, showSun, onToggleSun, warningCount, onToggleWarnings, contentsCount, onToggleContents, onToggleCalendar, onOpenPlants, onOpenSetup, onOpenGardens, onCloseDrawer, notices = [], readOnly = false }: Props) {
  const [legendOpen, setLegendOpen] = useLangCarriedState('toolbar.legendOpen', false)
  const season = useStore((s) => s.project?.settings.season)
  const setSeason = useStore((s) => s.setSeason)
  const project = useStore((s) => s.project)
  const cloudWarmPct = useStore((s) => s.project?.climate?.cloudWarmPct ?? null)
  const arrange = useArrange()
  const year = useStore((s) => s.project?.settings.year ?? 0)
  const applyNextYear = useStore((s) => s.applyNextYear)
  // Kept as data, not text, so the note rewords itself after a language switch.
  const [skipped, setSkipped] = useLangCarriedState<{ year: number; list: NotPlaced[] } | null>('toolbar.skipped', null)
  const veggie = project?.gardenType === 'veggie-beds'
  const ready = project !== null && setupComplete(project)
  const onSuggest = () => {
    const cur = useStore.getState().project
    if (!cur) return
    const y = cur.settings.year
    const hasNext = cur.plants.some((pl) => pl.plantedYear === y + 1 && seasonalInBeds(cur, library.byId.get(pl.plantId)))
    if (hasNext && !window.confirm(en.rotation.confirmReplace)) return
    const notPlaced = applyNextYear()
    setSkipped(notPlaced.length ? { year: y + 1, list: notPlaced } : null)
  }
  if (!season) return null
  const SeasonIcon = SEASON_ICON[season]
  const onExport = () => {
    const project = useStore.getState().project
    if (!project) return
    const { filename, blob } = exportProject(project)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }
  const extra = [arrange.message, skipped && skipped.year === year ? en.rotation.notPlaced(describeNotPlaced(skipped.list)) : null].filter((m): m is string => !!m)
  const messages = extra.length ? [...notices, ...extra] : notices
  return (
    <>
      {messages.length > 0 && (
        <div className="bar-messages" role="status">
          {messages.map((m) => <p key={m} className="hint">{m}</p>)}
        </div>
      )}
      <div className="toolbar sun-toolbar" role="group" aria-label={en.overlay.toolbarLabel}>
        <button type="button" onClick={onOpenGardens}>{en.editor.backToGardens}</button>
        {!readOnly && <SetupMenu onOpen={onOpenSetup} onExpand={onCloseDrawer} />}
        <AddMenu readOnly={readOnly} onPlants={onOpenPlants} onExpand={onCloseDrawer} />
        <span className="info-tip" onMouseEnter={() => setLegendOpen(true)} onMouseLeave={() => setLegendOpen(false)}>
          <button
            type="button"
            className={showSun ? 'icon-button sun-toggle on' : 'icon-button sun-toggle'}
            aria-label={en.overlay.showSun}
            aria-pressed={showSun}
            aria-describedby={legendOpen ? 'sun-key' : undefined}
            onClick={() => onToggleSun(!showSun)}
            onFocus={() => setLegendOpen(true)}
            onBlur={() => setLegendOpen(false)}
            onKeyDown={(e) => { if (e.key === 'Escape') setLegendOpen(false) }}
          >
            <Sun aria-hidden="true" size={ICON} />
          </button>
          {legendOpen && (
            <span id="sun-key" role="tooltip" className="info-popover">
              <strong>{showSun ? en.overlay.sunOn : en.overlay.sunOff}</strong>
              <SunLegend cloudWarmPct={cloudWarmPct} view={showSun && project?.location ? sunView : 'hours'} slopeNote={project ? slopeNoteOf(project) : null} />
            </span>
          )}
        </span>
        {showSun && project?.location && (
          <span className="sun-view-switch" role="group" aria-label={en.overlay.viewSwitchLabel}>
            {(['hours', 'strength'] as const).map((v) => (
              <button key={v} type="button" className={sunView === v ? 'on' : ''} aria-pressed={sunView === v} onClick={() => onSunView(v)}>
                {v === 'hours' ? en.overlay.viewHours : en.overlay.viewStrength}
              </button>
            ))}
          </span>
        )}
        <IconButton label={en.overlay.seasonButton(en.overlay.season[season], en.overlay.season[nextSeason(season)])} className={`season-button ${season}`} onClick={() => setSeason(nextSeason(season))}>
          <SeasonIcon aria-hidden="true" size={ICON} />
        </IconButton>
        <YearSlider />
        <IconButton label={arrange.busy ? en.arrange.busy : en.arrange.button} disabled={readOnly || arrange.busy || !ready} busy={arrange.busy} onClick={() => void arrange.run()}>
          <WandSparkles aria-hidden="true" size={ICON} />
        </IconButton>
        {veggie && (
          <IconButton label={en.rotation.suggest} disabled={readOnly || year >= 20} onClick={onSuggest}>
            <Shuffle aria-hidden="true" size={ICON} />
          </IconButton>
        )}
        <IconButton label={en.contents.button(contentsCount)} onClick={onToggleContents}>
          <ListTree aria-hidden="true" size={ICON} /><span className="count" aria-hidden="true">{contentsCount}</span>
        </IconButton>
        <IconButton label={en.calendar.button} onClick={onToggleCalendar}>
          <CalendarDays aria-hidden="true" size={ICON} />
        </IconButton>
        <IconButton label={en.exportUi.button} onClick={onExport}>
          <Download aria-hidden="true" size={ICON} />
        </IconButton>
        <IconButton label={en.warningsUi.listButton(warningCount)} className={warningCount > 0 ? 'warnings-button has-warnings' : 'warnings-button'} onClick={onToggleWarnings}>
          <TriangleAlert aria-hidden="true" size={ICON} /><span className="count" aria-hidden="true">{warningCount}</span>
        </IconButton>
      </div>
    </>
  )
}
