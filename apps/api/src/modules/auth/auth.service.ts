import {
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import {
  AuthResponseDto,
  MeResponseDto,
  RefreshResponseDto,
  UserPayloadDto,
} from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { parseDurationToMs } from './utils/duration.util';

interface AccessTokenPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(
    dto: LoginDto,
  ): Promise<AuthResponseDto & { refreshToken: string }> {
    const user = await this.validateUser(dto.email, dto.password);
    if (!user) {
      this.logger.warn(
        `Failed login attempt for email: ${dto.email.toLowerCase()}`,
      );
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.issueTokens(user);
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: this.toUserPayload(user),
    };
  }

  async refresh(refreshToken: string): Promise<RefreshResponseDto> {
    const refreshTokenHash = this.hashRefreshToken(refreshToken);
    const user = await this.prisma.user.findFirst({
      where: {
        refreshTokenHash,
        refreshTokenExpiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Unauthorized');
    }

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    } satisfies AccessTokenPayload);

    return { accessToken };
  }

  async logout(userId: string): Promise<void> {
    await this.revokeRefreshToken(userId);
  }

  async getMe(userId: string): Promise<MeResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('Unauthorized');
    }

    return {
      ...this.toUserPayload(user),
      active: user.active,
    };
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const normalizedEmail = email.toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return null;
    }

    if (!user.active) {
      throw new ForbiddenException(
        'Your account is inactive. Contact the workshop administrator.',
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async issueTokens(
    user: User,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    } satisfies AccessTokenPayload);

    const refreshToken = randomBytes(32).toString('hex');
    const refreshTokenHash = this.hashRefreshToken(refreshToken);
    const refreshTtl = this.configService.get<string>('JWT_REFRESH_TTL', '7d');
    const refreshTokenExpiresAt = new Date(
      Date.now() + parseDurationToMs(refreshTtl),
    );

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        refreshTokenHash,
        refreshTokenExpiresAt,
      },
    });

    return { accessToken, refreshToken };
  }

  async revokeRefreshToken(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        refreshTokenHash: null,
        refreshTokenExpiresAt: null,
      },
    });
  }

  hashRefreshToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  getRefreshCookieMaxAgeMs(): number {
    const refreshTtl = this.configService.get<string>('JWT_REFRESH_TTL', '7d');
    return parseDurationToMs(refreshTtl);
  }

  private toUserPayload(user: User): UserPayloadDto {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    };
  }
}
