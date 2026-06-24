import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TaskStatus, TaskType } from './enums';
import { Job } from './job.entity';
import { User } from './user.entity';
import { TaskDependency } from './task-dependency.entity';
import { TaskAssignment } from './task-assignment.entity';
import { Submission } from './submission.entity';
import { Artifact } from './artifact.entity';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'job_id' })
  jobId!: string;

  @ManyToOne(() => Job, (job) => job.tasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_id' })
  job!: Job;

  @Column()
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'enum', enum: TaskType })
  type!: TaskType;

  @Column({ type: 'int', default: 1 })
  difficulty!: number;

  @Column({ name: 'estimated_hours', type: 'float', default: 1 })
  estimatedHours!: number;

  @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.AVAILABLE })
  status!: TaskStatus;

  @Column({ name: 'assigned_worker_id', type: 'uuid', nullable: true })
  assignedWorkerId!: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assigned_worker_id' })
  assignedWorker!: User | null;

  @Column({ name: 'claim_expires_at', type: 'timestamptz', nullable: true })
  claimExpiresAt!: Date | null;

  @OneToMany(() => TaskDependency, (dep) => dep.task)
  dependencies!: TaskDependency[];

  @OneToMany(() => TaskAssignment, (a) => a.task)
  assignments!: TaskAssignment[];

  @OneToMany(() => Submission, (s) => s.task)
  submissions!: Submission[];

  @OneToMany(() => Artifact, (a) => a.task)
  artifacts!: Artifact[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
