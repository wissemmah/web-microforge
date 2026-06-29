import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Submission } from '../../entities/submission.entity';
import { ReviewComment } from '../../entities/review-comment.entity';
import { ReviewDecision } from '../../entities/review-decision.entity';
import { Task } from '../../entities/task.entity';
import { TaskDependency } from '../../entities/task-dependency.entity';
import { User } from '../../entities/user.entity';
import { ReviewDecisionType, TaskStatus, UserRole } from '../../entities/enums';
import { ReviewCommentDto, ReviewDecisionDto } from './dto/review.dto';
import { AuditService } from '../audit/audit.service';

const REQUIRED_CHECKS = ['lint', 'tests', 'readme'];

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Submission) private readonly submissionRepo: Repository<Submission>,
    @InjectRepository(ReviewComment) private readonly commentRepo: Repository<ReviewComment>,
    @InjectRepository(ReviewDecision) private readonly decisionRepo: Repository<ReviewDecision>,
    @InjectRepository(Task) private readonly taskRepo: Repository<Task>,
    @InjectRepository(TaskDependency) private readonly depRepo: Repository<TaskDependency>,
    private readonly auditService: AuditService,
  ) {}

  async findPending(): Promise<Submission[]> {
    return this.submissionRepo
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.task', 'task')
      .leftJoinAndSelect('task.job', 'job')
      .leftJoinAndSelect('s.worker', 'worker')
      .leftJoinAndSelect('s.comments', 'comments')
      .leftJoinAndSelect('s.decisions', 'decisions')
      .where('task.status IN (:...statuses)', {
        statuses: [TaskStatus.SUBMITTED, TaskStatus.IN_REVIEW],
      })
      .orderBy('s.created_at', 'ASC')
      .getMany();
  }

  async findOne(submissionId: string): Promise<Submission> {
    const submission = await this.submissionRepo.findOne({
      where: { id: submissionId },
      relations: ['task', 'task.job', 'worker', 'comments', 'decisions', 'comments.reviewer'],
    });
    if (!submission) throw new NotFoundException('Soumission introuvable');
    return submission;
  }

  async addComment(submissionId: string, dto: ReviewCommentDto, user: User): Promise<ReviewComment> {
    this.assertReviewer(user);
    const submission = await this.findOne(submissionId);
    this.assertNotOwnSubmission(submission, user);

    const comment = this.commentRepo.create({
      submissionId,
      reviewerId: user.id,
      comment: dto.comment,
    });
    await this.commentRepo.save(comment);

    submission.task.status = TaskStatus.IN_REVIEW;
    await this.taskRepo.save(submission.task);
    await this.auditService.log(user.id, 'REVIEW_COMMENT', 'Submission', submissionId);

    return comment;
  }

  async decide(submissionId: string, dto: ReviewDecisionDto, user: User): Promise<ReviewDecision> {
    this.assertReviewer(user);
    const submission = await this.findOne(submissionId);
    this.assertNotOwnSubmission(submission, user);

    if (dto.decision === ReviewDecisionType.ACCEPTED) {
      const checklist = dto.qualityChecklist ?? submission.checklistJson ?? {};
      for (const key of REQUIRED_CHECKS) {
        if (!checklist[key]) {
          throw new BadRequestException(`Checklist qualité incomplète: ${key} requis`);
        }
      }
    }

    const decision = this.decisionRepo.create({
      submissionId,
      reviewerId: user.id,
      decision: dto.decision,
      qualityChecklistJson: dto.qualityChecklist ?? null,
    });
    await this.decisionRepo.save(decision);

    if (dto.comment) {
      await this.addComment(submissionId, { comment: dto.comment }, user);
    }

    const task = submission.task;
    if (dto.decision === ReviewDecisionType.ACCEPTED) {
      task.status = TaskStatus.ACCEPTED;
      await this.unlockDependentTasks(task.id);
      await this.updateWorkerReputation(submission.workerId, 5);
    } else if (dto.decision === ReviewDecisionType.REJECTED) {
      task.status = TaskStatus.REJECTED;
      task.assignedWorkerId = submission.workerId;
      await this.updateWorkerReputation(submission.workerId, -10);
    } else {
      task.status = TaskStatus.CLAIMED;
    }
    await this.taskRepo.save(task);

    await this.auditService.log(user.id, 'REVIEW_DECISION', 'Submission', submissionId, {
      decision: dto.decision,
    });

    return decision;
  }

  private assertReviewer(user: User): void {
    if (![UserRole.REVIEWER, UserRole.ADMIN].includes(user.role)) {
      throw new ForbiddenException('Réservé aux reviewers');
    }
  }

  private assertNotOwnSubmission(submission: Submission, user: User): void {
    if (submission.workerId === user.id) {
      throw new ForbiddenException('Un reviewer ne peut pas valider sa propre soumission');
    }
  }

  private async unlockDependentTasks(taskId: string): Promise<void> {
    const dependents = await this.depRepo.find({
      where: { dependsOnTaskId: taskId },
      relations: ['task'],
    });
    for (const dep of dependents) {
      const allDeps = await this.depRepo.find({
        where: { taskId: dep.taskId },
        relations: ['dependsOnTask'],
      });
      const allAccepted = allDeps.every((d) => d.dependsOnTask?.status === TaskStatus.ACCEPTED);
      if (allAccepted && dep.task.status === TaskStatus.BLOCKED) {
        dep.task.status = TaskStatus.AVAILABLE;
        await this.taskRepo.save(dep.task);
      }
    }
  }

  private async updateWorkerReputation(workerId: string, delta: number): Promise<void> {
    await this.submissionRepo.manager.query(
      `UPDATE users SET reputation_score = GREATEST(0, reputation_score + $1) WHERE id = $2`,
      [delta, workerId],
    );
  }
}
