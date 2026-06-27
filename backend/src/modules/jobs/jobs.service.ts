import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from '../../entities/job.entity';
import { JobRequirement } from '../../entities/job-requirement.entity';
import { Task } from '../../entities/task.entity';
import { TaskDependency } from '../../entities/task-dependency.entity';
import { User } from '../../entities/user.entity';
import { JobStatus, TaskStatus, TaskType, UserRole } from '../../entities/enums';
import { CreateJobDto, UpdateJobStatusDto, CreateTaskDto } from './dto/job.dto';
import { AuditService } from '../audit/audit.service';

const STATUS_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  [JobStatus.DRAFT]: [JobStatus.PUBLISHED],
  [JobStatus.PUBLISHED]: [JobStatus.IN_PROGRESS, JobStatus.DRAFT],
  [JobStatus.IN_PROGRESS]: [JobStatus.IN_REVIEW],
  [JobStatus.IN_REVIEW]: [JobStatus.COMPLETED, JobStatus.IN_PROGRESS],
  [JobStatus.COMPLETED]: [],
};

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job) private readonly jobRepo: Repository<Job>,
    @InjectRepository(JobRequirement) private readonly reqRepo: Repository<JobRequirement>,
    @InjectRepository(Task) private readonly taskRepo: Repository<Task>,
    @InjectRepository(TaskDependency) private readonly depRepo: Repository<TaskDependency>,
    private readonly auditService: AuditService,
  ) {}

  async findAll(user: User): Promise<Job[]> {
    const qb = this.jobRepo
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.requirements', 'requirements')
      .leftJoinAndSelect('job.tasks', 'tasks')
      .leftJoinAndSelect('job.client', 'client')
      .orderBy('job.created_at', 'DESC');

    if (user.role === UserRole.CLIENT) {
      qb.where('job.client_id = :clientId', { clientId: user.id });
    } else if (user.role !== UserRole.ADMIN) {
      qb.where('job.status != :draft', { draft: JobStatus.DRAFT });
    }
    return qb.getMany();
  }

  async findOne(id: string, user: User): Promise<Job> {
    const job = await this.jobRepo.findOne({
      where: { id },
      relations: ['requirements', 'tasks', 'tasks.dependencies', 'client'],
    });
    if (!job) throw new NotFoundException('Job introuvable');
    this.assertJobAccess(job, user);
    return job;
  }

  async create(dto: CreateJobDto, user: User): Promise<Job> {
    if (![UserRole.CLIENT, UserRole.ADMIN].includes(user.role)) {
      throw new ForbiddenException('Seuls les clients peuvent créer des jobs');
    }

    const job = this.jobRepo.create({
      clientId: user.id,
      title: dto.title,
      description: dto.description,
      stack: dto.stack,
      constraints: dto.constraints ?? null,
      virtualBudget: dto.virtualBudget ?? 0,
      deadline: dto.deadline ? new Date(dto.deadline) : null,
      status: JobStatus.DRAFT,
    });
    await this.jobRepo.save(job);

    if (dto.requirements?.length) {
      const reqs = dto.requirements.map((r) =>
        this.reqRepo.create({ jobId: job.id, description: r.description, priority: r.priority ?? 1 }),
      );
      await this.reqRepo.save(reqs);
    }

    await this.auditService.log(user.id, 'JOB_CREATED', 'Job', job.id, { title: job.title });
    return this.findOne(job.id, user);
  }

  async updateStatus(id: string, dto: UpdateJobStatusDto, user: User): Promise<Job> {
    const job = await this.findOne(id, user);
    if (user.role === UserRole.CLIENT && job.clientId !== user.id) {
      throw new ForbiddenException('Accès refusé');
    }
    if (![UserRole.CLIENT, UserRole.ADMIN].includes(user.role)) {
      throw new ForbiddenException('Transition de statut réservée au client');
    }

    const allowed = STATUS_TRANSITIONS[job.status];
    if (!allowed.includes(dto.status)) {
      throw new BadRequestException(`Transition ${job.status} → ${dto.status} interdite`);
    }

    job.status = dto.status;
    await this.jobRepo.save(job);
    await this.auditService.log(user.id, 'JOB_STATUS_CHANGED', 'Job', job.id, { status: dto.status });
    return job;
  }

  async addTask(jobId: string, dto: CreateTaskDto, user: User): Promise<Task> {
    const job = await this.findOne(jobId, user);
    if (user.role === UserRole.CLIENT && job.clientId !== user.id) {
      throw new ForbiddenException('Accès refusé');
    }
    if (![UserRole.CLIENT, UserRole.ADMIN].includes(user.role)) {
      throw new ForbiddenException('Seuls les clients peuvent ajouter des tâches');
    }

    const task = this.taskRepo.create({
      jobId: job.id,
      title: dto.title,
      description: dto.description,
      type: dto.type as TaskType,
      difficulty: dto.difficulty ?? 1,
      estimatedHours: dto.estimatedHours ?? 1,
      status: dto.dependsOnTaskIds?.length ? TaskStatus.BLOCKED : TaskStatus.AVAILABLE,
    });
    await this.taskRepo.save(task);

    if (dto.dependsOnTaskIds?.length) {
      for (const depId of dto.dependsOnTaskIds) {
        const dep = this.depRepo.create({ taskId: task.id, dependsOnTaskId: depId });
        await this.depRepo.save(dep);
      }
    }

    await this.auditService.log(user.id, 'TASK_CREATED', 'Task', task.id, { jobId });
    return this.taskRepo.findOneOrFail({
      where: { id: task.id },
      relations: ['dependencies'],
    });
  }

  private assertJobAccess(job: Job, user: User): void {
    if (user.role === UserRole.ADMIN) return;
    if (user.role === UserRole.CLIENT && job.clientId !== user.id) {
      throw new ForbiddenException('Accès refusé à ce job');
    }
    if (user.role !== UserRole.CLIENT && job.status === JobStatus.DRAFT) {
      throw new ForbiddenException('Job non publié');
    }
  }
}
