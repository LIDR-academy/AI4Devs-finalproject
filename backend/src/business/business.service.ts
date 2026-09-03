import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBusinessDto } from './dto/create-business.dto';

@Injectable()
export class BusinessService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateBusinessDto) {
    return this.prisma.business.create({
      data: { userId, name: dto.name.trim() },
    });
  }

  async list(userId: string) {
    return this.prisma.business.findMany({
      where: { userId },
      include: { businessProfile: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getOwned(userId: string, businessId: string) {
    const business = await this.prisma.business.findFirst({
      where: { id: businessId, userId },
    });
    if (!business) {
      throw new NotFoundException('Business not found');
    }
    return business;
  }
}
