import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class SessionsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.session.findMany({
      include: { user: { select: { id: true, email: true, phone: true, firstName: true, lastName: true, status: true } } },
      orderBy: { loginAt: 'desc' },
      take: 100,
    });
  }

  async revoke(id: string) {
    const session = await this.prisma.session.findUnique({ where: { id } });
    if (!session) throw new NotFoundException('Session not found');
    await this.prisma.session.update({ where: { id }, data: { revokedAt: new Date() } });
    return { revoked: true };
  }

  async revokeForUser(userId: string) {
    await this.prisma.session.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return { revoked: true };
  }
}
