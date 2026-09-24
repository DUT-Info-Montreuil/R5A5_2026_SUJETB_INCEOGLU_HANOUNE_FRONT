// Contrat supposé avec le back — à aligner avec le collègue quand les routes existeront.

// Les 4 états imposés par le sujet (« Vie d'un tournoi »).
export const TOURNAMENT_STATUS = {
  REGISTRATION_OPEN: 'REGISTRATION_OPEN',
  REGISTRATION_CLOSED: 'REGISTRATION_CLOSED',
  IN_PROGRESS: 'IN_PROGRESS',
  FINISHED: 'FINISHED',
} as const
export type TournamentStatus = (typeof TOURNAMENT_STATUS)[keyof typeof TOURNAMENT_STATUS]

export type Tournament = {
  id: string
  name: string
  game: string
  status: TournamentStatus
  teamCount: number
  createdAt: string
}
