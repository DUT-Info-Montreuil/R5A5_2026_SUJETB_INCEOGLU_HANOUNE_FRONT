// Formes exactes du back (src/models/types.ts du repo back, Swagger /api-docs).
export type Role = 'joueur' | 'administrateur'

export type User = {
  id: number
  nom: string
  email: string
  role: Role
}

// Réponse de POST /api/auth/login (register renvoie seulement le User, sans token).
export type AuthResponse = { token: string; user: User }
