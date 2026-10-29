import { useEffect, useRef } from 'react'
import { authApi } from '@/features/auth/api'
import { useAuth } from '@/features/auth/AuthContext'
import { useTempsReelEquipes } from '@/features/equipes/realtime'
import { useTempsReelTournois } from '@/features/tournaments/realtime'
import { ApiError } from '@/shared/api/client'
import { tokenStorage } from '@/shared/api/tokenStorage'
import { connecterSocket, socket } from '@/shared/realtime/socket'

// Délai avant de retenter la connexion quand le back n'a pas pu confirmer la session.
const NOUVEL_ESSAI_MS = 5000

// Branche le client Socket.io partagé sur la session, et ses événements sur le cache.
export function TempsReel() {
  const { user, loading } = useAuth()
  // Lu à chaque rendu : signIn / signOut changent user, donc provoquent un rendu.
  // Suivre le token (et pas seulement l'id) couvre une reconnexion au même compte.
  const token = loading ? null : tokenStorage.get()
  const connecte = useRef(user !== null)
  useEffect(() => {
    connecte.current = user !== null
  }, [user])

  // Connexion, puis reconnexion à chaque login / logout : le back n'identifie la socket qu'au handshake.
  useEffect(() => {
    if (loading) return
    connecterSocket(token)
  }, [token, loading])

  // Token refusé à la connexion, ou socket coupée par le back (jeton expiré depuis) :
  // socket.io ne retente pas seul. On demande à l'API qui on est :
  // - 401 : apiFetch oublie le token et AuthProvider repasse en visiteur, ce qui reconnecte (effet ci-dessus) ;
  //   si personne n'était connecté, rien ne change côté React : on reconnecte nous-mêmes en visiteur ;
  // - back injoignable : on retente plus tard avec le token conservé.
  useEffect(() => {
    let minuteur: ReturnType<typeof setTimeout> | undefined
    const verifierSession = () => {
      authApi.me().catch((err) => {
        if (err instanceof ApiError && err.status === 0) {
          minuteur = setTimeout(() => connecterSocket(tokenStorage.get()), NOUVEL_ESSAI_MS)
        } else if (!tokenStorage.get() && !connecte.current) {
          connecterSocket(null)
        }
      })
    }
    const onConnectError = (err: Error) => {
      if (err.message === 'Token invalide ou expire') verifierSession()
    }
    const onDisconnect = (raison: string) => {
      if (raison === 'io server disconnect') verifierSession()
    }
    socket.on('connect_error', onConnectError)
    socket.on('disconnect', onDisconnect)
    return () => {
      clearTimeout(minuteur)
      socket.off('connect_error', onConnectError)
      socket.off('disconnect', onDisconnect)
      socket.disconnect()
    }
  }, [])

  useTempsReelTournois()
  useTempsReelEquipes()
  return null
}
