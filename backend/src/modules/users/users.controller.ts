import { Controller, Get } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../../entities/audit-log.entity';
import { User } from '../../entities/user.entity';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../entities/enums';

@Controller('admin')
export class UsersController {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(AuditLog) private readonly auditRepo: Repository<AuditLog>,
  ) {}

  @Get('users')
  @Roles(UserRole.ADMIN)
  async listUsers() {
    const users = await this.userRepo.find({ relations: ['skills'], order: { createdAt: 'DESC' } });
    return users.map(({ passwordHash: _, ...u }) => u);
  }

  @Get('audit-logs')
  @Roles(UserRole.ADMIN)
  async auditLogs() {
    return this.auditRepo.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }
}
