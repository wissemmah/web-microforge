import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, In, IsNull } from 'typeorm';
import { Task } from '../../entities/task.entity';
import { TaskAssignment } from '../../entities/task-assignment.entity';
import { TaskDependency } from '../../entities/task-dependency.entity';
import { Submission } from '../../entities/submission.entity';
import { User } from '../../entities/user.entity';
import { TaskStatus, UserRole, JobStatus } from '../../entities/enums';
import { ClaimTaskDto, SubmitTaskDto } from './dto/task.dto';
import { AuditService } from '../audit/audit.service';
import { scanForSecrets } from '../../common/utils/security.util';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task) private readonly taskRepo: Repository<Task>,
    @InjectRepository(TaskAssignment) private readonly assignRepo: Repository<TaskAssignment>,
    @InjectRepository(TaskDependency) private readonly depRepo: Repository<TaskDependency>,
    @InjectRepository(Submission) private readonly submissionRepo: Repository<Submission>,
    private readonly auditService: AuditService,
  ) {}

  async findAvailable(user: User): Promise<Task[]> {
    await this.releaseExpiredClaims();
    return this.taskRepo.find({
      where: { status: In([TaskStatus.AVAILABLE, TaskStatus.REJECTED]) },
      relations: ['job', 'dependencies', 'dependencies.dependsOnTask'],
      order: { createdAt: 'DESC' },
    });
  }

  async findMyTasks(user: User): Promise<Task[]> {
    await this.releaseExpiredClaims();
    return this.taskRepo.find({
      where: { assignedWorkerId: user.id },
      relations: ['job', 'submissions'],
      order: { updatedAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.taskRepo.findOne({
      where: { id },
      relations: ['job', 'dependencies', 'dependencies.dependsOnTask', 'submissions', 'assignments'],
    });
    if (!task) throw new NotFoundException('Tâche introuvable');
    return task;
  }

  async claim(id: string, dto: ClaimTaskDto, user: User): Promise<Task> {
    if (![UserRole.WORKER, UserRole.ADMIN].includes(user.role)) {
      throw new ForbiddenException('Seuls les workers peuvent claim une tâche');
    }

    await this.releaseExpiredClaims();
    const task = await this.findOne(id);

    if (![TaskStatus.AVAILABLE, TaskStatus.REJECTED].includes(task.status)) {
      throw new BadRequestException('Tâche non disponible');
    }
    if (task.job.status === JobStatus.DRAFT) {
      throw new BadRequestException('Job non publié');
    }

    await this.assertDependenciesMet(task);

    const hours = dto.claimHours ?? 48;
    const expiresAt = new Date(Date.now() + hours * 3600 * 1000);

    task.status = TaskStatus.CLAIMED;
    task.assignedWorkerId = user.id;
    task.claimExpiresAt = expiresAt;
    await this.taskRepo.save(task);

    const assignment = this.assignRepo.create({
      taskId: task.id,
      workerId: user.id,
      claimedAt: new Date(),
      expiresAt,
    });
    await this.assignRepo.save(assignment);
    await this.auditService.log(user.id, 'TASK_CLAIMED', 'Task', task.id, { expiresAt });

    return this.findOne(id);
  }

  async submit(id: string, dto: SubmitTaskDto, user: User): Promise<Submission> {
    const task = await this.findOne(id);
    if (task.assignedWorkerId !== user.id) {
      throw new ForbiddenException('Vous n\'êtes pas assigné à cette tâche');
    }
    if (task.status !== TaskStatus.CLAIMED && task.status !== TaskStatus.REJECTED) {
      throw new BadRequestException('Statut incompatible avec soumission');
    }

    const textToScan = [dto.content, dto.instructions, dto.gitUrl].filter(Boolean).join('\n');
    const scan = scanForSecrets(textToScan);
    if (!scan.passed) {
      throw new BadRequestException('Secrets détectés dans la soumission — corrigez avant envoi');
    }

    const lastVersion = task.submissions?.length
      ? Math.max(...task.submissions.map((s) => s.version))
      : 0;

    const submission = this.submissionRepo.create({
      taskId: task.id,
      workerId: user.id,
      version: lastVersion + 1,
      content: dto.content ?? null,
      gitUrl: dto.gitUrl ?? null,
      instructions: dto.instructions ?? null,
      checklistJson: dto.checklist ?? { lint: false, tests: false, readme: false },
      secretScanPassed: true,
    });
    await this.submissionRepo.save(submission);

    task.status = TaskStatus.SUBMITTED;
    await this.taskRepo.save(task);
    await this.auditService.log(user.id, 'TASK_SUBMITTED', 'Submission', submission.id, {
      taskId: task.id,
      version: submission.version,
    });

    return submission;
  }

  async releaseExpiredClaims(): Promise<number> {
    const now = new Date();
    const expired = await this.taskRepo.find({
      where: {
        status: TaskStatus.CLAIMED,
        claimExpiresAt: LessThan(now),
      },
    });

    for (const task of expired) {
      task.status = TaskStatus.AVAILABLE;
      task.assignedWorkerId = null;
      task.claimExpiresAt = null;
      await this.taskRepo.save(task);

      const assignment = await this.assignRepo.findOne({
        where: { taskId: task.id, releasedAt: IsNull() },
        order: { claimedAt: 'DESC' },
      });
      if (assignment) {
        assignment.releasedAt = now;
        await this.assignRepo.save(assignment);
      }
      await this.auditService.log(null, 'TASK_CLAIM_EXPIRED', 'Task', task.id);
    }
    return expired.length;
  }

  private async assertDependenciesMet(task: Task): Promise<void> {
    const deps = await this.depRepo.find({
      where: { taskId: task.id },
      relations: ['dependsOnTask'],
    });
    for (const dep of deps) {
      const parent = dep.dependsOnTask ?? (await this.taskRepo.findOne({ where: { id: dep.dependsOnTaskId } }));
      if (!parent || parent.status !== TaskStatus.ACCEPTED) {
        throw new BadRequestException('Dépendances non satisfaites');
      }
    }
    if (task.status === TaskStatus.BLOCKED && deps.every((d) => d.dependsOnTask?.status === TaskStatus.ACCEPTED)) {
      task.status = TaskStatus.AVAILABLE;
      await this.taskRepo.save(task);
    }
  }
}
