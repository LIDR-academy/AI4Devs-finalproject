import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AdminService } from './admin.service';
import { PrismaService } from '../prisma/prisma.service';
import { MockConversationsService } from '../mock/mock-conversations.service';

const mockPrisma = {
  order: {
    findMany: jest.fn(),
    count: jest.fn(),
  },
  user: {
    findMany: jest.fn(),
    count: jest.fn(),
  },
  conversation: {
    findUnique: jest.fn(),
  },
  $transaction: jest.fn(),
};

const mockMockConversations = {
  getConversationHistory: jest.fn(),
};

describe('AdminService', () => {
  let service: AdminService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: MockConversationsService, useValue: mockMockConversations },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    jest.clearAllMocks();
  });

  describe('getOrders', () => {
    it('devuelve pedidos paginados con meta', async () => {
      const orders = [{ id: 'o1', store: {}, user: { phone: {} }, conversations: [] }];
      mockPrisma.$transaction.mockResolvedValue([orders, 1]);

      const result = await service.getOrders(1, 50);

      expect(result.data).toEqual(orders);
      expect(result.meta).toEqual({ page: 1, limit: 50, total: 1 });
      expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
    });

    it('devuelve data vacía cuando no hay pedidos', async () => {
      mockPrisma.$transaction.mockResolvedValue([[], 0]);

      const result = await service.getOrders(1, 50);

      expect(result.data).toEqual([]);
      expect(result.meta.total).toBe(0);
    });

    it('calcula skip correctamente en página 2', async () => {
      mockPrisma.$transaction.mockResolvedValue([[], 0]);
      mockPrisma.order.findMany.mockResolvedValue([]);
      mockPrisma.order.count.mockResolvedValue(0);

      await service.getOrders(2, 10);

      const transactionCall = mockPrisma.$transaction.mock.calls[0][0];
      expect(transactionCall).toHaveLength(2);
    });
  });

  describe('buildOrderBy (via getOrders)', () => {
    beforeEach(() => {
      mockPrisma.$transaction.mockResolvedValue([[], 0]);
    });

    it('sortBy=date → ordena por webhookReceivedAt', async () => {
      await service.getOrders(1, 50, { sortBy: 'date', sortDir: 'desc' });
      expect(mockPrisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: [{ webhookReceivedAt: 'desc' }] }),
      );
    });

    it('sortBy=date asc → ordena por webhookReceivedAt asc', async () => {
      await service.getOrders(1, 50, { sortBy: 'date', sortDir: 'asc' });
      expect(mockPrisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: [{ webhookReceivedAt: 'asc' }] }),
      );
    });

    it('sin sortBy (undefined) → fallback a date desc', async () => {
      await service.getOrders(1, 50, {});
      expect(mockPrisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: [{ webhookReceivedAt: 'desc' }] }),
      );
    });

    it('sortBy inválido → fallback a date desc', async () => {
      await service.getOrders(1, 50, { sortBy: 'foobar', sortDir: 'asc' });
      expect(mockPrisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: [{ webhookReceivedAt: 'desc' }] }),
      );
    });

    it('sortBy=ref → ordena por externalOrderNumber con nulls last', async () => {
      await service.getOrders(1, 50, { sortBy: 'ref', sortDir: 'asc' });
      expect(mockPrisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [{ externalOrderNumber: { sort: 'asc', nulls: 'last' } }],
        }),
      );
    });

    it('sortBy=store → ordena por store.name con subsort por externalOrderNumber', async () => {
      await service.getOrders(1, 50, { sortBy: 'store', sortDir: 'asc' });
      expect(mockPrisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [
            { store: { name: 'asc' } },
            { externalOrderNumber: { sort: 'asc', nulls: 'last' } },
          ],
        }),
      );
    });

    it('sortBy=store desc → subsort externalOrderNumber también desc', async () => {
      await service.getOrders(1, 50, { sortBy: 'store', sortDir: 'desc' });
      expect(mockPrisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [
            { store: { name: 'desc' } },
            { externalOrderNumber: { sort: 'desc', nulls: 'last' } },
          ],
        }),
      );
    });

    it('sortBy=user → ordena por firstName luego lastName', async () => {
      await service.getOrders(1, 50, { sortBy: 'user', sortDir: 'asc' });
      expect(mockPrisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [{ user: { firstName: 'asc' } }, { user: { lastName: 'asc' } }],
        }),
      );
    });

    it('sortBy=amount → ordena por totalAmount', async () => {
      await service.getOrders(1, 50, { sortBy: 'amount', sortDir: 'desc' });
      expect(mockPrisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: [{ totalAmount: 'desc' }] }),
      );
    });
  });

  describe('buildWhere (via getOrders)', () => {
    beforeEach(() => {
      mockPrisma.$transaction.mockResolvedValue([[], 0]);
    });

    it('sin filtros → where vacío {}', async () => {
      await service.getOrders(1, 50, {});
      expect(mockPrisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} }),
      );
    });

    it('q → OR sobre las 4 columnas con mode insensitive', async () => {
      await service.getOrders(1, 50, { q: 'garcia' });
      expect(mockPrisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            AND: [
              {
                OR: [
                  { store: { name: { contains: 'garcia', mode: 'insensitive' } } },
                  { externalOrderNumber: { contains: 'garcia', mode: 'insensitive' } },
                  { user: { firstName: { contains: 'garcia', mode: 'insensitive' } } },
                  { user: { lastName: { contains: 'garcia', mode: 'insensitive' } } },
                ],
              },
            ],
          },
        }),
      );
    });

    it('status CSV válido → { in: [...] }', async () => {
      await service.getOrders(1, 50, { status: 'COMPLETED,CANCELED' });
      expect(mockPrisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { AND: [{ status: { in: ['COMPLETED', 'CANCELED'] } }] },
        }),
      );
    });

    it('status con valor inválido en CSV → solo los válidos en el in', async () => {
      await service.getOrders(1, 50, { status: 'COMPLETED,ROGUE' });
      expect(mockPrisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { AND: [{ status: { in: ['COMPLETED'] } }] },
        }),
      );
    });

    it('status completamente inválido → no se añade filtro de status', async () => {
      await service.getOrders(1, 50, { status: 'INVALID_STATUS' });
      expect(mockPrisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} }),
      );
    });

    it('mode CSV válido → { in: [...] }', async () => {
      await service.getOrders(1, 50, { mode: 'ADRESLES,TRADITIONAL' });
      expect(mockPrisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { AND: [{ orderMode: { in: ['ADRESLES', 'TRADITIONAL'] } }] },
        }),
      );
    });

    it('solo from → { gte: Date 00:00:00Z }', async () => {
      await service.getOrders(1, 50, { from: '2026-02-01' });
      expect(mockPrisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            AND: [
              {
                webhookReceivedAt: {
                  gte: new Date('2026-02-01T00:00:00.000Z'),
                },
              },
            ],
          },
        }),
      );
    });

    it('solo to → { lte: Date 23:59:59.999Z }', async () => {
      await service.getOrders(1, 50, { to: '2026-02-28' });
      expect(mockPrisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            AND: [
              {
                webhookReceivedAt: {
                  lte: new Date('2026-02-28T23:59:59.999Z'),
                },
              },
            ],
          },
        }),
      );
    });

    it('from + to → { gte, lte } con horas correctas', async () => {
      await service.getOrders(1, 50, { from: '2026-02-01', to: '2026-02-28' });
      expect(mockPrisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            AND: [
              {
                webhookReceivedAt: {
                  gte: new Date('2026-02-01T00:00:00.000Z'),
                  lte: new Date('2026-02-28T23:59:59.999Z'),
                },
              },
            ],
          },
        }),
      );
    });

    it('combinación q + status + from → AND entre los tres filtros', async () => {
      await service.getOrders(1, 50, { q: 'zara', status: 'COMPLETED', from: '2026-02-01' });
      expect(mockPrisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            AND: expect.arrayContaining([
              expect.objectContaining({ OR: expect.any(Array) }),
              { status: { in: ['COMPLETED'] } },
              expect.objectContaining({ webhookReceivedAt: expect.objectContaining({ gte: expect.any(Date) }) }),
            ]),
          },
        }),
      );
    });

    it('count se llama con el mismo where que findMany', async () => {
      await service.getOrders(1, 50, { status: 'COMPLETED' });
      expect(mockPrisma.order.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { AND: [{ status: { in: ['COMPLETED'] } }] },
        }),
      );
    });
  });

  describe('getUsers', () => {
    it('devuelve usuarios paginados con meta', async () => {
      const users = [{ id: 'u1', phone: {}, _count: { orders: 1, addresses: 0 } }];
      mockPrisma.$transaction.mockResolvedValue([users, 1]);

      const result = await service.getUsers(1, 50);

      expect(result.data).toEqual(users);
      expect(result.meta).toEqual({ page: 1, limit: 50, total: 1 });
    });

    it('devuelve lista vacía cuando no hay usuarios', async () => {
      mockPrisma.$transaction.mockResolvedValue([[], 0]);

      const result = await service.getUsers(1, 50);

      expect(result.data).toEqual([]);
      expect(result.meta.total).toBe(0);
    });

    it('filtra usuarios con isDeleted = true (no aparecen en resultados)', async () => {
      mockPrisma.$transaction.mockResolvedValue([[], 0]);

      await service.getUsers(1, 50);

      // El findMany debe recibir where: { isDeleted: false } para excluir usuarios borrados
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isDeleted: false },
        }),
      );
    });
  });

  describe('getConversationMessages', () => {
    const mockConversation = {
      id: 'conv-1',
      conversationType: 'GET_ADDRESS',
      status: 'COMPLETED',
      startedAt: new Date('2026-02-21T10:01:00Z'),
      completedAt: new Date('2026-02-21T10:05:00Z'),
      order: { externalOrderNumber: '#1001', externalOrderId: 'wc-1001' },
    };

    const mockMessages = [
      {
        conversationId: 'conv-1',
        messageId: 'msg-1',
        role: 'assistant',
        content: 'Hola!',
        timestamp: '2026-02-21T10:01:00Z',
        expiresAt: 1748822460,
      },
    ];

    it('devuelve mensajes con metadata de conversación', async () => {
      mockPrisma.conversation.findUnique.mockResolvedValue(mockConversation);
      mockMockConversations.getConversationHistory.mockResolvedValue(mockMessages);

      const result = await service.getConversationMessages('conv-1');

      expect(result.conversationId).toBe('conv-1');
      expect(result.conversation.type).toBe('GET_ADDRESS');
      expect(result.conversation.status).toBe('COMPLETED');
      expect(result.conversation.order.externalOrderNumber).toBe('#1001');
      expect(result.messages).toHaveLength(1);
      expect(result.messages[0].messageId).toBe('msg-1');
    });

    it('usa externalOrderId como fallback si externalOrderNumber es null', async () => {
      mockPrisma.conversation.findUnique.mockResolvedValue({
        ...mockConversation,
        order: { externalOrderNumber: null, externalOrderId: 'wc-1001' },
      });
      mockMockConversations.getConversationHistory.mockResolvedValue([]);

      const result = await service.getConversationMessages('conv-1');

      expect(result.conversation.order.externalOrderNumber).toBe('wc-1001');
    });

    it('lanza NotFoundException cuando la conversación no existe en Prisma', async () => {
      mockPrisma.conversation.findUnique.mockResolvedValue(null);

      await expect(service.getConversationMessages('id-inexistente')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('devuelve messages vacío si DynamoDB no tiene mensajes', async () => {
      mockPrisma.conversation.findUnique.mockResolvedValue(mockConversation);
      mockMockConversations.getConversationHistory.mockResolvedValue([]);

      const result = await service.getConversationMessages('conv-1');

      expect(result.messages).toEqual([]);
    });
  });
});
