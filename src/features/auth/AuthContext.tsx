import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { setUnauthorizedHandler } from '@/shared/api/client'
import { tokenStorage } from '@/shared/api/tokenStorage'
import { authApi } from './api'
import type { AuthResponse, User } from './types'

type AuthState = {
  user: User | null
  loading: boolean
  // Vrai quand le back a rejeté le token en cours de session : Layout l'affiche.
  sessionExpiree: boolean
  signIn: (res: AuthResponse) => void
  signOut: () => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(() => tokenStorage.get() !== null)
  const [sessionExpiree, setSessionExpiree] = useState(false)
  const queryClient = useQueryClient()
  const userRef = useRef(user)
  useEffect(() => {
    userRef.current = user
  }, [user])

  // Au démarrage : si un token traîne, on demande au back qui on est.
  useEffect(() => {
    if (!tokenStorage.get()) return
    authApi
      .me()
      .then(setUser)
      // Token invalide (401) : apiFetch l'a déjà oublié. Back injoignable : on garde le token pour plus tard.
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // 401 en cours de session : apiFetch a déjà oublié le token, on repasse en visiteur.
  // On ne vide pas le cache (les écrans publics restent affichés) : on le fait recharger sans token.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      // Token rejeté au démarrage (via /me) : personne n'était connecté, pas de bandeau.
      if (userRef.current) setSessionExpiree(true)
      setUser(null)
      queryClient.invalidateQueries()
    })
    return () => setUnauthorizedHandler(null)
  }, [queryClient])

  const signIn = useCallback((res: AuthResponse) => {
    tokenStorage.set(res.token)
    setUser(res.user)
    setSessionExpiree(false)
    queryClient.clear() // rien de ce qui a été chargé avant (autre compte, session expirée) ne doit rester
  }, [queryClient])

  const signOut = useCallback(() => {
    tokenStorage.clear()
    setUser(null)
    queryClient.clear() // on jette les données vues avec l'ancien compte
  }, [queryClient])

  return <AuthContext.Provider value={{ user, loading, sessionExpiree, signIn, signOut }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être utilisé dans <AuthProvider>')
  return ctx
}
