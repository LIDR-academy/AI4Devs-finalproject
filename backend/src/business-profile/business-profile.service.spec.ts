import { BusinessProfile, BusinessProfileStatus } from '@prisma/client';
import { BusinessProfileService } from './business-profile.service';
import { BusinessService } from '../business/business.service';
import { PrismaService } from '../prisma/prisma.service';

function profile(overrides: Partial<BusinessProfile> = {}): BusinessProfile {
  return {
    id: 'profile-id',
    businessId: 'business-id',
    businessName: 'Cafe',
    category: 'Cafe',
    services: ['Coffee'],
    products: [],
    targetAudience: 'People nearby',
    tone: 'Friendly',
    style: null,
    location: 'Madrid',
    phone: null,
    website: null,
    gdprConsent: true,
    status: BusinessProfileStatus.NORMALIZED,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}

describe('BusinessProfileService', () => {
  const businessService = { getOwned: jest.fn() } as unknown as BusinessService;
  const prisma = {
    businessProfile: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  } as unknown as PrismaService;
  const service = new BusinessProfileService(prisma, businessService);

  beforeEach(() => {
    jest.clearAllMocks();
    (businessService.getOwned as jest.Mock).mockResolvedValue({ id: 'business-id' });
  });

  it('retrieves and approves a normalized owned profile', async () => {
    (prisma.businessProfile.findUnique as jest.Mock).mockResolvedValue(profile());
    (prisma.businessProfile.update as jest.Mock).mockResolvedValue(profile({ status: BusinessProfileStatus.APPROVED }));

    await expect(service.approve('owner-id', 'business-id')).resolves.toMatchObject({ status: 'APPROVED' });
    expect(businessService.getOwned).toHaveBeenCalledWith('owner-id', 'business-id');
    expect(prisma.businessProfile.update).toHaveBeenCalledWith({ where: { id: 'profile-id' }, data: { status: 'APPROVED' } });
  });

  it('blocks approval and generation until the profile is approved', async () => {
    (prisma.businessProfile.findUnique as jest.Mock).mockResolvedValue(profile({ status: BusinessProfileStatus.DRAFT }));
    await expect(service.approve('owner-id', 'business-id')).rejects.toThrow('Only a normalized profile can be approved');
    await expect(service.getApprovedOwned('owner-id', 'business-id')).rejects.toThrow('Business profile must be approved');
  });

  it('requires consent before approval', async () => {
    (prisma.businessProfile.findUnique as jest.Mock).mockResolvedValue(profile({ gdprConsent: false }));
    await expect(service.approve('owner-id', 'business-id')).rejects.toThrow('GDPR consent is required');
  });
});
