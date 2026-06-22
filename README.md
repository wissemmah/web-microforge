# MicroForge

Plateforme SaaS de **crowdsourcing de développement logiciel** — décomposition de besoins en micro-tâches, revue qualité, assemblage de livrables.

## Stack

| Couche | Technologie |
|--------|-------------|
| Frontend | React 18 + Vite + Tailwind + React Router |
| Backend | NestJS 10 + TypeORM |
| Base de données | PostgreSQL 16 |
| Déploiement | Docker Compose |

## Démarrage rapide

```bash
chmod +x install.sh
./install.sh
```

Ouvrir **http://localhost:8080**

### Comptes de test

| Email | Rôle | Mot de passe |
|-------|------|--------------|
| `client@microforge.demo` | Client | `DemoPass123!` |
| `worker1@microforge.demo` | Worker | `DemoPass123!` |
| `reviewer@microforge.demo` | Reviewer | `DemoPass123!` |
| `admin@microforge.demo` | Admin | `DemoPass123!` |

## Développement local (sans Docker)

Prérequis : Node.js 20+, PostgreSQL 16.

```bash
# Backend
cd backend && npm install
cp ../.env.example .env   # ajuster DB_HOST=localhost
npm run start:dev

# Frontend (autre terminal)
cd frontend && npm install && npm run dev
```

## Commandes

```bash
docker compose up -d --build    # Démarrer
docker compose down             # Arrêter
docker compose logs -f backend  # Logs API

cd backend && npm run test:e2e  # Tests sécurité RBAC
cd frontend && npm run build    # Build production
```

## Fonctionnalités MVP

- **Jobs** : création, statuts (Brouillon → Publié → En cours → En revue → Terminé)
- **Micro-tâches** : types code/test/doc/bugfix, dépendances, claim avec expiration
- **Revue** : commentaires, acceptation/refus, checklist qualité (lint/tests/readme)
- **Assemblage** : export JSON manifest + procédure d'exécution
- **Sécurité** : JWT + RBAC, validation inputs, Helmet, scan secrets regex, audit log

Voir [TECHNICAL.md](./TECHNICAL.md) pour le modèle de données et les parcours utilisateur.
