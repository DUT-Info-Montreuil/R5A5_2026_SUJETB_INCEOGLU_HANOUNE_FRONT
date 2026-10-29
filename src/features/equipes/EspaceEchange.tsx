import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/AuthContext'
import { useRoom } from '@/shared/realtime/socket'
import { ErrorMessage, Loader } from '@/shared/ui/Feedback'
import { btnPrimary, inputCls } from '@/shared/ui/styles'
import { useEnvoyerMessage, useMessages } from './hooks'
import { equipeKeys } from './keys'
import type { Equipe, Message, MessageDiffuse } from './types'

type Props = { equipe: Equipe; estMembre: boolean; estAdmin: boolean }

// Espace d'échange de l'équipe (B-16 à B-18). Affiché aux membres et à l'administrateur ;
// c'est le back qui décide vraiment (403 non membre, 409 équipe éliminée), on affiche ses refus.
export function EspaceEchange({ equipe, estMembre, estAdmin }: Props) {
  // B-18 : équipe éliminée, l'espace est fermé à ses membres. Inutile de demander au back.
  if (equipe.eliminee && !estAdmin) {
    return (
      <Cadre>
        <p className="text-sm text-slate-400">
          Votre équipe a été éliminée du tournoi : son espace d'échange est désormais fermé.
        </p>
      </Cadre>
    )
  }
  return <Fil equipe={equipe} peutEcrire={estMembre && !equipe.eliminee} />
}

function Cadre({ children }: { children: ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="mb-4 text-xl font-semibold">Espace d'échange</h2>
      {children}
    </section>
  )
}

function Fil({ equipe, peutEcrire }: { equipe: Equipe; peutEcrire: boolean }) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const messages = useMessages(equipe.id)
  // Les nouveaux messages arrivent par message:nouveau tant qu'on est dans la room equipe:<id>.
  // Une fois dans la room, on relit l'historique : un message posté avant (ou pendant une coupure) n'est pas rejoué.
  const refusRoom = useRoom({ type: 'equipe', equipeId: equipe.id }, () =>
    queryClient.invalidateQueries({ queryKey: equipeKeys.messages(equipe.id) }),
  )
  const liste = useRef<HTMLUListElement>(null)
  const nbMessages = messages.data?.length ?? 0

  // Toujours afficher le dernier message reçu.
  useEffect(() => {
    if (liste.current) liste.current.scrollTop = liste.current.scrollHeight
  }, [nbMessages])

  // L'historique REST ne donne que userId ; les messages reçus en direct portent aussi nomAuteur.
  const auteur = (m: Message | MessageDiffuse) =>
    equipe.membres.find((membre) => membre.userId === m.userId)?.nom ??
    ('nomAuteur' in m ? m.nomAuteur : null) ??
    `Joueur #${m.userId}`

  return (
    <Cadre>
      {!peutEcrire && (
        <p className="mb-3 text-sm text-slate-400">
          {equipe.eliminee
            ? "Équipe éliminée : l'espace est fermé à ses membres. Consultation en lecture seule (administrateur)."
            : 'Consultation en lecture seule (administrateur).'}
        </p>
      )}
      {refusRoom && (
        <p className="mb-3 text-sm text-amber-300">Messages en direct indisponibles : {refusRoom}</p>
      )}
      {messages.isLoading && <Loader />}
      {messages.isError && <ErrorMessage error={messages.error} />}
      {messages.data && (
        <ul ref={liste} className="mb-4 max-h-96 space-y-2 overflow-y-auto rounded-lg border border-slate-800 bg-slate-900 p-3">
          {messages.data.length === 0 && <li className="text-sm text-slate-400">Aucun message pour l'instant.</li>}
          {messages.data.map((m) => (
            <li key={m.id} className={`rounded-md px-3 py-2 text-sm ${m.userId === user?.id ? 'bg-indigo-500/10' : 'bg-slate-800/60'}`}>
              <div className="mb-0.5 flex items-baseline gap-2">
                <span className="font-medium">{auteur(m)}</span>
                <span className="text-xs text-slate-500">{new Date(m.createdAt).toLocaleString('fr-FR')}</span>
              </div>
              <p className="break-words whitespace-pre-wrap text-slate-200">{m.contenu}</p>
            </li>
          ))}
        </ul>
      )}
      {peutEcrire && messages.data && <EnvoiForm equipeId={equipe.id} />}
    </Cadre>
  )
}

function EnvoiForm({ equipeId }: { equipeId: number }) {
  const [contenu, setContenu] = useState('')
  const envoyer = useEnvoyerMessage(equipeId)

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    envoyer.mutate(contenu.trim(), { onSuccess: () => setContenu('') })
  }

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <div className="flex gap-2">
        <input
          className={inputCls}
          value={contenu}
          onChange={(e) => setContenu(e.target.value)}
          placeholder="Écrire à l'équipe…"
          aria-label="Message"
        />
        <button disabled={envoyer.isPending || !contenu.trim()} className={`${btnPrimary} shrink-0`}>
          Envoyer
        </button>
      </div>
      {envoyer.isError && <ErrorMessage error={envoyer.error} />}
    </form>
  )
}
