/**
 * Parse a lap time string (m:ss.sss) into milliseconds.
 * e.g. "1:42.381" → 102381
 *      "0:58.007" → 58007
 */
export function parseLapTime(str: string): number {
  const match = str.trim().match(/^(\d+):(\d{2})\.(\d{3})$/)
  if (!match) return NaN

  const minutes = parseInt(match[1], 10)
  const seconds = parseInt(match[2], 10)
  const millis  = parseInt(match[3], 10)

  return minutes * 60_000 + seconds * 1_000 + millis
}

/**
 * Format milliseconds into a lap time string (m:ss.sss).
 * e.g. 102381 → "1:42.381"
 *      58007  → "0:58.007"
 */
export function formatLapTime(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return '0:00.000'

  const totalSeconds = Math.floor(ms / 1_000)
  const minutes      = Math.floor(totalSeconds / 60)
  const seconds      = totalSeconds % 60
  const millis       = ms % 1_000

  return `${minutes}:${String(seconds).padStart(2, '0')}.${String(millis).padStart(3, '0')}`
}

/**
 * Returns true if the string is a valid lap time format.
 */
export function isValidLapTime(str: string): boolean {
  return !Number.isNaN(parseLapTime(str))
}
