// Client Socket.io UNIQUE, partagé par toute l'application (voir docs/temps-reel.md du back).
// Socket.io ne fait que diffuser : toute écriture passe par l'API REST (apiFetch).
// Les événements reçus mettent à jour le cache TanStack Query, jamais un état à part.
import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'

// Même origine que le front : en dev, Vite relaie /socket.io vers le back (vite.config.ts).
export const socket = io({ autoConnect: false })

// (Re)connecte avec le JWT de la session, ou en visiteur sans token.
// Le back ne lit le token qu'au handshake : changer de compte impose une nouvelle connexion.
export function connecterSocket(token: string | null) {
  socket.auth = token ? { token } : {}
  socket.disconnect().connect()
}

// Écoute un événement serveur tant que le composant est monté.
// Le handler peut changer à chaque rendu : on garde toujours le dernier sans se réabonner.
export function useSocketEvent<T>(event: string, handler: (payload: T) => void) {
  const handlerRef = useRef(handler)
  useEffect(() => {
    handlerRef.current = handler
  })
  useEffect(() => {
    const listener = (payload: T) => handlerRef.current(payload)
    socket.on(event, listener)
    return () => {
      socket.off(event, listener)
    }
  }, [event])
}

type Ack = { ok: true } | { ok: false; message: string }
type Room = { type: 'tournoi'; tournoiId: number } | { type: 'equipe'; equipeId: number }

// Rooms rejointes, avec les composants qui les suivent. Une room n'est quittée que lorsque
// plus aucun composant ne la suit (deux composants sur la même room ne se gênent pas).
type RoomSuivie = { type: Room['type']; payload: object; abonnes: Set<(ack: Ack) => void> }
const rooms = new Map<string, RoomSuivie>()

function rejoindre(room: RoomSuivie, essai = 1) {
  socket
    .timeout(5000)
    .emitWithAck(`${room.type}:rejoindre`, room.payload)
    .then((ack: Ack) => room.abonnes.forEach((abonne) => abonne(ack)))
    .catch(() => {
      // Pas de réponse à temps : une nouvelle tentative, puis on le signale.
      if (!socket.connected || !room.abonnes.size) return
      if (essai < 2) rejoindre(room, essai + 1)
      else room.abonnes.forEach((abonne) => abonne({ ok: false, message: 'le serveur ne répond pas' }))
    })
}

// Le back oublie les rooms tournoi: et equipe: d'une socket déconnectée : on les rejoint à chaque connexion.
socket.on('connect', () => rooms.forEach((room) => rejoindre(room)))

// Suit une room tant que le composant est monté. Renvoie le refus du back (ex. « Acces refuse »), ou null.
// onRejoint est appelé à chaque entrée acceptée : ce qui a été diffusé avant (chargement initial,
// coupure réseau) n'est pas rejoué par le back, c'est à l'appelant de relire ses données.
export function useRoom(room: Room | null, onRejoint?: () => void) {
  const [refus, setRefus] = useState<string | null>(null)
  const onRejointRef = useRef(onRejoint)
  useEffect(() => {
    onRejointRef.current = onRejoint
  })
  const type = room?.type
  const id = room ? (room.type === 'tournoi' ? room.tournoiId : room.equipeId) : null

  useEffect(() => {
    if (!type || id === null) return
    const cle = `${type}:${id}`
    let suivie = rooms.get(cle)
    const nouvelle = !suivie
    if (!suivie) {
      suivie = { type, payload: type === 'tournoi' ? { tournoiId: id } : { equipeId: id }, abonnes: new Set() }
      rooms.set(cle, suivie)
    }
    const abonne = (ack: Ack) => {
      setRefus(ack.ok ? null : ack.message)
      if (ack.ok) onRejointRef.current?.()
    }
    suivie.abonnes.add(abonne)
    if (nouvelle && socket.connected) rejoindre(suivie)

    return () => {
      suivie.abonnes.delete(abonne)
      if (suivie.abonnes.size === 0) {
        rooms.delete(cle)
        if (socket.connected) socket.emit(`${type}:quitter`, suivie.payload)
      }
      setRefus(null)
    }
  }, [type, id])

  return refus
}
