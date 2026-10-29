import { useQueryClient } from '@tanstack/react-query'
import { tournoiKeys } from '@/features/tournaments/hooks'
import { useSocketEvent } from '@/shared/realtime/socket'
import { ajouterMessage } from './hooks'
import { equipeKeys } from './keys'
import type { DemandeAdhesion, Equipe, ExclusionEquipe, MessageDiffuse } from './types'

// Événements Socket.io des équipes → cache TanStack Query (voir docs/temps-reel.md du back).
// Monté une seule fois (app/TempsReel) : un événement n'arrive que si la socket est dans la bonne room.
export function useTempsReelEquipes() {
  const queryClient = useQueryClient()

  // Composition, nom, rôles, capitaine ou élimination : le back envoie l'équipe complète.
  useSocketEvent<Equipe>('equipe:maj', (equipe) => {
    queryClient.setQueryData(equipeKeys.detail(equipe.id), equipe)
    queryClient.setQueryData<Equipe[]>(tournoiKeys.equipes(equipe.tournoiId), (liste) => {
      if (!liste) return liste
      return liste.some((e) => e.id === equipe.id) ? liste.map((e) => (e.id === equipe.id ? equipe : e)) : [...liste, equipe]
    })
    queryClient.invalidateQueries({ queryKey: equipeKeys.mesEquipes })
    // Une demande acceptée sort de la liste du capitaine.
    queryClient.invalidateQueries({ queryKey: equipeKeys.demandes(equipe.id), exact: true })
  })

  // B-16 : nouveau message dans une équipe dont on a rejoint la room.
  useSocketEvent<MessageDiffuse>('message:nouveau', (message) => {
    queryClient.setQueryData<MessageDiffuse[]>(equipeKeys.messages(message.equipeId), (liste) => ajouterMessage(liste, message))
  })

  // B-17 : exclu ou parti. Le back nous a déjà retiré de la room ; on oublie l'historique.
  useSocketEvent<ExclusionEquipe>('equipe:exclu', ({ equipeId }) => {
    queryClient.removeQueries({ queryKey: equipeKeys.messages(equipeId) })
    queryClient.invalidateQueries({ queryKey: equipeKeys.detail(equipeId), exact: true })
    queryClient.invalidateQueries({ queryKey: equipeKeys.mesEquipes })
  })

  // B-06 : reçu par le capitaine.
  useSocketEvent<DemandeAdhesion>('demande:nouvelle', (demande) => {
    queryClient.invalidateQueries({ queryKey: equipeKeys.demandes(demande.equipeId), exact: true })
  })

  // B-06, B-07 : reçu par l'auteur (acceptée, refusée ou annulée).
  useSocketEvent<DemandeAdhesion>('demande:maj', (demande) => {
    queryClient.invalidateQueries({ queryKey: equipeKeys.mesDemandes })
    if (demande.statut === 'acceptee') {
      queryClient.invalidateQueries({ queryKey: equipeKeys.mesEquipes })
      queryClient.invalidateQueries({ queryKey: equipeKeys.detail(demande.equipeId), exact: true })
    }
  })
}
