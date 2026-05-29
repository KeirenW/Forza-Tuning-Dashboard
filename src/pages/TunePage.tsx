import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useGarageStore } from '../store/garageStore'
import { useTuneStore } from '../store/tuneStore'
import type { LapRecord, TuneSettings } from '../types/tune'
import { TRACKS } from '../types/track'
import type { Track } from '../types/track'
import { recalculatePBs, diffTuneStatuses } from '../utils/pb'
import { formatLapTime } from '../utils/laps'
import LapInput from '../components/shared/LapInput'
import TyresSection from '../components/tune-editor/TyresSection'
import GearingSection from '../components/tune-editor/GearingSection'
import AlignmentSection from '../components/tune-editor/AlignmentSection'
import AntiRollBarsSection from '../components/tune-editor/AntiRollBarsSection'
import SpringsSection from '../components/tune-editor/SpringsSection'
import DampingSection from '../components/tune-editor/DampingSection'
import StatusBadge from '../components/shared/StatusBadge'
import AeroSection from '../components/tune-editor/AeroSection'
import BrakesSection from '../components/tune-editor/BrakesSection'
import DifferentialSection from '../components/tune-editor/DifferentialSection'

interface DraftPayload {
  name: string
  notes: string
  settings: TuneSettings
  lapRecords: LapRecord[]
}

function draftKey(tuneId: string) {
  return `draft:${tuneId}`
}

/** Suggest the next version name: "Baseline" → "Baseline V2", "Baseline V2" → "Baseline V3" */
function suggestDuplicateName(name: string): string {
  const match = name.match(/^(.*?)\s+V(\d+)$/)
  if (match) {
    return `${match[1]} V${parseInt(match[2], 10) + 1}`
  }
  return `${name} V2`
}

