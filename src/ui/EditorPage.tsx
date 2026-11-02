import { type ReactNode } from 'react'
import { SETUP_ITEMS, useStore, type SetupItem } from '../state/store'
import { en } from '../strings/en'
import { EditorCanvas } from './editor/EditorCanvas'
import { CalendarView } from './CalendarView'
import { CreditsButton } from './CreditsDialog'
import { SettingsMenu } from './SettingsMenu'
import { AlphaNotice } from './AlphaNotice'
import { useClimateRefresh } from './useClimateRefresh'
import { useIsPhone } from './useIsPhone'
import { GardenTypePanel } from './panels/GardenTypePanel'
import { LocationPanel } from './panels/LocationPanel'
import { PlotPanel } from './panels/PlotPanel'
import { ShadeObjectsPanel } from './panels/ShadeObjectsPanel'
import { SoilPanel } from './panels/SoilPanel'
import { SelectionPanel } from './panels/SelectionPanel'
import { GardensPanel } from './GardensDialog'
import { CloseButton } from './CloseButton'
import { useLangCarriedState } from './useLangCarried'

export default function EditorPage() {
  const name = useStore((s) => s.project?.name)
  const readOnly = useIsPhone()
  useClimateRefresh()
  const [chosen, setOpen] = useLangCarriedState<SetupItem | 'calendar' | 'gardens' | null>('editor.drawer', null)
  // A phone can't edit, so only the calendar and My gardens open there.
  const open = readOnly && chosen !== 'calendar' && chosen !== 'gardens' ? null : chosen
  const toggle = (item: 'calendar' | 'gardens') => setOpen((o) => (o === item ? null : item))
  const panels: Partial<Record<SetupItem, ReactNode>> = {
    location: <LocationPanel />,
    plot: <PlotPanel readOnly={readOnly} />,
    soil: <SoilPanel />,
    gardenType: <GardenTypePanel />,
    shadeObjects: <ShadeObjectsPanel readOnly={readOnly} />,
  }
  const panel = open === 'calendar' ? <CalendarView />
    : open === 'gardens' ? <GardensPanel withActions onOpened={() => setOpen(null)} />
    : open ? panels[open] : undefined
  // Setup steps end with Next (the following step) or Finish (closes the drawer) on the last one.
  const step = open ? SETUP_ITEMS.indexOf(open as SetupItem) : -1
  const nextStep = step >= 0 ? SETUP_ITEMS[step + 1] ?? null : undefined
  const title = open === 'calendar' ? en.calendar.title : open === 'gardens' ? en.gardens.title : open ? en.setup[open] : ''
  return (
    <div className="editor-page">
      <AlphaNotice />
      <header className="editor-header">
        <h1>{name}</h1>
        {readOnly && <p className="hint" role="status">{en.phone.readOnly}</p>}
        <SettingsMenu />
        <CreditsButton iconOnly />
      </header>
      <div className="editor-body">
        {open && panel && (
          <section className="drawer" aria-label={title}>
            <header className="drawer-head">
              <h2>{title}</h2>
              <CloseButton label={en.setup.close} onClick={() => setOpen(null)} />
            </header>
            {panel}
            {nextStep !== undefined && (
              <footer className="drawer-foot">
                <button type="button" className="primary" onClick={() => setOpen(nextStep)}>
                  {nextStep ? en.setup.next : en.setup.finish}
                </button>
              </footer>
            )}
          </section>
        )}
        <EditorCanvas
          readOnly={readOnly}
          onToggleCalendar={() => toggle('calendar')}
          onOpenSetup={setOpen}
          onOpenGardens={() => toggle('gardens')}
          onCloseDrawer={() => setOpen(null)}
        />
        <SelectionPanel readOnly={readOnly} />
      </div>
    </div>
  )
}
