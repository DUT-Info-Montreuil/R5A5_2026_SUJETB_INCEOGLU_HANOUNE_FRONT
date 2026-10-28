import { ApiError } from '@/shared/api/client'

export function Loader() {
  return <p className="py-8 text-center text-slate-400">Chargement…</p>
}

export function ErrorMessage({ error }: { error: unknown }) {
  let msg = 'Une erreur est survenue.'
  if (error instanceof ApiError) {
    // Le back renvoie { message } en français : on l'affiche tel quel.
    msg = error.status === 0 ? 'Le serveur ne répond pas. Le back est-il lancé ?' : error.message
  }
  return <p className="rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">{msg}</p>
}
