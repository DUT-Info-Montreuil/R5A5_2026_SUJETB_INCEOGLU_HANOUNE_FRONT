import type { EtatTournoi } from './types'

const LABELS: Record<EtatTournoi, { label: string; cls: string }> = {
  inscriptions_ouvertes: { label: 'Inscriptions ouvertes', cls: 'bg-emerald-500/15 text-emerald-300' },
  inscriptions_closes: { label: 'Inscriptions closes', cls: 'bg-amber-500/15 text-amber-300' },
  en_cours: { label: 'En cours', cls: 'bg-indigo-500/15 text-indigo-300' },
  termine: { label: 'Terminé', cls: 'bg-slate-500/20 text-slate-300' },
}

export function StatusBadge({ etat }: { etat: EtatTournoi }) {
  const { label, cls } = LABELS[etat]
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>{label}</span>
}
