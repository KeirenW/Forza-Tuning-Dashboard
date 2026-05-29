import { useState, useEffect, useRef } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useGarageStore } from '../store/garageStore'
import { useTuneStore } from '../store/tuneStore'
import { TRACKS } from '../types/track'
import type { Track } from '../types/track'
import type { Tune } from '../types/tune'
import { diffTunes, formatDelta } from '../utils/comparison'
import DiffTable from '../components/comparison/DiffTable'

export default function ComparePage() {
  const { carId } = useParams<{ carId: string }>()
  const [searchParams] = useSearchParams()

  const cars  = useGarageStore(s => s.cars)
  const tunes = useTuneStore(s => s.tunes).filter(t => t.carId === carId)
  const car   = cars.find(c => c.id === carId) ?? null

  const [activeTrack, setActiveTrack] = useState<Track>(TRACKS[0])
  const [tuneAId, setTuneAId] = useState<string | null>(null)
  const [tuneBId, setTuneBId] = useState<string | null>(null)
  const [showAll, setShowAll]  = useState(false)

  // Track whether the user has manually picked a reference tune
  const userPickedB = useRef(false)

  // Initialise Tune A from ?tuneId query param
  useEffect(() => {
    const fromUrl = searchParams.get('tuneId')
    if (fromUrl && tunes.some(t => t.id === fromUrl)) {
      setTuneAId(fromUrl)
    } else if (tunes.length > 0) {
      setTuneAId(tunes[0].id)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // When active track changes, auto-pick the PB tune as reference (unless user already chose one)
  useEffect(() => {
    if (userPickedB.current) return
    const pbTune = tunes.find(
      t => t.status === 'pb' && t.lapRecords.some(lr => lr.track === activeTrack)
    )
    setTuneBId(pbTune?.id ?? null)
  }, [activeTrack, tunes])

  const tuneA: Tune | null = tunes.find(t => t.id === tuneAId) ?? null
  const tuneB: Tune | null = tunes.find(t => t.id === tuneBId) ?? null

  const lapA = tuneA?.lapRecords.find(lr => lr.track === activeTrack) ?? null
  const lapB = tuneB?.lapRecords.find(lr => lr.track === activeTrack) ?? null
  const lapDeltaMs = lapA && lapB ? lapA.bestLapMs - lapB.bestLapMs : null

  const diffEntries = tuneA && tuneB ? diffTunes(tuneA, tuneB) : []

  function tuneLabel(tune: Tune): string {
    const hasLap = tune.lapRecords.some(lr => lr.track === activeTrack)
    return hasLap ? tune.name : `${tune.name} (no lap)`
  }

  function handlePickA(id: string) {
    setTuneAId(id)
  }

  function handlePickB(id: string) {
    userPickedB.current = true
    setTuneBId(id)
  }

  function handleTrackTab(track: Track) {
    userPickedB.current = false
    setActiveTrack(track)
  }

  return (
    <div>
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">Garage</Link></li>
          <li className="breadcrumb-item">
            <Link to={`/car/${carId}`}>{car ? `${car.manufacturer} ${car.model}` : 'Car'}</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">Compare</li>
        </ol>
      </nav>

      <h2 className="h4 mb-4">Compare Tunes</h2>

      {/* Track tabs */}
      <ul className="nav nav-tabs mb-4">
        {TRACKS.map(track => (
          <li className="nav-item" key={track}>
            <button
              className={`nav-link${activeTrack === track ? ' active' : ''}`}
              onClick={() => handleTrackTab(track)}
            >
              {track}
            </button>
          </li>
        ))}
      </ul>

      {/* Tune pickers */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6">
          <label className="form-label fw-semibold" htmlFor="tune-a-select">Tune A</label>
          <select
            id="tune-a-select"
            className="form-select"
            value={tuneAId ?? ''}
            onChange={e => handlePickA(e.target.value)}
          >
            <option value="" disabled>Select a tune…</option>
            {tunes.map(t => (
              <option key={t.id} value={t.id}>{tuneLabel(t)}</option>
            ))}
          </select>
        </div>
        <div className="col-sm-6">
          <label className="form-label fw-semibold" htmlFor="tune-b-select">Tune B <span className="text-secondary fw-normal">(Reference)</span></label>
          <select
            id="tune-b-select"
            className="form-select"
            value={tuneBId ?? ''}
            onChange={e => handlePickB(e.target.value)}
          >
            <option value="" disabled>Select a tune…</option>
            {tunes.map(t => (
              <option key={t.id} value={t.id}>{tuneLabel(t)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* No PB message */}
      {tuneBId === null && (
        <div className="alert alert-secondary py-2">
          No PB set for {activeTrack} — select a reference tune above.
        </div>
      )}

      {/* Lap delta headline */}
      {tuneA && tuneB && (
        <div className="card mb-4">
          <div className="card-body py-3 text-center">
            <div className="text-secondary small mb-1">{activeTrack} lap delta (A vs B)</div>
            {lapDeltaMs !== null ? (
              <div
                className={`display-6 ${lapDeltaMs < 0 ? 'lap-delta-faster' : lapDeltaMs > 0 ? 'lap-delta-slower' : ''}`}
              >
                {formatDelta(lapDeltaMs)}
              </div>
            ) : (
              <div className="display-6 text-secondary">—</div>
            )}
            {lapDeltaMs === null && (
              <div className="text-secondary small mt-1">
                {!lapA && !lapB ? 'Neither tune has a lap for this track'
                  : !lapA ? `${tuneA.name} has no lap for ${activeTrack}`
                  : `${tuneB.name} has no lap for ${activeTrack}`}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Diff table */}
      {tuneA && tuneB ? (
        <>
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h5 className="mb-0">Settings Diff</h5>
            <div className="form-check form-switch mb-0">
              <input
                className="form-check-input"
                type="checkbox"
                id="showAllToggle"
                checked={showAll}
                onChange={e => setShowAll(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="showAllToggle">
                Show all fields
              </label>
            </div>
          </div>
          {diffEntries.length === 0 || (!showAll && diffEntries.every(e => e.current === e.reference)) ? (
            <p className="text-secondary">No differences found.</p>
          ) : (
            <div className="table-scroll-wrapper">
              <DiffTable entries={diffEntries} showAll={showAll} />
            </div>
          )}
        </>
      ) : (
        !tuneA && !tuneB && tunes.length < 2 ? (
          <p className="text-secondary">Add at least two tunes to compare.</p>
        ) : (
          <p className="text-secondary">Select two tunes above to see a diff.</p>
        )
      )}
    </div>
  )
}

