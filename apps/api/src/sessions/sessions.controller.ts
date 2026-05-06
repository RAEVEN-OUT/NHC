import { Controller, Delete, Get, Param } from '@nestjs/common';
import { Permissions } from '../common/decorators/permissions.decorator';
import { SessionsService } from './sessions.service';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessions: SessionsService) {}

  @Get()
  @Permissions('session.view')
  findAll() {
    return this.sessions.findAll();
  }

  @Delete('user/:id')
  @Permissions('session.force_logout')
  revokeForUser(@Param('id') userId: string) {
    return this.sessions.revokeForUser(userId);
  }

  @Delete(':id')
  @Permissions('session.force_logout')
  revoke(@Param('id') id: string) {
    return this.sessions.revoke(id);
  }
}
