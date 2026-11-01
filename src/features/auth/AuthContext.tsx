import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { setUnauthorizedHandler } from '@/shared/api/client'
import { tokenStorage } from '@/shared/api/tokenStorage'
import { authApi } from './api'
import type { AuthResponse, User } from './types'

type AuthState = {
  user: User | null
  // Token de la session affichée. TempsReel s'en sert pour (re)connecter la socket.
  token: string | null
  loading: boolean
  // Vrai quand le back a rejeté le token en cours de session : Layout l'affiche.
  sessionExpiree: boolean
  signIn: (res: AuthResponse) => void
  signOut: () => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState(() => tokenStorage.get())
  const [loading, setLoading] = useState(() => tokenStorage.get() !== null)
  const [sessionExpiree, setSessionExpiree] = useState(false)
  const queryClient = useQueryClient()
  const userRef = useRef(user)
  useEffect(() => {
    userRef.current = user
  }, [user])

  // Demande au back à qui appartient le token stocké (loading doit déjà être vrai).
  // Si le token change pendant la requête (autre onglet), la réponse concerne l'ancien : on l'ignore.
  const chargerUtilisateur = useCallback(() => {
    const demande = tokenStorage.get()
    if (!demande) return
    authApi
      .me()
      .then((u) => {
        if (tokenStorage.get() === demande) setUser(u)
      })
      // Token invalide (401) : apiFetch l'a déjà oublié. Back injoignable : on garde le token pour plus tard.
      .catch(() => {})
      .finally(() => {
        if (tokenStorage.get() === demande || !tokenStorage.get()) setLoading(false)
      })
  }, [])

  // Au démarrage : si un token traîne, on demande au back qui on est.
  useEffect(() => {
    chargerUtilisateur()
  }, [chargerUtilisateur])

  // Un autre onglet s'est connecté (autre compte) ou déconnecté : le token partagé a changé.
  // Sans ça, cet onglet afficherait l'ancien utilisateur en envoyant le nouveau token.
  // On repart de zéro : plus d'utilisateur, plus de cache, puis /me avec le nouveau token.
  // La socket suit le changement de `token` (TempsReel).
  useEffect(
    () =>
      tokenStorage.onChange(() => {
        const nouveau = tokenStorage.get()
        setUser(null)
        setToken(nouveau)
        setSessionExpiree(false)
        queryClient.clear()
        setLoading(nouveau !== null)
        chargerUtilisateur()
      }),
    [queryClient, chargerUtilisateur],
  )

  // 401 en cours de session : apiFetch a déjà oublié le token, on repasse en visiteur.
  // On ne vide pas le cache (les écrans publics restent affichés) : on le fait recharger sans token.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      // Token rejeté au démarrage (via /me) : personne n'était connecté, pas de bandeau.
      if (userRef.current) setSessionExpiree(true)
      setUser(null)
      setToken(null)
      queryClient.invalidateQueries()
    })
    return () => setUnauthorizedHandler(null)
  }, [queryClient])

  const signIn = useCallback((res: AuthResponse) => {
    tokenStorage.set(res.token)
    setToken(res.token)
    setUser(res.user)
    setLoading(false) // un /me encore en cours (ancien token) ne le remettrait pas à faux
    setSessionExpiree(false)
    queryClient.clear() // rien de ce qui a été chargé avant (autre compte, session expirée) ne doit rester
  }, [queryClient])

  const signOut = useCallback(() => {
    tokenStorage.clear()
    setToken(null)
    setUser(null)
    setLoading(false)
    queryClient.clear() // on jette les données vues avec l'ancien compte
  }, [queryClient])

  return (
    <AuthContext.Provider value={{ user, token, loading, sessionExpiree, signIn, signOut }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être utilisé dans <AuthProvider>')
  return ctx
}
