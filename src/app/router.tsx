import { createBrowserRouter } from 'react-router-dom'
import { AuthForm } from '@/features/auth/AuthForm'
import { AdminPage } from '@/features/admin/AdminPage'
import { RequireAdmin, RequireAuth } from '@/features/auth/guards'
import { EquipePage } from '@/features/equipes/EquipePage'
import { MesEquipesPage } from '@/features/equipes/MesEquipesPage'
import { TournamentDetailPage } from '@/features/tournaments/TournamentDetailPage'
import { TournamentListPage } from '@/features/tournaments/TournamentListPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { Layout } from '@/shared/ui/Layout'

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      // Public (visiteur) — B-02, B-19
      { path: '/', element: <TournamentListPage /> },
      { path: '/tournois/:id', element: <TournamentDetailPage /> },
      { path: '/equipes/:id', element: <EquipePage /> },
      { path: '/connexion', element: <AuthForm mode="login" /> },
      { path: '/inscription', element: <AuthForm mode="register" /> },

      // Joueur / capitaine connecté
      {
        element: <RequireAuth />,
        children: [{ path: '/mes-equipes', element: <MesEquipesPage /> }],
      },

      // Administrateur
      {
        element: <RequireAdmin />,
        children: [{ path: '/admin', element: <AdminPage /> }],
      },

      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
