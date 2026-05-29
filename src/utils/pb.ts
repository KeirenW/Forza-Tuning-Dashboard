import type { Tune, TuneStatus } from '../types/tune'
import { TRACKS } from '../types/track'

/**
 * Recalculate PB status for all tunes belonging to a car.
 *
 * Rules:
 * - "retired" tunes are never eligible for PB.
 * - For each track, find the tune with the lowest bestLapMs.
 * - Any tune that holds the fastest lap on at least one track → status "pb".
 * - A tune that previously had "pb" but no longer holds any track record:
 *   - If it was originally "baseline" → stays "baseline".
 *   - Otherwise → reverts to "testing".
 *
 * Returns a new array with statuses updated (only the affected car's tunes).
 * Tunes for other cars are returned unchanged.
 */
export function recalculatePBs(carId: string, allTunes: Tune[]): Tune[] {
  const carTunes = allTunes.filter((t) => t.carId === carId)
  const otherTunes = allTunes.filter((t) => t.carId !== carId)

  // Set of tune IDs that hold the fastest lap on at least one track
  const pbIds = new Set<string>()

  for (const track of TRACKS) {
    let bestMs = Infinity
    let bestId: string | null = null

    for (const tune of carTunes) {
      if (tune.status === 'retired') continue
      const record = tune.lapRecords.find((lr) => lr.track === track)
      if (record && record.bestLapMs < bestMs) {
        bestMs = record.bestLapMs
        bestId = tune.id
      }
    }

    if (bestId) pbIds.add(bestId)
  }

  const updatedCarTunes: Tune[] = carTunes.map((tune) => {
    if (tune.status === 'retired') return tune

    if (pbIds.has(tune.id)) {
      return tune.status === 'pb' ? tune : { ...tune, status: 'pb' as TuneStatus }
    }

    // Tune lost PB or never had it
    if (tune.status === 'pb') {
      // Revert: keep "baseline" if it was the baseline, else "testing"
      const revertTo: TuneStatus = tune.parentTuneId == null ? 'baseline' : 'testing'
      return { ...tune, status: revertTo }
    }

    return tune
  })

  return [...updatedCarTunes, ...otherTunes]
}

/** Extract status changes between two tune arrays for atomic store updates */
export function diffTuneStatuses(
  before: Tune[],
  after: Tune[]
): { id: string; status: TuneStatus }[] {
  const afterMap = new Map(after.map((t) => [t.id, t]))
  return before
    .filter((t) => {
      const updated = afterMap.get(t.id)
      return updated && updated.status !== t.status
    })
    .map((t) => ({ id: t.id, status: afterMap.get(t.id)!.status }))
}
