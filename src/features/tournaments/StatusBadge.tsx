import type { TournamentStatus } from './types'

const LABELS: Record<TournamentStatus, { label: string; cls: string }> = {
  REGISTRATION_OPEN: { label: 'Inscriptions ouvertes', cls: 'bg-emerald-500/15 text-emerald-300' },
  REGISTRATION_CLOSED: { label: 'Inscriptions closes', cls: 'bg-amber-500/15 text-amber-300' },
  IN_PROGRESS: { label: 'En cours', cls: 'bg-indigo-500/15 text-indigo-300' },
  FINISHED: { label: 'Terminé', cls: 'bg-slate-500/20 text-slate-300' },
}

export function StatusBadge({ status }: { status: TournamentStatus }) {
  const { label, cls } = LABELS[status]
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>{label}</span>
}
