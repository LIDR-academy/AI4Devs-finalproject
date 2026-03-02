import { Injectable, BadRequestException } from '@nestjs/common';
import { StoresService } from '../stores/stores.service';
import { UsersService } from '../users/users.service';
import { OrdersService } from '../orders/orders.service';
import { ConversationsService } from '../conversations/conversations.service';
import { EcommerceSyncService } from '../ecommerce-sync/ecommerce-sync.service';
import { CreateMockOrderDto } from './dto/create-mock-order.dto';
import { ConversationType, UserType } from '@prisma/client';

export interface MockOrderResult {
  order_id: string;
  conversation_id: string;
}

@Injectable()
export class MockOrdersService {
  constructor(
    private readonly stores: StoresService,
    private readonly users: UsersService,
    private readonly orders: OrdersService,
    private readonly conversations: ConversationsService,
    private readonly ecommerceSync: EcommerceSyncService,
  ) {}

  async processMockOrder(dto: CreateMockOrderDto): Promise<MockOrderResult> {
    if (dto.mode === 'tradicional' && !dto.address) {
      throw new BadRequestException('Address is required when mode is tradicional');
    }

    const { id: storeId } = await this.stores.findOrCreateStore(dto.store);
    const { id: userId, phoneId } = await this.users.findOrCreateByPhone(dto.buyer);

    if (dto.mode === 'tradicional' && dto.address) {
      return this.processTraditionalOrder(dto, storeId, userId, phoneId);
    }

    return this.processAdreslesOrder(dto, storeId, userId);
  }

  private async processAdreslesOrder(
    dto: CreateMockOrderDto,
    storeId: string,
    userId: string,
  ): Promise<MockOrderResult> {
    const order = await this.orders.createFromMock(dto, storeId, userId, {
      initialStatus: 'PENDING_ADDRESS',
      orderMode: 'ADRESLES',
    });

    const conversation = await this.conversations.createAndEnqueue({
      orderId: order.id,
      userId,
      conversationType: 'GET_ADDRESS',
      userType: UserType.BUYER,
      context: {
        buyerRegisteredEcommerce: dto.buyer_registered_ecommerce ?? false,
        buyerEcommerceAddress: dto.buyer_ecommerce_address ?? null,
        giftRecipient: dto.gift_recipient ?? null,
      },
    });

    return { order_id: order.id, conversation_id: conversation.id };
  }

  private async processTraditionalOrder(
    dto: CreateMockOrderDto,
    storeId: string,
    userId: string,
    phoneId: string,
  ): Promise<MockOrderResult> {
    if (!dto.address) throw new BadRequestException('Address required for traditional mode');

    const order = await this.orders.createFromMock(dto, storeId, userId, {
      initialStatus: 'READY_TO_PROCESS',
      orderMode: 'TRADITIONAL',
      createAddress: {
        address: dto.address,
        recipientPhoneId: phoneId,
        recipientName: `${dto.buyer.first_name} ${dto.buyer.last_name}`,
      },
    });

    const conversation = await this.conversations.createAndEnqueue({
      orderId: order.id,
      userId,
      conversationType: ConversationType.INFORMATION,
      userType: UserType.BUYER,
    });

    this.ecommerceSync.simulateSync(order.id, {
      orderId: order.id,
      fullAddress: dto.address.full_address,
      recipientName: `${dto.buyer.first_name} ${dto.buyer.last_name}`,
      recipientPhone: dto.buyer.phone,
    });

    return { order_id: order.id, conversation_id: conversation.id };
  }
}
