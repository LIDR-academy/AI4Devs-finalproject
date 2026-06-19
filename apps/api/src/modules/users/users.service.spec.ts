import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { User, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let usersService: UsersService;
  let prisma: {
    user: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      count: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  const adminUser: User = {
    id: 'admin-1',
    email: 'admin@taller.com',
    passwordHash: '$2b$12$hashed',
    fullName: 'Workshop Admin',
    role: UserRole.ADMIN,
    active: true,
    refreshTokenHash: null,
    refreshTokenExpiresAt: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };

  const mechanicUser: User = {
    id: 'mechanic-1',
    email: 'mechanic@taller.com',
    passwordHash: '$2b$12$hashed',
    fullName: 'Workshop Mechanic',
    role: UserRole.MECHANIC,
    active: true,
    refreshTokenHash: 'token-hash',
    refreshTokenExpiresAt: new Date('2027-01-01'),
    createdAt: new Date('2026-01-02'),
    updatedAt: new Date('2026-01-02'),
  };

  const inactiveUser: User = {
    ...mechanicUser,
    id: 'inactive-1',
    email: 'inactive@taller.com',
    fullName: 'Inactive User',
    active: false,
  };

  beforeEach(() => {
    prisma = {
      user: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    usersService = new UsersService(prisma as unknown as PrismaService);
    jest.spyOn(bcrypt, 'hash').mockResolvedValue('$2b$12$newhash' as never);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('findAll', () => {
    it('returns users sorted active first then by fullName without sensitive fields', async () => {
      prisma.user.findMany.mockResolvedValue([adminUser, mechanicUser]);

      const result = await usersService.findAll();

      expect(prisma.user.findMany).toHaveBeenCalledWith({
        orderBy: [{ active: 'desc' }, { fullName: 'asc' }],
      });
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: adminUser.id,
        fullName: adminUser.fullName,
        email: adminUser.email,
        role: adminUser.role,
        active: true,
        createdAt: adminUser.createdAt,
        updatedAt: adminUser.updatedAt,
      });
      expect(result[0]).not.toHaveProperty('passwordHash');
      expect(result[0]).not.toHaveProperty('refreshTokenHash');
    });
  });

  describe('create', () => {
    const createDto: CreateUserDto = {
      fullName: 'New Mechanic',
      email: 'New.Mechanic@Taller.com',
      password: 'SecurePass123',
      role: UserRole.MECHANIC,
    };

    it('creates an active user with hashed password and normalized email', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        ...mechanicUser,
        id: 'new-user-1',
        email: 'new.mechanic@taller.com',
        fullName: createDto.fullName,
      });

      const result = await usersService.create(createDto, adminUser.id);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'new.mechanic@taller.com' },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(createDto.password, 12);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'new.mechanic@taller.com',
          passwordHash: '$2b$12$newhash',
          fullName: createDto.fullName,
          role: UserRole.MECHANIC,
          active: true,
        },
      });
      expect(result.active).toBe(true);
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('throws ConflictException for duplicate active email', async () => {
      prisma.user.findUnique.mockResolvedValue(mechanicUser);

      await expect(
        usersService.create(createDto, adminUser.id),
      ).rejects.toThrow(
        new ConflictException('This email is already registered'),
      );
    });

    it('throws ConflictException for duplicate inactive email', async () => {
      prisma.user.findUnique.mockResolvedValue(inactiveUser);

      await expect(
        usersService.create(createDto, adminUser.id),
      ).rejects.toThrow(
        new ConflictException('This email is already registered'),
      );
    });
  });

  describe('deactivate', () => {
    it('deactivates an active mechanic and clears refresh tokens', async () => {
      const deactivated = {
        ...mechanicUser,
        active: false,
        refreshTokenHash: null,
        refreshTokenExpiresAt: null,
        updatedAt: new Date('2026-06-01'),
      };

      prisma.$transaction.mockImplementation(
        async (callback: (tx: typeof prisma) => Promise<User>) => {
          return callback(prisma);
        },
      );
      prisma.user.findUnique.mockResolvedValue(mechanicUser);
      prisma.user.update.mockResolvedValue(deactivated);

      const result = await usersService.deactivate(
        mechanicUser.id,
        adminUser.id,
      );

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: mechanicUser.id },
        data: {
          active: false,
          refreshTokenHash: null,
          refreshTokenExpiresAt: null,
        },
      });
      expect(result.active).toBe(false);
      expect(result.updatedAt).toEqual(deactivated.updatedAt);
    });

    it('throws NotFoundException for unknown user', async () => {
      prisma.$transaction.mockImplementation(
        async (callback: (tx: typeof prisma) => Promise<User>) => {
          return callback(prisma);
        },
      );
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        usersService.deactivate('unknown-id', adminUser.id),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ConflictException when user is already inactive', async () => {
      prisma.$transaction.mockImplementation(
        async (callback: (tx: typeof prisma) => Promise<User>) => {
          return callback(prisma);
        },
      );
      prisma.user.findUnique.mockResolvedValue(inactiveUser);

      await expect(
        usersService.deactivate(inactiveUser.id, adminUser.id),
      ).rejects.toThrow(new ConflictException('User is already inactive'));
    });

    it('throws BadRequestException when deactivating own account', async () => {
      prisma.$transaction.mockImplementation(
        async (callback: (tx: typeof prisma) => Promise<User>) => {
          return callback(prisma);
        },
      );
      prisma.user.findUnique.mockResolvedValue(adminUser);

      await expect(
        usersService.deactivate(adminUser.id, adminUser.id),
      ).rejects.toThrow(
        new BadRequestException('You cannot deactivate your own account'),
      );
    });

    it('throws BadRequestException when deactivating the last active admin', async () => {
      prisma.$transaction.mockImplementation(
        async (callback: (tx: typeof prisma) => Promise<User>) => {
          return callback(prisma);
        },
      );
      prisma.user.findUnique.mockResolvedValue(adminUser);
      prisma.user.count.mockResolvedValue(0);

      await expect(
        usersService.deactivate(adminUser.id, 'other-admin-id'),
      ).rejects.toThrow(
        new BadRequestException(
          'At least one active administrator is required',
        ),
      );
    });
  });

  describe('countActiveAdmins', () => {
    it('counts active admins excluding optional user id', async () => {
      prisma.user.count.mockResolvedValue(1);

      const count = await usersService.countActiveAdmins('exclude-id');

      expect(prisma.user.count).toHaveBeenCalledWith({
        where: {
          role: UserRole.ADMIN,
          active: true,
          id: { not: 'exclude-id' },
        },
      });
      expect(count).toBe(1);
    });
  });
});
