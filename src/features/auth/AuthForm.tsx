import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { ErrorMessage } from '@/shared/ui/Feedback'
import { authApi } from './api'
import { useAuth } from './AuthContext'

const input = 'w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-indigo-400'

export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const [pseudo, setPseudo] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const from = (useLocation().state as { from?: string } | null)?.from ?? '/'

  const mutation = useMutation({
    mutationFn: () => (mode === 'login' ? authApi.login(email, password) : authApi.register(pseudo, email, password)),
    onSuccess: (res) => {
      signIn(res)
      navigate(from, { replace: true })
    },
  })

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    mutation.mutate()
  }

  const isLogin = mode === 'login'
  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-6 text-2xl font-bold">{isLogin ? 'Connexion' : 'Créer un compte'}</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        {!isLogin && (
          <input className={input} placeholder="Pseudo" value={pseudo} onChange={(e) => setPseudo(e.target.value)} required />
        )}
        <input className={input} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className={input} type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
        {mutation.isError && <ErrorMessage error={mutation.error} />}
        <button disabled={mutation.isPending} className="w-full rounded-md bg-indigo-500 py-2 font-medium hover:bg-indigo-400 disabled:opacity-50">
          {mutation.isPending ? '…' : isLogin ? 'Se connecter' : "S'inscrire"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-400">
        {isLogin ? (
          <>Pas de compte ? <Link className="text-indigo-300 hover:underline" to="/inscription">Inscription</Link></>
        ) : (
          <>Déjà inscrit ? <Link className="text-indigo-300 hover:underline" to="/connexion">Connexion</Link></>
        )}
      </p>
    </div>
  )
}
