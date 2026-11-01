import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { UseMutationResult } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/AuthContext'
import { useTournoi } from '@/features/tournaments/hooks'
import { useSuivreTournoi } from '@/features/tournaments/realtime'
import { StatusBadge } from '@/features/tournaments/StatusBadge'
import { useSocketEvent } from '@/shared/realtime/socket'
import { ErrorMessage, Loader } from '@/shared/ui/Feedback'
import { btnDanger, btnPrimary, btnSecondary, inputCls } from '@/shared/ui/styles'
import { EspaceEchange } from './EspaceEchange'
import { useActionsEquipe, useDemandesRecues, useEquipe } from './hooks'
import type { DemandeAdhesion, Equipe, ExclusionEquipe, MembreEquipe } from './types'

export function EquipePage() {
  const id = Number(useParams().id)
  const { data: equipe, isLoading, isError, error } = useEquipe(id)

  if (isLoading) return <Loader />
  if (isError) return <ErrorMessage error={error} />
  if (!equipe) return null
  return <EquipeDetail equipe={equipe} />
}

type Actions = ReturnType<typeof useActionsEquipe>

function EquipeDetail({ equipe }: { equipe: Equipe }) {
  const { user } = useAuth()
  const tournoi = useTournoi(equipe.tournoiId)
  const actions = useActionsEquipe(equipe.id, equipe.tournoiId)
  // equipe:maj et tournoi:maj sont diffusés dans la room du tournoi : la fiche suit sans recharger (B-19).
  useSuivreTournoi(equipe.tournoiId)

  const estMembre = !!user && equipe.membres.some((m) => m.userId === user.id)
  const estCapitaine = user?.id === equipe.capitaineId
  const estAdmin = user?.role === 'administrateur'

  // B-17 : exclu (ou parti) pendant que la page est ouverte. L'espace disparaît tout de suite,
  // sans attendre le rechargement de l'équipe ; c'est le back qui coupe réellement l'accès.
  // Redevenir membre passe par une demande acceptée (demande:maj) : l'exclusion est alors levée.
  const [exclusion, setExclusion] = useState<ExclusionEquipe['motif'] | null>(null)
  useSocketEvent<ExclusionEquipe>('equipe:exclu', (e) => {
    if (e.equipeId === equipe.id) setExclusion(e.motif)
  })
  useSocketEvent<DemandeAdhesion>('demande:maj', (d) => {
    if (d.equipeId === equipe.id && d.statut === 'acceptee') setExclusion(null)
  })
  // B-11 : passé les inscriptions, la composition est figée. Tant que l'état n'est pas connu, on n'affiche rien.
  const ouvertes = tournoi.data?.etat === 'inscriptions_ouvertes'
  const gerer = estCapitaine && ouvertes

  // Une seule action à la fois : on efface les erreurs des précédentes avant d'en lancer une nouvelle.
  function lancer<V>(mutation: UseMutationResult<unknown, Error, V>, variables: NoInfer<V>) {
    Object.values(actions).forEach((m) => m.reset())
    mutation.mutate(variables)
  }
  const erreur = Object.values(actions).find((m) => m.isError)?.error

  return (
    <div>
      <Link to={`/tournois/${equipe.tournoiId}`} className="text-sm text-slate-400 hover:text-slate-200">
        ← {tournoi.data?.nom ?? 'Tournoi'}
      </Link>
      <div className="mt-4 mb-2 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">{equipe.nom}</h1>
        {equipe.eliminee ? (
          <span className="rounded-full bg-red-500/15 px-2.5 py-0.5 text-xs font-medium text-red-300">Éliminée</span>
        ) : (
          <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-300">En lice</span>
        )}
      </div>
      <div className="mb-8 flex items-center gap-2 text-sm text-slate-400">
        Tournoi :
        {tournoi.isLoading && <span>…</span>}
        {tournoi.isError && <span className="text-red-300">indisponible</span>}
        {tournoi.data && <StatusBadge etat={tournoi.data.etat} />}
      </div>

      {erreur && <div className="mb-4"><ErrorMessage error={erreur} /></div>}

      {exclusion && (
        <p className="mb-6 rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
          {exclusion === 'exclusion'
            ? "Vous avez été exclu de l'équipe : vous n'avez plus accès à son espace d'échange."
            : "Vous avez quitté l'équipe : vous n'avez plus accès à son espace d'échange."}
        </p>
      )}

      {gerer && <RenommerForm key={equipe.nom} equipe={equipe} onRenommer={(nom) => lancer(actions.renommer, nom)} pending={actions.renommer.isPending} />}

      {gerer && <DemandesSection equipeId={equipe.id} actions={actions} lancer={lancer} />}

      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold">Membres ({equipe.membres.length})</h2>
        {equipe.membres.length === 0 ? (
          <p className="text-slate-400">Aucun membre.</p>
        ) : (
          <ul className="space-y-2">
            {equipe.membres.map((m) => (
              <MembreRow key={`${m.userId}-${m.roleJeu}`} membre={m} equipe={equipe} gerer={gerer} actions={actions} lancer={lancer} />
            ))}
          </ul>
        )}
      </section>

      {!exclusion && (estMembre || estAdmin) && <EspaceEchange equipe={equipe} estMembre={estMembre} estAdmin={estAdmin} />}

      {estMembre && tournoi.data && !ouvertes && (
        <p className="mb-6 text-sm text-slate-400">Inscriptions closes : la composition de l'équipe est figée.</p>
      )}

      {estMembre && ouvertes && !estCapitaine && (
        <button
          onClick={() => confirm("Quitter l'équipe ?") && lancer(actions.retirerMembre, user!.id)}
          disabled={actions.retirerMembre.isPending}
          className={btnDanger}
        >
          Quitter l'équipe
        </button>
      )}
      {gerer && <p className="text-sm text-slate-400">Pour quitter l'équipe, passez d'abord la main à un autre membre.</p>}
    </div>
  )
}

