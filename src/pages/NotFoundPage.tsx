import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="py-16 text-center">
      <h1 className="mb-2 text-3xl font-bold">404</h1>
      <p className="mb-6 text-slate-400">Cette page n'existe pas.</p>
      <Link to="/" className="text-indigo-300 hover:underline">Retour aux tournois</Link>
    </div>
  )
}
