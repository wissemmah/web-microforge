import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto, UpdateJobStatusDto, CreateTaskDto } from './dto/job.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { User } from '../../entities/user.entity';
import { UserRole } from '../../entities/enums';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.jobsService.findAll(user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.jobsService.findOne(id, user);
  }

  @Post()
  @Roles(UserRole.CLIENT, UserRole.ADMIN)
  create(@Body() dto: CreateJobDto, @CurrentUser() user: User) {
    return this.jobsService.create(dto, user);
  }

  @Patch(':id/status')
  @Roles(UserRole.CLIENT, UserRole.ADMIN)
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateJobStatusDto,
    @CurrentUser() user: User,
  ) {
    return this.jobsService.updateStatus(id, dto, user);
  }

  @Post(':id/tasks')
  @Roles(UserRole.CLIENT, UserRole.ADMIN)
  addTask(
    @Param('id') id: string,
    @Body() dto: CreateTaskDto,
    @CurrentUser() user: User,
  ) {
    return this.jobsService.addTask(id, dto, user);
  }
}
