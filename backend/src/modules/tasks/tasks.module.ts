import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from '../../entities/task.entity';
import { TaskAssignment } from '../../entities/task-assignment.entity';
import { TaskDependency } from '../../entities/task-dependency.entity';
import { Submission } from '../../entities/submission.entity';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Task, TaskAssignment, TaskDependency, Submission])],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
