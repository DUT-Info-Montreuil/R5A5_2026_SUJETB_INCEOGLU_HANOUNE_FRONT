// Point d'entrée UNIQUE pour parler au back.
// Tous les appels passent ici : préfixe d'URL, token, parsing JSON et erreurs sont gérés une seule fois.
import { tokenStorage } from './tokenStorage'

const API_URL = import.meta.env.VITE_API_URL ?? '/api'

export class ApiError extends Error {
  readonly status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

// Prévenu quand le back rejette le token en cours de session (expiré, secret changé…).
// AuthProvider s'y abonne pour repasser l'interface en mode déconnecté.
let onUnauthorized: (() => void) | null = null
export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler
}

type Options = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  body?: unknown
  signal?: AbortSignal
}

export async function apiFetch<T>(path: string, { method = 'GET', body, signal }: Options = {}): Promise<T> {
  const headers: Record<string, string> = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const token = tokenStorage.get()
  if (token) headers.Authorization = `Bearer ${token}`

  let res: Response
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    })
  } catch {
    throw new ApiError(0, 'Serveur injoignable')
  }

  // Token expiré ou invalide : on l'oublie et on prévient l'UI, qui repasse en mode visiteur.
  // Sans token envoyé (ex. mauvais mot de passe au login), un 401 ne déconnecte personne.
  // Si le token a changé entre-temps (reconnexion), ce 401 concerne l'ancienne session : on l'ignore.
  if (res.status === 401 && token && tokenStorage.get() === token) {
    tokenStorage.clear()
    onUnauthorized?.()
  }

  if (!res.ok) {
    const data = await res.json().catch(() => null)
    // En dev, le proxy Vite répond 502 (corps vide) quand le back est éteint : même cas que « injoignable ».
    if (!data && res.status >= 502 && res.status <= 504) throw new ApiError(0, 'Serveur injoignable')
    throw new ApiError(res.status, data?.message ?? data?.error ?? `Erreur ${res.status}`)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}
