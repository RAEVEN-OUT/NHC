import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { AssignRolesDto, CreateUserDto, ResetUserPasswordDto, UpdateUserDto, UpdateUserStatusDto } from './dto';

const userSelect = {
  id: true,
  username: true,
  email: true,
  phone: true,
  firstName: true,
  lastName: true,
  status: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
  roles: { include: { role: true } },
};

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  findAll(query: { search?: string; status?: string }) {
    return this.prisma.user.findMany({
      where: {
        deletedAt: null,
        status: query.status as never,
        OR: query.search
          ? [
              { email: { contains: query.search, mode: 'insensitive' } },
              { phone: { contains: query.search, mode: 'insensitive' } },
              { firstName: { contains: query.search, mode: 'insensitive' } },
            ]
          : undefined,
      },
      select: userSelect,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findFirst({ where: { id, deletedAt: null }, select: userSelect });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(dto: CreateUserDto, actorId?: string) {
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        email: dto.email.toLowerCase(),
        phone: dto.phone,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        createdById: actorId,
        roles: dto.roleIds?.length
          ? { create: dto.roleIds.map((roleId) => ({ roleId })) }
          : undefined,
      },
      select: userSelect,
    });
    await this.audit.log({ actorId, action: 'user.create', entityType: 'users', entityId: user.id, newValues: user });
    return user;
  }

  async update(id: string, dto: UpdateUserDto, actorId?: string) {
    await this.findOne(id);
    const user = await this.prisma.user.update({
      where: { id },
      data: { ...dto, email: dto.email?.toLowerCase() },
      select: userSelect,
    });
    await this.audit.log({ actorId, action: 'user.edit', entityType: 'users', entityId: id, newValues: user });
    return user;
  }

  async updateStatus(id: string, dto: UpdateUserStatusDto, actorId?: string) {
    await this.findOne(id);
    const user = await this.prisma.user.update({ where: { id }, data: { status: dto.status }, select: userSelect });
    await this.audit.log({ actorId, action: 'user.status_change', entityType: 'users', entityId: id, newValues: user });
    return user;
  }

  async softDelete(id: string, actorId?: string) {
    await this.findOne(id);
    const user = await this.prisma.user.update({ where: { id }, data: { deletedAt: new Date() }, select: userSelect });
    await this.audit.log({ actorId, action: 'user.delete', entityType: 'users', entityId: id, oldValues: user });
    return { deleted: true };
  }

  async assignRoles(id: string, dto: AssignRolesDto, actorId?: string) {
    if (!dto.roleIds.length) throw new BadRequestException('At least one role is required');
    await this.findOne(id);
    await this.prisma.$transaction([
      this.prisma.userRole.deleteMany({ where: { userId: id } }),
      ...dto.roleIds.map((roleId) => this.prisma.userRole.create({ data: { userId: id, roleId } })),
    ]);
    const user = await this.findOne(id);
    await this.audit.log({ actorId, action: 'role.assign', entityType: 'users', entityId: id, newValues: user });
    return user;
  }

  async resetPassword(id: string, dto: ResetUserPasswordDto, actorId?: string) {
    await this.findOne(id);
    const passwordHash = await bcrypt.hash(dto.password, 12);
    await this.prisma.user.update({ where: { id }, data: { passwordHash } });
    await this.prisma.refreshToken.updateMany({
      where: { userId: id, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    await this.prisma.session.updateMany({
      where: { userId: id, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    await this.audit.log({ actorId, action: 'user.password_reset', entityType: 'users', entityId: id });
    return { reset: true };
  }

  activity(id: string) {
    return this.prisma.auditLog.findMany({
      where: { OR: [{ actorId: id }, { entityType: 'users', entityId: id }] },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}
