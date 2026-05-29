import { useState, useEffect } from 'react'
import { parseLapTime, formatLapTime, isValidLapTime } from '../../utils/laps'

interface LapInputProps {
  /** Current stored value in milliseconds, or null if not set */
  valueMs: number | null
  onCommit: (ms: number) => void
  onClear: () => void
  /** Optional: the car's current PB for this track, shown as a reference */
  currentPbMs?: number | null
}

export default function LapInput({ valueMs, onCommit, onClear, currentPbMs }: LapInputProps) {
  const [inputValue, setInputValue] = useState(valueMs !== null ? formatLapTime(valueMs) : '')
  const [error, setError] = useState(false)

  // Sync display when external value changes (e.g. draft restore)
  useEffect(() => {
    setInputValue(valueMs !== null ? formatLapTime(valueMs) : '')
    setError(false)
  }, [valueMs])

  function handleBlur() {
    const trimmed = inputValue.trim()

    if (trimmed === '') {
      // Empty input = no record (do nothing, clear is explicit via × button)
      setInputValue(valueMs !== null ? formatLapTime(valueMs) : '')
      setError(false)
      return
    }

    if (!isValidLapTime(trimmed)) {
      setError(true)
      return
    }

    setError(false)
    const ms = parseLapTime(trimmed)
    // Normalise display
    setInputValue(formatLapTime(ms))
    onCommit(ms)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(e.target.value)
    if (error) setError(false)
  }

  function handleClear() {
    setInputValue('')
    setError(false)
    onClear()
  }

  const isDelta = valueMs !== null && currentPbMs !== null && currentPbMs !== undefined
  const deltaMs = isDelta ? valueMs - currentPbMs! : null

  return (
    <div>
      <div className="input-group input-group-sm">
        <input
          type="text"
          className={`form-control font-monospace${error ? ' is-invalid' : ''}`}
          placeholder="m:ss.sss"
          value={inputValue}
          onChange={handleChange}
          onBlur={handleBlur}
          aria-label="Lap time"
        />
        {valueMs !== null && (
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={handleClear}
            title="Clear lap time"
          >
            ×
          </button>
        )}
      </div>
      {error && (
        <div className="text-danger small mt-1">Invalid format — use m:ss.sss</div>
      )}
      {isDelta && deltaMs !== null && (
        <div className={`small mt-1 ${deltaMs < 0 ? 'lap-delta-faster' : 'lap-delta-slower'}`}>
          {deltaMs < 0
            ? `${Math.abs(deltaMs / 1000).toFixed(3)}s faster than PB`
            : `+${(deltaMs / 1000).toFixed(3)}s slower than PB`}
        </div>
      )}
    </div>
  )
}
