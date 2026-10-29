import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { tournoiKeys } from '@/features/tournaments/hooks'
import { equipesApi } from './api'
import { equipeKeys } from './keys'

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

// Une équipe a changé : sa fiche, ses demandes et la liste des équipes de son tournoi sont à recharger.
function useInvaliderEquipe() {
  const queryClient = useQueryClient()
  return (equipeId: number, tournoiId: number) =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: equipeKeys.detail(equipeId) }),
      queryClient.invalidateQueries({ queryKey: tournoiKeys.equipes(tournoiId) }),
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
      onSuccess,
    }),
    decider: useMutation({
      mutationFn: ({ demandeId, decision }: { demandeId: number; decision: 'acceptee' | 'refusee' }) =>
        equipesApi.decider(equipeId, demandeId, decision),
      onSuccess,
    }),
  }
}
