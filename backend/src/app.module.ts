import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './modules/auth/auth.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { AssemblyModule } from './modules/assembly/assembly.module';
import { AuditModule } from './modules/audit/audit.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { HealthController } from './health.controller';
import { UsersModule } from './modules/users/users.module';
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
} from './entities';

const ENTITIES = [
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
];

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST', 'localhost'),
        port: parseInt(config.get('DB_PORT', '5432'), 10),
        username: config.get('DB_USER', 'microforge'),
        password: config.get('DB_PASSWORD', 'microforge'),
        database: config.get('DB_NAME', 'microforge'),
        entities: ENTITIES,
        synchronize: config.get('DB_SYNC', 'true') === 'true',
        logging: config.get('DB_LOGGING', 'false') === 'true',
      }),
    }),
    AuditModule,
    AuthModule,
    UsersModule,
    JobsModule,
    TasksModule,
    ReviewsModule,
    AssemblyModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
