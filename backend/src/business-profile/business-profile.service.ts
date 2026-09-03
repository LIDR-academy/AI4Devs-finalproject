import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BusinessService } from '../business/business.service';

@Injectable()
export class BusinessProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly businessService: BusinessService,
  ) {}

  async getOwned(userId: string, businessId: string) {
    await this.businessService.getOwned(userId, businessId);
    const profile = await this.prisma.businessProfile.findUnique({ where: { businessId } });
    if (!profile) {
      throw new NotFoundException('Business profile not found');
    }
    return profile;
  }

  async approve(userId: string, businessId: string) {
    const profile = await this.getOwned(userId, businessId);
    if (profile.status !== 'NORMALIZED') {
      throw new UnprocessableEntityException('Only a normalized profile can be approved');
    }
    if (!profile.gdprConsent) {
      throw new UnprocessableEntityException('GDPR consent is required');
    }
    return this.prisma.businessProfile.update({
      where: { id: profile.id },
      data: { status: 'APPROVED' },
    });
  }

  async getApprovedOwned(userId: string, businessId: string) {
    const profile = await this.getOwned(userId, businessId);
    if (profile.status !== 'APPROVED') {
      throw new UnprocessableEntityException('Business profile must be approved before generation');
    }
    if (!profile.gdprConsent) {
      throw new UnprocessableEntityException('GDPR consent is required');
    }
    return profile;
  }
}
