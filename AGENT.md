## Projet
- **Nom**: web-microforge
- **Type**: app web SaaS multi-rôles
- **Stack**: React + Vite + Tailwind (frontend) · NestJS + TypeORM + PostgreSQL (backend)

## Description
Plateforme de crowdsourcing de développement logiciel : décomposition de besoins en micro-tâches, claim worker, revue qualité, assemblage livrable.

## Rôles
- **CLIENT** : créer/gérer jobs, publier, assembler livrable
- **WORKER** : claim tâches, soumettre livrables
- **REVIEWER** : revue, commentaires, acceptation/refus
- **ADMIN** : utilisateurs, audit logs, accès complet

## Commandes

### Installation Docker (recommandé)
```bash
chmod +x install.sh && ./install.sh
```
→ Frontend http://localhost:8080 · API http://localhost:3000/api/health

### Dev local
```bash
cd backend && npm install && npm run start:dev
cd frontend && npm install && npm run dev
```

### Quality gates
```bash
cd backend && npm run lint && npm run build && npm run test:e2e
cd frontend && npm run build
docker compose build
```

## Comptes de test
`client@` / `worker1@` / `reviewer@` / `admin@microforge.demo` — mot de passe `DemoPass123!`

## Sécurité
- JWT Bearer + RBAC guards globaux
- Validation class-validator (whitelist)
- Helmet + nginx security headers
- bcrypt passwords (cost 12)
- Scan regex secrets à la soumission
- AuditLog (créations, validations, refus)

## Fichiers clés
- `docker-compose.yml` — stack complète
- `backend/src/entities/` — modèle de données
- `backend/test/security.e2e-spec.ts` — tests RBAC/sécurité
- `frontend/src/lib/rbac.js` — contrôles UI par rôle
- `TECHNICAL.md` — architecture détaillée

## Conventions
- API prefix `/api`
- Statuts job : DRAFT → PUBLISHED → IN_PROGRESS → IN_REVIEW → COMPLETED
- 1 worker max par tâche ; dépendances bloquantes jusqu'à ACCEPTED
