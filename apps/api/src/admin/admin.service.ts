import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, StorePlatform } from '@adresles/prisma-db';
import { PrismaService } from '../prisma/prisma.service';
import { MockConversationsService } from '../mock/mock-conversations.service';

export interface GetOrdersParams {
  sortBy?: string;
  sortDir?: string;
  q?: string;
  status?: string;
  mode?: string;
  from?: string;
  to?: string;
}

export interface GetUsersParams {
  sortBy?: string;
  sortDir?: string;
  q?: string;
  registered?: string;
}

export interface SimulateStore {
  id: string;
  name: string;
  url: string;
  platform: StorePlatform;
  ecommerceName: string;
}

const VALID_STATUSES = [
  'PENDING_PAYMENT',
  'PENDING_ADDRESS',
  'READY_TO_PROCESS',
  'COMPLETED',
  'CANCELED',
] as const;

const VALID_MODES = ['TRADITIONAL', 'ADRESLES'] as const;

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mockConversations: MockConversationsService,
  ) {}

  private readonly validSortColumns = ['ref', 'store', 'user', 'amount', 'date'];

  private readonly validUserSortColumns = ['name', 'email', 'orders', 'addresses', 'lastInteraction'];

  async getOrders(
    page: number,
    limit: number,
    params: GetOrdersParams = {},
  ) {
    const skip = (page - 1) * limit;
    const isValidSort =
      params.sortBy !== undefined &&
      this.validSortColumns.includes(params.sortBy);
    const resolvedSort = isValidSort ? params.sortBy : 'date';
    const dir: 'asc' | 'desc' = isValidSort
      ? params.sortDir === 'asc'
        ? 'asc'
        : 'desc'
      : 'desc';
    const orderBy = this.buildOrderBy(resolvedSort, dir);
    const where = this.buildWhere(params);

    const [data, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        include: {
          store: true,
          user: { include: { phone: true } },
          conversations: { select: { id: true } },
        },
        where,
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);

    return { data, meta: { page, limit, total } };
  }

  private buildWhere(params: GetOrdersParams): Prisma.OrderWhereInput {
    const conditions: Prisma.OrderWhereInput[] = [];

    if (params.q && params.q.trim()) {
      const q = params.q.trim();
      conditions.push({
        OR: [
          { store: { name: { contains: q, mode: 'insensitive' } } },
          { externalOrderNumber: { contains: q, mode: 'insensitive' } },
          { user: { firstName: { contains: q, mode: 'insensitive' } } },
          { user: { lastName: { contains: q, mode: 'insensitive' } } },
        ],
      });
    }

    if (params.status) {
      const validStatuses = params.status
        .split(',')
        .map((s) => s.trim())
        .filter((s) => (VALID_STATUSES as readonly string[]).includes(s));
      if (validStatuses.length > 0) {
        conditions.push({ status: { in: validStatuses as any } });
      }
    }

    if (params.mode) {
      const validModes = params.mode
        .split(',')
        .map((m) => m.trim())
        .filter((m) => (VALID_MODES as readonly string[]).includes(m));
      if (validModes.length > 0) {
        conditions.push({ orderMode: { in: validModes as any } });
      }
    }

    if (params.from || params.to) {
      const dateFilter: Prisma.DateTimeFilter = {};
      if (params.from) {
        dateFilter.gte = new Date(`${params.from}T00:00:00.000Z`);
      }
      if (params.to) {
        dateFilter.lte = new Date(`${params.to}T23:59:59.999Z`);
      }
      conditions.push({ webhookReceivedAt: dateFilter });
    }

    return conditions.length > 0 ? { AND: conditions } : {};
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

  async getUsers(page: number, limit: number, params: GetUsersParams = {}) {
    const skip = (page - 1) * limit;
    const isValidSort =
      params.sortBy !== undefined &&
      this.validUserSortColumns.includes(params.sortBy);
    const resolvedSort = isValidSort ? params.sortBy! : 'lastInteraction';
    const dir: 'asc' | 'desc' =
      isValidSort ? (params.sortDir === 'asc' ? 'asc' : 'desc') : 'desc';
    const orderBy = this.buildUsersOrderBy(resolvedSort, dir);
    const where = this.buildUsersWhere(params);

    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        include: {
          phone: true,
          _count: { select: { orders: true, addresses: true } },
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data, meta: { page, limit, total } };
  }

  private buildUsersOrderBy(sortBy: string, dir: 'asc' | 'desc') {
    switch (sortBy) {
      case 'name':
        return [
          { firstName: { sort: dir, nulls: 'last' as const } },
          { lastName: { sort: dir, nulls: 'last' as const } },
        ];
      case 'email':
        return [{ email: { sort: dir, nulls: 'last' as const } }];
      case 'orders':
        return [{ orders: { _count: dir } }];
      case 'addresses':
        return [{ addresses: { _count: dir } }];
      case 'lastInteraction':
      default:
        return [{ lastInteractionAt: { sort: dir, nulls: 'last' as const } }];
    }
  }

  private buildUsersWhere(params: GetUsersParams): Prisma.UserWhereInput {
    const conditions: Prisma.UserWhereInput[] = [{ isDeleted: false }];

    if (params.q && params.q.trim()) {
      const q = params.q.trim();
      conditions.push({
        OR: [
          { firstName: { contains: q, mode: 'insensitive' } },
          { lastName: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
        ],
      });
    }

    if (params.registered === 'true') {
      conditions.push({ isRegistered: true });
    } else if (params.registered === 'false') {
      conditions.push({ isRegistered: false });
    }

    return { AND: conditions };
  }

  async getStores(): Promise<{ data: SimulateStore[] }> {
    const stores = await this.prisma.store.findMany({
      where: { status: 'ACTIVE' },
      orderBy: [{ ecommerce: { commercialName: 'asc' } }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        url: true,
        platform: true,
        ecommerce: { select: { commercialName: true, legalName: true } },
      },
    });

    return {
      data: stores.map((s) => ({
        id: s.id,
        name: s.name,
        url: s.url,
        platform: s.platform,
        ecommerceName: s.ecommerce.commercialName ?? s.ecommerce.legalName,
      })),
    };
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
