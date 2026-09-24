import { apiFetch } from '@/shared/api/client'
import type { AuthResponse, User } from './types'

export const authApi = {
  login: (email: string, password: string) =>
    apiFetch<AuthResponse>('/auth/login', { method: 'POST', body: { email, password } }),
  register: (pseudo: string, email: string, password: string) =>
    apiFetch<AuthResponse>('/auth/register', { method: 'POST', body: { pseudo, email, password } }),
  me: () => apiFetch<User>('/auth/me'),
}
