import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import { errorHandler } from '../middleware/error-handler';
import { IOrderService } from '../services/order.service';
import { OrderListResponse } from '../types/domain';

// We import these after they're created — at test-write time they don't exist yet
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createOrderRouter } = require('../routes/order.routes');

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';

const buildOrderListResponse = (overrides: Partial<OrderListResponse> = {}): OrderListResponse => ({
  id: 'ORD-1700000000000',
  status: 'processing',
  date: '2026-06-01T10:00:00.000Z',
  subtotal: 129.99,
  shipping: 4.99,
  total: 134.98,
  shippingName: 'Jane Runner',
  shippingEmail: 'jane@example.com',
  shippingAddress: 'Calle Falsa 123',
  shippingCity: 'Madrid',
  shippingPostalCode: '28001',
  shippingCountry: 'España',
  items: [
    {
      productId: VALID_UUID,
      productName: 'Nike Pegasus 41',
      productBrand: 'Nike',
      productPrice: 129.99,
      image: 'products/nike-pegasus.jpg',
      quantity: 1,
      size: '42',
      color: 'black',
    },
  ],
  ...overrides,
});

const makeOrderService = (overrides: Partial<IOrderService> = {}): IOrderService => ({
  getOrders: jest.fn().mockResolvedValue([buildOrderListResponse()]),
  ...overrides,
});

const buildApp = (service: IOrderService) => {
  const app = express();
  app.use(cookieParser());
  app.use(express.json());
  app.use('/api/orders', createOrderRouter(service));
  app.use(errorHandler);
  return app;
};

describe('GET /api/orders', () => {
  it('devuelve 200 con los pedidos de la sesión', async () => {
    const orders = [buildOrderListResponse()];
    const service = makeOrderService({
      getOrders: jest.fn().mockResolvedValue(orders),
    });

    const res = await request(buildApp(service))
      .get('/api/orders')
      .set('Cookie', [`sessionId=${VALID_UUID}`]);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(orders);
  });

  it('devuelve 200 con [] cuando la sesión no tiene pedidos (sesión nueva, sin cookie previa)', async () => {
    const service = makeOrderService({
      getOrders: jest.fn().mockResolvedValue([]),
    });

    const res = await request(buildApp(service)).get('/api/orders');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('no expone stack traces ni detalles de Prisma en errores 500', async () => {
    const service = makeOrderService({
      getOrders: jest.fn().mockRejectedValue(new Error('Prisma: connection error with stack')),
    });

    const res = await request(buildApp(service))
      .get('/api/orders')
      .set('Cookie', [`sessionId=${VALID_UUID}`]);

    expect(res.status).toBe(500);
    expect(JSON.stringify(res.body)).not.toContain('stack');
    expect(JSON.stringify(res.body)).not.toContain('Prisma');
  });
});
