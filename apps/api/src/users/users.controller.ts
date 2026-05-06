import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { Permissions } from '../common/decorators/permissions.decorator';
import { AssignRolesDto, CreateUserDto, ResetUserPasswordDto, UpdateUserDto, UpdateUserStatusDto } from './dto';
import { UsersService } from './users.service';

type AuthRequest = Request & { user?: { sub: string } };

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  @Permissions('user.view')
  findAll(@Query() query: { search?: string; status?: string }) {
    return this.users.findAll(query);
  }

  @Get(':id')
  @Permissions('user.view')
  findOne(@Param('id') id: string) {
    return this.users.findOne(id);
  }

  @Post()
  @Permissions('user.create')
  create(@Body() dto: CreateUserDto, @Req() req: AuthRequest) {
    return this.users.create(dto, req.user?.sub);
  }

  @Patch(':id')
  @Permissions('user.edit')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto, @Req() req: AuthRequest) {
    return this.users.update(id, dto, req.user?.sub);
  }

  @Patch(':id/status')
  @Permissions('user.status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateUserStatusDto, @Req() req: AuthRequest) {
    return this.users.updateStatus(id, dto, req.user?.sub);
  }

  @Post(':id/roles')
  @Permissions('role.assign')
  assignRoles(@Param('id') id: string, @Body() dto: AssignRolesDto, @Req() req: AuthRequest) {
    return this.users.assignRoles(id, dto, req.user?.sub);
  }

  @Post(':id/reset-password')
  @Permissions('user.reset_password')
  resetPassword(@Param('id') id: string, @Body() dto: ResetUserPasswordDto, @Req() req: AuthRequest) {
    return this.users.resetPassword(id, dto, req.user?.sub);
  }

  @Get(':id/activity')
  @Permissions('user.activity')
  activity(@Param('id') id: string) {
    return this.users.activity(id);
  }

  @Get(':id/roles')
  @Permissions('role.view')
  roles(@Param('id') id: string) {
    return this.users.findOne(id);
  }

  @Delete(':id')
  @Permissions('user.delete')
  remove(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.users.softDelete(id, req.user?.sub);
  }
}
