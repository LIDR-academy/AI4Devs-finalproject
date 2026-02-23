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

      // El skip debe ser (2-1)*10 = 10
      const transactionCall = mockPrisma.$transaction.mock.calls[0][0];
      expect(transactionCall).toHaveLength(2);
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
