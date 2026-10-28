import { useQuery } from '@tanstack/react-query'
import { tournoisApi } from './api'

// Clés de cache centralisées : le temps réel (Socket.io) viendra invalider ces clés
// pour que l'écran se mette à jour sans recharger la page (B-19).
export const tournoiKeys = {
  all: ['tournois'] as const,
  list: (q: string) => [...tournoiKeys.all, 'list', q] as const,
  detail: (id: number) => [...tournoiKeys.all, 'detail', id] as const,
  equipes: (id: number) => [...tournoiKeys.detail(id), 'equipes'] as const,
  matchs: (id: number) => [...tournoiKeys.detail(id), 'matchs'] as const,
}

export function useTournois(q: string) {
  return useQuery({ queryKey: tournoiKeys.list(q), queryFn: () => tournoisApi.list(q) })
}

export function useTournoi(id: number) {
  return useQuery({ queryKey: tournoiKeys.detail(id), queryFn: () => tournoisApi.get(id) })
}

export function useEquipesDuTournoi(id: number) {
  return useQuery({ queryKey: tournoiKeys.equipes(id), queryFn: () => tournoisApi.equipes(id) })
}

export function useMatchsDuTournoi(id: number) {
  return useQuery({ queryKey: tournoiKeys.matchs(id), queryFn: () => tournoisApi.matchs(id) })
}
