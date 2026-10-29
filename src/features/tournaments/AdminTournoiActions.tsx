import { ErrorMessage } from '@/shared/ui/Feedback'
import { btnPrimary } from '@/shared/ui/styles'
import { useChangerEtatTournoi } from './hooks'
import type { Tournoi } from './types'

// Boutons de l'administrateur selon l'état (B-03, B-04). Le back revérifie rôle et état.
export function AdminTournoiActions({ tournoi }: { tournoi: Tournoi }) {
  const { cloturer, lancer } = useChangerEtatTournoi(tournoi.id)

  let action: { label: string; aide: string; mutation: typeof cloturer } | null = null
  if (tournoi.etat === 'inscriptions_ouvertes') {
    action = { label: 'Clôturer les inscriptions', aide: "Génère l'arbre ; il faut exactement 8 équipes.", mutation: cloturer }
  } else if (tournoi.etat === 'inscriptions_closes') {
    action = { label: 'Lancer le tournoi', aide: 'Les équipes incomplètes seront déclarées forfait au premier tour.', mutation: lancer }
  }
  if (!action) return null

  const { mutation } = action
  return (
    <div className="mb-8 rounded-lg border border-indigo-500/30 bg-indigo-500/5 p-4">
      <h2 className="mb-2 text-sm font-semibold text-indigo-300">Administration</h2>
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={() => confirm(`${action.label} ? Cette action est définitive.`) && mutation.mutate()} disabled={mutation.isPending} className={btnPrimary}>
          {mutation.isPending ? '…' : action.label}
        </button>
        <span className="text-sm text-slate-400">{action.aide}</span>
      </div>
      {mutation.isError && <div className="mt-3"><ErrorMessage error={mutation.error} /></div>}
    </div>
  )
}
