import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MockStoreDto } from '../mock/dto/create-mock-order.dto';

@Injectable()
export class StoresService {
  constructor(private readonly prisma: PrismaService) {}

  async findOrCreateStore(storeDto: MockStoreDto): Promise<{ id: string }> {
    const existing = await this.prisma.store.findUnique({
      where: { url: storeDto.url },
    });
    if (existing) {
      return { id: existing.id };
    }
    const ecommerce = await this.prisma.ecommerce.findFirst();
    if (!ecommerce) {
      const newEcommerce = await this.prisma.ecommerce.create({
        data: {
          taxId: `MOCK-${Date.now()}`,
          legalName: 'Mock eCommerce',
          commercialName: storeDto.name,
          email: 'mock@adresles.local',
          country: 'ES',
          status: 'ACTIVE',
        },
      });
      const store = await this.prisma.store.create({
        data: {
          ecommerceId: newEcommerce.id,
          url: storeDto.url,
          name: storeDto.name,
          platform: 'WOOCOMMERCE',
          defaultLanguage: 'es',
          defaultCurrency: 'EUR',
          timezone: 'Europe/Madrid',
          status: 'ACTIVE',
        },
      });
      return { id: store.id };
    }
    const store = await this.prisma.store.create({
      data: {
        ecommerceId: ecommerce.id,
        url: storeDto.url,
        name: storeDto.name,
        platform: 'WOOCOMMERCE',
        defaultLanguage: 'es',
        defaultCurrency: 'EUR',
        timezone: 'Europe/Madrid',
        status: 'ACTIVE',
      },
    });
    return { id: store.id };
  }
}
