import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ErrorMessage, Loader } from '@/shared/ui/Feedback'
import { useTournois } from './hooks'
import { StatusBadge } from './StatusBadge'

export function TournamentListPage() {
  const [input, setInput] = useState('')
  const [search, setSearch] = useState('')

  // Petit debounce : on n'interroge pas le back à chaque touche.
  useEffect(() => {
    const t = setTimeout(() => setSearch(input.trim()), 300)
    return () => clearTimeout(t)
  }, [input])

  const { data, isLoading, isError, error } = useTournois(search)

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Tournois</h1>
      <input
        className="mb-6 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-indigo-400"
        placeholder="Chercher un tournoi ou un jeu…"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      {isLoading && <Loader />}
      {isError && <ErrorMessage error={error} />}
      {data && data.length === 0 && <p className="text-slate-400">Aucun tournoi.</p>}
      <ul className="grid gap-3 sm:grid-cols-2">
        {data?.map((t) => (
          <li key={t.id}>
            <Link to={`/tournois/${t.id}`} className="block rounded-lg border border-slate-800 bg-slate-900 p-4 hover:border-indigo-400">
              <div className="mb-2 flex items-start justify-between gap-2">
                <h2 className="font-semibold">{t.nom}</h2>
                <StatusBadge etat={t.etat} />
              </div>
              <p className="text-sm text-slate-400">{t.jeu}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
