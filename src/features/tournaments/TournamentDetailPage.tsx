import { Link, useParams } from 'react-router-dom'
import { ErrorMessage, Loader } from '@/shared/ui/Feedback'
import { useAuth } from '@/features/auth/AuthContext'
import { CreerEquipeForm } from '@/features/equipes/CreerEquipeForm'
import { DemanderRejoindre } from '@/features/equipes/DemanderRejoindre'
import { AdminTournoiActions } from './AdminTournoiActions'
import { ArbreTournoi } from './ArbreTournoi'
import { useEquipesDuTournoi, useTournoi } from './hooks'
import { useSuivreTournoi } from './realtime'
import { StatusBadge } from './StatusBadge'
import type { Tournoi } from './types'

export function TournamentDetailPage() {
  const id = Number(useParams().id)
  const { data: t, isLoading, isError, error } = useTournoi(id)
  const { user } = useAuth()
  // B-19 : état, équipes et arbre se mettent à jour sans recharger tant que la page est ouverte.
  useSuivreTournoi(id)

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

      {user?.role === 'administrateur' && <AdminTournoiActions tournoi={t} />}
      <EquipesSection tournoi={t} />
      <ArbreTournoi tournoi={t} />
    </div>
  )
}

// Confort uniquement : ces limites sont vérifiées par le back (B-08, B-12).
const NOMBRE_EQUIPES_MAX = 8
const EFFECTIF_MAX = 5

function EquipesSection({ tournoi }: { tournoi: Tournoi }) {
  const { data, isLoading, isError, error } = useEquipesDuTournoi(tournoi.id)
  const { user } = useAuth()

  const ouvertes = tournoi.etat === 'inscriptions_ouvertes'
  // Déjà engagé sur ce tournoi (B-07) : inutile de proposer de créer ou rejoindre. Le back le refuserait.
  const monEquipe = user ? data?.find((e) => e.membres.some((m) => m.userId === user.id)) : undefined
  const peutSEngager = ouvertes && !!user && !!data && !monEquipe
  // B-12 : au-delà de 8 équipes le back refuse la création (409) ; on ne propose pas le formulaire.
  const complet = !!data && data.length >= NOMBRE_EQUIPES_MAX

  return (
    <section className="mb-10">
      <h2 className="mb-4 text-xl font-semibold">Équipes {data && `(${data.length})`}</h2>
      {ouvertes && !user && (
        <p className="mb-4 text-sm text-slate-400">
          <Link to="/connexion" className="text-indigo-300 hover:underline">Connectez-vous</Link> pour créer ou rejoindre une équipe.
        </p>
      )}
      {peutSEngager && !complet && <CreerEquipeForm tournoiId={tournoi.id} />}
      {isLoading && <Loader />}
      {isError && <ErrorMessage error={error} />}
      {data && data.length === 0 && <p className="text-slate-400">Aucune équipe inscrite.</p>}
      <ul className="grid gap-3 sm:grid-cols-2">
        {data?.map((e) => (
          <li key={e.id} className="rounded-lg border border-slate-800 bg-slate-900 p-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <Link to={`/equipes/${e.id}`} className="font-semibold hover:text-indigo-300">{e.nom}</Link>
              {e.eliminee && <span className="text-xs text-red-300">Éliminée</span>}
              {e.id === monEquipe?.id && <span className="text-xs text-emerald-300">Votre équipe</span>}
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
            {peutSEngager && e.membres.length < EFFECTIF_MAX && <DemanderRejoindre equipeId={e.id} />}
          </li>
        ))}
      </ul>
    </section>
  )
}
