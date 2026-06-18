import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import { errorHandler } from '../middleware/error-handler';
import { ICheckoutService } from '../services/checkout.service';
import { OrderResponse } from '../types/domain';
import { NotFoundError, StockError, ValidationError } from '../types/errors';

// We import these after they're created — at test-write time they don't exist yet
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createCheckoutRouter } = require('../routes/checkout.routes');

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';

const VALID_SHIPPING_BODY = {
  name: 'Ana Runner',
  email: 'ana@example.com',
  phone: '600 123 456',
  address: 'Calle Mayor 1',
  city: 'Madrid',
  postalCode: '28001',
  country: 'España',
};

const buildOrderResponse = (overrides: Partial<OrderResponse> = {}): OrderResponse => ({
  id: 'ORD-1718700000000',
  status: 'processing',
  date: new Date().toISOString(),
  subtotal: 129.99,
  shipping: 0,
  total: 129.99,
  shippingName: VALID_SHIPPING_BODY.name,
  shippingEmail: VALID_SHIPPING_BODY.email,
  shippingPhone: VALID_SHIPPING_BODY.phone,
  shippingAddress: VALID_SHIPPING_BODY.address,
  shippingCity: VALID_SHIPPING_BODY.city,
  shippingPostalCode: VALID_SHIPPING_BODY.postalCode,
  shippingCountry: VALID_SHIPPING_BODY.country,
  items: [
    {
      productId: VALID_UUID,
      productName: 'Nike Pegasus 41',
      productBrand: 'Nike',
      productPrice: 129.99,
      quantity: 1,
      size: '42',
      color: 'black',
    },
  ],
  ...overrides,
});

const makeCheckoutService = (overrides: Partial<ICheckoutService> = {}): ICheckoutService => ({
  processCheckout: jest.fn().mockResolvedValue(buildOrderResponse()),
  ...overrides,
});

const buildApp = (service: ICheckoutService) => {
  const app = express();
  app.use(cookieParser());
  app.use(express.json());
  app.use('/api/checkout', createCheckoutRouter(service));
  app.use(errorHandler);
  return app;
};

describe('POST /api/checkout', () => {
  it('devuelve 201 con el pedido creado', async () => {
    const service = makeCheckoutService();

    const res = await request(buildApp(service))
      .post('/api/checkout')
      .set('Cookie', [`sessionId=${VALID_UUID}`])
      .send(VALID_SHIPPING_BODY);

    expect(res.status).toBe(201);
    expect(res.body.id).toMatch(/^ORD-/);
    expect(res.body.status).toBe('processing');
  });

  it('devuelve 400 con body inválido (email con formato incorrecto)', async () => {
    const service = makeCheckoutService();

    const res = await request(buildApp(service))
      .post('/api/checkout')
      .set('Cookie', [`sessionId=${VALID_UUID}`])
      .send({ ...VALID_SHIPPING_BODY, email: 'not-an-email' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('devuelve 400 con campos extra en el body (strict)', async () => {
    const service = makeCheckoutService();

    const res = await request(buildApp(service))
      .post('/api/checkout')
      .set('Cookie', [`sessionId=${VALID_UUID}`])
      .send({ ...VALID_SHIPPING_BODY, cardNumber: '4111111111111111' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('devuelve 400 cuando el carrito está vacío', async () => {
    const service = makeCheckoutService({
      processCheckout: jest.fn().mockRejectedValue(new ValidationError('El carrito está vacío')),
    });

    const res = await request(buildApp(service))
      .post('/api/checkout')
      .set('Cookie', [`sessionId=${VALID_UUID}`])
      .send(VALID_SHIPPING_BODY);

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('devuelve 404 cuando un producto ya no existe', async () => {
    const service = makeCheckoutService({
      processCheckout: jest.fn().mockRejectedValue(new NotFoundError('Product not found')),
    });

    const res = await request(buildApp(service))
      .post('/api/checkout')
      .set('Cookie', [`sessionId=${VALID_UUID}`])
      .send(VALID_SHIPPING_BODY);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Producto no encontrado');
  });

  it('devuelve 409 cuando hay stock insuficiente', async () => {
    const service = makeCheckoutService({
      processCheckout: jest.fn().mockRejectedValue(new StockError(2)),
    });

    const res = await request(buildApp(service))
      .post('/api/checkout')
      .set('Cookie', [`sessionId=${VALID_UUID}`])
      .send(VALID_SHIPPING_BODY);

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('Stock insuficiente');
    expect(res.body.available).toBe(2);
  });

  it('emite Set-Cookie con el nuevo sessionId cuando no había cookie previa', async () => {
    const service = makeCheckoutService();

    const res = await request(buildApp(service))
      .post('/api/checkout')
      .send(VALID_SHIPPING_BODY);

    expect(res.status).toBe(201);
    const setCookieHeader = res.headers['set-cookie'];
    expect(setCookieHeader).toBeDefined();
    const cookieStr = Array.isArray(setCookieHeader) ? setCookieHeader.join(';') : String(setCookieHeader);
    expect(cookieStr).toMatch(/sessionId=[0-9a-f-]{36}/i);
    expect(cookieStr).toContain('HttpOnly');
  });

  it('no expone stack traces en errores 500', async () => {
    const service = makeCheckoutService({
      processCheckout: jest.fn().mockRejectedValue(new Error('Prisma: connection error with stack')),
    });

    const res = await request(buildApp(service))
      .post('/api/checkout')
      .set('Cookie', [`sessionId=${VALID_UUID}`])
      .send(VALID_SHIPPING_BODY);

    expect(res.status).toBe(500);
    expect(JSON.stringify(res.body)).not.toContain('stack');
    expect(JSON.stringify(res.body)).not.toContain('Prisma');
  });
});
