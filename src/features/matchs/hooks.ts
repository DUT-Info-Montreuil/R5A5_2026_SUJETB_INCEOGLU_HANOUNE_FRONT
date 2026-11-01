import { useMutation, useQueryClient } from '@tanstack/react-query'
import { equipeKeys } from '@/features/equipes/keys'
import { tournoiKeys } from '@/features/tournaments/hooks'
import { matchsApi } from './api'

// Un résultat fait avancer le gagnant, élimine le perdant et peut terminer le tournoi :
// on recharge tout ce qui touche aux tournois et aux équipes.
export function useDeciderMatch() {
  const queryClient = useQueryClient()
  const onSuccess = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: tournoiKeys.all }),
      queryClient.invalidateQueries({ queryKey: equipeKeys.all }),
    ])
  return {
    resultat: useMutation({
      mutationFn: ({ matchId, vainqueurId }: { matchId: number; vainqueurId: number }) =>
        matchsApi.resultat(matchId, vainqueurId),
      onSuccess,
    }),
    forfait: useMutation({
      mutationFn: ({ matchId, equipeForfaitId }: { matchId: number; equipeForfaitId: number }) =>
        matchsApi.forfait(matchId, equipeForfaitId),
      onSuccess,
    }),
  }
}
