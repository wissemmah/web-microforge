import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Submission } from './submission.entity';
import { User } from './user.entity';

@Entity('review_comments')
export class ReviewComment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'submission_id' })
  submissionId!: string;

  @ManyToOne(() => Submission, (s) => s.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'submission_id' })
  submission!: Submission;

  @Column({ name: 'reviewer_id' })
  reviewerId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reviewer_id' })
  reviewer!: User;

  @Column({ type: 'text' })
  comment!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
