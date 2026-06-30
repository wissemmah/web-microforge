import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import {
  User,
  SkillTag,
  Job,
  JobRequirement,
  Task,
  TaskDependency,
  UserRole,
  JobStatus,
  TaskType,
  TaskStatus,
} from '../entities';

export async function seedDatabase(dataSource: DataSource): Promise<void> {
  const userRepo = dataSource.getRepository(User);
  const skillRepo = dataSource.getRepository(SkillTag);
  const jobRepo = dataSource.getRepository(Job);
  const reqRepo = dataSource.getRepository(JobRequirement);
  const taskRepo = dataSource.getRepository(Task);
  const depRepo = dataSource.getRepository(TaskDependency);

  const existing = await userRepo.findOne({ where: { email: 'admin@microforge.demo' } });
  if (existing) {
    console.log('Seed déjà appliqué — skip');
    return;
  }

  const hash = await bcrypt.hash('DemoPass123!', 12);

  const admin = userRepo.create({ email: 'admin@microforge.demo', passwordHash: hash, name: 'Admin Demo', role: UserRole.ADMIN });
  const client = userRepo.create({ email: 'client@microforge.demo', passwordHash: hash, name: 'Alice Client', role: UserRole.CLIENT });
  const worker1 = userRepo.create({ email: 'worker1@microforge.demo', passwordHash: hash, name: 'Bob Worker', role: UserRole.WORKER, reputationScore: 95 });
  const worker2 = userRepo.create({ email: 'worker2@microforge.demo', passwordHash: hash, name: 'Carol Worker', role: UserRole.WORKER, reputationScore: 88 });
  const reviewer = userRepo.create({ email: 'reviewer@microforge.demo', passwordHash: hash, name: 'Dave Reviewer', role: UserRole.REVIEWER });
  await userRepo.save([admin, client, worker1, worker2, reviewer]);

  const react = skillRepo.create({ name: 'React', slug: 'react' });
  const node = skillRepo.create({ name: 'Node.js', slug: 'nodejs' });
  const testing = skillRepo.create({ name: 'Testing', slug: 'testing' });
  await skillRepo.save([react, node, testing]);
  worker1.skills = [react, node];
  worker2.skills = [node, testing];
  await userRepo.save([worker1, worker2]);

  const job = jobRepo.create({
    clientId: client.id,
    title: 'API REST de gestion de tâches',
    description: 'Développer une API REST complète avec authentification JWT, CRUD jobs/tâches et tests unitaires.',
    stack: 'Node.js, NestJS, PostgreSQL',
    constraints: 'TypeScript strict, couverture tests > 70%',
    virtualBudget: 5000,
    deadline: new Date(Date.now() + 30 * 86400000),
    status: JobStatus.IN_PROGRESS,
  });
  await jobRepo.save(job);

  await reqRepo.save([
    reqRepo.create({ jobId: job.id, description: 'Authentification JWT avec RBAC', priority: 1 }),
    reqRepo.create({ jobId: job.id, description: 'CRUD jobs et micro-tâches', priority: 2 }),
    reqRepo.create({ jobId: job.id, description: 'Tests unitaires et e2e', priority: 3 }),
  ]);

  const t1 = taskRepo.create({
    jobId: job.id,
    title: 'Modèle de données et migrations',
    description: 'Créer les entités User, Job, Task avec TypeORM et migrations PostgreSQL.',
    type: TaskType.CODE,
    difficulty: 2,
    estimatedHours: 4,
    status: TaskStatus.ACCEPTED,
  });
  const t2 = taskRepo.create({
    jobId: job.id,
    title: 'Endpoints auth (register/login)',
    description: 'Implémenter register, login, JWT guard et RBAC par rôle.',
    type: TaskType.CODE,
    difficulty: 3,
    estimatedHours: 6,
    status: TaskStatus.AVAILABLE,
  });
  const t3 = taskRepo.create({
    jobId: job.id,
    title: 'Tests e2e auth et RBAC',
    description: 'Suite de tests supertest couvrant auth, RBAC et CSRF headers.',
    type: TaskType.TEST,
    difficulty: 2,
    estimatedHours: 3,
    status: TaskStatus.BLOCKED,
  });
  const t4 = taskRepo.create({
    jobId: job.id,
    title: 'README et procédure déploiement Docker',
    description: 'Documenter installation, variables env et docker-compose.',
    type: TaskType.DOC,
    difficulty: 1,
    estimatedHours: 2,
    status: TaskStatus.AVAILABLE,
  });
  await taskRepo.save([t1, t2, t3, t4]);

  await depRepo.save([
    depRepo.create({ taskId: t2.id, dependsOnTaskId: t1.id }),
    depRepo.create({ taskId: t3.id, dependsOnTaskId: t2.id }),
  ]);

  const draftJob = jobRepo.create({
    clientId: client.id,
    title: 'Script de migration CSV → JSON',
    description: 'Convertir un export CSV legacy en JSON structuré avec validation.',
    stack: 'Python 3.11',
    virtualBudget: 800,
    status: JobStatus.DRAFT,
  });
  await jobRepo.save(draftJob);

  console.log('Seed terminé — comptes demo @microforge.demo / DemoPass123!');
}
