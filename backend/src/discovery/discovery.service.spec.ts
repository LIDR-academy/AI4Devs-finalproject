import { Prisma } from '@prisma/client';
import { DiscoveryService } from './discovery.service';
import { BusinessService } from '../business/business.service';
import { PrismaService } from '../prisma/prisma.service';

function transactionMock() {
  const discoveryResponses = { upsert: jest.fn().mockResolvedValue({ id: 'discovery-id' }) };
  const businessProfile = { upsert: jest.fn().mockResolvedValue({ id: 'profile-id', status: 'NORMALIZED' }) };
  const transaction = { discoveryResponses, businessProfile } as unknown as Prisma.TransactionClient;
  const prisma = {
    $transaction: jest.fn(async (callback: (client: Prisma.TransactionClient) => Promise<unknown>) => callback(transaction)),
  } as unknown as PrismaService;
  return { prisma, transaction, discoveryResponses, businessProfile };
}

describe('DiscoveryService', () => {
  it('persists validated responses and associates the normalized profile with the owned business', async () => {
    const { prisma, transaction, discoveryResponses, businessProfile } = transactionMock();
    const businessService = { getOwned: jest.fn().mockResolvedValue({ id: 'business-id' }) } as unknown as BusinessService;
    const service = new DiscoveryService(prisma, businessService);

    await expect(service.submit('owner-id', {
      businessId: 'business-id',
      businessName: ' Cafe ',
      category: ' Cafe ',
      services: ['Coffee'],
      products: [],
      targetAudience: 'People nearby',
      tone: 'Friendly',
      location: 'Madrid',
      gdprConsent: true,
    })).resolves.toEqual({ id: 'profile-id', status: 'NORMALIZED' });

    expect(businessService.getOwned).toHaveBeenCalledWith('owner-id', 'business-id');
    expect(discoveryResponses.upsert).toHaveBeenCalledWith(expect.objectContaining({
      where: { businessId: 'business-id' },
      create: expect.objectContaining({ businessId: 'business-id', responses: expect.objectContaining({ businessName: ' Cafe ' }) }),
    }));
    expect(businessProfile.upsert).toHaveBeenCalledWith(expect.objectContaining({
      where: { businessId: 'business-id' },
      create: expect.objectContaining({ businessId: 'business-id', status: 'NORMALIZED' }),
    }));
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(transaction).toBeDefined();
  });

  it('does not persist data when the business is not owned by the user', async () => {
    const { prisma, discoveryResponses, businessProfile } = transactionMock();
    const businessService = { getOwned: jest.fn().mockRejectedValue(new Error('Business not found')) } as unknown as BusinessService;
    const service = new DiscoveryService(prisma, businessService);

    await expect(service.submit('other-owner-id', {
      businessId: 'business-id', businessName: 'Cafe', category: 'Cafe', services: ['Coffee'],
      targetAudience: 'People nearby', tone: 'Friendly', location: 'Madrid', gdprConsent: true,
    })).rejects.toThrow('Business not found');
    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(discoveryResponses.upsert).not.toHaveBeenCalled();
    expect(businessProfile.upsert).not.toHaveBeenCalled();
  });
});
