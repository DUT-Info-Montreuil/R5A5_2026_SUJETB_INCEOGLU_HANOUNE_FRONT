// Formes exactes du back (src/models/types.ts du repo back, Swagger /api-docs).

// Les 4 états imposés par le sujet (« Vie d'un tournoi »).
export type EtatTournoi = 'inscriptions_ouvertes' | 'inscriptions_closes' | 'en_cours' | 'termine'

export type Tournoi = {
  id: number
  nom: string
  jeu: string
  etat: EtatTournoi
}