export default function TunePage() {
  const { carId, tuneId } = useParams<{ carId: string; tuneId: string }>()
  const navigate = useNavigate()

  const car = useGarageStore((s) => s.cars.find((c) => c.id === carId))
  const tune = useTuneStore((s) => s.tunes.find((t) => t.id === tuneId))
  const allTunes = useTuneStore((s) => s.tunes)
  const updateTune = useTuneStore((s) => s.updateTune)
  const duplicateTune = useTuneStore((s) => s.duplicateTune)
  const bulkUpdateTuneStatuses = useTuneStore((s) => s.bulkUpdateTuneStatuses)

  const [draftName, setDraftName] = useState('')
  const [draftNotes, setDraftNotes] = useState('')
  const [draftSettings, setDraftSettings] = useState<TuneSettings | null>(null)
  const [draftLapRecords, setDraftLapRecords] = useState<LapRecord[]>([])
  const [showDraftBanner, setShowDraftBanner] = useState(false)
  const [pendingDraft, setPendingDraft] = useState<DraftPayload | null>(null)

  // Initialise state from tune on first load
  useEffect(() => {
    if (!tune) return

    const key = draftKey(tune.id)
    const raw = localStorage.getItem(key)

    if (raw) {
      try {
        const saved = JSON.parse(raw) as DraftPayload
        setPendingDraft(saved)
        setShowDraftBanner(true)
        // Load live tune values as baseline; user can restore from banner
        setDraftName(tune.name)
        setDraftNotes(tune.notes ?? '')
        setDraftSettings(JSON.parse(JSON.stringify(tune.settings)) as TuneSettings)
        setDraftLapRecords([...tune.lapRecords])
        return
      } catch {
        localStorage.removeItem(key)
      }
    }

    setDraftName(tune.name)
    setDraftNotes(tune.notes ?? '')
    setDraftSettings(JSON.parse(JSON.stringify(tune.settings)) as TuneSettings)
    setDraftLapRecords([...tune.lapRecords])
  }, [tune?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Autosave every 3s
  const autosaveRef = useRef<ReturnType<typeof setInterval> | null>(null)
  useEffect(() => {
    if (!tuneId || !draftSettings) return

    autosaveRef.current = setInterval(() => {
      const payload: DraftPayload = {
        name: draftName,
        notes: draftNotes,
        settings: draftSettings,
        lapRecords: draftLapRecords,
      }
      localStorage.setItem(draftKey(tuneId), JSON.stringify(payload))
    }, 3000)

    return () => {
      if (autosaveRef.current) clearInterval(autosaveRef.current)
    }
  }, [tuneId, draftName, draftNotes, draftSettings, draftLapRecords])

  function handleRestoreDraft() {
    if (!pendingDraft) return
    setDraftName(pendingDraft.name)
    setDraftNotes(pendingDraft.notes)
    setDraftSettings(pendingDraft.settings)
    setDraftLapRecords(pendingDraft.lapRecords ?? [])
    setShowDraftBanner(false)
    setPendingDraft(null)
  }

  function handleLapCommit(track: Track, ms: number) {
    setDraftLapRecords((prev) => {
      const filtered = prev.filter((lr) => lr.track !== track)
      return [...filtered, { track, bestLapMs: ms }]
    })
  }

  function handleLapClear(track: Track) {
    setDraftLapRecords((prev) => prev.filter((lr) => lr.track !== track))
  }

  function handleDiscardDraft() {
    if (tuneId) localStorage.removeItem(draftKey(tuneId))
    setShowDraftBanner(false)
    setPendingDraft(null)
  }

  function handleSettingsChange(patch: Partial<TuneSettings>) {
    setDraftSettings((prev) => (prev ? { ...prev, ...patch } : prev))
  }

  function handleSaveRevision() {
    if (!tuneId || !draftSettings || !tune) return

    const lapsChanged =
      JSON.stringify(draftLapRecords) !== JSON.stringify(tune.lapRecords)

    updateTune(tuneId, {
      name: draftName,
      notes: draftNotes || undefined,
      settings: draftSettings,
      lapRecords: draftLapRecords,
    })

    // Recalculate PBs only when lap records changed
    if (lapsChanged && carId) {
      // Build updated tunes array reflecting the just-saved lap records
      const updatedTunes = allTunes.map((t) =>
        t.id === tuneId ? { ...t, lapRecords: draftLapRecords } : t
      )
      const recalculated = recalculatePBs(carId, updatedTunes)
      const statusChanges = diffTuneStatuses(allTunes, recalculated)
      bulkUpdateTuneStatuses(statusChanges)
    }

    localStorage.removeItem(draftKey(tuneId))
    navigate(`/car/${carId}`)
  }

  function handleDuplicate() {
    if (!tuneId) return
    const suggested = suggestDuplicateName(draftName)
    const newTune = duplicateTune(tuneId, suggested)
    if (newTune) {
      navigate(`/car/${carId}/tune/${newTune.id}`)
    }
  }

  if (!tune || !car || !draftSettings) {
    return (
      <div className="text-center py-5">
        <p className="text-secondary">Tune not found.</p>
        <Link to={`/car/${carId}`} className="btn btn-secondary btn-sm">
          Back to Car
        </Link>
      </div>
    )
  }

  const sections = [
    { id: 'tyres',        label: 'Tyres',          content: <TyresSection settings={draftSettings} onChange={handleSettingsChange} /> },
    { id: 'gearing',      label: 'Gearing',         content: <GearingSection settings={draftSettings} onChange={handleSettingsChange} /> },
    { id: 'alignment',    label: 'Alignment',       content: <AlignmentSection settings={draftSettings} onChange={handleSettingsChange} /> },
    { id: 'arb',          label: 'Anti-Roll Bars',  content: <AntiRollBarsSection settings={draftSettings} onChange={handleSettingsChange} /> },
    { id: 'springs',      label: 'Springs',         content: <SpringsSection settings={draftSettings} onChange={handleSettingsChange} /> },
    { id: 'damping',      label: 'Damping',         content: <DampingSection settings={draftSettings} onChange={handleSettingsChange} /> },
    { id: 'aero',         label: 'Aero',            content: <AeroSection settings={draftSettings} onChange={handleSettingsChange} /> },
    { id: 'brakes',       label: 'Brakes',          content: <BrakesSection settings={draftSettings} onChange={handleSettingsChange} /> },
    { id: 'differential', label: 'Differential',    content: <DifferentialSection settings={draftSettings} onChange={handleSettingsChange} drivetrain={car.drivetrain} /> },
  ]

  return (
    <div>
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">Garage</Link></li>
          <li className="breadcrumb-item"><Link to={`/car/${carId}`}>{car.manufacturer} {car.model}</Link></li>
          <li className="breadcrumb-item active">{tune.name}</li>
        </ol>
      </nav>

      {/* Draft restore banner */}
      {showDraftBanner && (
        <div className="alert alert-warning d-flex align-items-center justify-content-between mb-3" role="alert">
          <span>Unsaved draft found for this tune.</span>
          <div className="d-flex gap-2 ms-3">
            <button type="button" className="btn btn-warning btn-sm" onClick={handleRestoreDraft}>
              Restore
            </button>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={handleDiscardDraft}>
              Discard
            </button>
          </div>
        </div>
      )}

      {/* Tune name + actions */}
      <div className="d-flex align-items-center justify-content-between gap-3 mb-4 flex-wrap">
        <input
          type="text"
          className="form-control form-control-lg fw-semibold"
          style={{ maxWidth: '360px' }}
          value={draftName}
          onChange={(e) => setDraftName(e.target.value)}
          aria-label="Tune name"
        />
        <div className="d-flex gap-2">
          <button type="button" className="btn btn-outline-secondary" onClick={handleDuplicate}>
            Duplicate
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSaveRevision}>
            Save Revision
          </button>
        </div>
      </div>

      {/* Notes */}
      <div className="mb-4">
        <label htmlFor="tune-notes" className="form-label small text-secondary">Notes</label>
        <textarea
          id="tune-notes"
          className="form-control"
          rows={2}
          placeholder="Optional notes about this revision…"
          value={draftNotes}
          onChange={(e) => setDraftNotes(e.target.value)}
        />
      </div>

      {/* Accordion sections */}
      <div className="accordion mb-4" id="tune-accordion">
        {sections.map((section, i) => {
          const headingId = `heading-${section.id}`
          const collapseId = `collapse-${section.id}`
          const isFirst = i === 0

          return (
            <div key={section.id} className="accordion-item">
              <h2 className="accordion-header" id={headingId}>
                <button
                  className={`accordion-button${isFirst ? '' : ' collapsed'}`}
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target={`#${collapseId}`}
                  aria-expanded={isFirst ? 'true' : 'false'}
                  aria-controls={collapseId}
                >
                  {section.label}
                </button>
              </h2>
              <div
                id={collapseId}
                className={`accordion-collapse collapse${isFirst ? ' show' : ''}`}
                aria-labelledby={headingId}
                data-bs-parent="#tune-accordion"
              >
                <div className="accordion-body">
                  {section.content}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Lap Records */}
      <div className="card mb-4">
        <div className="card-header fw-semibold">Lap Records</div>
        <div className="card-body">
          <div className="d-flex flex-column gap-3">
            {TRACKS.map((track) => {
              const record = draftLapRecords.find((lr) => lr.track === track)
              const valueMs = record ? record.bestLapMs : null

              // Find the car's current PB for this track (from saved tunes, excluding this one)
              const carPbMs = allTunes
                .filter((t) => t.carId === carId && t.id !== tuneId)
                .flatMap((t) => t.lapRecords)
                .filter((lr) => lr.track === track)
                .reduce<number | null>((best, lr) =>
                  best === null || lr.bestLapMs < best ? lr.bestLapMs : best
                , null)

              return (
                <div key={track} className="row align-items-center g-2">
                  <div className="col-3 col-md-2">
                    <span className="fw-semibold small">{track}</span>
                  </div>
                  <div className="col-6 col-md-4">
                    <LapInput
                      valueMs={valueMs}
                      onCommit={(ms) => handleLapCommit(track, ms)}
                      onClear={() => handleLapClear(track)}
                      currentPbMs={carPbMs}
                    />
                  </div>
                  {carPbMs !== null && (
                    <div className="col-auto text-secondary small">
                      Car PB: <span className="font-monospace">{formatLapTime(carPbMs)}</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="text-secondary small">
        Status: <StatusBadge status={tune.status} />
        <span className="ms-3">Created: {new Date(tune.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  )
}
