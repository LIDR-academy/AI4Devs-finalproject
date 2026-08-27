import { PrismaClient } from '../../../generated/prisma/client.js';
import { User, UserRole, UserStatusType } from '../../../domain/auth/entities/User.js';
import { Pin } from '../../../domain/auth/value-objects/Pin.js';
import { IUserRepository } from '../../../domain/auth/repositories/IUserRepository.js';

function toDomain(raw: any): User {
  return new User({
    id: raw.id,
    name: raw.name,
    role: (raw.role?.name || raw.roleId || 'ADMIN') as UserRole,
    pin: Pin.createFromHash(raw.pinHash),
    status: raw.status as UserStatusType,
    failedAttempts: raw.failedAttempts,
    createdAt: raw.createdAt,
  });
}

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  public async findById(id: string): Promise<User | null> {
    const raw = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });
    return raw ? toDomain(raw) : null;
  }

  public async findAll(): Promise<User[]> {
    const rows = await this.prisma.user.findMany({
      include: { role: true },
    });
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
        pinHash: user.pin.getHash(),
        status: user.status,
        failedAttempts: user.failedAttempts,
      },
    });
  }
}
