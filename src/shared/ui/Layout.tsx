import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthContext'
import { ApiStatus } from '@/features/health/ApiStatus'

const navCls = ({ isActive }: { isActive: boolean }) =>
  `text-sm ${isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`

export function Layout() {
  const { user, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <Link to="/" className="font-bold">🏆 Tournois inter-IUT</Link>
          <nav className="flex gap-4">
            <NavLink to="/" end className={navCls}>Tournois</NavLink>
            {user && <NavLink to="/mes-equipes" className={navCls}>Mes équipes</NavLink>}
            {user?.role === 'administrateur' && <NavLink to="/admin" className={navCls}>Admin</NavLink>}
          </nav>
          <div className="ml-auto flex items-center gap-4">
            <ApiStatus />
            {user ? (
              <>
                <span className="text-sm text-slate-300">{user.nom}</span>
                <button onClick={signOut} className="text-sm text-slate-400 hover:text-slate-200">Déconnexion</button>
              </>
            ) : (
              <NavLink to="/connexion" className={navCls}>Connexion</NavLink>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
