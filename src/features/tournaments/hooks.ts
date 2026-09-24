import { useQuery } from '@tanstack/react-query'
import { tournamentsApi } from './api'

// Clés de cache centralisées : le temps réel (SSE) viendra invalider ces clés
// pour que l'écran se mette à jour sans recharger la page (B-19).
export const tournamentKeys = {
  all: ['tournaments'] as const,
  list: (search: string) => [...tournamentKeys.all, 'list', search] as const,
  detail: (id: string) => [...tournamentKeys.all, 'detail', id] as const,
}

export function useTournaments(search: string) {
  return useQuery({ queryKey: tournamentKeys.list(search), queryFn: () => tournamentsApi.list(search) })
}

export function useTournament(id: string) {
  return useQuery({ queryKey: tournamentKeys.detail(id), queryFn: () => tournamentsApi.get(id) })
}
