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
import { JobStatus } from './enums';
import { User } from './user.entity';
import { JobRequirement } from './job-requirement.entity';
import { Task } from './task.entity';
import { Artifact } from './artifact.entity';

@Entity('jobs')
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'client_id' })
  clientId!: string;

  @ManyToOne(() => User, (user) => user.jobs)
  @JoinColumn({ name: 'client_id' })
  client!: User;

  @Column()
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column()
  stack!: string;

  @Column({ type: 'text', nullable: true })
  constraints!: string | null;

  @Column({ name: 'virtual_budget', type: 'int', default: 0 })
  virtualBudget!: number;

  @Column({ type: 'timestamptz', nullable: true })
  deadline!: Date | null;

  @Column({ type: 'enum', enum: JobStatus, default: JobStatus.DRAFT })
  status!: JobStatus;

  @OneToMany(() => JobRequirement, (req) => req.job, { cascade: true })
  requirements!: JobRequirement[];

  @OneToMany(() => Task, (task) => task.job, { cascade: true })
  tasks!: Task[];

  @OneToMany(() => Artifact, (a) => a.job)
  artifacts!: Artifact[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
