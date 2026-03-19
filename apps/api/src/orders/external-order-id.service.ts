import { Injectable } from '@nestjs/common';
import { StorePlatform } from '@adresles/prisma-db';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExternalOrderIdService {
  constructor(private readonly prisma: PrismaService) {}

  async generate(storeId: string): Promise<string> {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
      select: { platform: true },
    });

    if (!store) return `SIM-${Date.now()}`;

    switch (store.platform) {
      case StorePlatform.WOOCOMMERCE:
        return this.generateWooCommerce(storeId);
      case StorePlatform.SHOPIFY:
        return this.generateShopify(storeId);
      case StorePlatform.PRESTASHOP:
        return this.generatePrestaShop(storeId);
      default:
        return `SIM-${Date.now()}`;
    }
  }

  private async generateWooCommerce(storeId: string): Promise<string> {
    const orders = await this.prisma.order.findMany({
      where: { storeId },
      select: { externalOrderId: true },
    });

    const numericIds = orders
      .map((o) => o.externalOrderId)
      .filter((id) => /^\d+$/.test(id))
      .map((id) => parseInt(id, 10));

    if (numericIds.length === 0) return '100';

    const max = Math.max(...numericIds);
    const delta = Math.floor(Math.random() * 5) + 1;
    return String(max + delta);
  }

  private async generateShopify(storeId: string): Promise<string> {
    const latest = await this.prisma.order.findFirst({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
      select: { externalOrderId: true },
    });

    if (!latest) return '1001';

    const match = latest.externalOrderId.match(/^(.*?)(\d{4,})(.*)$/);
    if (!match) return '1001';

    const prefix = match[1];
    const numStr = match[2];
    const suffix = match[3];

    const incremented = parseInt(numStr, 10) + 1;
    const padded = String(incremented).padStart(numStr.length, '0');

    return `${prefix}${padded}${suffix}`;
  }

  private async generatePrestaShop(storeId: string): Promise<string> {
    const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const LENGTH = 9;

    for (let attempt = 0; attempt < 10; attempt++) {
      let candidate = '';
      for (let i = 0; i < LENGTH; i++) {
        candidate += CHARS[Math.floor(Math.random() * CHARS.length)];
      }

      const existing = await this.prisma.order.findFirst({
        where: { storeId, externalOrderId: candidate },
        select: { id: true },
      });

      if (!existing) return candidate;
    }

    throw new Error(
      `No se pudo generar un externalOrderId único para la tienda PRESTASHOP ${storeId} tras 10 intentos`,
    );
  }
}
