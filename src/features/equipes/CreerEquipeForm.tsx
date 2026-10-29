import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ErrorMessage } from '@/shared/ui/Feedback'
import { btnPrimary, inputCls } from '@/shared/ui/styles'
import { useCreerEquipe } from './hooks'

// B-05 : le joueur connecté crée une équipe et en devient capitaine.
export function CreerEquipeForm({ tournoiId }: { tournoiId: number }) {
  const [nom, setNom] = useState('')
  const navigate = useNavigate()
  const creer = useCreerEquipe(tournoiId)

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    creer.mutate(nom.trim(), { onSuccess: (equipe) => navigate(`/equipes/${equipe.id}`) })
  }

  return (
    <form onSubmit={onSubmit} className="mb-6 rounded-lg border border-slate-800 bg-slate-900 p-4">
      <h3 className="mb-3 font-semibold">Créer une équipe</h3>
      <div className="flex gap-2">
        <input className={inputCls} placeholder="Nom de l'équipe" value={nom} onChange={(e) => setNom(e.target.value)} required />
        <button disabled={creer.isPending || !nom.trim()} className={`${btnPrimary} shrink-0`}>
          {creer.isPending ? '…' : 'Créer'}
        </button>
      </div>
      {creer.isError && <div className="mt-3"><ErrorMessage error={creer.error} /></div>}
    </form>
  )
}
