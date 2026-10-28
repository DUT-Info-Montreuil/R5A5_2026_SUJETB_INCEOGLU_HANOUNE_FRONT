import { apiFetch } from '@/shared/api/client'
import type { AuthResponse, User } from './types'

export const authApi = {
  login: (email: string, password: string) =>
    apiFetch<AuthResponse>('/auth/login', { method: 'POST', body: { email, password } }),
  // Le back crée le compte (rôle joueur) et renvoie l'utilisateur, SANS token : il faut ensuite se connecter.
  register: (nom: string, email: string, password: string) =>
    apiFetch<User>('/auth/register', { method: 'POST', body: { nom, email, password } }),
  me: () => apiFetch<User>('/auth/me'),
}
