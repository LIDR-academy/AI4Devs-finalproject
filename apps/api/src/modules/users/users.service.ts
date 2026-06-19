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
import { CreateUserDto } from './dto/create-user.dto';
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

    const user = await this.prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        fullName: dto.fullName,
        role: dto.role,
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

      return tx.user.update({
        where: { id: userId },
        data: {
          active: false,
          refreshTokenHash: null,
          refreshTokenExpiresAt: null,
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
      active: user.active,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
