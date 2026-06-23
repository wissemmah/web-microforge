import { Controller, Get } from '@nestjs/common';
import { Public } from './common/decorators/roles.decorator';

@Controller()
export class HealthController {
  @Public()
  @Get('health')
  health() {
    return { status: 'ok', service: 'microforge-api', timestamp: new Date().toISOString() };
  }
}