function RenommerForm({ equipe, onRenommer, pending }: { equipe: Equipe; onRenommer: (nom: string) => void; pending: boolean }) {
  const [nom, setNom] = useState(equipe.nom)

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    onRenommer(nom.trim())
  }

  return (
    <form onSubmit={onSubmit} className="mb-8 flex max-w-md gap-2">
      <input className={inputCls} value={nom} onChange={(e) => setNom(e.target.value)} aria-label="Nom de l'équipe" required />
      <button disabled={pending || !nom.trim() || nom.trim() === equipe.nom} className={`${btnPrimary} shrink-0`}>
        Renommer
      </button>
    </form>
  )
}

type Lancer = <V>(mutation: UseMutationResult<unknown, Error, V>, variables: NoInfer<V>) => void

function MembreRow({ membre, equipe, gerer, actions, lancer }: {
  membre: MembreEquipe
  equipe: Equipe
  gerer: boolean
  actions: Actions
  lancer: Lancer
}) {
  const [roleJeu, setRoleJeu] = useState(membre.roleJeu ?? '')
  const estCapitaine = membre.userId === equipe.capitaineId
  const enCours = Object.values(actions).some((m) => m.isPending)

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    lancer(actions.attribuerRole, { userId: membre.userId, roleJeu: roleJeu.trim() })
  }

  return (
    <li className="rounded-lg border border-slate-800 bg-slate-900 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium">{membre.nom}</span>
        {estCapitaine && <span className="text-sm text-amber-300">(capitaine)</span>}
        {!gerer && <span className="text-sm text-slate-500">{membre.roleJeu ?? 'Sans rôle'}</span>}
      </div>
      {gerer && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <form onSubmit={onSubmit} className="flex gap-2">
            <input
              className={`${inputCls} py-1.5 text-sm`}
              placeholder="Rôle (ex. duelliste)"
              value={roleJeu}
              onChange={(e) => setRoleJeu(e.target.value)}
              aria-label={`Rôle de ${membre.nom}`}
            />
            <button disabled={enCours || !roleJeu.trim() || roleJeu.trim() === membre.roleJeu} className={`${btnSecondary} shrink-0`}>
              Attribuer
            </button>
          </form>
          {!estCapitaine && (
            <>
              <button
                onClick={() => confirm(`Passer la main à ${membre.nom} ?`) && lancer(actions.passerCapitaine, membre.userId)}
                disabled={enCours}
                className={btnSecondary}
              >
                Nommer capitaine
              </button>
              <button
                onClick={() => confirm(`Exclure ${membre.nom} de l'équipe ?`) && lancer(actions.retirerMembre, membre.userId)}
                disabled={enCours}
                className={btnDanger}
              >
                Exclure
              </button>
            </>
          )}
        </div>
      )}
    </li>
  )
}

function DemandesSection({ equipeId, actions, lancer }: { equipeId: number; actions: Actions; lancer: Lancer }) {
  const { data, isLoading, isError, error } = useDemandesRecues(equipeId)
  const { decider } = actions

  return (
    <section className="mb-10">
      <h2 className="mb-4 text-xl font-semibold">Demandes en attente {data && `(${data.length})`}</h2>
      {isLoading && <Loader />}
      {isError && <ErrorMessage error={error} />}
      {data && data.length === 0 && <p className="text-slate-400">Aucune demande en attente.</p>}
      <ul className="space-y-2">
        {data?.map((d) => (
          <li key={d.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 p-3">
            <span className="flex-1">
              {d.nomJoueur ?? `Joueur #${d.userId}`}
              <span className="ml-2 text-xs text-slate-500">{new Date(d.createdAt).toLocaleString('fr-FR')}</span>
            </span>
            <button
              onClick={() => lancer(decider, { demandeId: d.id, decision: 'acceptee' })}
              disabled={Object.values(actions).some((m) => m.isPending)}
              className={btnPrimary}
            >
              Accepter
            </button>
            <button
              onClick={() => lancer(decider, { demandeId: d.id, decision: 'refusee' })}
              disabled={Object.values(actions).some((m) => m.isPending)}
              className={btnDanger}
            >
              Refuser
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
