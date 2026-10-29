import { useQueryClient } from '@tanstack/react-query'
import type { Match } from '@/features/matchs/types'
import { useRoom, useSocketEvent } from '@/shared/realtime/socket'
import { tournoiKeys } from './hooks'
import type { Tournoi } from './types'

// Événements Socket.io des tournois → cache TanStack Query (B-19).
// Monté une seule fois (app/TempsReel) : ils n'arrivent qu'aux sockets de la room tournoi:<id>.
export function useTempsReelTournois() {
  const queryClient = useQueryClient()

  // Clôture, lancement, fin du tournoi.
  useSocketEvent<Tournoi>('tournoi:maj', (tournoi) => {
    queryClient.setQueryData(tournoiKeys.detail(tournoi.id), tournoi)
    queryClient.invalidateQueries({ queryKey: [...tournoiKeys.all, 'list'] })
  })

  // Arbre complet, émis une fois la cascade terminée : on remplace celui en cache.
  // Jamais vide en pratique (l'arbre existe dès la clôture) ; vide, on ne saurait pas de quel tournoi il s'agit.
  useSocketEvent<Match[]>('tournoi:matchs', (matchs) => {
    if (matchs.length === 0) return
    queryClient.setQueryData(tournoiKeys.matchs(matchs[0].tournoiId), matchs)
  })
}

// À appeler sur la page d'un tournoi : ses événements arrivent tant qu'elle est affichée.
// À chaque entrée dans la room, on relit le tournoi, ses équipes et son arbre (detail(id) les couvre) :
// ce qui a été diffusé pendant une coupure n'est pas rejoué.
export function useSuivreTournoi(tournoiId: number) {
  const queryClient = useQueryClient()
  useRoom(Number.isInteger(tournoiId) ? { type: 'tournoi', tournoiId } : null, () =>
    queryClient.invalidateQueries({ queryKey: tournoiKeys.detail(tournoiId) }),
  )
}
