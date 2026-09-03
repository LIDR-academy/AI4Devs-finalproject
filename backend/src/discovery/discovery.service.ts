import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BusinessService } from '../business/business.service';
import { SubmitDiscoveryDto } from './dto/submit-discovery.dto';
import { normalizeDiscovery } from './normalization';

@Injectable()
export class DiscoveryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly businessService: BusinessService,
  ) {}

  async submit(userId: string, dto: SubmitDiscoveryDto) {
    await this.businessService.getOwned(userId, dto.businessId);
    const normalized = normalizeDiscovery(dto);
    const { businessId, ...rawResponses } = dto;

    return this.prisma.$transaction(async (transaction) => {
      await transaction.discoveryResponses.upsert({
        where: { businessId },
        create: { businessId, responses: rawResponses },
        update: { responses: rawResponses, submittedAt: new Date() },
      });

      return transaction.businessProfile.upsert({
        where: { businessId },
        create: { businessId, ...normalized, status: 'NORMALIZED' },
        update: { ...normalized, status: 'NORMALIZED' },
      });
    });
  }
}
