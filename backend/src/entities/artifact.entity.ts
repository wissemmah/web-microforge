import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { StorageType } from './enums';
import { Job } from './job.entity';
import { Task } from './task.entity';

@Entity('artifacts')
export class Artifact {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'job_id' })
  jobId!: string;

  @ManyToOne(() => Job, (job) => job.artifacts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_id' })
  job!: Job;

  @Column({ name: 'task_id', type: 'uuid', nullable: true })
  taskId!: string | null;

  @ManyToOne(() => Task, (task) => task.artifacts, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'task_id' })
  task!: Task | null;

  @Column()
  name!: string;

  @Column({ name: 'storage_type', type: 'enum', enum: StorageType })
  storageType!: StorageType;

  @Column({ name: 'content_or_path', type: 'text' })
  contentOrPath!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
