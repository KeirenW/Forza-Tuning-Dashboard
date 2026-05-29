import { Fragment } from 'react'
import type { DiffEntry } from '../../utils/comparison'
import { formatDelta } from '../../utils/comparison'

interface Props {
  entries: DiffEntry[]
  showAll: boolean
}

function isChanged(e: DiffEntry): boolean {
  return e.current !== e.reference
}

function formatValue(val: number | string | null, unit?: string): string {
  if (val === null) return '—'
  if (typeof val === 'string') return val
  const num = unit ? `${val} ${unit}` : String(val)
  return num
}

function DeltaCell({ entry }: { entry: DiffEntry }) {
  if (entry.section === 'Lap Records') {
    if (entry.lapDeltaMs == null) return <td className="text-secondary">—</td>
    const cls = entry.lapDeltaMs < 0 ? 'lap-delta-faster' : entry.lapDeltaMs > 0 ? 'lap-delta-slower' : ''
    return <td className={cls}>{formatDelta(entry.lapDeltaMs)}</td>
  }
  if (entry.delta == null) return <td className="text-secondary">—</td>
  if (entry.delta === 0) return <td className="text-secondary">0</td>
  const cls = entry.delta < 0 ? 'diff-improved' : 'diff-worse'
  const sign = entry.delta > 0 ? '+' : ''
  return <td className={cls}>{sign}{entry.delta.toFixed(2)}</td>
}

export default function DiffTable({ entries, showAll }: Props) {
  // Group entries by section
  const sections = Array.from(new Set(entries.map(e => e.section)))

  return (
    <table className="table table-sm table-hover table-bordered align-middle">
      <thead className="table-dark">
        <tr>
          <th style={{ width: '28%' }}>Setting</th>
          <th style={{ width: '24%' }}>Tune A</th>
          <th style={{ width: '24%' }}>Tune B (Ref)</th>
          <th style={{ width: '24%' }}>Delta</th>
        </tr>
      </thead>
      <tbody>
        {sections.map(section => {
          const rows = entries.filter(e => e.section === section)
          const visibleRows = showAll ? rows : rows.filter(isChanged)
          if (visibleRows.length === 0) return null
          return (
            <Fragment key={section}>
              <tr className="table-secondary">
                <td colSpan={4} className="fw-semibold text-uppercase small" style={{ letterSpacing: '0.06em' }}>
                  {section}
                </td>
              </tr>
              {visibleRows.map(entry => (
                <tr key={entry.path} className={isChanged(entry) ? '' : 'opacity-50'}>
                  <td>
                    {entry.label}
                    {entry.unit && <span className="text-secondary ms-1 small">({entry.unit})</span>}
                  </td>
                  <td>{formatValue(entry.current, undefined)}</td>
                  <td>{formatValue(entry.reference, undefined)}</td>
                  <DeltaCell entry={entry} />
                </tr>
              ))}
            </Fragment>
          )
        })}
      </tbody>
    </table>
  )
}
