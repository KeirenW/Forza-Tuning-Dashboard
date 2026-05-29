import NumericField from '../shared/NumericField'
import type { TuneSettings } from '../../types/tune'

interface Props {
  settings: TuneSettings
  onChange: (patch: Partial<TuneSettings>) => void
}

export default function TyresSection({ settings, onChange }: Props) {
  const { tyres } = settings

  return (
    <div className="row g-3">
      <div className="col-6">
        <NumericField
          id="tyre-front-psi"
          label="Front PSI"
          value={tyres.frontPsi}
          unit="PSI"
          onChange={(v) => onChange({ tyres: { ...tyres, frontPsi: v } })}
        />
      </div>
      <div className="col-6">
        <NumericField
          id="tyre-rear-psi"
          label="Rear PSI"
          value={tyres.rearPsi}
          unit="PSI"
          onChange={(v) => onChange({ tyres: { ...tyres, rearPsi: v } })}
        />
      </div>
    </div>
  )
}
