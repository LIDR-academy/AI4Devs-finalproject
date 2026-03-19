import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MockStoreDto } from '../mock/dto/create-mock-order.dto';

// Identificador estable del ecommerce de pruebas generado automáticamente.
// Usar un taxId fijo garantiza que todos los stores mock se asocien siempre
// al mismo ecommerce, independientemente de cuántos ecommerces haya en la BD.
const MOCK_ECOMMERCE_TAX_ID = 'MOCK-ADRESLES';

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

    // upsert garantiza un único ecommerce mock identificado por taxId fijo,
    // evitando el comportamiento no determinista de findFirst() en entornos
    // con múltiples ecommerces (seeds, tests, multi-tenant futuro).
    const ecommerce = await this.prisma.ecommerce.upsert({
      where: { taxId: MOCK_ECOMMERCE_TAX_ID },
      update: {},
      create: {
        taxId: MOCK_ECOMMERCE_TAX_ID,
        legalName: 'Mock eCommerce',
        email: 'mock@adresles.local',
        country: 'ES',
        status: 'ACTIVE',
      },
    });

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
