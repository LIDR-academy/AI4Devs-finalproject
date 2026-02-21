import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MockBuyerDto } from '../mock/dto/create-mock-order.dto';

interface PhoneData {
  e164: string;
  countryCallingCode: string;
  nationalNumber: string;
  isValid: boolean;
  country?: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findOrCreateByPhone(buyer: MockBuyerDto): Promise<{ id: string; phoneId: string }> {
    const phoneData = this.parsePhone(buyer.phone);

    let phone = await this.prisma.phone.findUnique({
      where: { e164: phoneData.e164 },
    });

    if (!phone) {
      phone = await this.prisma.phone.create({ data: phoneData });
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { phoneId: phone.id },
    });

    if (existingUser) {
      await this.prisma.user.update({
        where: { id: existingUser.id },
        data: {
          firstName: buyer.first_name,
          lastName: buyer.last_name,
          email: buyer.email ?? existingUser.email,
          lastInteractionAt: new Date(),
        },
      });
      return { id: existingUser.id, phoneId: phone.id };
    }

    const user = await this.prisma.user.create({
      data: {
        phoneId: phone.id,
        firstName: buyer.first_name,
        lastName: buyer.last_name,
        email: buyer.email,
      },
    });

    return { id: user.id, phoneId: phone.id };
  }

  private parsePhone(phone: string): PhoneData {
    const e164 = phone.startsWith('+') ? phone : `+${phone}`;

    const countryPrefixes: Array<{ prefix: string; code: string; country: string }> = [
      { prefix: '+34', code: '34', country: 'ES' },
      { prefix: '+33', code: '33', country: 'FR' },
      { prefix: '+39', code: '39', country: 'IT' },
      { prefix: '+49', code: '49', country: 'DE' },
      { prefix: '+44', code: '44', country: 'GB' },
      { prefix: '+1', code: '1', country: 'US' },
      { prefix: '+351', code: '351', country: 'PT' },
    ];

    const match = countryPrefixes.find((p) => e164.startsWith(p.prefix));
    const countryCallingCode = match?.code ?? e164.slice(1, 3);
    const country = match?.country;
    const nationalNumber = e164.slice(1 + countryCallingCode.length);
    const isValid = /^\+\d{7,15}$/.test(e164);

    return { e164, countryCallingCode, nationalNumber, isValid, country };
  }
}
