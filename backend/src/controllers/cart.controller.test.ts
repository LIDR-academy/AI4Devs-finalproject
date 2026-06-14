import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import { errorHandler } from '../middleware/error-handler';
import { sessionMiddleware } from '../middleware/session';
import { ICartService } from '../services/cart.service';
import { CartResponse } from '../types/domain';
import { NotFoundError, StockError } from '../types/errors';

// We import these after they're created — at test-write time they don't exist yet
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createCartRouter } = require('../routes/cart.routes');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { CartController } = require('../controllers/cart.controller');

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';

const buildCartResponse = (overrides: Partial<CartResponse> = {}): CartResponse => ({
  sessionId: VALID_UUID,
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
  subtotal: 129.99,
  shipping: 0,
  total: 129.99,
  ...overrides,
});

const makeCartService = (overrides: Partial<ICartService> = {}): ICartService => ({
  addItem: jest.fn().mockResolvedValue(buildCartResponse()),
  ...overrides,
});

const buildApp = (service: ICartService) => {
  const app = express();
  app.use(cookieParser());
  app.use(express.json());
  app.use('/api/cart', createCartRouter(service));
  app.use(errorHandler);
  return app;
};

describe('POST /api/cart', () => {
  it('devuelve 200 con carrito actualizado', async () => {
    const cartResponse = buildCartResponse();
    const service = makeCartService({
      addItem: jest.fn().mockResolvedValue(cartResponse),
    });

    const res = await request(buildApp(service))
      .post('/api/cart')
      .set('Cookie', [`sessionId=${VALID_UUID}`])
      .send({ productId: VALID_UUID, quantity: 1, size: '42', color: 'black' });

    expect(res.status).toBe(200);
    expect(res.body.items).toBeDefined();
    expect(res.body.subtotal).toBeDefined();
    expect(res.body.total).toBeDefined();
  });

  it('devuelve 400 con body inválido (quantity negativa)', async () => {
    const service = makeCartService();

    const res = await request(buildApp(service))
      .post('/api/cart')
      .set('Cookie', [`sessionId=${VALID_UUID}`])
      .send({ productId: VALID_UUID, quantity: -1 });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
    expect(JSON.stringify(res.body)).not.toContain('stack');
  });

  it('devuelve 400 cuando hay campos extra (strict)', async () => {
    const service = makeCartService();

    const res = await request(buildApp(service))
      .post('/api/cart')
      .set('Cookie', [`sessionId=${VALID_UUID}`])
      .send({ productId: VALID_UUID, quantity: 1, price: 9.99 });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('devuelve 404 cuando el producto no existe', async () => {
    const service = makeCartService({
      addItem: jest.fn().mockRejectedValue(new NotFoundError('Product not found')),
    });

    const res = await request(buildApp(service))
      .post('/api/cart')
      .set('Cookie', [`sessionId=${VALID_UUID}`])
      .send({ productId: VALID_UUID, quantity: 1 });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Producto no encontrado');
  });

  it('devuelve 409 cuando hay stock insuficiente', async () => {
    const service = makeCartService({
      addItem: jest.fn().mockRejectedValue(new StockError(2)),
    });

    const res = await request(buildApp(service))
      .post('/api/cart')
      .set('Cookie', [`sessionId=${VALID_UUID}`])
      .send({ productId: VALID_UUID, quantity: 5 });

    expect(res.status).toBe(409);
    expect(res.body.available).toBe(2);
  });

  it('emite Set-Cookie cuando no había sessionId', async () => {
    const service = makeCartService();

    const res = await request(buildApp(service))
      .post('/api/cart')
      .send({ productId: VALID_UUID, quantity: 1 });

    const setCookieHeader = res.headers['set-cookie'] as string[] | string | undefined;
    expect(setCookieHeader).toBeDefined();
    const cookieStr = Array.isArray(setCookieHeader)
      ? setCookieHeader.join('; ')
      : setCookieHeader ?? '';
    expect(cookieStr).toContain('sessionId');
    expect(cookieStr).toContain('HttpOnly');
  });

  it('SEC-01: Set-Cookie incluye Secure en entorno no-development', async () => {
    // Regression test for missing Secure flag — without it the sessionId cookie
    // is transmitted over HTTP in production, enabling session hijacking.
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const service = makeCartService();

    const res = await request(buildApp(service))
      .post('/api/cart')
      .send({ productId: VALID_UUID, quantity: 1 });

    process.env.NODE_ENV = originalEnv;

    const setCookieHeader = res.headers['set-cookie'] as string[] | string | undefined;
    expect(setCookieHeader).toBeDefined();
    const cookieStr = Array.isArray(setCookieHeader)
      ? setCookieHeader.join('; ')
      : setCookieHeader ?? '';
    expect(cookieStr).toContain('Secure');
  });

  it('no expone stack traces en errores 500', async () => {
    const service = makeCartService({
      addItem: jest.fn().mockRejectedValue(new Error('Prisma: connection error with stack')),
    });

    const res = await request(buildApp(service))
      .post('/api/cart')
      .set('Cookie', [`sessionId=${VALID_UUID}`])
      .send({ productId: VALID_UUID, quantity: 1 });

    expect(res.status).toBe(500);
    expect(JSON.stringify(res.body)).not.toContain('stack');
    expect(JSON.stringify(res.body)).not.toContain('Prisma');
  });
});
