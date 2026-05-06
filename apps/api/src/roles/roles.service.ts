import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateRoleDto, SetRolePermissionsDto, UpdateRoleDto } from './dto';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.role.findMany({
      where: { deletedAt: null },
      include: { permissions: { include: { permission: true } }, _count: { select: { users: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async create(dto: CreateRoleDto) {
    return this.prisma.role.create({ data: { ...dto, name: dto.name.toLowerCase(), isSystem: false } });
  }

  async update(id: string, dto: UpdateRoleDto) {
    await this.ensureExists(id);
    return this.prisma.role.update({ where: { id }, data: dto });
  }

  async softDelete(id: string) {
    await this.ensureExists(id);
    await this.prisma.role.update({ where: { id }, data: { deletedAt: new Date() } });
    return { deleted: true };
  }

  async setPermissions(id: string, dto: SetRolePermissionsDto) {
    await this.ensureExists(id);
    await this.prisma.$transaction([
      this.prisma.rolePermission.deleteMany({ where: { roleId: id } }),
      ...dto.permissionIds.map((permissionId) =>
        this.prisma.rolePermission.create({ data: { roleId: id, permissionId } }),
      ),
    ]);
    return this.prisma.role.findUnique({
      where: { id },
      include: { permissions: { include: { permission: true } } },
    });
  }

  permissions(id: string) {
    return this.prisma.rolePermission.findMany({ where: { roleId: id }, include: { permission: true } });
  }

  private async ensureExists(id: string) {
    const role = await this.prisma.role.findFirst({ where: { id, deletedAt: null } });
    if (!role) throw new NotFoundException('Role not found');
  }
}
