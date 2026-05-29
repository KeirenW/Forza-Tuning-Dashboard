import NumericField from '../shared/NumericField'
import type { TuneSettings } from '../../types/tune'
import type { Drivetrain } from '../../types/car'

interface Props {
  settings: TuneSettings
  onChange: (patch: Partial<TuneSettings>) => void
  drivetrain: Drivetrain
}

export default function DifferentialSection({ settings, onChange, drivetrain }: Props) {
  const { differential } = settings

  function update(field: keyof typeof differential, value: number) {
    onChange({ differential: { ...differential, [field]: value } })
  }

  return (
    <div className="d-flex flex-column gap-3">
      <div className="row g-3">
        <div className="col-6 col-md-3">
          <NumericField
            id="diff-front-accel"
            label="Front Accel"
            value={differential.frontAccel}
            unit="%"
            step={1}
            min={0}
            max={100}
            onChange={(v) => update('frontAccel', v)}
          />
        </div>
        <div className="col-6 col-md-3">
          <NumericField
            id="diff-front-decel"
            label="Front Decel"
            value={differential.frontDecel}
            unit="%"
            step={1}
            min={0}
            max={100}
            onChange={(v) => update('frontDecel', v)}
          />
        </div>
        <div className="col-6 col-md-3">
          <NumericField
            id="diff-rear-accel"
            label="Rear Accel"
            value={differential.rearAccel}
            unit="%"
            step={1}
            min={0}
            max={100}
            onChange={(v) => update('rearAccel', v)}
          />
        </div>
        <div className="col-6 col-md-3">
          <NumericField
            id="diff-rear-decel"
            label="Rear Decel"
            value={differential.rearDecel}
            unit="%"
            step={1}
            min={0}
            max={100}
            onChange={(v) => update('rearDecel', v)}
          />
        </div>
      </div>

      {/* Center Balance — AWD only */}
      {drivetrain === 'AWD' && (
        <div className="row g-3">
          <div className="col-6 col-md-3">
            <NumericField
              id="diff-center-balance"
              label="Center Balance"
              value={differential.centerBalance}
              unit="%"
              step={1}
              min={0}
              max={100}
              onChange={(v) => update('centerBalance', v)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
