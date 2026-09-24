import { apiFetch } from '@/shared/api/client'
import type { Tournament } from './types'

export const tournamentsApi = {
  // B-02 : n'importe qui (même non connecté) peut chercher un tournoi
  list: (search?: string) =>
    apiFetch<Tournament[]>(`/tournaments${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  get: (id: string) => apiFetch<Tournament>(`/tournaments/${id}`),
}
