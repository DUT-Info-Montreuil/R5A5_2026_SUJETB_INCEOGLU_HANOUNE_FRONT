import { Link, useParams } from 'react-router-dom'
import { ErrorMessage, Loader } from '@/shared/ui/Feedback'
import type { Match } from '@/features/matchs/types'
import { useEquipesDuTournoi, useMatchsDuTournoi, useTournoi } from './hooks'
import { StatusBadge } from './StatusBadge'

export function TournamentDetailPage() {
  const id = Number(useParams().id)
  const { data: t, isLoading, isError, error } = useTournoi(id)

  if (isLoading) return <Loader />
  if (isError) return <ErrorMessage error={error} />
  if (!t) return null

  return (
    <div>
      <Link to="/" className="text-sm text-slate-400 hover:text-slate-200">← Tous les tournois</Link>
      <div className="mt-4 mb-6 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">{t.nom}</h1>
        <StatusBadge etat={t.etat} />
      </div>
      <p className="mb-8 text-slate-400">Jeu : {t.jeu}</p>

      <EquipesSection tournoiId={t.id} />
      <MatchsSection tournoiId={t.id} />
    </div>
  )
}

function EquipesSection({ tournoiId }: { tournoiId: number }) {
  const { data, isLoading, isError, error } = useEquipesDuTournoi(tournoiId)

  return (
    <section className="mb-10">
      <h2 className="mb-4 text-xl font-semibold">Équipes {data && `(${data.length})`}</h2>
      {isLoading && <Loader />}
      {isError && <ErrorMessage error={error} />}
      {data && data.length === 0 && <p className="text-slate-400">Aucune équipe inscrite.</p>}
      <ul className="grid gap-3 sm:grid-cols-2">
        {data?.map((e) => (
          <li key={e.id} className="rounded-lg border border-slate-800 bg-slate-900 p-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h3 className="font-semibold">{e.nom}</h3>
              {e.eliminee && <span className="text-xs text-red-300">Éliminée</span>}
            </div>
            {e.membres.length === 0 ? (
              <p className="text-sm text-slate-500">Aucun membre.</p>
            ) : (
              <ul className="space-y-1 text-sm text-slate-300">
                {e.membres.map((m) => (
                  <li key={m.userId}>
                    {m.nom}
                    {m.userId === e.capitaineId && <span className="ml-1 text-amber-300">(capitaine)</span>}
                    {m.roleJeu && <span className="text-slate-500"> · {m.roleJeu}</span>}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

// Nom lisible d'un tour, en partant de la finale (dernier tour).
function nomDuTour(round: number, dernierRound: number) {
  const ecart = dernierRound - round
  if (ecart === 0) return 'Finale'
  if (ecart === 1) return 'Demi-finales'
  if (ecart === 2) return 'Quarts de finale'
  return `Tour ${round}`
}

function MatchsSection({ tournoiId }: { tournoiId: number }) {
  const matchs = useMatchsDuTournoi(tournoiId)
  // Les noms d'équipes viennent de la même requête (cache partagé avec EquipesSection).
  const equipes = useEquipesDuTournoi(tournoiId)

  const nomEquipe = (equipeId: number | null) =>
    equipeId === null ? 'À déterminer' : (equipes.data?.find((e) => e.id === equipeId)?.nom ?? `Équipe #${equipeId}`)

  const parTour = new Map<number, Match[]>()
  for (const m of [...(matchs.data ?? [])].sort((a, b) => a.round - b.round || a.position - b.position)) {
    parTour.set(m.round, [...(parTour.get(m.round) ?? []), m])
  }
  const dernierRound = Math.max(0, ...parTour.keys())

  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold">Matchs</h2>
      {matchs.isLoading && <Loader />}
      {matchs.isError && <ErrorMessage error={matchs.error} />}
      {matchs.data && matchs.data.length === 0 && (
        <p className="text-slate-400">Aucun match : l'arbre est généré à la clôture des inscriptions.</p>
      )}
      <div className="space-y-6">
        {[...parTour].map(([round, liste]) => (
          <div key={round}>
            <h3 className="mb-2 font-medium text-slate-300">{nomDuTour(round, dernierRound)}</h3>
            <ul className="grid gap-2 sm:grid-cols-2">
              {liste.map((m) => (
                <li key={m.id} className="rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm">
                  {[m.equipe1Id, m.equipe2Id].map((equipeId, i) => {
                    const gagnant = m.vainqueurId !== null && m.vainqueurId === equipeId
                    const cls = gagnant ? 'font-semibold text-emerald-300' : equipeId === null ? 'text-slate-500' : ''
                    return (
                      <div key={i} className={cls}>
                        {nomEquipe(equipeId)}
                        {gagnant && ' ✓'}
                      </div>
                    )
                  })}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
