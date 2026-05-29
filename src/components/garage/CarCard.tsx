import { useNavigate } from 'react-router-dom'
import type { Car } from '../../types/car'
import type { Tune } from '../../types/tune'
import { TRACKS } from '../../types/track'
import { formatLapTime } from '../../utils/laps'

interface CarCardProps {
  car: Car
  tunes: Tune[]
  onEdit: (car: Car) => void
  onDelete: (car: Car) => void
}

const CLASS_COLOURS: Record<string, string> = {
  D: 'secondary',
  C: 'info',
  B: 'primary',
  A: 'warning',
  S1: 'danger',
  S2: 'danger',
  X: 'dark',
}

export default function CarCard({ car, tunes, onEdit, onDelete }: CarCardProps) {
  const navigate = useNavigate()

  function handleCardClick() {
    navigate(`/car/${car.id}`)
  }

  function handleEdit(e: React.MouseEvent) {
    e.stopPropagation()
    onEdit(car)
  }

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    onDelete(car)
  }

  const classColour = CLASS_COLOURS[car.carClass] ?? 'secondary'

  return (
    <div
      className="card h-100 border"
      style={{ cursor: 'pointer' }}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleCardClick()}
      aria-label={`${car.manufacturer} ${car.model}`}
    >
      <div className="card-body d-flex flex-column gap-2">
        {/* Header row */}
        <div className="d-flex align-items-start justify-content-between gap-2">
          <div className="flex-grow-1 min-width-0">
            <div className="text-secondary small mb-1">{car.manufacturer}</div>
            <h5 className="card-title mb-0 text-truncate">{car.model}</h5>
          </div>

          {/* Action buttons */}
          <div className="d-flex gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={handleEdit}
              aria-label="Edit car"
              title="Edit car"
            >
              ✏️
            </button>
            <button
              type="button"
              className="btn btn-outline-danger btn-sm"
              onClick={handleDelete}
              aria-label="Delete car"
              title="Delete car"
            >
              🗑
            </button>
          </div>
        </div>

        {/* Badges */}
        <div className="d-flex gap-2 flex-wrap">
          <span className={`badge text-bg-${classColour}`}>{car.carClass}</span>
          <span className="badge text-bg-secondary">{car.drivetrain}</span>
        </div>

        {/* Track PB summary */}
        <div className="mt-auto pt-2 border-top">
          <div className="small text-secondary mb-1">Best Laps</div>
          <div className="d-flex flex-column gap-1">
            {TRACKS.map((track) => {
              const bestMs = tunes
                .flatMap((t) => t.lapRecords)
                .filter((lr) => lr.track === track)
                .reduce<number | null>((best, lr) =>
                  best === null || lr.bestLapMs < best ? lr.bestLapMs : best
                , null)

              return (
                <div key={track} className="d-flex justify-content-between small">
                  <span className="text-secondary">{track}</span>
                  <span className={bestMs !== null ? 'font-monospace' : 'text-secondary fst-italic'}>
                    {bestMs !== null ? formatLapTime(bestMs) : '—'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
