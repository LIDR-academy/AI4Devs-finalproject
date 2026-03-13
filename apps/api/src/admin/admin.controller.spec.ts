import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

const mockAdminService = {
  getOrders: jest.fn(),
  getUsers: jest.fn(),
  getConversationMessages: jest.fn(),
  getStores: jest.fn(),
};

describe('AdminController (integration HTTP)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [{ provide: AdminService, useValue: mockAdminService }],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    jest.clearAllMocks();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /admin/orders', () => {
    const defaultParams = {
      sortBy: undefined,
      sortDir: undefined,
      q: undefined,
      status: undefined,
      mode: undefined,
      from: undefined,
      to: undefined,
    };

    it('responde 200 con datos paginados', async () => {
      const payload = {
        data: [{ id: 'o1' }],
        meta: { page: 1, limit: 50, total: 1 },
      };
      mockAdminService.getOrders.mockResolvedValue(payload);

      const res = await request(app.getHttpServer())
        .get('/admin/orders')
        .expect(200);

      expect(res.body).toEqual(payload);
      expect(mockAdminService.getOrders).toHaveBeenCalledWith(1, 50, defaultParams);
    });

    it('parsea correctamente los parámetros page y limit', async () => {
      mockAdminService.getOrders.mockResolvedValue({ data: [], meta: { page: 2, limit: 10, total: 0 } });

      await request(app.getHttpServer())
        .get('/admin/orders?page=2&limit=10')
        .expect(200);

      expect(mockAdminService.getOrders).toHaveBeenCalledWith(2, 10, defaultParams);
    });

    it('usa valores por defecto cuando no se envían parámetros', async () => {
      mockAdminService.getOrders.mockResolvedValue({ data: [], meta: {} });

      await request(app.getHttpServer()).get('/admin/orders').expect(200);

      expect(mockAdminService.getOrders).toHaveBeenCalledWith(1, 50, defaultParams);
    });

    it('pasa sortBy y sortDir al servicio cuando se proporcionan', async () => {
      mockAdminService.getOrders.mockResolvedValue({ data: [], meta: {} });

      await request(app.getHttpServer())
        .get('/admin/orders?sortBy=store&sortDir=asc')
        .expect(200);

      expect(mockAdminService.getOrders).toHaveBeenCalledWith(1, 50, {
        ...defaultParams,
        sortBy: 'store',
        sortDir: 'asc',
      });
    });

    it('pasa sortBy=amount y sortDir=desc correctamente', async () => {
      mockAdminService.getOrders.mockResolvedValue({ data: [], meta: {} });

      await request(app.getHttpServer())
        .get('/admin/orders?sortBy=amount&sortDir=desc')
        .expect(200);

      expect(mockAdminService.getOrders).toHaveBeenCalledWith(1, 50, {
        ...defaultParams,
        sortBy: 'amount',
        sortDir: 'desc',
      });
    });

    it('pasa q al servicio cuando se proporciona', async () => {
      mockAdminService.getOrders.mockResolvedValue({ data: [], meta: {} });

      await request(app.getHttpServer())
        .get('/admin/orders?q=zara')
        .expect(200);

      expect(mockAdminService.getOrders).toHaveBeenCalledWith(1, 50, {
        ...defaultParams,
        q: 'zara',
      });
    });

    it('pasa status y from/to al servicio correctamente', async () => {
      mockAdminService.getOrders.mockResolvedValue({ data: [], meta: {} });

      await request(app.getHttpServer())
        .get('/admin/orders?status=COMPLETED,CANCELED&from=2026-02-01&to=2026-02-28')
        .expect(200);

      expect(mockAdminService.getOrders).toHaveBeenCalledWith(1, 50, {
        ...defaultParams,
        status: 'COMPLETED,CANCELED',
        from: '2026-02-01',
        to: '2026-02-28',
      });
    });
  });

  describe('GET /admin/users', () => {
    const defaultUserParams = {
      sortBy: undefined,
      sortDir: undefined,
      q: undefined,
      registered: undefined,
    };

    it('responde 200 con usuarios paginados', async () => {
      const payload = {
        data: [{ id: 'u1' }],
        meta: { page: 1, limit: 50, total: 1 },
      };
      mockAdminService.getUsers.mockResolvedValue(payload);

      const res = await request(app.getHttpServer())
        .get('/admin/users')
        .expect(200);

      expect(res.body).toEqual(payload);
      expect(mockAdminService.getUsers).toHaveBeenCalledWith(1, 50, defaultUserParams);
    });

    it('pasa sortBy=name y sortDir=asc al servicio', async () => {
      mockAdminService.getUsers.mockResolvedValue({ data: [], meta: {} });

      await request(app.getHttpServer())
        .get('/admin/users?sortBy=name&sortDir=asc')
        .expect(200);

      expect(mockAdminService.getUsers).toHaveBeenCalledWith(1, 50, {
        ...defaultUserParams,
        sortBy: 'name',
        sortDir: 'asc',
      });
    });

    it('pasa q=garcia al servicio', async () => {
      mockAdminService.getUsers.mockResolvedValue({ data: [], meta: {} });

      await request(app.getHttpServer())
        .get('/admin/users?q=garcia')
        .expect(200);

      expect(mockAdminService.getUsers).toHaveBeenCalledWith(1, 50, {
        ...defaultUserParams,
        q: 'garcia',
      });
    });

    it('pasa registered=true al servicio', async () => {
      mockAdminService.getUsers.mockResolvedValue({ data: [], meta: {} });

      await request(app.getHttpServer())
        .get('/admin/users?registered=true')
        .expect(200);

      expect(mockAdminService.getUsers).toHaveBeenCalledWith(1, 50, {
        ...defaultUserParams,
        registered: 'true',
      });
    });
  });

  describe('GET /admin/stores', () => {
    it('responde 200 con la lista de tiendas', async () => {
      const payload = {
        data: [
          { id: 's1', name: 'Tienda A', url: 'https://a.com', platform: 'WOOCOMMERCE', ecommerceName: 'EcomA' },
        ],
      };
      mockAdminService.getStores.mockResolvedValue(payload);

      const res = await request(app.getHttpServer())
        .get('/admin/stores')
        .expect(200);

      expect(res.body).toEqual(payload);
      expect(mockAdminService.getStores).toHaveBeenCalledTimes(1);
    });

    it('responde 200 con data vacía si no hay tiendas activas', async () => {
      mockAdminService.getStores.mockResolvedValue({ data: [] });

      const res = await request(app.getHttpServer())
        .get('/admin/stores')
        .expect(200);

      expect(res.body).toEqual({ data: [] });
    });
  });

  describe('GET /admin/conversations/:conversationId/messages', () => {
    it('responde 200 con mensajes y metadata de conversación', async () => {
      const payload = {
        conversationId: 'conv-1',
        conversation: { type: 'GET_ADDRESS', status: 'COMPLETED' },
        messages: [],
      };
      mockAdminService.getConversationMessages.mockResolvedValue(payload);

      const res = await request(app.getHttpServer())
        .get('/admin/conversations/conv-1/messages')
        .expect(200);

      expect(res.body).toEqual(payload);
      expect(mockAdminService.getConversationMessages).toHaveBeenCalledWith('conv-1');
    });

    it('propaga NotFoundException como 404', async () => {
      const { NotFoundException } = await import('@nestjs/common');
      mockAdminService.getConversationMessages.mockRejectedValue(
        new NotFoundException('Conversation not found'),
      );

      await request(app.getHttpServer())
        .get('/admin/conversations/id-inexistente/messages')
        .expect(404);
    });
  });
});
