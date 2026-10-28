// Gardes de route = CONFORT, pas SÉCURITÉ.
// Elles évitent d'afficher une page inutile, mais n'empêchent personne d'appeler l'API.
// Les vrais contrôles d'accès (B-10, B-13…) sont faits par le back.
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Loader } from '@/shared/ui/Feedback'
import { useAuth } from './AuthContext'

export function RequireAuth() {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <Loader />
  if (!user) return <Navigate to="/connexion" replace state={{ from: location.pathname }} />
  return <Outlet />
}

export function RequireAdmin() {
  const { user, loading } = useAuth()
  if (loading) return <Loader />
  if (user?.role !== 'administrateur') return <Navigate to="/" replace />
  return <Outlet />
}
