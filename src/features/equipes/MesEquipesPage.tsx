import { Link } from 'react-router-dom'
import { useQueries } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/AuthContext'
import { StatusBadge } from '@/features/tournaments/StatusBadge'
import { ApiError } from '@/shared/api/client'
import { ErrorMessage, Loader } from '@/shared/ui/Feedback'
import { btnDanger } from '@/shared/ui/styles'
import { equipesApi } from './api'
import { useAnnulerDemande, useMesDemandes, useMesEquipes } from './hooks'
import { equipeKeys } from './keys'
import type { MaDemande, MonEquipe, StatutDemande } from './types'

const STATUTS: Record<StatutDemande, { label: string; cls: string }> = {
  en_attente: { label: 'En attente', cls: 'text-amber-300' },
  acceptee: { label: 'Acceptée', cls: 'text-emerald-300' },
  refusee: { label: 'Refusée', cls: 'text-red-300' },
  annulee: { label: 'Annulée', cls: 'text-slate-500' },
}

export function MesEquipesPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Mes équipes</h1>
      <MesEquipesSection />
      <MesDemandesSection />
    </div>
  )
}

function MesEquipesSection() {
  const { user } = useAuth()
  const { data, isLoading, isError, error } = useMesEquipes()
  // Demandes en attente des équipes que je dirige (même cache que la page équipe, rafraîchi par demande:nouvelle).
  const capitaine = data?.filter((e) => e.capitaineId === user?.id) ?? []
  const demandes = useQueries({
    queries: capitaine.map((e) => ({ queryKey: equipeKeys.demandes(e.id), queryFn: () => equipesApi.demandesRecues(e.id) })),
  })
  // Nombre de demandes, ou null si le back a refusé / échoué (on le dit plutôt que de masquer le compteur).
  const enAttente = new Map(capitaine.map((e, i) => [e.id, demandes[i]?.isError ? null : demandes[i]?.data?.length]))

  return (
    <section className="mb-10">
      <h2 className="mb-4 text-xl font-semibold">Mes équipes {data && `(${data.length})`}</h2>
      {isLoading && <Loader />}
      {/* Route ajoutée récemment au back : si elle manque encore, on le dit au lieu de la simuler. */}
      {isError && error instanceof ApiError && error.status === 404 ? (
        <p className="rounded-md border border-slate-700 bg-slate-900 p-3 text-sm text-slate-400">
          Le serveur ne fournit pas encore la liste de vos équipes : retrouvez-les depuis la page de leur tournoi.
        </p>
      ) : (
        isError && <ErrorMessage error={error} />
      )}
      {data && data.length === 0 && <p className="text-slate-400">Vous n'êtes membre d'aucune équipe.</p>}
      <ul className="space-y-2">
        {data?.map((e) => (
          <EquipeRow key={e.id} equipe={e} estCapitaine={e.capitaineId === user?.id} enAttente={enAttente.get(e.id)} />
        ))}
      </ul>
    </section>
  )
}

function EquipeRow({ equipe: e, estCapitaine, enAttente }: { equipe: MonEquipe; estCapitaine: boolean; enAttente?: number | null }) {
  return (
    <li className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-800 bg-slate-900 p-3">
      <Link to={`/equipes/${e.id}`} className="font-medium hover:text-indigo-300">{e.nom}</Link>
      {estCapitaine && <span className="text-sm text-amber-300">capitaine</span>}
      {e.eliminee && <span className="text-sm text-red-300">éliminée</span>}
      <Link to={`/tournois/${e.tournoiId}`} className="text-sm text-slate-400 hover:text-slate-200">
        {e.nomTournoi ?? `Tournoi #${e.tournoiId}`}
      </Link>
      {e.etatTournoi && <StatusBadge etat={e.etatTournoi} />}
      {estCapitaine && enAttente === null && <span className="ml-auto text-sm text-red-300">Demandes indisponibles</span>}
      {estCapitaine && enAttente != null && (
        <Link
          to={`/equipes/${e.id}`}
          className={`ml-auto text-sm ${enAttente > 0 ? 'font-medium text-amber-300' : 'text-slate-500'}`}
        >
          {enAttente === 0 ? 'Aucune demande en attente' : `${enAttente} demande${enAttente > 1 ? 's' : ''} en attente`}
        </Link>
      )}
    </li>
  )
}

function MesDemandesSection() {
  const { data, isLoading, isError, error } = useMesDemandes()

  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold">Mes demandes {data && `(${data.length})`}</h2>
      {isLoading && <Loader />}
      {isError && <ErrorMessage error={error} />}
      {data && data.length === 0 && <p className="text-slate-400">Aucune demande envoyée.</p>}
      <ul className="space-y-2">
        {data?.map((d) => <DemandeRow key={d.id} demande={d} />)}
      </ul>
    </section>
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
