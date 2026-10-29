import { apiFetch } from '@/shared/api/client'
import type { DemandeAdhesion, DemandeRecue, Equipe, MaDemande, Message, MonEquipe } from './types'

export const equipesApi = {
  get: (id: number) => apiFetch<Equipe>(`/equipes/${id}`),
  // B-05 : le créateur devient capitaine
  creer: (tournoiId: number, nom: string) => apiFetch<Equipe>('/equipes', { method: 'POST', body: { tournoiId, nom } }),
  renommer: (id: number, nom: string) => apiFetch<Equipe>(`/equipes/${id}`, { method: 'PATCH', body: { nom } }),
  attribuerRole: (id: number, userId: number, roleJeu: string) =>
    apiFetch<Equipe>(`/equipes/${id}/membres/${userId}`, { method: 'PATCH', body: { roleJeu } }),
  // Sert à la fois à quitter (soi-même) et à exclure (capitaine).
  retirerMembre: (id: number, userId: number) =>
    apiFetch<void>(`/equipes/${id}/membres/${userId}`, { method: 'DELETE' }),
  passerCapitaine: (id: number, nouveauCapitaineId: number) =>
    apiFetch<Equipe>(`/equipes/${id}/capitaine`, { method: 'PATCH', body: { nouveauCapitaineId } }),

  // Demandes d'adhésion (B-06)
  demander: (id: number) => apiFetch<DemandeAdhesion>(`/equipes/${id}/demandes`, { method: 'POST' }),
  demandesRecues: (id: number) => apiFetch<DemandeRecue[]>(`/equipes/${id}/demandes`),
  decider: (id: number, demandeId: number, decision: 'acceptee' | 'refusee') =>
    apiFetch<DemandeAdhesion>(`/equipes/${id}/demandes/${demandeId}`, { method: 'PATCH', body: { decision } }),
  annulerDemande: (id: number, demandeId: number) =>
    apiFetch<void>(`/equipes/${id}/demandes/${demandeId}`, { method: 'DELETE' }),
  mesDemandes: () => apiFetch<MaDemande[]>('/auth/me/demandes'),
  mesEquipes: () => apiFetch<MonEquipe[]>('/auth/me/equipes'),

  // Espace d'échange (B-16 à B-18) : membres, ou administrateur (lecture seule, même après élimination).
  messages: (id: number) => apiFetch<Message[]>(`/equipes/${id}/messages`),
  envoyerMessage: (id: number, contenu: string) =>
    apiFetch<Message>(`/equipes/${id}/messages`, { method: 'POST', body: { contenu } }),
}
