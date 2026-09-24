# Contrat API attendu par le front (à valider avec le back)

Le back n'expose pour l'instant que `GET /health`. Voici ce que le front appelle déjà.
Si le back choisit d'autres noms, il suffit de modifier les fichiers `api.ts` / `types.ts` correspondants.

Auth : JWT dans le header `Authorization: Bearer <token>`.
Erreurs : `{ "message": "..." }` avec le bon code HTTP (401, 403, 404, 409…).

| Méthode | Route | Corps | Réponse |
|---|---|---|---|
| GET | `/health` | — | `{ status: "ok" }` ✅ existe |
| POST | `/auth/register` | `{ pseudo, email, password }` | `{ token, user }` |
| POST | `/auth/login` | `{ email, password }` | `{ token, user }` |
| GET | `/auth/me` | — (token) | `user` |
| GET | `/tournaments?search=` | — | `Tournament[]` (public, B-02) |
| GET | `/tournaments/:id` | — | `Tournament` (public) |

```ts
type User = { id: string; pseudo: string; email: string; role: 'ADMIN' | 'PLAYER' }

type Tournament = {
  id: string
  name: string
  game: string
  status: 'REGISTRATION_OPEN' | 'REGISTRATION_CLOSED' | 'IN_PROGRESS' | 'FINISHED'
  teamCount: number
  createdAt: string // ISO
}
```
