import NumericField from '../shared/NumericField'
import type { TuneSettings } from '../../types/tune'

interface Props {
  settings: TuneSettings
  onChange: (patch: Partial<TuneSettings>) => void
}

export default function DampingSection({ settings, onChange }: Props) {
  const { damping } = settings

  function update(field: keyof typeof damping, value: number) {
    onChange({ damping: { ...damping, [field]: value } })
  }

  return (
    <div className="row g-3">
      <div className="col-6 col-md-3">
        <NumericField
          id="damp-front-rebound"
          label="Front Rebound"
          value={damping.frontRebound}
          step={0.1}
          onChange={(v) => update('frontRebound', v)}
        />
      </div>
      <div className="col-6 col-md-3">
        <NumericField
          id="damp-rear-rebound"
          label="Rear Rebound"
          value={damping.rearRebound}
          step={0.1}
          onChange={(v) => update('rearRebound', v)}
        />
      </div>
      <div className="col-6 col-md-3">
        <NumericField
          id="damp-front-bump"
          label="Front Bump"
          value={damping.frontBump}
          step={0.1}
          onChange={(v) => update('frontBump', v)}
        />
      </div>
      <div className="col-6 col-md-3">
        <NumericField
          id="damp-rear-bump"
          label="Rear Bump"
          value={damping.rearBump}
          step={0.1}
          onChange={(v) => update('rearBump', v)}
        />
      </div>
    </div>
  )
}
