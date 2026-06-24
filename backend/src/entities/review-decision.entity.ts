import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ReviewDecisionType } from './enums';
import { Submission } from './submission.entity';
import { User } from './user.entity';

@Entity('review_decisions')
export class ReviewDecision {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'submission_id' })
  submissionId!: string;

  @ManyToOne(() => Submission, (s) => s.decisions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'submission_id' })
  submission!: Submission;

  @Column({ name: 'reviewer_id' })
  reviewerId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reviewer_id' })
  reviewer!: User;

  @Column({ type: 'enum', enum: ReviewDecisionType })
  decision!: ReviewDecisionType;

  @Column({ name: 'quality_checklist_json', type: 'jsonb', nullable: true })
  qualityChecklistJson!: Record<string, boolean> | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
