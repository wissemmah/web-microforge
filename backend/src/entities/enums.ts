export enum UserRole {
  CLIENT = 'CLIENT',
  WORKER = 'WORKER',
  REVIEWER = 'REVIEWER',
  ADMIN = 'ADMIN',
}

export enum JobStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  IN_PROGRESS = 'IN_PROGRESS',
  IN_REVIEW = 'IN_REVIEW',
  COMPLETED = 'COMPLETED',
}

export enum TaskType {
  CODE = 'CODE',
  TEST = 'TEST',
  DOC = 'DOC',
  BUGFIX = 'BUGFIX',
  INTEGRATION = 'INTEGRATION',
}

export enum TaskStatus {
  AVAILABLE = 'AVAILABLE',
  CLAIMED = 'CLAIMED',
  SUBMITTED = 'SUBMITTED',
  IN_REVIEW = 'IN_REVIEW',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  BLOCKED = 'BLOCKED',
}

export enum ReviewDecisionType {
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  CHANGES_REQUESTED = 'CHANGES_REQUESTED',
}

export enum StorageType {
  DB = 'DB',
  FILE = 'FILE',
  URL = 'URL',
}
