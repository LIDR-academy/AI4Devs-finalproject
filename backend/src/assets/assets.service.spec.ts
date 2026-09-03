import { Asset, AssetType, BusinessProfile, BusinessProfileStatus } from '@prisma/client';
import { AssetsService } from './assets.service';
import { AiGenerationService } from '../ai-generation/ai-generation.service';
import { BusinessProfileService } from '../business-profile/business-profile.service';
import { PrismaService } from '../prisma/prisma.service';

function profile(): BusinessProfile {
  return {
    id: 'profile-id', businessId: 'business-id', businessName: 'Cafe', category: 'Cafe',
    services: ['Coffee'], products: [], targetAudience: 'People nearby', tone: 'Friendly', style: null,
    location: 'Madrid', phone: null, website: null, gdprConsent: true,
    status: BusinessProfileStatus.APPROVED, createdAt: new Date(), updatedAt: new Date(),
  };
}

function asset(overrides: Partial<Asset> = {}): Asset {
  return {
    id: 'asset-id', businessProfileId: 'profile-id', assetType: AssetType.BUSINESS_SUMMARY,
    title: 'Summary', content: 'Original content', status: 'READY_FOR_REVIEW',
    createdAt: new Date(), updatedAt: new Date(), ...overrides,
  };
}

describe('AssetsService', () => {
  const prisma = {
    asset: { findMany: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
  } as unknown as PrismaService;
  const profileService = {
    getOwned: jest.fn(), getApprovedOwned: jest.fn(),
  } as unknown as BusinessProfileService;
  const aiGenerationService = { regenerateOne: jest.fn() } as unknown as AiGenerationService;
  const service = new AssetsService(prisma, profileService, aiGenerationService);

  beforeEach(() => jest.clearAllMocks());

  it('lists assets for the owned profile and edits an owned asset', async () => {
    (profileService.getOwned as jest.Mock).mockResolvedValue(profile());
    (prisma.asset.findMany as jest.Mock).mockResolvedValue([asset()]);
    (prisma.asset.findFirst as jest.Mock).mockResolvedValue(asset());
    (prisma.asset.update as jest.Mock).mockResolvedValue(asset({ title: 'Edited', content: 'Updated', status: 'EDITED' }));

    await expect(service.list('owner-id', 'business-id')).resolves.toMatchObject([{ id: 'asset-id', businessProfileId: 'profile-id', assetType: AssetType.BUSINESS_SUMMARY, content: 'Original content', status: 'READY_FOR_REVIEW' }]);
    await expect(service.edit('owner-id', 'asset-id', { title: ' Edited ', content: 'Updated' })).resolves.toMatchObject({ status: 'EDITED' });
    expect(prisma.asset.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { businessProfileId: 'profile-id' } }));
    expect(prisma.asset.update).toHaveBeenCalledWith(expect.objectContaining({ data: { title: 'Edited', content: 'Updated', status: 'EDITED' } }));
  });

  it('preserves ownership and binds regeneration to the URL asset and requested type', async () => {
    const current = asset();
    (prisma.asset.findFirst as jest.Mock).mockResolvedValue(current);
    (profileService.getApprovedOwned as jest.Mock).mockResolvedValue(profile());
    (aiGenerationService.regenerateOne as jest.Mock).mockResolvedValue(current);

    await expect(service.regenerate('owner-id', 'asset-id', {
      businessId: 'business-id', assetType: AssetType.BUSINESS_SUMMARY,
    })).resolves.toEqual(current);
    expect(aiGenerationService.regenerateOne).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'profile-id', businessId: 'business-id', status: BusinessProfileStatus.APPROVED }),
      'owner-id',
      AssetType.BUSINESS_SUMMARY,
    );

    await expect(service.regenerate('owner-id', 'asset-id', {
      businessId: 'business-id', assetType: AssetType.FAQ,
    })).rejects.toThrow('does not match');
    expect(aiGenerationService.regenerateOne).toHaveBeenCalledTimes(1);
  });

  it('rejects an asset that belongs to another user', async () => {
    (prisma.asset.findFirst as jest.Mock).mockResolvedValue(null);
    await expect(service.get('other-owner-id', 'asset-id')).rejects.toThrow('Asset not found');
    expect(prisma.asset.findFirst).toHaveBeenCalledWith({
      where: { id: 'asset-id', businessProfile: { business: { userId: 'other-owner-id' } } },
    });
  });
});
