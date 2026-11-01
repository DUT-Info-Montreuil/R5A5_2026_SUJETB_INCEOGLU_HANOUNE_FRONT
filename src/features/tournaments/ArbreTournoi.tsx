import { useAuth } from '@/features/auth/AuthContext'
import { ArbitrageMatch } from '@/features/matchs/ArbitrageMatch'
import type { Match } from '@/features/matchs/types'
import { ErrorMessage, Loader } from '@/shared/ui/Feedback'
import { useEquipesDuTournoi, useMatchsDuTournoi } from './hooks'
import type { Tournoi } from './types'

// B-14 : un match se joue quand ses deux équipes sont connues et qu'il n'a pas encore de vainqueur.
function estJouable(m: Match): m is Match & { equipe1Id: number; equipe2Id: number } {
  return m.equipe1Id !== null && m.equipe2Id !== null && m.vainqueurId === null
}

// Nom lisible d'un tour, en partant de la finale (dernier tour).
function nomDuTour(round: number, dernierRound: number) {
  const ecart = dernierRound - round
  if (ecart === 0) return 'Finale'
  if (ecart === 1) return 'Demi-finales'
  if (ecart === 2) return 'Quarts de finale'
  return `Tour ${round}`
}

// Arbre à élimination directe : une colonne par tour, les matchs centrés face à ceux qui les alimentent.
// Mis à jour sans recharger par tournoi:matchs (B-19), qui remplace les matchs en cache.
export function ArbreTournoi({ tournoi }: { tournoi: Tournoi }) {
  const matchs = useMatchsDuTournoi(tournoi.id)
  // Les noms d'équipes viennent de la même requête (cache partagé avec EquipesSection).
  const equipes = useEquipesDuTournoi(tournoi.id)
  const { user } = useAuth()
  // Sans la liste des équipes, on ne sait pas repérer un double forfait : pas d'arbitrage.
  const arbitre = user?.role === 'administrateur' && tournoi.etat === 'en_cours' && !!equipes.data
  const eliminee = (equipeId: number | null) => equipes.data?.find((e) => e.id === equipeId)?.eliminee ?? false
  // Double forfait (deux équipes incomplètes au lancement, B-04) : match clos sans vainqueur.
  const doubleForfait = (m: Match) =>
    m.vainqueurId === null && m.equipe1Id !== null && eliminee(m.equipe1Id) && eliminee(m.equipe2Id)

  const nomEquipe = (equipeId: number | null) =>
    equipeId === null ? 'À déterminer' : (equipes.data?.find((e) => e.id === equipeId)?.nom ?? `Équipe #${equipeId}`)

  const parTour = new Map<number, Match[]>()
  for (const m of [...(matchs.data ?? [])].sort((a, b) => a.round - b.round || a.position - b.position)) {
    parTour.set(m.round, [...(parTour.get(m.round) ?? []), m])
  }
  const dernierRound = Math.max(0, ...parTour.keys())
  const finale = parTour.get(dernierRound)?.[0]
  const champion = finale?.vainqueurId ?? null

  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold">Arbre du tournoi</h2>
      {matchs.isLoading && <Loader />}
      {matchs.isError && <ErrorMessage error={matchs.error} />}
      {equipes.isError && <ErrorMessage error={equipes.error} />}
      {matchs.data && matchs.data.length === 0 && (
        <p className="text-slate-400">Aucun match : l'arbre est généré à la clôture des inscriptions.</p>
      )}

      {champion !== null && (
        <p className="mb-4 rounded-md border border-amber-400/40 bg-amber-400/10 p-3 font-semibold text-amber-200">
          🏆 Vainqueur du tournoi : {nomEquipe(champion)}
        </p>
      )}

      {parTour.size > 0 && (
        // Défilement horizontal sur petit écran plutôt que des colonnes illisibles.
        <div className="overflow-x-auto pb-2">
          <div
            className="grid min-w-[44rem] gap-4"
            style={{ gridTemplateColumns: `repeat(${parTour.size}, minmax(0, 1fr))` }}
          >
            {[...parTour].map(([round, liste]) => (
              <div key={round} className="flex flex-col">
                <h3 className="mb-3 text-center text-sm font-medium tracking-wide text-slate-400 uppercase">
                  {nomDuTour(round, dernierRound)}
                </h3>
                <ul className="flex flex-1 flex-col justify-around gap-4">
                  {liste.map((m) => (
                    <li key={m.id} className="rounded-md border border-slate-800 bg-slate-900 p-2 text-sm">
                      {[m.equipe1Id, m.equipe2Id].map((equipeId, i) => {
                        const gagnant = m.vainqueurId !== null && m.vainqueurId === equipeId
                        const perdant = m.vainqueurId !== null && !gagnant
                        let cls = 'text-slate-200'
                        if (gagnant) cls = 'bg-emerald-500/15 font-semibold text-emerald-300'
                        else if (perdant) cls = 'text-slate-500 line-through'
                        else if (equipeId === null) cls = 'text-slate-500 italic'
                        return (
                          <div key={i} className={`flex items-center justify-between rounded px-2 py-1 ${cls}`}>
                            <span className="truncate">{nomEquipe(equipeId)}</span>
                            {gagnant && <span aria-label="vainqueur">✓</span>}
                          </div>
                        )
                      })}
                      {doubleForfait(m) && <p className="mt-1 px-2 text-xs text-red-300">Double forfait</p>}
                      {arbitre && estJouable(m) && !doubleForfait(m) && <ArbitrageMatch match={m} nomEquipe={nomEquipe} />}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
