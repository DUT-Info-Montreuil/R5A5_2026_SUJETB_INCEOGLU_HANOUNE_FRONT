import { ErrorMessage } from '@/shared/ui/Feedback'
import { btnDanger, btnSecondary } from '@/shared/ui/styles'
import { useDeciderMatch } from './hooks'
import type { Match } from './types'

type Props = {
  match: Match & { equipe1Id: number; equipe2Id: number }
  nomEquipe: (id: number) => string
}

// Saisie du vainqueur ou d'un forfait par l'administrateur (B-13, B-15).
// Le back n'autorise aucune correction : on demande confirmation avant d'envoyer.
export function ArbitrageMatch({ match, nomEquipe }: Props) {
  const { resultat, forfait } = useDeciderMatch()
  const enCours = resultat.isPending || forfait.isPending
  const erreur = resultat.error ?? forfait.error

  function vainqueur(equipeId: number) {
    if (!confirm(`Valider la victoire de ${nomEquipe(equipeId)} ? Le résultat ne pourra pas être corrigé.`)) return
    forfait.reset()
    resultat.mutate({ matchId: match.id, vainqueurId: equipeId })
  }

  function declarerForfait(equipeId: number) {
    if (!confirm(`Déclarer ${nomEquipe(equipeId)} forfait ? L'adversaire sera qualifié.`)) return
    resultat.reset()
    forfait.mutate({ matchId: match.id, equipeForfaitId: equipeId })
  }

  return (
    <div className="mt-3 space-y-2 border-t border-slate-800 pt-3">
      {[match.equipe1Id, match.equipe2Id].map((equipeId) => (
        <div key={equipeId} className="flex flex-wrap items-center gap-2">
          <span className="min-w-0 flex-1 truncate text-slate-400">{nomEquipe(equipeId)}</span>
          <button onClick={() => vainqueur(equipeId)} disabled={enCours} className={btnSecondary}>Vainqueur</button>
          <button onClick={() => declarerForfait(equipeId)} disabled={enCours} className={btnDanger}>Forfait</button>
        </div>
      ))}
      {erreur && <ErrorMessage error={erreur} />}
    </div>
  )
}
