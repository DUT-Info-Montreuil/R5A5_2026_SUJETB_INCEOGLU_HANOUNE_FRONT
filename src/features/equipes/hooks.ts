import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { tournoiKeys } from '@/features/tournaments/hooks'
import { equipesApi } from './api'
import { equipeKeys } from './keys'
import type { MessageAvecAuteur } from './types'

export function useEquipe(id: number) {
  return useQuery({ queryKey: equipeKeys.detail(id), queryFn: () => equipesApi.get(id) })
}

// Réservé au capitaine (le back répond 403 sinon) : n'appeler que depuis un écran affiché au capitaine.
export function useDemandesRecues(id: number) {
  return useQuery({ queryKey: equipeKeys.demandes(id), queryFn: () => equipesApi.demandesRecues(id) })
}

export function useMesDemandes() {
  return useQuery({ queryKey: equipeKeys.mesDemandes, queryFn: equipesApi.mesDemandes })
}

export function useMesEquipes() {
  return useQuery({ queryKey: equipeKeys.mesEquipes, queryFn: equipesApi.mesEquipes })
}

// Membres, ou administrateur. Le back refuse (403 non membre, 409 équipe éliminée) : l'écran affiche son message.
export function useMessages(equipeId: number) {
  return useQuery({ queryKey: equipeKeys.messages(equipeId), queryFn: () => equipesApi.messages(equipeId), retry: false })
}

// Ajoute un message reçu en direct à l'historique en cache, sans doublon
// (il peut déjà y être si l'historique a été relu entre-temps).
export function ajouterMessage(liste: MessageAvecAuteur[] | undefined, message: MessageAvecAuteur) {
  if (!liste || liste.some((m) => m.id === message.id)) return liste
  return [...liste, message]
}

export function useEnvoyerMessage(equipeId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (contenu: string) => equipesApi.envoyerMessage(equipeId, contenu),
    // La réponse du POST n'a pas le nom de l'auteur, et on ne le déduit pas de l'utilisateur connecté
    // (le token peut appartenir à un autre compte, cf. autre onglet). Le message arrive en général
    // déjà par message:nouveau ; sinon (room refusée), on relit l'historique, qui porte nomAuteur.
    // Relire à chaque envoi pourrait écraser un message:nouveau arrivé pendant la relecture.
    onSuccess: (message) => {
      const liste = queryClient.getQueryData<MessageAvecAuteur[]>(equipeKeys.messages(equipeId))
      if (liste?.some((m) => m.id === message.id)) return
      return queryClient.invalidateQueries({ queryKey: equipeKeys.messages(equipeId) })
    },
  })
}

// Une équipe a changé : sa fiche, ses demandes et la liste des équipes de son tournoi sont à recharger.
function useInvaliderEquipe() {
  const queryClient = useQueryClient()
  return (equipeId: number, tournoiId: number) =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: equipeKeys.detail(equipeId) }),
      queryClient.invalidateQueries({ queryKey: tournoiKeys.equipes(tournoiId) }),
      queryClient.invalidateQueries({ queryKey: equipeKeys.mesEquipes }),
    ])
}

export function useCreerEquipe(tournoiId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (nom: string) => equipesApi.creer(tournoiId, nom),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: tournoiKeys.equipes(tournoiId) }),
        // Le back annule mes demandes en attente sur ce tournoi (B-07).
        queryClient.invalidateQueries({ queryKey: equipeKeys.mesDemandes }),
        queryClient.invalidateQueries({ queryKey: equipeKeys.mesEquipes }),
      ]),
  })
}

export function useDemanderARejoindre(equipeId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => equipesApi.demander(equipeId),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: equipeKeys.mesDemandes }),
        queryClient.invalidateQueries({ queryKey: equipeKeys.demandes(equipeId) }),
      ]),
  })
}

export function useAnnulerDemande() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ equipeId, demandeId }: { equipeId: number; demandeId: number }) =>
      equipesApi.annulerDemande(equipeId, demandeId),
    onSuccess: (_, { equipeId }) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: equipeKeys.mesDemandes }),
        queryClient.invalidateQueries({ queryKey: equipeKeys.demandes(equipeId) }),
      ]),
  })
}

// Actions sur une équipe existante (membre ou capitaine). Toutes rechargent l'équipe après succès.
export function useActionsEquipe(equipeId: number, tournoiId: number) {
  const queryClient = useQueryClient()
  const invalider = useInvaliderEquipe()
  const onSuccess = () => invalider(equipeId, tournoiId)
  return {
    renommer: useMutation({ mutationFn: (nom: string) => equipesApi.renommer(equipeId, nom), onSuccess }),
    attribuerRole: useMutation({
      mutationFn: ({ userId, roleJeu }: { userId: number; roleJeu: string }) =>
        equipesApi.attribuerRole(equipeId, userId, roleJeu),
      onSuccess,
    }),
    retirerMembre: useMutation({ mutationFn: (userId: number) => equipesApi.retirerMembre(equipeId, userId), onSuccess }),
    passerCapitaine: useMutation({
      mutationFn: (userId: number) => equipesApi.passerCapitaine(equipeId, userId),
      // Le back renvoie l'équipe à jour : on l'écrit telle quelle, ce qui retire tout de suite les boutons
      // de capitaine. Pas de relecture de detail(id) : elle relirait aussi les demandes, refusées (403)
      // à l'ancien capitaine. Les demandes sont oubliées, le nouveau capitaine les chargera.
      onSuccess: (equipe) => {
        queryClient.setQueryData(equipeKeys.detail(equipeId), equipe)
        queryClient.removeQueries({ queryKey: equipeKeys.demandes(equipeId), exact: true })
        return Promise.all([
          queryClient.invalidateQueries({ queryKey: tournoiKeys.equipes(tournoiId) }),
          queryClient.invalidateQueries({ queryKey: equipeKeys.mesEquipes }),
        ])
      },
    }),
    decider: useMutation({
      mutationFn: ({ demandeId, decision }: { demandeId: number; decision: 'acceptee' | 'refusee' }) =>
        equipesApi.decider(equipeId, demandeId, decision),
      onSuccess,
    }),
  }
}
