import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MockBuyerDto } from '../mock/dto/create-mock-order.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findOrCreateByPhone(buyer: MockBuyerDto): Promise<{ id: string }> {
    const phoneCountry = this.extractPhoneCountry(buyer.phone);
    const existing = await this.prisma.user.findUnique({
      where: { phone: buyer.phone },
    });
    if (existing) {
      await this.prisma.user.update({
        where: { id: existing.id },
        data: {
          firstName: buyer.first_name,
          lastName: buyer.last_name,
          email: buyer.email ?? existing.email,
          lastInteractionAt: new Date(),
        },
      });
      return { id: existing.id };
    }
    const user = await this.prisma.user.create({
      data: {
        phone: buyer.phone,
        phoneCountry,
        firstName: buyer.first_name,
        lastName: buyer.last_name,
        email: buyer.email,
      },
    });
    return { id: user.id };
  }

  private extractPhoneCountry(phone: string): string {
    if (phone.startsWith('+34')) return 'ES';
    if (phone.startsWith('+33')) return 'FR';
    if (phone.startsWith('+39')) return 'IT';
    if (phone.startsWith('+49')) return 'DE';
    if (phone.startsWith('+44')) return 'GB';
    if (phone.startsWith('+')) return phone.slice(1, 3) || 'ES';
    return 'ES';
  }
}
