# Contrat API

La référence, c'est le **back** (`R5A5_2026_SUJETB_INCEOGLU_HANOUNE_BACK`), pas ce fichier.

- Swagger : http://localhost:3000/api-docs (back lancé avec `npm run dev`)
- Routes : `src/routes/*.routes.ts` du repo back
- Types : `src/models/types.ts` du repo back

Les `types.ts` du front (`src/features/*/types.ts`) recopient ces formes à l'identique.
Si un champ ou une route manque, on le signale à l'équipe back au lieu de le simuler côté front.

## Rappels utiles

- Routes sous `/api` : `/api/auth`, `/api/tournois`, `/api/equipes`, `/api/matchs`.
  Seule exception : `GET /health` (le proxy Vite relaie `/api/health` vers `/health`).
  Ce relais n'existe qu'en `npm run dev` : hors du serveur de dev, l'indicateur « API en ligne »
  ne fonctionne pas tant que le back n'expose pas aussi `/api/health` (à demander au back).
- Auth : JWT dans `Authorization: Bearer <token>`.
  `POST /api/auth/register` renvoie l'utilisateur **sans token** : le front enchaîne un `POST /api/auth/login`.
- Erreurs : `{ "message": "..." }` en français, avec le code HTTP (400, 401, 403, 404, 409).
- Ids numériques, champs et valeurs en français (`nom`, `jeu`, `etat`, `inscriptions_ouvertes`, `administrateur`…).
