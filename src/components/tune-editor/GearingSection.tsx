import NumericField from '../shared/NumericField'
import type { TuneSettings } from '../../types/tune'

interface Props {
  settings: TuneSettings
  onChange: (patch: Partial<TuneSettings>) => void
}

const GEAR_COUNT_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

export default function GearingSection({ settings, onChange }: Props) {
  const { gearing } = settings

  function handleGearCountChange(newCount: number) {
    const current = gearing.gears
    let newGears: number[]

    if (newCount > current.length) {
      // Extend with zeros
      newGears = [...current, ...Array(newCount - current.length).fill(0)]
    } else {
      // Trim
      newGears = current.slice(0, newCount)
    }

    onChange({ gearing: { ...gearing, gearCount: newCount, gears: newGears } })
  }

  function handleGearChange(index: number, value: number) {
    const newGears = [...gearing.gears]
    newGears[index] = value
    onChange({ gearing: { ...gearing, gears: newGears } })
  }

  return (
    <div className="d-flex flex-column gap-3">
      <div className="row g-3">
        {/* Final Drive */}
        <div className="col-6">
          <NumericField
            id="gear-final-drive"
            label="Final Drive"
            value={gearing.finalDrive}
            step={0.01}
            onChange={(v) => onChange({ gearing: { ...gearing, finalDrive: v } })}
          />
        </div>

        {/* Gear Count */}
        <div className="col-6">
          <label htmlFor="gear-count" className="form-label small mb-1">
            Gear Count
          </label>
          <select
            id="gear-count"
            className="form-select form-select-sm"
            value={gearing.gearCount}
            onChange={(e) => handleGearCountChange(parseInt(e.target.value, 10))}
          >
            {GEAR_COUNT_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n} Speed
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Individual gear ratios */}
      <div className="row g-3">
        {Array.from({ length: gearing.gearCount }, (_, i) => (
          <div key={i} className="col-6 col-md-4 col-lg-3">
            <NumericField
              id={`gear-${i + 1}`}
              label={`Gear ${i + 1}`}
              value={gearing.gears[i] ?? 0}
              step={0.001}
              onChange={(v) => handleGearChange(i, v)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
