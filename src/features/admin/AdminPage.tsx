import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useCreerTournoi, useTournois } from '@/features/tournaments/hooks'
import { StatusBadge } from '@/features/tournaments/StatusBadge'
import { ErrorMessage, Loader } from '@/shared/ui/Feedback'
import { btnPrimary, inputCls } from '@/shared/ui/styles'

// Écran d'administration. La clôture, le lancement et l'arbitrage se font sur la page de chaque tournoi.
export function AdminPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Administration</h1>
      <CreerTournoiForm />
      <TournoisAGerer />
    </div>
  )
}

function CreerTournoiForm() {
  const [nom, setNom] = useState('')
  const [jeu, setJeu] = useState('')
  const creer = useCreerTournoi()

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    creer.mutate(
      { nom: nom.trim(), jeu: jeu.trim() },
      {
        onSuccess: () => {
          setNom('')
          setJeu('')
        },
      },
    )
  }

  return (
    <form onSubmit={onSubmit} className="mb-10 max-w-md space-y-3 rounded-lg border border-slate-800 bg-slate-900 p-4">
      <h2 className="font-semibold">Créer un tournoi</h2>
      <input className={inputCls} placeholder="Nom" value={nom} onChange={(e) => setNom(e.target.value)} required />
      <input className={inputCls} placeholder="Jeu" value={jeu} onChange={(e) => setJeu(e.target.value)} required />
      {creer.isError && <ErrorMessage error={creer.error} />}
      {creer.isSuccess && (
        <p className="text-sm text-emerald-300">
          Tournoi créé : <Link to={`/tournois/${creer.data.id}`} className="underline">{creer.data.nom}</Link>
        </p>
      )}
      <button disabled={creer.isPending || !nom.trim() || !jeu.trim()} className={btnPrimary}>
        {creer.isPending ? '…' : 'Créer'}
      </button>
    </form>
  )
}

function TournoisAGerer() {
  const { data, isLoading, isError, error } = useTournois('')

  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold">Tournois</h2>
      {isLoading && <Loader />}
      {isError && <ErrorMessage error={error} />}
      {data && data.length === 0 && <p className="text-slate-400">Aucun tournoi.</p>}
      <ul className="space-y-2">
        {data?.map((t) => (
          <li key={t.id}>
            <Link to={`/tournois/${t.id}`} className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-900 p-3 hover:border-indigo-400">
              <span className="font-medium">{t.nom}</span>
              <span className="text-sm text-slate-400">{t.jeu}</span>
              <span className="ml-auto"><StatusBadge etat={t.etat} /></span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
