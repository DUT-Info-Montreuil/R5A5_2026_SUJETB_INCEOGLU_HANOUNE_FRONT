// Formes exactes du back (src/models/types.ts du repo back, Swagger /api-docs).
export type Match = {
  id: number
  tournoiId: number
  round: number
  position: number
  equipe1Id: number | null
  equipe2Id: number | null
  vainqueurId: number | null
  matchSuivantId: number | null
}
