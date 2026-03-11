import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueueService } from '../queue/queue.service';
import { ConversationType, UserType } from '@prisma/client';

@Injectable()
export class ConversationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queue: QueueService,
  ) {}

  async createAndEnqueue(params: {
    orderId: string;
    userId: string;
    conversationType: ConversationType;
    userType: UserType;
    isRegisteredAdresles?: boolean;
    hasAddressAdresles?: boolean;
  }) {
    const conversation = await this.prisma.conversation.create({
      data: {
        orderId: params.orderId,
        userId: params.userId,
        conversationType: params.conversationType,
        userType: params.userType,
        isRegisteredAdresles: params.isRegisteredAdresles ?? false,
        hasAddressAdresles: params.hasAddressAdresles ?? false,
      },
    });

    await this.queue.addProcessConversationJob({
      conversationId: conversation.id,
      orderId: params.orderId,
      userId: params.userId,
      conversationType: params.conversationType,
    });

    return conversation;
  }
}
