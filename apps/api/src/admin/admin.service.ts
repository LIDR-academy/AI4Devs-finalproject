import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MockConversationsService } from '../mock/mock-conversations.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mockConversations: MockConversationsService,
  ) {}

  private readonly validSortColumns = ['ref', 'store', 'user', 'amount', 'date'];

  async getOrders(
    page: number,
    limit: number,
    sortBy?: string,
    sortDir?: string,
  ) {
    const skip = (page - 1) * limit;
    const isValidSort = sortBy !== undefined && this.validSortColumns.includes(sortBy);
    const resolvedSort = isValidSort ? sortBy : 'date';
    const dir: 'asc' | 'desc' = isValidSort
      ? sortDir === 'asc' ? 'asc' : 'desc'
      : 'desc';
    const orderBy = this.buildOrderBy(resolvedSort, dir);

    const [data, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        include: {
          store: true,
          user: { include: { phone: true } },
          conversations: { select: { id: true } },
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.order.count(),
    ]);

    return { data, meta: { page, limit, total } };
  }

  private buildOrderBy(sortBy: string | undefined, dir: 'asc' | 'desc') {
    const refSort = { externalOrderNumber: { sort: dir, nulls: 'last' as const } };

    switch (sortBy) {
      case 'ref':
        return [refSort];
      case 'store':
        return [{ store: { name: dir } }, refSort];
      case 'user':
        return [{ user: { firstName: dir } }, { user: { lastName: dir } }];
      case 'amount':
        return [{ totalAmount: dir }];
      case 'date':
      default:
        return [{ webhookReceivedAt: dir }];
    }
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
