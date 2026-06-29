import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job } from '../../entities/job.entity';
import { Task } from '../../entities/task.entity';
import { Artifact } from '../../entities/artifact.entity';
import { AssemblyService } from './assembly.service';
import { AssemblyController } from './assembly.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Job, Task, Artifact])],
  controllers: [AssemblyController],
  providers: [AssemblyService],
})
export class AssemblyModule {}
