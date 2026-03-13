import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMockOrderDto, MockAddressDto } from '../mock/dto/create-mock-order.dto';
import { calculateFee } from '../shared/fee.utils';
import { OrderStatus, StatusSource } from '@adresles/prisma-db';

export interface CreateAddressOptions {
  address: MockAddressDto;
  recipientPhoneId: string;
  recipientName: string;
}

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async createFromMock(
    dto: CreateMockOrderDto,
    storeId: string,
    userId: string,
    options: {
      initialStatus: OrderStatus;
      orderMode: 'TRADITIONAL' | 'ADRESLES';
      createAddress?: CreateAddressOptions;
    },
  ) {
    const { percentage, amount: feeAmount } = calculateFee(dto.total_amount);
    const now = new Date();
    const isAddressReady = options.initialStatus === 'READY_TO_PROCESS';

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
        orderMode: options.orderMode,
        paymentType: 'OTHER',
        isGift: false,
        itemsSummary: dto.items ? (dto.items as object) : undefined,
        webhookReceivedAt: now,
        addressConfirmedAt: isAddressReady ? now : undefined,
        syncedAt: isAddressReady ? now : undefined,
        statusSource: isAddressReady ? StatusSource.STORE : undefined,
      },
    });

    if (options.createAddress) {
      const { address, recipientPhoneId, recipientName } = options.createAddress;
      await this.prisma.orderAddress.create({
        data: {
          orderId: order.id,
          recipientType: 'BUYER',
          recipientName,
          recipientPhoneId,
          fullAddress: address.full_address,
          street: address.street,
          number: address.number,
          block: address.block,
          staircase: address.staircase,
          floor: address.floor,
          door: address.door,
          additionalInfo: address.additional_info,
          postalCode: address.postal_code,
          city: address.city,
          province: address.province,
          country: address.country,
          addressOrigin: 'STORE_TRADITIONAL',
          confirmedAt: now,
          confirmedVia: 'MANUAL',
        },
      });
    }

    return order;
  }

  async createAddressFromConversation(params: {
    orderId: string;
    recipientPhoneId: string;
    recipientName: string;
    address: {
      street: string;
      number?: string | null;
      block?: string | null;
      staircase?: string | null;
      floor?: string | null;
      door?: string | null;
      additionalInfo?: string | null;
      postalCode: string;
      city: string;
      province?: string | null;
      country: string;
      fullAddress: string;
      gmapsPlaceId?: string | null;
    };
  }) {
    const now = new Date();
    return this.prisma.orderAddress.create({
      data: {
        orderId: params.orderId,
        recipientType: 'BUYER',
        recipientName: params.recipientName,
        recipientPhoneId: params.recipientPhoneId,
        fullAddress: params.address.fullAddress,
        street: params.address.street,
        number: params.address.number ?? undefined,
        block: params.address.block ?? undefined,
        staircase: params.address.staircase ?? undefined,
        floor: params.address.floor ?? undefined,
        door: params.address.door ?? undefined,
        additionalInfo: params.address.additionalInfo ?? undefined,
        postalCode: params.address.postalCode,
        city: params.address.city,
        province: params.address.province ?? undefined,
        country: params.address.country,
        gmapsPlaceId: params.address.gmapsPlaceId ?? undefined,
        addressOrigin: 'USER_CONVERSATION',
        confirmedAt: now,
        confirmedVia: 'CONVERSATION',
      },
    });
  }

  async updateStatus(
    orderId: string,
    status: OrderStatus,
    options?: { addressConfirmedAt?: Date; syncedAt?: Date; statusSource?: StatusSource },
  ) {
    return this.prisma.order.update({
      where: { id: orderId },
      data: { status, ...options },
    });
  }
}
