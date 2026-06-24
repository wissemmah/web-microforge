import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRole } from './enums';
import { Job } from './job.entity';
import { SkillTag } from './skill-tag.entity';
import { TaskAssignment } from './task-assignment.entity';
import { Submission } from './submission.entity';
import { AuditLog } from './audit-log.entity';
import { Notification } from './notification.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ name: 'password_hash' })
  passwordHash!: string;

  @Column()
  name!: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.WORKER })
  role!: UserRole;

  @Column({ name: 'reputation_score', type: 'float', default: 100 })
  reputationScore!: number;

  @ManyToMany(() => SkillTag, (tag) => tag.users, { cascade: true })
  @JoinTable({ name: 'user_skills' })
  skills!: SkillTag[];

  @OneToMany(() => Job, (job) => job.client)
  jobs!: Job[];

  @OneToMany(() => TaskAssignment, (a) => a.worker)
  assignments!: TaskAssignment[];

  @OneToMany(() => Submission, (s) => s.worker)
  submissions!: Submission[];

  @OneToMany(() => AuditLog, (log) => log.user)
  auditLogs!: AuditLog[];

  @OneToMany(() => Notification, (n) => n.user)
  notifications!: Notification[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
