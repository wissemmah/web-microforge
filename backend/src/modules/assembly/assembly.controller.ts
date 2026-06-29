import { Controller, Get, Param, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import * as fs from 'fs';
import { AssemblyService } from './assembly.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { User } from '../../entities/user.entity';
import { UserRole } from '../../entities/enums';

@Controller()
export class AssemblyController {
  constructor(private readonly assemblyService: AssemblyService) {}

  @Post('jobs/:jobId/assemble')
  @Roles(UserRole.CLIENT, UserRole.ADMIN)
  assemble(@Param('jobId') jobId: string, @CurrentUser() user: User) {
    return this.assemblyService.assemble(jobId, user);
  }

  @Get('jobs/:jobId/artifacts')
  getArtifacts(@Param('jobId') jobId: string, @CurrentUser() user: User) {
    return this.assemblyService.getArtifacts(jobId, user);
  }

  @Get('artifacts/:id/download')
  async download(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Res() res: Response,
  ) {
    const { path: filePath, name } = await this.assemblyService.download(id, user);
    res.download(filePath, `${name}.json`);
  }
}
