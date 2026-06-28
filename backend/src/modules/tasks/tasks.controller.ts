import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { ClaimTaskDto, SubmitTaskDto } from './dto/task.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { User } from '../../entities/user.entity';
import { UserRole } from '../../entities/enums';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get('available')
  findAvailable(@CurrentUser() user: User) {
    return this.tasksService.findAvailable(user);
  }

  @Get('mine')
  @Roles(UserRole.WORKER, UserRole.ADMIN)
  findMine(@CurrentUser() user: User) {
    return this.tasksService.findMyTasks(user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Post(':id/claim')
  @Roles(UserRole.WORKER, UserRole.ADMIN)
  claim(@Param('id') id: string, @Body() dto: ClaimTaskDto, @CurrentUser() user: User) {
    return this.tasksService.claim(id, dto, user);
  }

  @Post(':id/submit')
  @Roles(UserRole.WORKER, UserRole.ADMIN)
  submit(@Param('id') id: string, @Body() dto: SubmitTaskDto, @CurrentUser() user: User) {
    return this.tasksService.submit(id, dto, user);
  }
}
