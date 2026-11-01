// Stockage du JWT. Isolé ici pour pouvoir changer de stratégie
// (ex. cookie httpOnly côté back) sans toucher au reste du front.
const KEY = 'tournois.token'

export const tokenStorage = {
  get: (): string | null => localStorage.getItem(KEY),
  set: (token: string) => localStorage.setItem(KEY, token),
  clear: () => localStorage.removeItem(KEY),
  // localStorage est partagé par tous les onglets : prévient quand UN AUTRE onglet change ou efface le token
  // (connexion à un autre compte, déconnexion). Le navigateur n'émet pas 'storage' dans l'onglet qui écrit.
  // Renvoie de quoi se désabonner.
  onChange: (callback: () => void) => {
    const listener = (e: StorageEvent) => {
      // key null : localStorage.clear() dans un autre onglet (oldValue et newValue valent alors null).
      if (e.key === null || (e.key === KEY && e.oldValue !== e.newValue)) callback()
    }
    window.addEventListener('storage', listener)
    return () => window.removeEventListener('storage', listener)
  },
}
