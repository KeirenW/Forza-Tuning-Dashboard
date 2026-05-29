export const SCHEMA_VERSION = 1

export function validateSchemaVersion(data: unknown): boolean {
  if (typeof data !== 'object' || data === null) return false
  return (data as Record<string, unknown>)['schemaVersion'] === SCHEMA_VERSION
}
