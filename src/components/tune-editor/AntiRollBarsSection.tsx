import NumericField from '../shared/NumericField'
import type { TuneSettings } from '../../types/tune'

interface Props {
  settings: TuneSettings
  onChange: (patch: Partial<TuneSettings>) => void
}

export default function AntiRollBarsSection({ settings, onChange }: Props) {
  const { antiRollBars } = settings

  return (
    <div className="row g-3">
      <div className="col-6">
        <NumericField
          id="arb-front"
          label="Front"
          value={antiRollBars.front}
          step={0.01}
          onChange={(v) => onChange({ antiRollBars: { ...antiRollBars, front: v } })}
        />
      </div>
      <div className="col-6">
        <NumericField
          id="arb-rear"
          label="Rear"
          value={antiRollBars.rear}
          step={0.01}
          onChange={(v) => onChange({ antiRollBars: { ...antiRollBars, rear: v } })}
        />
      </div>
    </div>
  )
}
