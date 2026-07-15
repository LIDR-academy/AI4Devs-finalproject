import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { User, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { normalizeCanActAsMechanic } from '../work-orders/utils/assignable-mechanic';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

const BCRYPT_COST = 12;

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.prisma.user.findMany({
      orderBy: [{ active: 'desc' }, { fullName: 'asc' }],
    });

    return users.map((user) => this.toUserResponse(user));
  }

  async create(dto: CreateUserDto, actorId: string): Promise<UserResponseDto> {
    const normalizedEmail = dto.email.toLowerCase().trim();

    const existingUser = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw new ConflictException('This email is already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_COST);
    const canActAsMechanic = normalizeCanActAsMechanic(
      dto.role,
      dto.canActAsMechanic,
    );

    const user = await this.prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        fullName: dto.fullName,
        role: dto.role,
        canActAsMechanic,
        active: true,
      },
    });

    this.logger.log({
      event: 'user.created',
      actorId,
      userId: user.id,
    });

    return this.toUserResponse(user);
  }

  async update(
    userId: string,
    dto: UpdateUserDto,
    actorId: string,
  ): Promise<UserResponseDto> {
    const hasPassword =
      dto.password !== undefined &&
      dto.password !== null &&
      dto.password !== '';

    const hasAnyField =
      dto.fullName !== undefined ||
      dto.email !== undefined ||
      dto.role !== undefined ||
      hasPassword ||
      dto.canActAsMechanic !== undefined;

    if (!hasAnyField) {
      throw new BadRequestException('At least one field is required');
    }

    const updatedUser = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('Not Found');
      }

      if (!user.active) {
        throw new ConflictException('User is inactive');
      }

      const nextFullName =
        dto.fullName !== undefined ? dto.fullName.trim() : user.fullName;
      const nextEmail =
        dto.email !== undefined
          ? dto.email.toLowerCase().trim()
          : user.email;
      const nextRole = dto.role !== undefined ? dto.role : user.role;

      if (nextEmail !== user.email) {
        const emailOwner = await tx.user.findUnique({
          where: { email: nextEmail },
        });

        if (emailOwner && emailOwner.id !== userId) {
          throw new ConflictException('This email is already registered');
        }
      }

      if (
        user.role === UserRole.ADMIN &&
        nextRole === UserRole.MECHANIC
      ) {
        const otherActiveAdmins = await tx.user.count({
          where: {
            role: UserRole.ADMIN,
            active: true,
            id: { not: userId },
          },
        });

        if (otherActiveAdmins < 1) {
          throw new BadRequestException(
            'At least one active administrator is required',
          );
        }
      }

      const nextCanActAsMechanic = normalizeCanActAsMechanic(
        nextRole,
        dto.canActAsMechanic !== undefined
          ? dto.canActAsMechanic
          : user.canActAsMechanic,
      );

      const roleChanged = nextRole !== user.role;
      const passwordChanged = hasPassword;

      const data: {
        fullName: string;
        email: string;
        role: UserRole;
        canActAsMechanic: boolean;
        passwordHash?: string;
        refreshTokenHash?: null;
        refreshTokenExpiresAt?: null;
      } = {
        fullName: nextFullName,
        email: nextEmail,
        role: nextRole,
        canActAsMechanic: nextCanActAsMechanic,
      };

      if (passwordChanged) {
        data.passwordHash = await bcrypt.hash(dto.password!, BCRYPT_COST);
      }

      if (roleChanged || passwordChanged) {
        data.refreshTokenHash = null;
        data.refreshTokenExpiresAt = null;
      }

      return tx.user.update({
        where: { id: userId },
        data,
      });
    });

    const changedFields: string[] = [];
    if (dto.fullName !== undefined) {
      changedFields.push('fullName');
    }
    if (dto.email !== undefined) {
      changedFields.push('email');
    }
    if (dto.role !== undefined) {
      changedFields.push('role');
    }
    if (hasPassword) {
      changedFields.push('password');
    }
    if (dto.canActAsMechanic !== undefined) {
      changedFields.push('canActAsMechanic');
    }

    this.logger.log({
      event: 'user.updated',
      actorId,
      userId,
      changedFields,
    });

    return this.toUserResponse(updatedUser);
  }

  async deactivate(userId: string, actorId: string): Promise<UserResponseDto> {
    const updatedUser = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('Not Found');
      }

      if (!user.active) {
        throw new ConflictException('User is already inactive');
      }

      if (userId === actorId) {
        throw new BadRequestException('You cannot deactivate your own account');
      }

      if (user.role === UserRole.ADMIN) {
        const activeAdmins = await tx.user.count({
          where: {
            role: UserRole.ADMIN,
            active: true,
            id: { not: userId },
          },
        });

        if (activeAdmins < 1) {
          throw new BadRequestException(
            'At least one active administrator is required',
          );
        }
      }

      // Bump sessionVersion so existing access tokens fail JwtStrategy checks.
      // Also clear refresh state. Call the same invalidation whenever a future
      // role-update endpoint changes privileges.
      return tx.user.update({
        where: { id: userId },
        data: {
          active: false,
          refreshTokenHash: null,
          refreshTokenExpiresAt: null,
          sessionVersion: { increment: 1 },
        },
      });
    });

    this.logger.log({
      event: 'user.deactivated',
      actorId,
      userId,
    });

    return this.toUserResponse(updatedUser);
  }

  async countActiveAdmins(excludeUserId?: string): Promise<number> {
    return this.prisma.user.count({
      where: {
        role: UserRole.ADMIN,
        active: true,
        ...(excludeUserId ? { id: { not: excludeUserId } } : {}),
      },
    });
  }

  private toUserResponse(user: User): UserResponseDto {
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      canActAsMechanic: user.canActAsMechanic,
      active: user.active,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
