import { apiFetch } from '@/shared/api/client'
import type { Equipe } from '@/features/equipes/types'
import type { Match } from '@/features/matchs/types'
import type { Tournoi } from './types'

export const tournoisApi = {
  // B-02 : n'importe qui (même non connecté) peut chercher un tournoi (nom ou jeu)
  list: (q?: string) => apiFetch<Tournoi[]>(`/tournois${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  get: (id: number) => apiFetch<Tournoi>(`/tournois/${id}`),
  equipes: (id: number) => apiFetch<Equipe[]>(`/tournois/${id}/equipes`),
  matchs: (id: number) => apiFetch<Match[]>(`/tournois/${id}/matchs`),

  // Administration (B-01, B-03, B-04) : le back exige le rôle administrateur.
  creer: (nom: string, jeu: string) => apiFetch<Tournoi>('/tournois', { method: 'POST', body: { nom, jeu } }),
  // Génère l'arbre : il faut exactement 8 équipes (B-12), sinon 409.
  cloturer: (id: number) => apiFetch<Tournoi>(`/tournois/${id}/cloturer`, { method: 'PATCH' }),
  // Les équipes incomplètes sont déclarées forfait au premier tour (B-04).
  lancer: (id: number) => apiFetch<Tournoi>(`/tournois/${id}/lancer`, { method: 'PATCH' }),
}
