import { Link, useNavigate } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import type { Tune } from '../../types/tune'
import StatusBadge from '../shared/StatusBadge'

interface TuneTimelineProps {
  tunes: Tune[]
  carId: string
  onDelete: (tune: Tune) => void
}

export default function TuneTimeline({ tunes, carId, onDelete }: TuneTimelineProps) {
  const navigate = useNavigate()

  const sorted = [...tunes].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )

  // Build a name lookup for parentTuneId resolution
  const nameById = Object.fromEntries(tunes.map((t) => [t.id, t.name]))

  if (sorted.length === 0) {
    return (
      <p className="text-secondary fst-italic">No tunes yet.</p>
    )
  }

  return (
    <div className="tune-timeline">
      {sorted.map((tune) => {
        const isPb = tune.status === 'pb'
        const parentName = tune.parentTuneId ? nameById[tune.parentTuneId] : null

        return (
          <div
            key={tune.id}
            className={`timeline-node${isPb ? ' is-pb' : ''}`}
          >
            <div className="d-flex align-items-start justify-content-between gap-3 flex-wrap">
              {/* Left: name + badges */}
              <div className="flex-grow-1 min-width-0">
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <span className="fw-semibold">{tune.name}</span>
                  <StatusBadge status={tune.status} />
                </div>
                {parentName && (
                  <div className="text-secondary small mt-1">
                    ↳ forked from <span className="fst-italic">{parentName}</span>
                  </div>
                )}
                <div className="text-secondary small mt-1">
                  {format(parseISO(tune.createdAt), 'dd MMM yyyy')}
                </div>
              </div>

              {/* Right: lap placeholder + actions */}
              <div className="d-flex align-items-center gap-2 flex-shrink-0">
                <span className="text-secondary small fst-italic me-2">—</span>

                <Link
                  to={`/car/${carId}/tune/${tune.id}`}
                  className="btn btn-outline-secondary btn-sm"
                >
                  Open
                </Link>

                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  title="Compare this tune"
                  onClick={() => navigate(`/car/${carId}/compare?tuneId=${tune.id}`)}
                >
                  Compare
                </button>

                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm"
                  title="Delete tune"
                  onClick={() => onDelete(tune)}
                >
                  🗑
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
