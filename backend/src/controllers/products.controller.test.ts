import request from 'supertest';
import express from 'express';
import { errorHandler } from '../middleware/error-handler';
import { createProductsRouter } from '../routes/products.routes';
import { ICatalogService } from '../services/catalog.service';
import { Product } from '../types/domain';

const buildProduct = (overrides: Partial<Product> = {}): Product => ({
  id: 'uuid-1',
  name: 'Nike Pegasus 41',
  brand: 'Nike',
  price: 129.99,
  image: 'products/nike-pegasus.jpg',
  category: 'shoes',
  subcategory: 'road',
  description: 'Great all-around running shoe',
  features: ['cushioning'],
  distance: ['marathon'],
  surface: ['road'],
  level: ['beginner'],
  objective: ['training'],
  sizes: ['42'],
  colors: ['black'],
  stock: 10,
  ...overrides,
});

const makeCatalogService = (overrides: Partial<ICatalogService> = {}): ICatalogService => ({
  getProducts: jest.fn().mockResolvedValue({ products: [], total: 0 }),
  getProductById: jest.fn().mockResolvedValue(null),
  ...overrides,
});

const buildApp = (service: ICatalogService) => {
  const app = express();
  app.use(express.json());
  app.use('/api/products', createProductsRouter(service));
  app.use(errorHandler);
  return app;
};

describe('GET /api/products', () => {
  it('responds 200 with products array and total', async () => {
    const products = [buildProduct(), buildProduct({ id: 'uuid-2', name: 'Brooks Ghost 16' })];
    const service = makeCatalogService({
      getProducts: jest.fn().mockResolvedValue({ products, total: 2 }),
    });

    const res = await request(buildApp(service)).get('/api/products');

    expect(res.status).toBe(200);
    expect(res.body.products).toHaveLength(2);
    expect(res.body.total).toBe(2);
  });

  it('total equals products.length', async () => {
    const products = [buildProduct(), buildProduct({ id: 'uuid-2' }), buildProduct({ id: 'uuid-3' })];
    const service = makeCatalogService({
      getProducts: jest.fn().mockResolvedValue({ products, total: 3 }),
    });

    const res = await request(buildApp(service)).get('/api/products');

    expect(res.body.total).toBe(res.body.products.length);
  });

  it('responds 200 with empty array when catalog has no products', async () => {
    const service = makeCatalogService({
      getProducts: jest.fn().mockResolvedValue({ products: [], total: 0 }),
    });

    const res = await request(buildApp(service)).get('/api/products');

    expect(res.status).toBe(200);
    expect(res.body.products).toEqual([]);
    expect(res.body.total).toBe(0);
  });

  it('responds 500 with generic error when service throws', async () => {
    const service = makeCatalogService({
      getProducts: jest.fn().mockRejectedValue(new Error('DB connection failed')),
    });

    const res = await request(buildApp(service)).get('/api/products');

    expect(res.status).toBe(500);
    expect(res.body.error).toBeDefined();
    expect(res.body.error).not.toContain('DB connection failed');
  });

  it('response body does not expose internal stack traces on error', async () => {
    const service = makeCatalogService({
      getProducts: jest.fn().mockRejectedValue(new Error('Prisma error details')),
    });

    const res = await request(buildApp(service)).get('/api/products');

    expect(res.status).toBe(500);
    expect(JSON.stringify(res.body)).not.toContain('Prisma');
    expect(JSON.stringify(res.body)).not.toContain('stack');
  });
});

describe('GET /api/products with running attribute filters', () => {
  it('passes parsed single distance filter to the service', async () => {
    const service = makeCatalogService();

    await request(buildApp(service)).get('/api/products?distance=5K');

    expect(service.getProducts).toHaveBeenCalledWith(
      expect.objectContaining({ distance: ['5K'] }),
    );
  });

  it('passes multiple distance values as array (OR within dimension)', async () => {
    const service = makeCatalogService();

    await request(buildApp(service)).get('/api/products?distance=5K&distance=marathon');

    expect(service.getProducts).toHaveBeenCalledWith(
      expect.objectContaining({ distance: ['5K', 'marathon'] }),
    );
  });

  it('passes multi-dimension filters to service (AND between dimensions)', async () => {
    const service = makeCatalogService();

    await request(buildApp(service)).get('/api/products?distance=marathon&surface=road');

    expect(service.getProducts).toHaveBeenCalledWith(
      expect.objectContaining({ distance: ['marathon'], surface: ['road'] }),
    );
  });

  it('discards invalid enum values and responds 200', async () => {
    const service = makeCatalogService({
      getProducts: jest.fn().mockResolvedValue({ products: [], total: 0 }),
    });

    const res = await request(buildApp(service)).get('/api/products?distance=INVALIDO');

    expect(res.status).toBe(200);
    expect(service.getProducts).toHaveBeenCalledWith(
      expect.objectContaining({ distance: [] }),
    );
  });

  it('passes empty filters when called without query params', async () => {
    const service = makeCatalogService();

    await request(buildApp(service)).get('/api/products');

    expect(service.getProducts).toHaveBeenCalledWith(
      expect.objectContaining({
        distance: [],
        surface: [],
        level: [],
        objective: [],
      }),
    );
  });
});
