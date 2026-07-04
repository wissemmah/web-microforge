# MicroForge — Documentation technique

## Choix techniques

| Décision | Choix | Justification |
|----------|-------|---------------|
| Backend | NestJS + TypeORM | RBAC natif (guards), validation class-validator, ORM migrations PostgreSQL |
| Frontend | React + Vite | Cohérence starter kit web, HMR rapide, proxy dev API |
| Auth | JWT Bearer | Stateless, adapté démo Docker école |
| Stockage livrables | Filesystem (`/app/storage`) + JSON manifest | Simple pour MVP ; DB pour petits contenus via `StorageType.DB` |
| Sync schema | TypeORM synchronize (dev/demo) | Migrations SQL en prod recommandées |

## Modèle de données

```
User ──< Job ──< Task ──< Submission ──< ReviewComment
  │       │       │              └──< ReviewDecision
  │       │       ├──< TaskDependency
  │       │       └──< TaskAssignment
  │       └──< Artifact
  ├──< Notification
  └──< AuditLog

SkillTag <>── User (user_skills)
Job ──< JobRequirement
```

## Parcours utilisateur

### Client
1. Créer un job (brouillon) avec exigences
2. Ajouter des micro-tâches + dépendances
3. Publier → En cours
4. Suivre l'avancement dashboard
5. Passer en revue quand tâches soumises
6. Assembler le livrable final (toutes tâches ACCEPTED)

### Worker
1. Parcourir tâches disponibles (respect dépendances)
2. Claim (48h par défaut)
3. Soumettre livrable
4. Corriger si REJECTED

### Reviewer
1. File de revue
2. Commenter, accepter (checklist obligatoire), refuser
3. Interdit : valider sa propre soumission

## Sécurité

| Contrôle | Détail |
|----------|--------|
| RBAC | `@Roles()` + `RolesGuard` global |
| Validation | `ValidationPipe` whitelist |
| XSS | React escape ; `escapeHtml()` backend |
| CSRF | API stateless JWT |
| Headers | Helmet + nginx |
| Mots de passe | bcrypt cost 12 |
| Audit | AuditLog actions critiques |
| Secrets | scan regex soumissions |

## Limites MVP

- Checklist qualité manuelle (pas CI simulée)
- Matching compétences : tags seedés seulement
- Livrable = manifest JSON
- Notifications : entité sans UI
