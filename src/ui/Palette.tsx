import { useMemo } from 'react'
import { useStore } from '../state/store'
import { library, plantName } from '../data/library'
import type { Layer } from '../model/plants'
import { en } from '../strings/en'
import { LAYER_COLOR, PLANT_DRAG_TYPE } from './plantShared'
import { Droplet } from 'lucide-react'
import { VEGGIE_LAYERS, filterPlants, paletteMarks } from './palette-filter'
import { CloseButton } from './CloseButton'
import { useEscape } from './useEscape'
import { useLangCarriedState } from './useLangCarried'

const LAYERS = Object.keys(en.layers) as Layer[]

/** The plant list as a sheet above the bottom bar: layer tabs, search and a wide grid, with the plan still a drop target. */
export function Palette({ readOnly, onClose }: { readOnly: boolean; onClose: () => void }) {
  const [text, setText] = useLangCarriedState('palette.text', '')
  const [layer, setLayer] = useLangCarriedState<Layer | null>('palette.layer', null)
  const [onlyFitting, setOnlyFitting] = useLangCarriedState('palette.onlyFitting', true)
  const [showWoody, setShowWoody] = useLangCarriedState('palette.showWoody', false)
  const project = useStore((s) => s.project)
  const isVeggie = project?.gardenType === 'veggie-beds'
  const veggieOnly = isVeggie && !showWoody
  const layers = veggieOnly ? LAYERS.filter((l) => VEGGIE_LAYERS.includes(l)) : LAYERS
  const activeLayer = layer !== null && layers.includes(layer) ? layer : null
  const plants = useMemo(
    () => filterPlants(library.all, { text, layer: activeLayer, fitsHere: onlyFitting && project ? { project } : null, veggieOnly }),
    [text, activeLayer, onlyFitting, project, veggieOnly],
  )
  const hidden = useMemo(
    () => (onlyFitting && project ? filterPlants(library.all, { text, layer: activeLayer, fitsHere: null, veggieOnly }).length - plants.length : 0),
    [text, activeLayer, onlyFitting, project, veggieOnly, plants.length],
  )
  useEscape(onClose)
  return (
    <section className="palette" aria-label={en.palette.title}>
      <div className="palette-head">
        <input type="search" aria-label={en.palette.searchLabel} value={text} placeholder={en.palette.searchPlaceholder} onChange={(e) => setText(e.target.value)} />
        <label className="palette-fit">
          <input type="checkbox" checked={onlyFitting} onChange={(e) => setOnlyFitting(e.target.checked)} /> {en.palette.onlyFitting}
        </label>
        {isVeggie && (
          <label className="palette-fit">
            <input type="checkbox" checked={showWoody} onChange={(e) => setShowWoody(e.target.checked)} /> {en.palette.showWoody}
          </label>
        )}
        <span className="palette-close"><CloseButton label={en.contents.close} onClick={onClose} /></span>
      </div>
      <div className="palette-tabs" role="tablist" aria-label={en.palette.layerLabel}>
        <button type="button" role="tab" aria-selected={activeLayer === null} onClick={() => setLayer(null)}>{en.palette.all}</button>
        {layers.map((l) => (
          <button key={l} type="button" role="tab" aria-selected={activeLayer === l} onClick={() => setLayer(l)}>
            {en.layers[l]}
          </button>
        ))}
      </div>
      {(hidden > 0 || !readOnly) && (
        <p className="hint">{[!readOnly && en.palette.dragHint, hidden > 0 && en.palette.hidden(hidden)].filter(Boolean).join(' ')}</p>
      )}
      {plants.length === 0 && <p className="hint">{en.palette.none}</p>}
      <ul className="palette-list">
        {plants.map((p) => (
          <li
            key={p.id}
            className="palette-item"
            draggable={!readOnly}
            onDragStart={(e) => {
              e.dataTransfer.setData(PLANT_DRAG_TYPE, p.id)
              e.dataTransfer.effectAllowed = 'copy'
            }}
          >
            <span className="swatch" style={{ background: LAYER_COLOR[p.layer] }} aria-hidden="true" />
            <span>{plantName(p)}</span>
            {activeLayer === null && <span className="palette-layer">{en.layers[p.layer]}</span>}
            {project && paletteMarks(p, project).map((m) => (
              <span key={m} className="palette-mark" role="img" title={en.palette.markWater} aria-label={en.palette.markWater}>
                <Droplet size={12} aria-hidden="true" />
              </span>
            ))}
          </li>
        ))}
      </ul>
    </section>
  )
}
