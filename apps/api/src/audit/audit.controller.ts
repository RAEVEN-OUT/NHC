import { Controller, Get, Query } from '@nestjs/common';
import { Permissions } from '../common/decorators/permissions.decorator';
import { AuditService } from './audit.service';

@Controller('audit-logs')
export class AuditController {
  constructor(private readonly audit: AuditService) {}

  @Get()
  @Permissions('audit.view')
  findAll(@Query() query: { actorId?: string; action?: string; from?: string; to?: string }) {
    return this.audit.findAll(query);
  }
}
