import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { Permissions } from '../common/decorators/permissions.decorator';
import { CreateRoleDto, SetRolePermissionsDto, UpdateRoleDto } from './dto';
import { RolesService } from './roles.service';

@Controller('roles')
export class RolesController {
  constructor(private readonly roles: RolesService) {}

  @Get()
  @Permissions('role.view')
  findAll() {
    return this.roles.findAll();
  }

  @Post()
  @Permissions('role.create')
  create(@Body() dto: CreateRoleDto) {
    return this.roles.create(dto);
  }

  @Patch(':id')
  @Permissions('role.edit')
  update(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.roles.update(id, dto);
  }

  @Delete(':id')
  @Permissions('role.delete')
  remove(@Param('id') id: string) {
    return this.roles.softDelete(id);
  }

  @Get(':id/permissions')
  @Permissions('permission.view')
  permissions(@Param('id') id: string) {
    return this.roles.permissions(id);
  }

  @Post(':id/permissions')
  @Permissions('permission.assign')
  setPermissions(@Param('id') id: string, @Body() dto: SetRolePermissionsDto) {
    return this.roles.setPermissions(id, dto);
  }
}
