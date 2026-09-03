import { Business } from '@prisma/client';
import { BusinessService } from './business.service';
import { PrismaService } from '../prisma/prisma.service';

function business(overrides: Partial<Business> = {}): Business {
  return {
    id: 'business-id',
    userId: 'owner-id',
    name: 'Cafe',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}

describe('BusinessService', () => {
  const prisma = {
    business: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
  } as unknown as PrismaService;
  const service = new BusinessService(prisma);

  beforeEach(() => jest.clearAllMocks());

  it('creates and lists only businesses owned by the authenticated user', async () => {
    (prisma.business.create as jest.Mock).mockResolvedValue(business());
    (prisma.business.findMany as jest.Mock).mockResolvedValue([business()]);

    await expect(service.create('owner-id', { name: ' Cafe ' })).resolves.toEqual(business());
    await expect(service.list('owner-id')).resolves.toEqual([business()]);
    expect(prisma.business.create).toHaveBeenCalledWith({ data: { userId: 'owner-id', name: 'Cafe' } });
    expect(prisma.business.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { userId: 'owner-id' } }));
  });

  it('does not allow an owner to retrieve another user business', async () => {
    (prisma.business.findFirst as jest.Mock).mockResolvedValue(null);
    await expect(service.getOwned('other-owner-id', 'business-id')).rejects.toThrow('Business not found');
    expect(prisma.business.findFirst).toHaveBeenCalledWith({ where: { id: 'business-id', userId: 'other-owner-id' } });
  });
});
