import NumericField from '../shared/NumericField'
import type { TuneSettings } from '../../types/tune'

interface Props {
  settings: TuneSettings
  onChange: (patch: Partial<TuneSettings>) => void
}

export default function SpringsSection({ settings, onChange }: Props) {
  const { springs } = settings

  function update(field: keyof typeof springs, value: number) {
    onChange({ springs: { ...springs, [field]: value } })
  }

  return (
    <div className="row g-3">
      <div className="col-6 col-md-3">
        <NumericField
          id="spring-front"
          label="Front Spring Rate"
          value={springs.front}
          step={0.1}
          onChange={(v) => update('front', v)}
        />
      </div>
      <div className="col-6 col-md-3">
        <NumericField
          id="spring-rear"
          label="Rear Spring Rate"
          value={springs.rear}
          step={0.1}
          onChange={(v) => update('rear', v)}
        />
      </div>
      <div className="col-6 col-md-3">
        <NumericField
          id="spring-front-rh"
          label="Front Ride Height"
          value={springs.frontRideHeight}
          unit="CM"
          step={0.01}
          onChange={(v) => update('frontRideHeight', v)}
        />
      </div>
      <div className="col-6 col-md-3">
        <NumericField
          id="spring-rear-rh"
          label="Rear Ride Height"
          value={springs.rearRideHeight}
          unit="CM"
          step={0.01}
          onChange={(v) => update('rearRideHeight', v)}
        />
      </div>
    </div>
  )
}
