import NumericField from '../shared/NumericField'
import type { TuneSettings } from '../../types/tune'

interface Props {
  settings: TuneSettings
  onChange: (patch: Partial<TuneSettings>) => void
}

export default function AlignmentSection({ settings, onChange }: Props) {
  const { alignment } = settings

  function update(field: keyof typeof alignment, value: number) {
    onChange({ alignment: { ...alignment, [field]: value } })
  }

  return (
    <div className="row g-3">
      <div className="col-6 col-md-4">
        <NumericField
          id="align-front-camber"
          label="Front Camber"
          value={alignment.frontCamber}
          unit="°"
          step={0.1}
          onChange={(v) => update('frontCamber', v)}
        />
      </div>
      <div className="col-6 col-md-4">
        <NumericField
          id="align-rear-camber"
          label="Rear Camber"
          value={alignment.rearCamber}
          unit="°"
          step={0.1}
          onChange={(v) => update('rearCamber', v)}
        />
      </div>
      <div className="col-6 col-md-4">
        <NumericField
          id="align-front-toe"
          label="Front Toe"
          value={alignment.frontToe}
          unit="°"
          step={0.1}
          onChange={(v) => update('frontToe', v)}
        />
      </div>
      <div className="col-6 col-md-4">
        <NumericField
          id="align-rear-toe"
          label="Rear Toe"
          value={alignment.rearToe}
          unit="°"
          step={0.1}
          onChange={(v) => update('rearToe', v)}
        />
      </div>
      <div className="col-6 col-md-4">
        <NumericField
          id="align-caster"
          label="Caster"
          value={alignment.caster}
          unit="°"
          step={0.1}
          onChange={(v) => update('caster', v)}
        />
      </div>
    </div>
  )
}
