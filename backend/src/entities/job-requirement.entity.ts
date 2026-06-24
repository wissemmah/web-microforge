import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Job } from './job.entity';

@Entity('job_requirements')
export class JobRequirement {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'job_id' })
  jobId!: string;

  @ManyToOne(() => Job, (job) => job.requirements, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_id' })
  job!: Job;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'int', default: 1 })
  priority!: number;
}
