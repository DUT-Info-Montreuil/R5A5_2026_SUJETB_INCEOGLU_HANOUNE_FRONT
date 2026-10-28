# R5A5_2026_SUJETB_INCEOGLU_HANOUNE_FRONT

Front React + TypeScript de la plateforme de tournois (sujet B).
Back associé : [R5A5_2026_SUJETB_INCEOGLU_HANOUNE_BACK](https://github.com/DUT-Info-Montreuil/R5A5_2026_SUJETB_INCEOGLU_HANOUNE_BACK)

## Lancer le projet

Prérequis : Node 20+ et le back lancé sur `http://localhost:3000`.

```bash
npm install
cp .env.example .env
npm run dev          # http://localhost:5173
```

En dev, le front appelle `/api/...` et Vite relaie vers le back (`/api/health` → `localhost:3000/health`).
Pas besoin de CORS côté back pour développer. Le voyant « API en ligne » dans le header confirme la connexion.

| Commande | Rôle |
|---|---|
| `npm run dev` | serveur de dev |
| `npm run build` | vérification TypeScript + build de prod dans `dist/` |
| `npm run lint` | lint (oxlint) |

## Stack

- **Vite + React 19 + TypeScript** (imposé : React + TS)
- **React Router** : routage et gardes de route
- **TanStack Query** : appels API, cache, états chargement/erreur
- **Tailwind CSS** : style

## Architecture

Découpage **par fonctionnalité** (feature-based) : tout ce qui concerne les tournois est dans `features/tournaments`, etc.

```
src/
├── app/            # assemblage : router, providers (QueryClient, Auth)
├── features/
│   ├── auth/       # connexion, contexte utilisateur, gardes de route
│   ├── tournaments/# liste, détail, types, appels API, hooks
│   └── health/     # voyant de connexion au back
├── pages/          # pages génériques (404, placeholders)
└── shared/
    ├── api/        # client HTTP unique (token, erreurs) + stockage du token
    └── ui/         # layout et composants réutilisables
```

Chaque feature suit la même forme : `types.ts` (contrat avec le back) → `api.ts` (appels HTTP) → `hooks.ts` (TanStack Query) → composants.

Les gardes de route (`RequireAuth`, `RequireAdmin`) sont du confort d'affichage, **pas de la sécurité** : les contrôles d'accès sont faits par le back.
