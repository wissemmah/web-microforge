import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { seedDatabase } from '../src/database/seed';

describe('Security & RBAC (e2e)', () => {
  let app: INestApplication;
  let clientToken: string;
  let workerToken: string;
  let reviewerToken: string;
  let adminToken: string;
  let jobId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();

    const ds = app.get(DataSource);
    await seedDatabase(ds);

    const login = async (email: string) => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email, password: 'DemoPass123!' });
      return res.body.token;
    };

    clientToken = await login('client@microforge.demo');
    workerToken = await login('worker1@microforge.demo');
    reviewerToken = await login('reviewer@microforge.demo');
    adminToken = await login('admin@microforge.demo');
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health — public', () => {
    return request(app.getHttpServer()).get('/api/health').expect(200);
  });

  it('GET /auth/me — requires JWT', () => {
    return request(app.getHttpServer()).get('/api/auth/me').expect(401);
  });

  it('Worker cannot create jobs (RBAC 403)', () => {
    return request(app.getHttpServer())
      .post('/api/jobs')
      .set('Authorization', `Bearer ${workerToken}`)
      .send({ title: 'X', description: 'Y', stack: 'Z' })
      .expect(403);
  });

  it('Client can create job', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/jobs')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        title: 'Test RBAC Job',
        description: 'Job e2e',
        stack: 'Node',
        requirements: [{ description: 'Auth' }],
      })
      .expect(201);
    jobId = res.body.id;
    expect(res.body.status).toBe('DRAFT');
  });

  it('Reject invalid input (validation)', () => {
    return request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email: 'bad', password: '123', name: '' })
      .expect(400);
  });

  it('Worker can claim available task', async () => {
    await request(app.getHttpServer())
      .patch(`/api/jobs/${jobId}/status`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ status: 'PUBLISHED' })
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/api/jobs/${jobId}/status`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ status: 'IN_PROGRESS' })
      .expect(200);

    const taskRes = await request(app.getHttpServer())
      .post(`/api/jobs/${jobId}/tasks`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ title: 'Task e2e', description: 'Desc', type: 'CODE' })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/api/tasks/${taskRes.body.id}/claim`)
      .set('Authorization', `Bearer ${workerToken}`)
      .send({ claimHours: 24 })
      .expect(201);
  });

  it('Reviewer cannot access admin endpoints', () => {
    return request(app.getHttpServer())
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${reviewerToken}`)
      .expect(403);
  });

  it('Admin can access audit logs', () => {
    return request(app.getHttpServer())
      .get('/api/admin/audit-logs')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
  });

  it('Rejects submission with secrets (regex scan)', async () => {
    const jobs = await request(app.getHttpServer())
      .get('/api/jobs')
      .set('Authorization', `Bearer ${clientToken}`);
    const job = jobs.body.find((j: { title: string }) => j.title === 'Test RBAC Job');
    const task = job?.tasks?.find((t: { title: string }) => t.title === 'Task e2e');
    if (!task) return;

    await request(app.getHttpServer())
      .post(`/api/tasks/${task.id}/submit`)
      .set('Authorization', `Bearer ${workerToken}`)
      .send({ content: 'password="HardcodedDemoSecret99"' })
      .expect(400);
  });

  it('Helmet security headers present', async () => {
    const res = await request(app.getHttpServer()).get('/api/health');
    expect(res.headers['x-content-type-options']).toBeDefined();
  });
});
