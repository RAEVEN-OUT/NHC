import { Controller, Get } from '@nestjs/common';
import { Permissions as RequirePermissions } from '../common/decorators/permissions.decorator';
import { PermissionsService } from './permissions.service';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissions: PermissionsService) {}

  @Get()
  @RequirePermissions('permission.view')
  findAll() {
    return this.permissions.findAll();
  }
}
