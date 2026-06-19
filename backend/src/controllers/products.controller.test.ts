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

describe('GET /api/products/:id', () => {
  it('responds 200 with the product when it exists', async () => {
    const product = buildProduct({ id: '550e8400-e29b-41d4-a716-446655440000' });
    const service = makeCatalogService({
      getProductById: jest.fn().mockResolvedValue(product),
    });

    const res = await request(buildApp(service)).get(
      '/api/products/550e8400-e29b-41d4-a716-446655440000',
    );

    expect(res.status).toBe(200);
    expect(res.body.id).toBe('550e8400-e29b-41d4-a716-446655440000');
    expect(res.body.name).toBe('Nike Pegasus 41');
    expect(res.body.price).toBe(129.99);
  });

  it('responds 404 when product does not exist', async () => {
    const service = makeCatalogService({
      getProductById: jest.fn().mockResolvedValue(null),
    });

    const res = await request(buildApp(service)).get(
      '/api/products/550e8400-e29b-41d4-a716-000000000000',
    );

    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
  });

  it('responds 404 when id has valid format but no matching product', async () => {
    const service = makeCatalogService({
      getProductById: jest.fn().mockResolvedValue(null),
    });

    const res = await request(buildApp(service)).get('/api/products/prod-not-found');

    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
  });

  it('responds 400 when id exceeds maximum length', async () => {
    const service = makeCatalogService();
    const longId = 'a'.repeat(201);

    const res = await request(buildApp(service)).get(`/api/products/${longId}`);

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
    expect(service.getProductById).not.toHaveBeenCalled();
  });

  it('does not expose internal stack traces on service error', async () => {
    const service = makeCatalogService({
      getProductById: jest.fn().mockRejectedValue(new Error('DB failure')),
    });

    const res = await request(buildApp(service)).get(
      '/api/products/550e8400-e29b-41d4-a716-446655440000',
    );

    expect(res.status).toBe(500);
    expect(JSON.stringify(res.body)).not.toContain('DB failure');
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

describe('GET /api/products with category and priceMax filters', () => {
  it('passes parsed category filter to the service', async () => {
    const service = makeCatalogService();

    await request(buildApp(service)).get('/api/products?category=shoes');

    expect(service.getProducts).toHaveBeenCalledWith(
      expect.objectContaining({ category: 'shoes' }),
    );
  });

  it('passes parsed priceMax filter to the service', async () => {
    const service = makeCatalogService();

    await request(buildApp(service)).get('/api/products?priceMax=50');

    expect(service.getProducts).toHaveBeenCalledWith(
      expect.objectContaining({ priceMax: 50 }),
    );
  });

  it('combines category and a running dimension filter (AND)', async () => {
    const service = makeCatalogService();

    await request(buildApp(service)).get('/api/products?category=shoes&distance=marathon');

    expect(service.getProducts).toHaveBeenCalledWith(
      expect.objectContaining({ category: 'shoes', distance: ['marathon'] }),
    );
  });

  it('discards an invalid category and responds 200', async () => {
    const service = makeCatalogService();

    const res = await request(buildApp(service)).get('/api/products?category=INVALIDO');

    expect(res.status).toBe(200);
    expect(service.getProducts).toHaveBeenCalledWith(
      expect.objectContaining({ category: undefined }),
    );
  });

  it('discards a non-numeric priceMax and responds 200', async () => {
    const service = makeCatalogService();

    const res = await request(buildApp(service)).get('/api/products?priceMax=abc');

    expect(res.status).toBe(200);
    expect(service.getProducts).toHaveBeenCalledWith(
      expect.objectContaining({ priceMax: undefined }),
    );
  });

  it('discards a negative priceMax and responds 200', async () => {
    const service = makeCatalogService();

    const res = await request(buildApp(service)).get('/api/products?priceMax=-10');

    expect(res.status).toBe(200);
    expect(service.getProducts).toHaveBeenCalledWith(
      expect.objectContaining({ priceMax: undefined }),
    );
  });
});
