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
}
