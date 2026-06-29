import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Job } from '../../entities/job.entity';
import { Task } from '../../entities/task.entity';
import { Artifact } from '../../entities/artifact.entity';
import { User } from '../../entities/user.entity';
import { JobStatus, StorageType, TaskStatus, TaskType, UserRole } from '../../entities/enums';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class AssemblyService {
  private readonly storageRoot = process.env.ARTIFACT_STORAGE_PATH || '/app/storage';

  constructor(
    @InjectRepository(Job) private readonly jobRepo: Repository<Job>,
    @InjectRepository(Task) private readonly taskRepo: Repository<Task>,
    @InjectRepository(Artifact) private readonly artifactRepo: Repository<Artifact>,
    private readonly auditService: AuditService,
  ) {}

  async assemble(jobId: string, user: User): Promise<{ artifact: Artifact; downloadUrl: string }> {
    if (![UserRole.CLIENT, UserRole.ADMIN].includes(user.role)) {
      throw new ForbiddenException('Assemblage réservé au client');
    }

    const job = await this.jobRepo.findOne({
      where: { id: jobId },
      relations: ['tasks', 'tasks.submissions', 'client'],
    });
    if (!job) throw new NotFoundException('Job introuvable');
    if (user.role === UserRole.CLIENT && job.clientId !== user.id) {
      throw new ForbiddenException('Accès refusé');
    }

    const acceptedTasks = job.tasks.filter((t) => t.status === TaskStatus.ACCEPTED && t.type !== TaskType.INTEGRATION);
    const pending = job.tasks.filter(
      (t) => t.type !== TaskType.INTEGRATION && t.status !== TaskStatus.ACCEPTED,
    );
    if (pending.length > 0) {
      throw new BadRequestException(`${pending.length} tâche(s) non validée(s) — assemblage impossible`);
    }

    const manifest = {
      job: { id: job.id, title: job.title, stack: job.stack },
      assembledAt: new Date().toISOString(),
      tasks: acceptedTasks.map((t) => ({
        id: t.id,
        title: t.title,
        type: t.type,
        latestSubmission: t.submissions?.sort((a, b) => b.version - a.version)[0],
      })),
      runInstructions: [
        '1. Cloner ou extraire l\'archive',
        '2. Installer les dépendances selon la stack indiquée',
        '3. Configurer les variables d\'environnement (.env.example)',
        '4. Lancer les migrations puis démarrer l\'application',
      ],
    };

    const dir = path.join(this.storageRoot, 'jobs', jobId);
    fs.mkdirSync(dir, { recursive: true });
    const filePath = path.join(dir, `deliverable-${Date.now()}.json`);
    fs.writeFileSync(filePath, JSON.stringify(manifest, null, 2));

    const artifact = this.artifactRepo.create({
      jobId: job.id,
      taskId: null,
      name: `Livrable — ${job.title}`,
      storageType: StorageType.FILE,
      contentOrPath: filePath,
    });
    await this.artifactRepo.save(artifact);

    job.status = JobStatus.COMPLETED;
    await this.jobRepo.save(job);
    await this.auditService.log(user.id, 'JOB_ASSEMBLED', 'Job', job.id, { artifactId: artifact.id });

    return {
      artifact,
      downloadUrl: `/api/artifacts/${artifact.id}/download`,
    };
  }

  async getArtifacts(jobId: string, user: User): Promise<Artifact[]> {
    const job = await this.jobRepo.findOne({ where: { id: jobId } });
    if (!job) throw new NotFoundException('Job introuvable');
    if (user.role === UserRole.CLIENT && job.clientId !== user.id) {
      throw new ForbiddenException('Accès refusé');
    }
    return this.artifactRepo.find({ where: { jobId }, order: { createdAt: 'DESC' } });
  }

  async download(artifactId: string, user: User): Promise<{ path: string; name: string }> {
    const artifact = await this.artifactRepo.findOne({
      where: { id: artifactId },
      relations: ['job'],
    });
    if (!artifact) throw new NotFoundException('Artefact introuvable');
    if (user.role === UserRole.CLIENT && artifact.job.clientId !== user.id) {
      throw new ForbiddenException('Accès refusé');
    }
    return { path: artifact.contentOrPath, name: artifact.name };
  }
}
