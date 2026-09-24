import { Link, useParams } from 'react-router-dom'
import { ErrorMessage, Loader } from '@/shared/ui/Feedback'
import { useTournament } from './hooks'
import { StatusBadge } from './StatusBadge'

export function TournamentDetailPage() {
  const { id = '' } = useParams()
  const { data: t, isLoading, isError, error } = useTournament(id)

  if (isLoading) return <Loader />
  if (isError) return <ErrorMessage error={error} />
  if (!t) return null

  return (
    <div>
      <Link to="/" className="text-sm text-slate-400 hover:text-slate-200">← Tous les tournois</Link>
      <div className="mt-4 mb-6 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">{t.name}</h1>
        <StatusBadge status={t.status} />
      </div>
      <p className="mb-8 text-slate-400">Jeu : {t.game}</p>

      {/* Emplacements prévus pour les prochaines étapes */}
      <section className="rounded-lg border border-dashed border-slate-700 p-6 text-slate-500">
        Équipes inscrites, arbre du tournoi et matchs — à venir.
      </section>
    </div>
  )
}
