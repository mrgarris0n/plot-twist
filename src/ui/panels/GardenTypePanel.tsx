import { useStore } from '../../state/store'
import { en } from '../../strings/en'
import { onRadioKeyDown, radioTabIndex } from '../radioGroup'

export function GardenTypePanel() {
  const current = useStore((s) => s.project?.gardenType ?? null)
  const setGardenType = useStore((s) => s.setGardenType)
  const soon = [en.gardenType.orchard, en.gardenType.mixed]
  return (
    <div className="stack" role="radiogroup" aria-label={en.setup.gardenType} onKeyDown={onRadioKeyDown}>
      <button type="button" role="radio" aria-checked={current === 'food-forest'} tabIndex={radioTabIndex(current === 'food-forest', true, current !== null)} onClick={() => setGardenType('food-forest')}>
        <strong>{en.gardenType.foodForest}</strong>
        <span className="hint block">{en.gardenType.foodForestHint}</span>
      </button>
      <button type="button" role="radio" aria-checked={current === 'veggie-beds'} tabIndex={radioTabIndex(current === 'veggie-beds', false, current !== null)} onClick={() => setGardenType('veggie-beds')}>
        <strong>{en.gardenType.vegBeds}</strong>
        <span className="hint block">{en.gardenType.vegBedsHint}</span>
      </button>
      {soon.map((label) => (
        <button key={label} type="button" role="radio" aria-checked={false} disabled>
          {label} <span className="hint">({en.gardenType.comingSoon})</span>
        </button>
      ))}
    </div>
  )
}
