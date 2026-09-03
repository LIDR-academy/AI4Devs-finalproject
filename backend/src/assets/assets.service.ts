import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BusinessProfileService } from '../business-profile/business-profile.service';
import { AiGenerationService } from '../ai-generation/ai-generation.service';
import { EditAssetDto } from './dto/edit-asset.dto';
import { GenerateAssetsDto } from './dto/generate-assets.dto';
import { RegenerateAssetDto } from './dto/regenerate-asset.dto';

@Injectable()
export class AssetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly profileService: BusinessProfileService,
    private readonly aiGenerationService: AiGenerationService,
  ) {}

  async generate(userId: string, dto: GenerateAssetsDto) {
    const profile = await this.profileService.getApprovedOwned(userId, dto.businessId);
    return this.aiGenerationService.generateAll(profile, userId);
  }

  async list(userId: string, businessId: string) {
    const profile = await this.profileService.getOwned(userId, businessId);
    return this.prisma.asset.findMany({
      where: { businessProfileId: profile.id },
      orderBy: { assetType: 'asc' },
    });
  }

  async get(userId: string, assetId: string) {
    const asset = await this.prisma.asset.findFirst({
      where: {
        id: assetId,
        businessProfile: { business: { userId } },
      },
    });
    if (!asset) {
      throw new NotFoundException('Asset not found');
    }
    return asset;
  }

  async edit(userId: string, assetId: string, dto: EditAssetDto) {
    const asset = await this.get(userId, assetId);
    return this.prisma.asset.update({
      where: { id: asset.id },
      data: {
        title: dto.title?.trim() ?? asset.title,
        content: dto.content.trim(),
        status: 'EDITED',
      },
    });
  }

  async regenerate(userId: string, assetId: string, dto: RegenerateAssetDto) {
    const currentAsset = await this.get(userId, assetId);
    const profile = await this.profileService.getApprovedOwned(userId, dto.businessId);
    if (currentAsset.businessProfileId !== profile.id || currentAsset.assetType !== dto.assetType) {
      throw new UnprocessableEntityException('Asset does not match the requested business and type');
    }
    return this.aiGenerationService.regenerateOne(profile, userId, dto.assetType);
  }
}
