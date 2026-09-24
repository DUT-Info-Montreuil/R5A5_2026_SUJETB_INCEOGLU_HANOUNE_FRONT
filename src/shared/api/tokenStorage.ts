// Stockage du JWT. Isolé ici pour pouvoir changer de stratégie
// (ex. cookie httpOnly côté back) sans toucher au reste du front.
const KEY = 'tournois.token'

export const tokenStorage = {
  get: (): string | null => localStorage.getItem(KEY),
  set: (token: string) => localStorage.setItem(KEY, token),
  clear: () => localStorage.removeItem(KEY),
}
