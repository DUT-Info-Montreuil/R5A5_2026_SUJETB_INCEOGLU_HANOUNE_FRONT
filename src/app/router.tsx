import { createBrowserRouter } from 'react-router-dom'
import { AuthForm } from '@/features/auth/AuthForm'
import { RequireAdmin, RequireAuth } from '@/features/auth/guards'
import { TournamentDetailPage } from '@/features/tournaments/TournamentDetailPage'
import { TournamentListPage } from '@/features/tournaments/TournamentListPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { Placeholder } from '@/pages/Placeholder'
import { Layout } from '@/shared/ui/Layout'

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      // Public (visiteur) — B-02, B-19
      { path: '/', element: <TournamentListPage /> },
      { path: '/tournois/:id', element: <TournamentDetailPage /> },
      { path: '/connexion', element: <AuthForm mode="login" /> },
      { path: '/inscription', element: <AuthForm mode="register" /> },

      // Joueur / capitaine connecté
      {
        element: <RequireAuth />,
        children: [{ path: '/mes-equipes', element: <Placeholder title="Mes équipes" /> }],
      },

      // Administrateur
      {
        element: <RequireAdmin />,
        children: [{ path: '/admin', element: <Placeholder title="Administration" /> }],
      },

      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
