import NumericField from '../shared/NumericField'
import type { TuneSettings } from '../../types/tune'

interface Props {
  settings: TuneSettings
  onChange: (patch: Partial<TuneSettings>) => void
}

export default function BrakesSection({ settings, onChange }: Props) {
  const { brakes } = settings

  return (
    <div className="row g-3">
      <div className="col-6">
        <NumericField
          id="brake-balance"
          label="Balance"
          value={brakes.balance}
          unit="%"
          step={1}
          min={0}
          max={100}
          onChange={(v) => onChange({ brakes: { ...brakes, balance: v } })}
        />
      </div>
      <div className="col-6">
        <NumericField
          id="brake-pressure"
          label="Pressure"
          value={brakes.pressure}
          unit="%"
          step={1}
          min={0}
          max={100}
          onChange={(v) => onChange({ brakes: { ...brakes, pressure: v } })}
        />
      </div>
    </div>
  )
}
