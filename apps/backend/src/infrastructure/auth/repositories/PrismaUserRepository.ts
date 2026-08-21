import { PrismaClient, User as PrismaUser } from '@prisma/client';
import { User, UserRole, UserStatusType } from '../../../domain/auth/entities/User.js';
import { Pin } from '../../../domain/auth/value-objects/Pin.js';
import { IUserRepository } from '../../../domain/auth/repositories/IUserRepository.js';

function toDomain(raw: PrismaUser): User {
  return new User({
    id: raw.id,
    name: raw.name,
    role: raw.role as UserRole,
    pin: Pin.createFromHash(raw.pinHash),
    status: raw.status as UserStatusType,
    failedAttempts: raw.failedAttempts,
    createdAt: raw.createdAt,
  });
}

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  public async findById(id: string): Promise<User | null> {
    const raw = await this.prisma.user.findUnique({ where: { id } });
    return raw ? toDomain(raw) : null;
  }

  public async findAll(): Promise<User[]> {
    const rows = await this.prisma.user.findMany();
    return rows.map(toDomain);
  }

  public async save(user: User): Promise<void> {
    await this.prisma.user.upsert({
      where: { id: user.id },
      update: {
        status: user.status,
        failedAttempts: user.failedAttempts,
      },
      create: {
        id: user.id,
        name: user.name,
        role: user.role,
        pinHash: user.pin.getHash(),
        status: user.status,
        failedAttempts: user.failedAttempts,
      },
    });
  }
}
