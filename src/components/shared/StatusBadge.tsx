import type { TuneStatus } from '../../types/tune'

interface StatusBadgeProps {
  status: TuneStatus
}

const BADGE_CONFIG: Record<TuneStatus, { className: string; label: string }> = {
  pb:       { className: 'badge-pb',       label: '★ PB'      },
  baseline: { className: 'badge-baseline', label: 'Baseline'  },
  testing:  { className: 'badge-testing',  label: 'Testing'   },
  retired:  { className: 'badge-retired',  label: 'Retired'   },
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const { className, label } = BADGE_CONFIG[status] ?? BADGE_CONFIG.testing
  return <span className={`badge ${className}`}>{label}</span>
}
