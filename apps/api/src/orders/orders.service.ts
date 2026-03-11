import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMockOrderDto, MockAddressDto } from '../mock/dto/create-mock-order.dto';
import { calculateFee } from '../shared/fee.utils';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async createFromMock(
    dto: CreateMockOrderDto,
    storeId: string,
    userId: string,
    options: { initialStatus: OrderStatus; createAddress?: MockAddressDto },
  ) {
    const { percentage, amount: feeAmount } = calculateFee(dto.total_amount);
    const now = new Date();

    const order = await this.prisma.order.create({
      data: {
        storeId,
        userId,
        externalOrderId: dto.external_order_id,
        externalOrderNumber: dto.external_order_number,
        totalAmount: dto.total_amount,
        currency: dto.currency,
        feePercentage: percentage,
        feeAmount,
        status: options.initialStatus,
        isGift: false,
        itemsSummary: dto.items ? (dto.items as object) : undefined,
        webhookReceivedAt: now,
        addressConfirmedAt: options.initialStatus === 'ADDRESS_CONFIRMED' ? now : undefined,
      },
    });

    if (options.createAddress) {
      await this.prisma.orderAddress.create({
        data: {
          orderId: order.id,
          recipientType: 'BUYER',
          recipientName: `${dto.buyer.first_name} ${dto.buyer.last_name}`,
          recipientPhone: dto.buyer.phone,
          fullAddress: options.createAddress.full_address,
          street: options.createAddress.street,
          number: options.createAddress.number,
          block: options.createAddress.block,
          staircase: options.createAddress.staircase,
          floor: options.createAddress.floor,
          door: options.createAddress.door,
          additionalInfo: options.createAddress.additional_info,
          postalCode: options.createAddress.postal_code,
          city: options.createAddress.city,
          province: options.createAddress.province,
          country: options.createAddress.country,
          confirmedAt: now,
          confirmedVia: 'MANUAL',
        },
      });
    }

    return order;
  }

  async updateStatus(orderId: string, status: OrderStatus, timestamps?: { addressConfirmedAt?: Date; syncedAt?: Date }) {
    return this.prisma.order.update({
      where: { id: orderId },
      data: { status, ...timestamps },
    });
  }
}
