import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { tokenStorage } from '@/shared/api/tokenStorage'
import { authApi } from './api'
import type { AuthResponse, User } from './types'

type AuthState = {
  user: User | null
  loading: boolean
  signIn: (res: AuthResponse) => void
  signOut: () => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(() => tokenStorage.get() !== null)
  const queryClient = useQueryClient()

  // Au démarrage : si un token traîne, on demande au back qui on est.
  useEffect(() => {
    if (!tokenStorage.get()) return
    authApi
      .me()
      .then(setUser)
      .catch(() => tokenStorage.clear())
      .finally(() => setLoading(false))
  }, [])

  const signIn = useCallback((res: AuthResponse) => {
    tokenStorage.set(res.token)
    setUser(res.user)
  }, [])

  const signOut = useCallback(() => {
    tokenStorage.clear()
    setUser(null)
    queryClient.clear() // on jette les données vues avec l'ancien compte
  }, [queryClient])

  return <AuthContext.Provider value={{ user, loading, signIn, signOut }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être utilisé dans <AuthProvider>')
  return ctx
}
