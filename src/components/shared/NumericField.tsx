interface NumericFieldProps {
  id: string
  label: string
  value: number
  onChange: (value: number) => void
  unit?: string
  step?: number
  min?: number
  max?: number
}

export default function NumericField({
  id,
  label,
  value,
  onChange,
  unit,
  step = 0.01,
  min,
  max,
}: NumericFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="form-label small mb-1">
        {label}
      </label>
      <div className="input-group input-group-sm">
        <input
          id={id}
          type="number"
          className="form-control"
          value={value}
          step={step}
          min={min}
          max={max}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        />
        {unit && <span className="input-group-text">{unit}</span>}
      </div>
    </div>
  )
}
