import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MockConversationsService } from '../mock/mock-conversations.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mockConversations: MockConversationsService,
  ) {}

  async getOrders(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        include: {
          store: true,
          user: { include: { phone: true } },
          conversations: { select: { id: true } },
        },
        orderBy: { webhookReceivedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count(),
    ]);

    return { data, meta: { page, limit, total } };
  }

  async getUsers(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where: { isDeleted: false },
        include: {
          phone: true,
          _count: { select: { orders: true, addresses: true } },
        },
        orderBy: { lastInteractionAt: { sort: 'desc', nulls: 'last' } },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where: { isDeleted: false } }),
    ]);

    return { data, meta: { page, limit, total } };
  }

  async getConversationMessages(conversationId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        order: {
          select: { externalOrderNumber: true, externalOrderId: true },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException(`Conversation ${conversationId} not found`);
    }

    const messages =
      await this.mockConversations.getConversationHistory(conversationId);

    return {
      conversationId,
      conversation: {
        type: conversation.conversationType,
        status: conversation.status,
        startedAt: conversation.startedAt,
        completedAt: conversation.completedAt,
        order: {
          externalOrderNumber:
            conversation.order.externalOrderNumber ??
            conversation.order.externalOrderId,
        },
      },
      messages: messages.map((m) => ({
        messageId: m.messageId,
        role: m.role,
        content: m.content,
        timestamp: m.timestamp,
        expiresAt: m.expiresAt,
      })),
    };
  }
}
