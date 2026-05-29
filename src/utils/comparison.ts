import type { Tune } from '../types/tune'
import { TRACKS } from '../types/track'
import { formatLapTime } from './laps'

export interface DiffEntry {
  path: string
  label: string
  section: string
  unit?: string
  current: number | string | null
  reference: number | string | null
  /** Numeric delta (current − reference). null when either side is missing, or for lap rows where delta is in ms via lapDeltaMs */
  delta: number | null
  /** Only set for Lap Records section rows — raw ms delta for formatDelta */
  lapDeltaMs?: number | null
}

function numEntry(
  path: string,
  label: string,
  section: string,
  cur: number,
  ref: number,
  unit?: string,
): DiffEntry {
  return { path, label, section, unit, current: cur, reference: ref, delta: cur - ref }
}

export function diffTunes(current: Tune, reference: Tune): DiffEntry[] {
  const s = current.settings
  const r = reference.settings
  const entries: DiffEntry[] = []

  // ── Tyres ──────────────────────────────────────────────────────
  entries.push(numEntry('tyres.frontPsi', 'Front PSI', 'Tyres', s.tyres.frontPsi, r.tyres.frontPsi, 'PSI'))
  entries.push(numEntry('tyres.rearPsi',  'Rear PSI',  'Tyres', s.tyres.rearPsi,  r.tyres.rearPsi,  'PSI'))

  // ── Gearing ────────────────────────────────────────────────────
  entries.push(numEntry('gearing.finalDrive', 'Final Drive', 'Gearing', s.gearing.finalDrive, r.gearing.finalDrive))
  entries.push(numEntry('gearing.gearCount',  'Gear Count',  'Gearing', s.gearing.gearCount,  r.gearing.gearCount))
  const maxGears = Math.max(s.gearing.gearCount, r.gearing.gearCount)
  for (let i = 0; i < maxGears; i++) {
    const cur = s.gearing.gears[i] ?? null
    const ref = r.gearing.gears[i] ?? null
    entries.push({
      path: `gearing.gear${i + 1}`,
      label: `Gear ${i + 1}`,
      section: 'Gearing',
      current: cur,
      reference: ref,
      delta: cur !== null && ref !== null ? cur - ref : null,
    })
  }

  // ── Alignment ──────────────────────────────────────────────────
  entries.push(numEntry('alignment.frontCamber', 'Front Camber', 'Alignment', s.alignment.frontCamber, r.alignment.frontCamber, '°'))
  entries.push(numEntry('alignment.rearCamber',  'Rear Camber',  'Alignment', s.alignment.rearCamber,  r.alignment.rearCamber,  '°'))
  entries.push(numEntry('alignment.frontToe',    'Front Toe',    'Alignment', s.alignment.frontToe,    r.alignment.frontToe,    '°'))
  entries.push(numEntry('alignment.rearToe',     'Rear Toe',     'Alignment', s.alignment.rearToe,     r.alignment.rearToe,     '°'))
  entries.push(numEntry('alignment.caster',      'Caster',       'Alignment', s.alignment.caster,      r.alignment.caster,      '°'))

  // ── Anti Roll Bars ─────────────────────────────────────────────
  entries.push(numEntry('arb.front', 'Front ARB', 'Anti Roll Bars', s.antiRollBars.front, r.antiRollBars.front))
  entries.push(numEntry('arb.rear',  'Rear ARB',  'Anti Roll Bars', s.antiRollBars.rear,  r.antiRollBars.rear))

  // ── Springs ────────────────────────────────────────────────────
  entries.push(numEntry('springs.front',           'Front Spring Rate', 'Springs', s.springs.front,           r.springs.front))
  entries.push(numEntry('springs.rear',            'Rear Spring Rate',  'Springs', s.springs.rear,            r.springs.rear))
  entries.push(numEntry('springs.frontRideHeight', 'Front Ride Height', 'Springs', s.springs.frontRideHeight, r.springs.frontRideHeight, 'CM'))
  entries.push(numEntry('springs.rearRideHeight',  'Rear Ride Height',  'Springs', s.springs.rearRideHeight,  r.springs.rearRideHeight,  'CM'))

  // ── Damping ────────────────────────────────────────────────────
  entries.push(numEntry('damping.frontRebound', 'Front Rebound', 'Damping', s.damping.frontRebound, r.damping.frontRebound))
  entries.push(numEntry('damping.rearRebound',  'Rear Rebound',  'Damping', s.damping.rearRebound,  r.damping.rearRebound))
  entries.push(numEntry('damping.frontBump',    'Front Bump',    'Damping', s.damping.frontBump,    r.damping.frontBump))
  entries.push(numEntry('damping.rearBump',     'Rear Bump',     'Damping', s.damping.rearBump,     r.damping.rearBump))

  // ── Aero ───────────────────────────────────────────────────────
  entries.push(numEntry('aero.front', 'Front Downforce', 'Aero', s.aero.front, r.aero.front))
  entries.push(numEntry('aero.rear',  'Rear Downforce',  'Aero', s.aero.rear,  r.aero.rear))

  // ── Brakes ────────────────────────────────────────────────────
  entries.push(numEntry('brakes.balance',  'Brake Balance',  'Brakes', s.brakes.balance,  r.brakes.balance,  '%'))
  entries.push(numEntry('brakes.pressure', 'Brake Pressure', 'Brakes', s.brakes.pressure, r.brakes.pressure, '%'))

  // ── Differential ──────────────────────────────────────────────
  entries.push(numEntry('diff.frontAccel',    'Front Accel',    'Differential', s.differential.frontAccel,    r.differential.frontAccel,    '%'))
  entries.push(numEntry('diff.frontDecel',    'Front Decel',    'Differential', s.differential.frontDecel,    r.differential.frontDecel,    '%'))
  entries.push(numEntry('diff.rearAccel',     'Rear Accel',     'Differential', s.differential.rearAccel,     r.differential.rearAccel,     '%'))
  entries.push(numEntry('diff.rearDecel',     'Rear Decel',     'Differential', s.differential.rearDecel,     r.differential.rearDecel,     '%'))
  entries.push(numEntry('diff.centerBalance', 'Center Balance', 'Differential', s.differential.centerBalance, r.differential.centerBalance, '%'))

  // ── Lap Records ───────────────────────────────────────────────
  for (const track of TRACKS) {
    const curLap = current.lapRecords.find(lr => lr.track === track)
    const refLap = reference.lapRecords.find(lr => lr.track === track)
    const curMs  = curLap?.bestLapMs ?? null
    const refMs  = refLap?.bestLapMs ?? null
    const lapDelta = curMs !== null && refMs !== null ? curMs - refMs : null
    entries.push({
      path: `laps.${track}`,
      label: track,
      section: 'Lap Records',
      current:    curMs !== null ? formatLapTime(curMs) : null,
      reference:  refMs !== null ? formatLapTime(refMs) : null,
      delta:      null,
      lapDeltaMs: lapDelta,
    })
  }

  return entries
}

/** Format a lap-time delta (ms) as a human-readable string, e.g. "-0.173s faster" */
export function formatDelta(deltaMs: number): string {
  if (deltaMs === 0) return 'Equal'
  const s = Math.abs(deltaMs / 1000).toFixed(3)
  return deltaMs < 0 ? `-${s}s faster` : `+${s}s slower`
}
