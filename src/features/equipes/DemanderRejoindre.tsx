import { ErrorMessage } from '@/shared/ui/Feedback'
import { btnSecondary } from '@/shared/ui/styles'
import { useDemanderARejoindre, useMesDemandes } from './hooks'

// B-06 : la demande part au capitaine ; le back refuse (409) si équipe complète, déjà engagé, doublon…
export function DemanderRejoindre({ equipeId }: { equipeId: number }) {
  const demander = useDemanderARejoindre(equipeId)
  // Une demande déjà en attente (envoyée lors d'une visite précédente) se lit côté serveur.
  const mesDemandes = useMesDemandes()
  const enAttente = mesDemandes.data?.some((d) => d.equipeId === equipeId && d.statut === 'en_attente')

  if (enAttente) return <p className="mt-3 text-sm text-amber-300">Demande en attente du capitaine.</p>
  return (
    <div className="mt-3 space-y-2">
      <button onClick={() => demander.mutate()} disabled={demander.isPending || mesDemandes.isLoading} className={btnSecondary}>
        {demander.isPending ? '…' : 'Demander à rejoindre'}
      </button>
      {demander.isError && <ErrorMessage error={demander.error} />}
    </div>
  )
}
