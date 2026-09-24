// Contrat supposé avec le back — à aligner quand les routes /auth existeront.
export type Role = 'ADMIN' | 'PLAYER'

export type User = {
  id: string
  pseudo: string
  email: string
  role: Role
}

export type AuthResponse = { token: string; user: User }
