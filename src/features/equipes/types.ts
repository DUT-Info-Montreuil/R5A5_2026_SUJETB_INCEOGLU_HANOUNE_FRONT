// Formes exactes du back (src/models/types.ts du repo back, Swagger /api-docs).
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
