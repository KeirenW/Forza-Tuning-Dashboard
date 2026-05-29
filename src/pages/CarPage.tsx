import { Link, useNavigate, useParams } from 'react-router-dom'
import { nanoid } from 'nanoid'
import { useGarageStore } from '../store/garageStore'
import { useTuneStore } from '../store/tuneStore'
import { DEFAULT_TUNE_SETTINGS } from '../types/tune'

export default function CarPage() {
  const { carId } = useParams<{ carId: string }>()
  const navigate = useNavigate()

  const car = useGarageStore((s) => s.cars.find((c) => c.id === carId))
  const tunes = useTuneStore((s) => s.tunes.filter((t) => t.carId === carId))
  const addTune = useTuneStore((s) => s.addTune)

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
    const tune = {
      id: nanoid(),
      carId: car.id,
      name: 'Baseline',
      status: 'baseline' as const,
      createdAt: now,
      updatedAt: now,
      settings: JSON.parse(JSON.stringify(DEFAULT_TUNE_SETTINGS)) as typeof DEFAULT_TUNE_SETTINGS,
      lapRecords: [],
    }
    addTune(tune)
    navigate(`/car/${car.id}/tune/${tune.id}`)
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
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h1 className="h3 mb-1">{car.manufacturer} {car.model}</h1>
          <div className="d-flex gap-2">
            <span className="badge text-bg-warning">{car.carClass}</span>
            <span className="badge text-bg-secondary">{car.drivetrain}</span>
          </div>
        </div>
        <button
          className="btn btn-primary"
          type="button"
          onClick={handleCreateBaseline}
        >
          + Create Baseline Tune
        </button>
      </div>

      {/* Tune list — placeholder; replaced by full timeline in Phase 4 */}
      {tunes.length === 0 ? (
        <div className="text-center py-5 border rounded">
          <p className="text-secondary mb-3">No tunes yet. Create a baseline to get started.</p>
          <button className="btn btn-primary" type="button" onClick={handleCreateBaseline}>
            + Create Baseline Tune
          </button>
        </div>
      ) : (
        <div className="d-flex flex-column gap-2">
          {tunes.map((tune) => (
            <div
              key={tune.id}
              className="d-flex align-items-center justify-content-between p-3 border rounded"
            >
              <div>
                <span className="fw-semibold me-2">{tune.name}</span>
                <span className="badge text-bg-secondary">{tune.status}</span>
              </div>
              <Link
                to={`/car/${car.id}/tune/${tune.id}`}
                className="btn btn-outline-secondary btn-sm"
              >
                Open
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
