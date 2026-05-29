import NumericField from '../shared/NumericField'
import type { TuneSettings } from '../../types/tune'

interface Props {
  settings: TuneSettings
  onChange: (patch: Partial<TuneSettings>) => void
}

export default function AeroSection({ settings, onChange }: Props) {
  const { aero } = settings

  return (
    <div className="row g-3">
      <div className="col-6">
        <NumericField
          id="aero-front"
          label="Front Downforce"
          value={aero.front}
          step={1}
          onChange={(v) => onChange({ aero: { ...aero, front: v } })}
        />
      </div>
      <div className="col-6">
        <NumericField
          id="aero-rear"
          label="Rear Downforce"
          value={aero.rear}
          step={1}
          onChange={(v) => onChange({ aero: { ...aero, rear: v } })}
        />
      </div>
    </div>
  )
}
