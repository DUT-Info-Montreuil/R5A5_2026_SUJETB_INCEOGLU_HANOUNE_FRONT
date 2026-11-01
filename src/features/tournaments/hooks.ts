import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { equipeKeys } from '@/features/equipes/keys'
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

export function useCreerTournoi() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ nom, jeu }: { nom: string; jeu: string }) => tournoisApi.creer(nom, jeu),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: tournoiKeys.all }),
  })
}

// Clôture et lancement changent l'état, l'arbre et (forfaits du lancement) les équipes éliminées.
export function useChangerEtatTournoi(id: number) {
  const queryClient = useQueryClient()
  const onSuccess = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: tournoiKeys.all }),
      queryClient.invalidateQueries({ queryKey: equipeKeys.all }),
    ])
  return {
    cloturer: useMutation({ mutationFn: () => tournoisApi.cloturer(id), onSuccess }),
    lancer: useMutation({ mutationFn: () => tournoisApi.lancer(id), onSuccess }),
  }
}
