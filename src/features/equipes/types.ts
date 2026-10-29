// Formes exactes du back (src/models/types.ts du repo back, Swagger /api-docs).
import type { EtatTournoi } from '@/features/tournaments/types'

export type MembreEquipe = {
  userId: number
  nom: string
  roleJeu: string | null
}

export type Equipe = {
  id: number
  tournoiId: number
  nom: string
  capitaineId: number
  eliminee: boolean
  membres: MembreEquipe[]
}

// Demande d'adhésion (B-06).
export type StatutDemande = 'en_attente' | 'acceptee' | 'refusee' | 'annulee'

export type DemandeAdhesion = {
  id: number
  equipeId: number
  userId: number
  statut: StatutDemande
  createdAt: string
}

// GET /api/equipes/:id/demandes (capitaine) : le back ajoute le nom du joueur.
export type DemandeRecue = DemandeAdhesion & { nomJoueur: string | null }

// GET /api/auth/me/demandes : le back ajoute le nom et le tournoi de l'équipe visée.
export type MaDemande = DemandeAdhesion & { nomEquipe: string | null; tournoiId: number | null }

// GET /api/auth/me/equipes : le back ajoute le nom et l'état du tournoi.
export type MonEquipe = Equipe & { nomTournoi: string | null; etatTournoi: EtatTournoi | null }

// Espace d'échange de l'équipe (B-16).
export type Message = {
  id: number
  equipeId: number
  userId: number
  contenu: string
  createdAt: string
}

// Événement Socket.io message:nouveau : le back ajoute le nom de l'auteur (absent de la réponse REST).
export type MessageDiffuse = Message & { nomAuteur: string | null }

// Événement Socket.io equipe:exclu, reçu par le joueur exclu ou qui part (B-17).
export type ExclusionEquipe = { equipeId: number; motif: 'exclusion' | 'depart' }
