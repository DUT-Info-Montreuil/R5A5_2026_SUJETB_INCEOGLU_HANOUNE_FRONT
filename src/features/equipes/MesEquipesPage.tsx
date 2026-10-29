import { Link } from 'react-router-dom'
import { ErrorMessage, Loader } from '@/shared/ui/Feedback'
import { btnDanger } from '@/shared/ui/styles'
import { useAnnulerDemande, useMesDemandes } from './hooks'
import type { MaDemande, StatutDemande } from './types'

const STATUTS: Record<StatutDemande, { label: string; cls: string }> = {
  en_attente: { label: 'En attente', cls: 'text-amber-300' },
  acceptee: { label: 'Acceptée', cls: 'text-emerald-300' },
  refusee: { label: 'Refusée', cls: 'text-red-300' },
  annulee: { label: 'Annulée', cls: 'text-slate-500' },
}

export function MesEquipesPage() {
  const { data, isLoading, isError, error } = useMesDemandes()

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Mes équipes</h1>
      {/* Manque côté back : pas de route « mes équipes » (ex. GET /api/auth/me/equipes). On ne la simule pas. */}
      <p className="mb-8 rounded-md border border-slate-700 bg-slate-900 p-3 text-sm text-slate-400">
        Le serveur ne fournit pas encore la liste de vos équipes : retrouvez-les depuis la page de leur tournoi.
        Ci-dessous, vos demandes d'adhésion (une demande acceptée ne dit pas que vous êtes encore membre).
      </p>
      {isLoading && <Loader />}
      {isError && <ErrorMessage error={error} />}

      {data && (
        <section>
          <h2 className="mb-4 text-xl font-semibold">Mes demandes ({data.length})</h2>
          {data.length === 0 && <p className="text-slate-400">Aucune demande envoyée.</p>}
          <ul className="space-y-2">
            {data.map((d) => <DemandeRow key={d.id} demande={d} />)}
          </ul>
        </section>
      )}
    </div>
  )
}

function DemandeRow({ demande: d }: { demande: MaDemande }) {
  const annuler = useAnnulerDemande()
  const statut = STATUTS[d.statut]

  return (
    <li className="rounded-lg border border-slate-800 bg-slate-900 p-3">
      <div className="flex flex-wrap items-center gap-3">
        <Link to={`/equipes/${d.equipeId}`} className="font-medium hover:text-indigo-300">
          {d.nomEquipe ?? `Équipe #${d.equipeId}`}
        </Link>
        {d.tournoiId !== null && (
          <Link to={`/tournois/${d.tournoiId}`} className="text-sm text-slate-400 hover:text-slate-200">voir le tournoi</Link>
        )}
        <span className={`text-sm ${statut.cls}`}>{statut.label}</span>
        <span className="text-xs text-slate-500">{new Date(d.createdAt).toLocaleString('fr-FR')}</span>
        {d.statut === 'en_attente' && (
          <button
            onClick={() => annuler.mutate({ equipeId: d.equipeId, demandeId: d.id })}
            disabled={annuler.isPending}
            className={`${btnDanger} ml-auto`}
          >
            Annuler
          </button>
        )}
      </div>
      {annuler.isError && <div className="mt-2"><ErrorMessage error={annuler.error} /></div>}
    </li>
  )
}
