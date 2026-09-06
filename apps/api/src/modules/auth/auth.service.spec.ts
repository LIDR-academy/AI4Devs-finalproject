import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('AuthService', () => {
  let authService: AuthService;
  let prisma: {
    user: {
      findUnique: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
    };
  };
  let jwtService: { signAsync: jest.Mock };
  let configService: { get: jest.Mock; getOrThrow: jest.Mock };

  const activeUser: User = {
    id: 'user-1',
    email: 'mechanic@taller.com',
    passwordHash: '$2b$12$hashedpasswordvalue',
    fullName: 'Workshop Mechanic',
    role: UserRole.MECHANIC,
    canActAsMechanic: false,
    active: true,
    refreshTokenHash: null,
    refreshTokenExpiresAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
    };

    jwtService = {
      signAsync: jest.fn().mockResolvedValue('access-token'),
    };

    configService = {
      get: jest.fn((key: string, defaultValue?: string) => {
        if (key === 'JWT_REFRESH_TTL') {
          return '7d';
        }
        return defaultValue;
      }),
      getOrThrow: jest.fn(),
    };

    authService = new AuthService(
      prisma as unknown as PrismaService,
      jwtService as unknown as JwtService,
      configService as unknown as ConfigService,
    );

    jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns tokens and user payload on successful login', async () => {
    prisma.user.findUnique.mockResolvedValue(activeUser);
    prisma.user.update.mockResolvedValue(activeUser);

    const result = await authService.login({
      email: 'Mechanic@Taller.com',
      password: 'MechanicPass123',
    });

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'mechanic@taller.com' },
    });
    expect(result.accessToken).toBe('access-token');
    expect(result.refreshToken).toBeDefined();
    expect(result.user).toEqual({
      id: activeUser.id,
      email: activeUser.email,
      fullName: activeUser.fullName,
      role: activeUser.role,
    });
  });

  it('throws UnauthorizedException for wrong password', async () => {
    prisma.user.findUnique.mockResolvedValue(activeUser);
    jest.spyOn(bcrypt, 'compare').mockImplementation(async () => false);

    await expect(
      authService.login({
        email: 'mechanic@taller.com',
        password: 'wrong',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('throws UnauthorizedException for unknown email', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(
      authService.login({
        email: 'unknown@taller.com',
        password: 'MechanicPass123',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('throws ForbiddenException for inactive user', async () => {
    prisma.user.findUnique.mockResolvedValue({
      ...activeUser,
      active: false,
    });

    await expect(
      authService.login({
        email: 'inactive@taller.com',
        password: 'InactivePass123',
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('returns user profile without password hash', async () => {
    prisma.user.findUnique.mockResolvedValue(activeUser);

    const result = await authService.getMe(activeUser.id);

    expect(result).toEqual({
      id: activeUser.id,
      email: activeUser.email,
      fullName: activeUser.fullName,
      role: activeUser.role,
      active: true,
    });
  });

  it('clears refresh token on logout', async () => {
    prisma.user.update.mockResolvedValue(activeUser);

    await authService.logout(activeUser.id);

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: activeUser.id },
      data: {
        refreshTokenHash: null,
        refreshTokenExpiresAt: null,
      },
    });
  });

  it('returns new access token for valid refresh token', async () => {
    const refreshToken = 'valid-refresh-token';
    prisma.user.findFirst.mockResolvedValue(activeUser);

    const result = await authService.refresh(refreshToken);

    expect(prisma.user.findFirst).toHaveBeenCalled();
    expect(result.accessToken).toBe('access-token');
  });

  it('throws UnauthorizedException for expired refresh token', async () => {
    prisma.user.findFirst.mockResolvedValue(null);

    await expect(authService.refresh('expired-token')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('hashes refresh tokens consistently', () => {
    const hashA = authService.hashRefreshToken('same-token');
    const hashB = authService.hashRefreshToken('same-token');

    expect(hashA).toBe(hashB);
    expect(hashA).not.toBe('same-token');
  });
});
