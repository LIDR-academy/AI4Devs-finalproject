import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { MockOrdersController } from './mock-orders.controller';
import { MockOrdersService } from './mock-orders.service';

const mockMockOrdersService = {
  processMockOrder: jest.fn(),
};

const adreslesPayload = {
  store: { name: 'Tienda Prueba', url: 'https://tienda.example.com' },
  external_order_id: 'ext-001',
  external_order_number: 'ORD-001',
  buyer: {
    first_name: 'María',
    last_name: 'López',
    phone: '+34600111222',
    email: 'maria@example.com',
  },
  mode: 'adresles',
  items: [{ name: 'Camiseta', quantity: 2, price: 25 }],
  total_amount: 50,
  currency: 'EUR',
};

const traditionalPayload = {
  ...adreslesPayload,
  mode: 'tradicional',
  address: {
    full_address: 'Paseo de Gracia 1, 08001 Barcelona',
    street: 'Paseo de Gracia',
    number: '1',
    postal_code: '08001',
    city: 'Barcelona',
    country: 'ES',
  },
};

describe('MockOrdersController (integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MockOrdersController],
      providers: [
        { provide: MockOrdersService, useValue: mockMockOrdersService },
      ],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /mock/orders', () => {
    it('returns 201 with order_id and conversation_id for valid adresles mode', async () => {
      mockMockOrdersService.processMockOrder.mockResolvedValue({
        order_id: 'order-uuid-1',
        conversation_id: 'conv-uuid-1',
      });

      const res = await request(app.getHttpServer())
        .post('/mock/orders')
        .send(adreslesPayload)
        .expect(201);

      expect(res.body).toEqual({
        order_id: 'order-uuid-1',
        conversation_id: 'conv-uuid-1',
      });
      expect(mockMockOrdersService.processMockOrder).toHaveBeenCalledTimes(1);
      expect(mockMockOrdersService.processMockOrder).toHaveBeenCalledWith(
        expect.objectContaining({ mode: 'adresles', total_amount: 50 }),
      );
    });

    it('returns 201 with order_id and conversation_id for valid tradicional mode', async () => {
      mockMockOrdersService.processMockOrder.mockResolvedValue({
        order_id: 'order-uuid-2',
        conversation_id: 'conv-uuid-2',
      });

      const res = await request(app.getHttpServer())
        .post('/mock/orders')
        .send(traditionalPayload)
        .expect(201);

      expect(res.body).toEqual({
        order_id: 'order-uuid-2',
        conversation_id: 'conv-uuid-2',
      });
    });

    it('returns 400 when required field store is missing', async () => {
      const { store: _store, ...withoutStore } = adreslesPayload;

      await request(app.getHttpServer())
        .post('/mock/orders')
        .send(withoutStore)
        .expect(400);

      expect(mockMockOrdersService.processMockOrder).not.toHaveBeenCalled();
    });

    it('returns 400 when required field buyer.phone is missing', async () => {
      const payload = {
        ...adreslesPayload,
        buyer: { first_name: 'María', last_name: 'López' },
      };

      await request(app.getHttpServer())
        .post('/mock/orders')
        .send(payload)
        .expect(400);

      expect(mockMockOrdersService.processMockOrder).not.toHaveBeenCalled();
    });

    it('returns 400 when mode is not a valid enum value', async () => {
      const payload = { ...adreslesPayload, mode: 'invalid-mode' };

      await request(app.getHttpServer())
        .post('/mock/orders')
        .send(payload)
        .expect(400);

      expect(mockMockOrdersService.processMockOrder).not.toHaveBeenCalled();
    });

    it('returns 400 when total_amount is missing', async () => {
      const { total_amount: _ta, ...withoutAmount } = adreslesPayload;

      await request(app.getHttpServer())
        .post('/mock/orders')
        .send(withoutAmount)
        .expect(400);

      expect(mockMockOrdersService.processMockOrder).not.toHaveBeenCalled();
    });

    it('returns 400 when store URL is not a valid URL', async () => {
      const payload = {
        ...adreslesPayload,
        store: { name: 'Test', url: 'not-a-url' },
      };

      await request(app.getHttpServer())
        .post('/mock/orders')
        .send(payload)
        .expect(400);

      expect(mockMockOrdersService.processMockOrder).not.toHaveBeenCalled();
    });

    it('returns 400 when buyer email is not a valid email', async () => {
      const payload = {
        ...adreslesPayload,
        buyer: { ...adreslesPayload.buyer, email: 'not-an-email' },
      };

      await request(app.getHttpServer())
        .post('/mock/orders')
        .send(payload)
        .expect(400);

      expect(mockMockOrdersService.processMockOrder).not.toHaveBeenCalled();
    });

    it('succeeds without optional fields (no items, no email)', async () => {
      mockMockOrdersService.processMockOrder.mockResolvedValue({
        order_id: 'order-uuid-3',
        conversation_id: 'conv-uuid-3',
      });

      const minimalPayload = {
        store: { name: 'Minimal Store', url: 'https://minimal.example.com' },
        external_order_id: 'ext-002',
        buyer: { first_name: 'Juan', last_name: 'Pérez', phone: '+34611222333' },
        mode: 'adresles',
        total_amount: 99,
        currency: 'EUR',
      };

      await request(app.getHttpServer())
        .post('/mock/orders')
        .send(minimalPayload)
        .expect(201);

      expect(mockMockOrdersService.processMockOrder).toHaveBeenCalledTimes(1);
    });
  });
});
