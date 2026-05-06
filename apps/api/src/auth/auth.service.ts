import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { LoginDto, RefreshDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly audit: AuditService,
  ) {}

  async login(dto: LoginDto, meta: { ipAddress?: string; userAgent?: string }) {
    const identifier = dto.identifier.trim().toLowerCase();
    const user = await this.prisma.user.findFirst({
      where: {
        deletedAt: null,
        status: 'ACTIVE',
        OR: [{ email: identifier }, { phone: dto.identifier.trim() }],
      },
      include: {
        roles: {
          include: {
            role: {
              include: { permissions: { include: { permission: true } } },
            },
          },
        },
      },
    });

    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const expiresAt = this.refreshExpiry();
    const session = await this.prisma.session.create({
      data: { userId: user.id, ipAddress: meta.ipAddress, userAgent: meta.userAgent, expiresAt },
    });
    await this.prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

    const accessToken = await this.signAccessToken(user.id, session.id);
    const refreshToken = await this.signRefreshToken(user.id, session.id);
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: await bcrypt.hash(refreshToken, 12),
        expiresAt,
      },
    });
    await this.audit.log({ actorId: user.id, action: 'auth.login', entityType: 'sessions', entityId: session.id, ipAddress: meta.ipAddress });

    return {
      accessToken,
      refreshToken,
      user: this.toAuthUser(user),
    };
  }

  async refresh(dto: RefreshDto) {
    const payload = await this.jwt.verifyAsync<{ sub: string; sid: string }>(dto.refreshToken, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET'),
    });
    const tokens = await this.prisma.refreshToken.findMany({
      where: { userId: payload.sub, revokedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });
    const match = await this.findMatchingToken(dto.refreshToken, tokens);
    if (!match) throw new UnauthorizedException('Invalid refresh token');

    await this.prisma.refreshToken.update({ where: { id: match.id }, data: { revokedAt: new Date() } });
    const refreshToken = await this.signRefreshToken(payload.sub, payload.sid);
    await this.prisma.refreshToken.create({
      data: {
        userId: payload.sub,
        tokenHash: await bcrypt.hash(refreshToken, 12),
        expiresAt: this.refreshExpiry(),
      },
    });
    return {
      accessToken: await this.signAccessToken(payload.sub, payload.sid),
      refreshToken,
    };
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      const tokens = await this.prisma.refreshToken.findMany({ where: { userId, revokedAt: null } });
      const match = await this.findMatchingToken(refreshToken, tokens);
      if (match) await this.prisma.refreshToken.update({ where: { id: match.id }, data: { revokedAt: new Date() } });
    }
    await this.audit.log({ actorId: userId, action: 'auth.logout', entityType: 'users', entityId: userId });
    return { loggedOut: true };
  }

  forgotPassword(identifier: string) {
    return {
      accepted: true,
      message: `Password reset request accepted for ${identifier}. Wire OTP/SMS/email provider here.`,
    };
  }

  resetPassword() {
    return {
      accepted: true,
      message: 'Password reset token endpoint scaffolded. Add OTP/email token verification before production.',
    };
  }

  private async signAccessToken(userId: string, sessionId: string) {
    return this.jwt.signAsync(
      { sub: userId, sid: sessionId },
      {
        secret: this.config.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.config.get<string>('JWT_ACCESS_EXPIRES_IN') ?? '15m',
      },
    );
  }

  private async signRefreshToken(userId: string, sessionId: string) {
    return this.jwt.signAsync(
      { sub: userId, sid: sessionId },
      {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: `${this.config.get<number>('JWT_REFRESH_EXPIRES_IN_DAYS') ?? 7}d`,
      },
    );
  }

  private refreshExpiry() {
    const days = Number(this.config.get('JWT_REFRESH_EXPIRES_IN_DAYS') ?? 7);
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  }

  private async findMatchingToken<T extends { id: string; tokenHash: string }>(raw: string, tokens: T[]) {
    for (const token of tokens) {
      if (await bcrypt.compare(raw, token.tokenHash)) return token;
    }
    return null;
  }

  private toAuthUser(user: any) {
    return {
      id: user?.id,
      email: user?.email,
      phone: user?.phone,
      firstName: user?.firstName,
      lastName: user?.lastName,
      roles: user?.roles.map((ur: any) => ur.role.name) ?? [],
      permissions: [
        ...new Set(user?.roles.flatMap((ur: any) => ur.role.permissions.map((rp: any) => rp.permission.key)) ?? []),
      ],
    };
  }
}
