import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Task } from './task.entity';
import { User } from './user.entity';
import { ReviewComment } from './review-comment.entity';
import { ReviewDecision } from './review-decision.entity';

@Entity('submissions')
export class Submission {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'task_id' })
  taskId!: string;

  @ManyToOne(() => Task, (task) => task.submissions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'task_id' })
  task!: Task;

  @Column({ name: 'worker_id' })
  workerId!: string;

  @ManyToOne(() => User, (user) => user.submissions)
  @JoinColumn({ name: 'worker_id' })
  worker!: User;

  @Column({ type: 'int', default: 1 })
  version!: number;

  @Column({ type: 'text', nullable: true })
  content!: string | null;

  @Column({ name: 'git_url', type: 'varchar', length: 512, nullable: true })
  gitUrl!: string | null;

  @Column({ type: 'text', nullable: true })
  instructions!: string | null;

  @Column({ name: 'file_path', type: 'varchar', length: 512, nullable: true })
  filePath!: string | null;

  @Column({ name: 'checklist_json', type: 'jsonb', nullable: true })
  checklistJson!: Record<string, boolean> | null;

  @Column({ name: 'secret_scan_passed', default: true })
  secretScanPassed!: boolean;

  @OneToMany(() => ReviewComment, (c) => c.submission)
  comments!: ReviewComment[];

  @OneToMany(() => ReviewDecision, (d) => d.submission)
  decisions!: ReviewDecision[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
