# Front — plateforme de tournois (R5A5, sujet B)

React 19 + TypeScript, Vite, React Router, TanStack Query, Tailwind.
Back associé : R5A5_2026_SUJETB_INCEOGLU_HANOUNE_BACK (Express, http://localhost:3000).

## Commandes
- `npm run dev` : http://localhost:5173 (le back doit tourner)
- `npm run build` : vérification TypeScript + build. Doit passer avant toute proposition de commit.
- `npm run lint` : oxlint.

## Le contrat, c'est le back
- La source de vérité est le Swagger du back : http://localhost:3000/api-docs
  (et ses routes dans `src/routes/*.routes.ts` du repo back).
- Le back parle FRANÇAIS : routes `/api/tournois`, `/api/equipes`, `/api/matchs`, `/api/auth` ;
  champs `nom`, `jeu`, `etat`, `capitaineId`, `membres`, `roleJeu`… ; états
  `inscriptions_ouvertes | inscriptions_closes | en_cours | termine` ; rôles `joueur | administrateur` ; ids numériques.
- Les `types.ts` du front recopient exactement ces formes. On n'invente pas de champ :
  s'il manque quelque chose au back, on le signale au lieu de le simuler côté front.
- Erreurs du back : `{ message }` + code HTTP (401, 403, 404, 409). Les afficher à l'utilisateur, en français.

## Structure (par fonctionnalité)
- `src/features/<feature>/` : `types.ts` → `api.ts` (appels via `apiFetch`) → `hooks.ts` (TanStack Query) → composants.
- `src/shared/api/client.ts` : SEUL point d'appel HTTP (préfixe, token, erreurs). Ne pas appeler `fetch` ailleurs.
- `src/shared/ui/` : composants réutilisables. `src/app/` : router et providers.
- Temps réel : un seul client Socket.io partagé (dans `shared/`), authentifié avec le JWT ;
  les événements reçus invalident ou mettent à jour le cache TanStack Query, pas d'état parallèle.

## Conventions
- Interface en français. Code et commentaires en français, comme l'existant.
- Les gardes de route (`RequireAuth`, `RequireAdmin`) et les boutons masqués sont du confort :
  la sécurité est faite par le back. Ne jamais compter sur le front pour interdire une action.
- Chaque écran gère ses états : chargement, erreur, vide.
- Simple et lisible avant joli : UX/UI ne vaut qu'un point, le périmètre fonctionnel est un coefficient de la note.

## Git
- Flux : branche `feat/...` depuis `dev` → PR → `dev`.
- Ne JAMAIS commit ni push sans accord explicite. À la fin d'une tâche : `git diff --stat`, résumé, puis attendre.
- Messages de commit en français, format `type: description`.
- N'ajouter AUCUNE ligne Co-Authored-By ni mention de Claude dans les commits ou les PR.
