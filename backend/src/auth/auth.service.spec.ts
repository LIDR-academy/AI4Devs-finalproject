import { User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

function user(overrides: Partial<User> = {}): User {
  return {
    id: 'user-id',
    email: 'owner@example.com',
    name: 'Owner',
    passwordHash: 'stored-hash',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}

describe('AuthService', () => {
  const prisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findUniqueOrThrow: jest.fn(),
    },
  } as unknown as PrismaService;
  const jwtService = { sign: jest.fn().mockReturnValue('signed-token') } as unknown as JwtService;
  const service = new AuthService(prisma, jwtService);

  beforeEach(() => jest.clearAllMocks());

  it('hashes the password and never returns it during registration', async () => {
    const created = user({ email: 'owner@example.com', passwordHash: await bcrypt.hash('correct-password', 4) });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.user.create as jest.Mock).mockResolvedValue(created);

    const result = await service.register({ email: ' Owner@Example.com ', name: ' Owner ', password: 'correct-password' });

    expect(prisma.user.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ email: 'owner@example.com', name: 'Owner' }),
    }));
    const passwordHash = (prisma.user.create as jest.Mock).mock.calls[0][0].data.passwordHash;
    expect(passwordHash).not.toBe('correct-password');
    await expect(bcrypt.compare('correct-password', passwordHash)).resolves.toBe(true);
    expect(result).toEqual({ accessToken: 'signed-token', user: { id: 'user-id', email: 'owner@example.com', name: 'Owner' } });
  });

  it('logs in with valid credentials and rejects invalid credentials', async () => {
    const passwordHash = await bcrypt.hash('correct-password', 4);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(user({ passwordHash }));

    await expect(service.login({ email: 'OWNER@example.com', password: 'correct-password' })).resolves.toEqual({
      accessToken: 'signed-token',
      user: { id: 'user-id', email: 'owner@example.com', name: 'Owner' },
    });
    await expect(service.login({ email: 'owner@example.com', password: 'wrong-password' })).rejects.toThrow('Invalid email or password');
  });
});
