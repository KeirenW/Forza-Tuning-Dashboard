import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { nanoid } from 'nanoid'
import { useGarageStore } from '../store/garageStore'
import { useTuneStore } from '../store/tuneStore'
import { DEFAULT_TUNE_SETTINGS, type Tune } from '../types/tune'
import { TRACKS } from '../types/track'
import TuneTimeline from '../components/timeline/TuneTimeline'
import ConfirmDeleteModal from '../components/shared/ConfirmDeleteModal'

export default function CarPage() {
  const { carId } = useParams<{ carId: string }>()
  const navigate = useNavigate()

  const car = useGarageStore((s) => s.cars.find((c) => c.id === carId))
  const tunes = useTuneStore((s) => s.tunes.filter((t) => t.carId === carId))
  const addTune = useTuneStore((s) => s.addTune)
  const deleteTune = useTuneStore((s) => s.deleteTune)

  const [deleteTuneTarget, setDeleteTuneTarget] = useState<Tune | null>(null)

  if (!car) {
    return (
      <div className="text-center py-5">
        <p className="text-secondary">Car not found.</p>
        <Link to="/" className="btn btn-secondary btn-sm">
          Back to Garage
        </Link>
      </div>
    )
  }

  function handleCreateBaseline() {
    if (!car) return
    const now = new Date().toISOString()
    const tune: Tune = {
      id: nanoid(),
      carId: car.id,
      name: 'Baseline',
      status: 'baseline',
      createdAt: now,
      updatedAt: now,
      settings: JSON.parse(JSON.stringify(DEFAULT_TUNE_SETTINGS)) as typeof DEFAULT_TUNE_SETTINGS,
      lapRecords: [],
    }
    addTune(tune)
    navigate(`/car/${car.id}/tune/${tune.id}`)
  }

  function handleConfirmDeleteTune() {
    if (!deleteTuneTarget) return
    deleteTune(deleteTuneTarget.id)
    setDeleteTuneTarget(null)
  }

  return (
    <div>
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/">Garage</Link>
          </li>
          <li className="breadcrumb-item active">{car.manufacturer} {car.model}</li>
        </ol>
      </nav>

      {/* Header */}
      <div className="d-flex align-items-start justify-content-between mb-4 gap-3 flex-wrap">
        <div>
          <h1 className="h3 mb-1">{car.manufacturer} {car.model}</h1>
          <div className="d-flex gap-2">
            <span className="badge text-bg-warning">{car.carClass}</span>
            <span className="badge text-bg-secondary">{car.drivetrain}</span>
          </div>
        </div>
        <div className="d-flex gap-2">
          {tunes.length >= 2 && (
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => navigate(`/car/${car.id}/compare`)}
            >
              Compare Tunes
            </button>
          )}
          <button
            className="btn btn-primary"
            type="button"
            onClick={handleCreateBaseline}
          >
            + New Tune
          </button>
        </div>
      </div>

      {/* Per-track PB summary table */}
      <div className="card mb-4">
        <div className="card-header small text-secondary text-uppercase fw-semibold">
          Track PBs
        </div>
        <div className="card-body p-0">
          <table className="table table-sm table-bordered mb-0">
            <thead>
              <tr>
                <th className="text-secondary small">Track</th>
                <th className="text-secondary small">Best Lap</th>
                <th className="text-secondary small">Tune</th>
              </tr>
            </thead>
            <tbody>
              {TRACKS.map((track) => {
                const pbTune = tunes.find(
                  (t) =>
                    t.status === 'pb' &&
                    t.lapRecords.some((lr) => lr.track === track)
                )
                return (
                  <tr key={track}>
                    <td>{track}</td>
                    <td className="text-secondary fst-italic">—</td>
                    <td className="text-secondary fst-italic">
                      {pbTune ? pbTune.name : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Timeline */}
      <h2 className="h5 mb-3">Tune History</h2>
      {tunes.length === 0 ? (
        <div className="text-center py-5 border rounded">
          <p className="text-secondary mb-3">No tunes yet. Create a baseline to get started.</p>
          <button className="btn btn-primary" type="button" onClick={handleCreateBaseline}>
            + Create Baseline Tune
          </button>
        </div>
      ) : (
        <TuneTimeline
          tunes={tunes}
          carId={car.id}
          onDelete={(t) => setDeleteTuneTarget(t)}
        />
      )}

      {/* Delete tune modal */}
      {deleteTuneTarget && (
        <ConfirmDeleteModal
          title="Delete Tune"
          message={`Delete "${deleteTuneTarget.name}"? This cannot be undone.`}
          onConfirm={handleConfirmDeleteTune}
          onCancel={() => setDeleteTuneTarget(null)}
        />
      )}
    </div>
  )
}

