import type { Car } from '../types/car'
import type { Tune } from '../types/tune'
import { SCHEMA_VERSION, validateSchemaVersion } from './storage'

export interface ExportData {
  schemaVersion: number
  exportedAt: string
  cars: Car[]
  tunes: Tune[]
}

export function exportData(cars: Car[], tunes: Tune[]): void {
  const payload: ExportData = {
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    cars,
    tunes,
  }

  const json = JSON.stringify(payload, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url  = URL.createObjectURL(blob)

  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `fh6-tunes-${new Date().toISOString().slice(0, 10)}.json`
  anchor.click()

  URL.revokeObjectURL(url)
}

export function importData(json: string): ExportData | null {
  try {
    const parsed = JSON.parse(json) as unknown
    if (!validateSchemaVersion(parsed)) return null

    const data = parsed as ExportData
    if (!Array.isArray(data.cars) || !Array.isArray(data.tunes)) return null

    return data
  } catch {
    return null
  }
}
