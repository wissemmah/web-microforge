import { DataSource } from 'typeorm';
import {
  User,
  SkillTag,
  Job,
  JobRequirement,
  Task,
  TaskDependency,
  TaskAssignment,
  Submission,
  ReviewComment,
  ReviewDecision,
  Artifact,
  Notification,
  AuditLog,
} from '../entities';

const ENTITIES = [
  User, SkillTag, Job, JobRequirement, Task, TaskDependency,
  TaskAssignment, Submission, ReviewComment, ReviewDecision,
  Artifact, Notification, AuditLog,
];

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'microforge',
  password: process.env.DB_PASSWORD || 'microforge',
  database: process.env.DB_NAME || 'microforge',
  entities: ENTITIES,
  synchronize: false,
});
