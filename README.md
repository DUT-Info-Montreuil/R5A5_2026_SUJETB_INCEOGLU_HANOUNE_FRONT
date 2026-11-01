# R5A5_2026_SUJETB_INCEOGLU_HANOUNE_FRONT

Front React + TypeScript de la plateforme de tournois inter-IUT (sujet B).
Back associé : [R5A5_2026_SUJETB_INCEOGLU_HANOUNE_BACK](https://github.com/DUT-Info-Montreuil/R5A5_2026_SUJETB_INCEOGLU_HANOUNE_BACK)
(installation, base de données, comptes de test : voir son [README](https://github.com/DUT-Info-Montreuil/R5A5_2026_SUJETB_INCEOGLU_HANOUNE_BACK#readme)).

## Prérequis

- Node **22.12 ou plus récent** et npm (fourni avec Node). Le back exige Node 22 et Vite 8 demande
  22.12+ sur cette branche : une seule version de Node suffit pour les deux projets (testé avec Node 26.8.2).
- Le back cloné à côté et lancé sur `http://localhost:3000`.

`npm audit` : 0 vulnérabilité après `npm audit fix` (Vite 8.3.5, source-map-js 1.2.2), sans `--force`
ni changement de version majeure.

## Installation et lancement

1. **Lancer le back d'abord** (voir son [README](https://github.com/DUT-Info-Montreuil/R5A5_2026_SUJETB_INCEOGLU_HANOUNE_BACK#readme)) :
   ```bash
   cd ../R5A5_2026_SUJETB_INCEOGLU_HANOUNE_BACK
   npm install
   cp .env.example .env   # valeurs par défaut utilisables telles quelles en local
   npm run dev            # http://localhost:3000, Swagger sur /api-docs
   ```
   Le `.env` doit exister : sans `JWT_SECRET` (`votre_secret_jwt` dans `.env.example`), le back refuse de démarrer.
   La base SQLite (`data/tournois.db`) est créée au premier démarrage avec le jeu de démonstration.
2. **Lancer le front** :
   ```bash
   npm install
   cp .env.example .env
   npm run dev            # http://localhost:5173
   ```

Le voyant « API en ligne » dans le header confirme que le front joint le back.

### Variables d'environnement (`.env`)

| Variable | Défaut | Rôle |
|---|---|---|
| `VITE_API_URL` | `/api` | Préfixe des appels API vus par le navigateur |
| `VITE_BACK_URL` | `http://localhost:3000` | Adresse du back pour le proxy Vite (voir limites) |

### Commandes

| Commande | Rôle |
|---|---|
| `npm run dev` | serveur de dev avec proxy vers le back |
| `npm run build` | vérification TypeScript + build de prod dans `dist/` |
| `npm run lint` | lint (oxlint) |

## Comptes de test

Recopiés du [README du back](https://github.com/DUT-Info-Montreuil/R5A5_2026_SUJETB_INCEOGLU_HANOUNE_BACK#comptes-de-test).
Jeu de démonstration stocké en SQLite côté back (`data/tournois.db`) : les données sont **conservées au
redémarrage** du back. Il n'est inséré que dans une base vide : pour repartir de zéro, arrêter le back,
supprimer `data/tournois.db` et le relancer.

Mot de passe commun : **`motdepasse`**. Email : `<identifiant>@iut.fr`.

| Compte | Situation | Permet de tester |
|---|---|---|
| `admin` | Administrateur : il organise, il ne joue pas | Créer, clore, lancer un tournoi ; saisir résultats et forfaits ; lire l'espace d'une équipe éliminée (B-01, B-03, B-04, B-13, B-15, B-18). Refus (403) de créer une équipe ou de demander à en rejoindre une |
| `zeki` | Capitaine de *Les Montreuillois* (tournoi 1) | Actions de capitaine : renommer, rôles, exclure, passer la main, traiter les demandes (B-09, B-10) |
| `hanoune` | Membre simple de *Les Montreuillois* | Refus des actions réservées au capitaine ; quitter l'équipe (B-06, B-10) |
| `lea` | Capitaine de *Team Paris 8* (tournoi 1) | Refus d'agir sur une équipe dont on n'est pas membre (B-10, B-16) |
| `sami` | Joueur sans équipe | Créer une équipe, demander à en rejoindre une, une seule équipe par tournoi (B-05, B-06, B-07) |
| `joueur6` à `joueur45` | 8 équipes de 5 du tournoi 2 (équipe 3 = joueur6 à joueur10, etc.) ; capitaines : joueur6, 11, 16, 21, 26, 31, 36, 41 | Messagerie d'équipe en temps réel, élimination puis fermeture de l'espace (B-16 à B-18) |
| `joueur46` à `joueur84` | 8 équipes du tournoi 3, rôles de jeu attribués : 7 équipes de 5 (équipe 11 = joueur46 à joueur50, etc.) et *Demo Hotel* (équipe 18) à 4 joueurs, joueur81 à joueur84 ; capitaines : joueur46, 51, 56, 61, 66, 71, 76, 81 | Avec `admin` : clore (arbre généré), lancer (*Demo Hotel* forfait au premier match), saisir les résultats (B-03, B-04, B-12 à B-15) |

## Écrans et droits

| Écran | Visiteur | Joueur | Capitaine | Admin |
|---|---|---|---|---|
| `/` Tournois | liste, recherche par nom ou jeu, état | idem | idem | idem |
| `/tournois/:id` Détail | état, équipes et membres, arbre | + créer une équipe, demander à rejoindre (inscriptions ouvertes) | idem | état, équipes, arbre + clôturer les inscriptions, lancer le tournoi, saisir vainqueur / forfait (en cours) ; ni création ni demande (403 du back) |
| `/equipes/:id` Équipe | membres et rôles | membre : espace d'échange, quitter l'équipe (inscriptions ouvertes) | + renommer, accepter / refuser les demandes, attribuer les rôles, nommer capitaine, exclure | espace d'échange en lecture seule |
| `/mes-equipes` | — | ses équipes, ses demandes (annuler si en attente) | + nombre de demandes en attente par équipe | vide : l'admin ne joue pas |
| `/admin` | — | — | — | créer un tournoi, liste des tournois à gérer |
| `/connexion`, `/inscription` | connexion, création de compte | — | — | — |

Règles affichées (les vrais contrôles sont faits par le back) : une équipe par joueur et par tournoi,
5 joueurs max par équipe, 8 équipes pour clôturer, composition figée après les inscriptions,
espace d'échange fermé aux membres d'une équipe éliminée, résultat de match non modifiable.

## Temps réel

- En dev, Vite relaie vers le back (`vite.config.ts`) : `/api/*` → `/api/*`, `/api/health` → `/health`,
  `/socket.io` (WebSocket compris). Même origine côté navigateur, donc pas de CORS à régler pour développer.
- Un seul client Socket.io (`shared/realtime/socket.ts`), authentifié par le JWT au handshake et reconnecté
  à chaque connexion / déconnexion.
- Rooms : `tournoi:<id>` (pages tournoi et équipe), `equipe:<id>` (espace d'échange).
- Événements écoutés : `tournoi:maj`, `tournoi:matchs`, `equipe:maj`, `equipe:exclu`, `message:nouveau`,
  `demande:nouvelle`, `demande:maj`. Ils mettent à jour ou invalident le cache TanStack Query, sans état parallèle.
- Socket.io ne fait que diffuser : toute écriture passe par l'API REST.

## Architecture

Découpage **par fonctionnalité** (feature-based).

```
src/
├── app/            # router, providers (QueryClient, Auth), TempsReel (socket ↔ session et cache)
├── features/
│   ├── auth/       # connexion / inscription, contexte utilisateur, gardes de route
│   ├── tournaments/# liste, détail, arbre, actions admin, temps réel des tournois
│   ├── equipes/    # création, demandes, page équipe, mes équipes, espace d'échange
│   ├── matchs/     # arbitrage (vainqueur, forfait)
│   ├── admin/      # écran d'administration
│   └── health/     # voyant de connexion au back
├── pages/          # pages génériques (404)
└── shared/
    ├── api/        # client HTTP unique (préfixe, token, erreurs) + stockage du token
    ├── realtime/   # client Socket.io unique, abonnement aux événements et aux rooms
    └── ui/         # layout et composants réutilisables
```

Chaque feature suit la même forme : `types.ts` (contrat avec le back) → `api.ts` (appels via `apiFetch`)
→ `hooks.ts` (TanStack Query) → composants. Contrat de référence : Swagger du back, voir `CONTRAT_API.md`.

Les gardes de route (`RequireAuth`, `RequireAdmin`) et les boutons masqués sont du confort d'affichage,
**pas de la sécurité** : les contrôles d'accès sont faits par le back.

## Limites connues

- **`VITE_BACK_URL` dans `.env` n'est pas pris en compte** : `vite.config.ts` lit `process.env`, que Vite
  ne remplit pas depuis `.env`. Pour un back ailleurs que sur `localhost:3000`, passer la variable au shell :
  `VITE_BACK_URL=http://... npm run dev`.
- Le proxy n'existe qu'en dev : un build servi ailleurs doit être servi derrière un reverse proxy vers le back
  (`/api`, `/socket.io`), et le voyant « API en ligne » échoue tant que le back n'expose pas `/api/health`.
- Événements diffusés pendant une coupure non rejoués par le back : le front relit les données à chaque
  entrée dans une room.
- Pas de correction d'un résultat de match ni d'édition / suppression de tournoi (non prévu par le back).
