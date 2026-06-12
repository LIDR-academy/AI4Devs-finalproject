import { ProductRepository } from './product.repository';

const mockDecimal = (value: number) => ({ toNumber: () => value });

const buildPrismaProduct = (overrides: Record<string, unknown> = {}) => ({
  id: 'uuid-1',
  name: 'Nike Pegasus 41',
  brand: 'Nike',
  price: mockDecimal(129.99),
  image: 'products/nike-pegasus.jpg',
  category: 'shoes',
  subcategory: 'road',
  description: 'Great all-around running shoe',
  features: ['cushioning', 'responsive'],
  distance: ['marathon'],
  surface: ['road'],
  level: ['beginner'],
  objective: ['training'],
  sizes: ['40', '41', '42'],
  colors: ['black', 'white'],
  stock: 10,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

type MockPrisma = {
  product: {
    findMany: jest.Mock;
    findUnique: jest.Mock;
  };
};

const makePrisma = (productOverrides: Partial<MockPrisma['product']> = {}): MockPrisma => ({
  product: {
    findMany: jest.fn().mockResolvedValue([]),
    findUnique: jest.fn().mockResolvedValue(null),
    ...productOverrides,
  },
});

describe('ProductRepository', () => {
  describe('findAll()', () => {
    it('calls prisma.product.findMany without a where clause', async () => {
      const prisma = makePrisma();
      const repo = new ProductRepository(prisma as unknown as import('@prisma/client').PrismaClient);

      await repo.findAll();

      expect(prisma.product.findMany).toHaveBeenCalledTimes(1);
      const call = prisma.product.findMany.mock.calls[0][0] as Record<string, unknown> | undefined;
      expect(call?.where).toBeUndefined();
    });

    it('maps Decimal price to number in the domain type', async () => {
      const prismaProduct = buildPrismaProduct({ price: mockDecimal(129.99) });
      const prisma = makePrisma({
        findMany: jest.fn().mockResolvedValue([prismaProduct]),
      });
      const repo = new ProductRepository(prisma as unknown as import('@prisma/client').PrismaClient);

      const result = await repo.findAll();

      expect(result).toHaveLength(1);
      expect(result[0].price).toBe(129.99);
      expect(typeof result[0].price).toBe('number');
    });

    it('returns empty array when no products exist', async () => {
      const prisma = makePrisma({ findMany: jest.fn().mockResolvedValue([]) });
      const repo = new ProductRepository(prisma as unknown as import('@prisma/client').PrismaClient);

      const result = await repo.findAll();

      expect(result).toEqual([]);
    });

    it('returns domain Product without Prisma-specific fields', async () => {
      const prismaProduct = buildPrismaProduct();
      const prisma = makePrisma({
        findMany: jest.fn().mockResolvedValue([prismaProduct]),
      });
      const repo = new ProductRepository(prisma as unknown as import('@prisma/client').PrismaClient);

      const result = await repo.findAll();
      const product = result[0];

      expect(product.id).toBe('uuid-1');
      expect(product.name).toBe('Nike Pegasus 41');
      expect(product.brand).toBe('Nike');
      expect(product.image).toBe('products/nike-pegasus.jpg');
      expect(product.level).toEqual(['beginner']);
      expect((product as unknown as Record<string, unknown>).createdAt).toBeUndefined();
      expect((product as unknown as Record<string, unknown>).updatedAt).toBeUndefined();
    });
  });

  describe('findAll() with running attribute filters', () => {
    it('passes no where clause when called without filters', async () => {
      const prisma = makePrisma();
      const repo = new ProductRepository(prisma as unknown as import('@prisma/client').PrismaClient);

      await repo.findAll();

      const call = prisma.product.findMany.mock.calls[0][0] as Record<string, unknown> | undefined;
      expect(call?.where).toBeUndefined();
    });

    it('builds hasSome for a single-dimension distance filter', async () => {
      const prisma = makePrisma();
      const repo = new ProductRepository(prisma as unknown as import('@prisma/client').PrismaClient);

      await repo.findAll({ distance: ['5K'] });

      const call = prisma.product.findMany.mock.calls[0][0] as { where: Record<string, unknown> };
      expect(call.where).toEqual({ distance: { hasSome: ['5K'] } });
    });

    it('builds hasSome for multiple values within a dimension (OR within dimension)', async () => {
      const prisma = makePrisma();
      const repo = new ProductRepository(prisma as unknown as import('@prisma/client').PrismaClient);

      await repo.findAll({ distance: ['5K', 'marathon'] });

      const call = prisma.product.findMany.mock.calls[0][0] as { where: Record<string, unknown> };
      expect(call.where).toEqual({ distance: { hasSome: ['5K', 'marathon'] } });
    });

    it('applies AND between dimensions when multiple filters are provided', async () => {
      const prisma = makePrisma();
      const repo = new ProductRepository(prisma as unknown as import('@prisma/client').PrismaClient);

      await repo.findAll({ distance: ['5K'], surface: ['road'] });

      const call = prisma.product.findMany.mock.calls[0][0] as { where: Record<string, unknown> };
      expect(call.where).toEqual({
        distance: { hasSome: ['5K'] },
        surface: { hasSome: ['road'] },
      });
    });

    it('does not add a condition for an empty array dimension', async () => {
      const prisma = makePrisma();
      const repo = new ProductRepository(prisma as unknown as import('@prisma/client').PrismaClient);

      await repo.findAll({ distance: [], surface: ['road'] });

      const call = prisma.product.findMany.mock.calls[0][0] as { where: Record<string, unknown> };
      expect(call.where).not.toHaveProperty('distance');
      expect(call.where).toEqual({ surface: { hasSome: ['road'] } });
    });

    it('builds hasSome for all four running dimensions (full AND)', async () => {
      const prisma = makePrisma();
      const repo = new ProductRepository(prisma as unknown as import('@prisma/client').PrismaClient);

      await repo.findAll({
        distance: ['marathon'],
        surface: ['road'],
        level: ['advanced'],
        objective: ['competition'],
      });

      const call = prisma.product.findMany.mock.calls[0][0] as { where: Record<string, unknown> };
      expect(call.where).toEqual({
        distance: { hasSome: ['marathon'] },
        surface: { hasSome: ['road'] },
        level: { hasSome: ['advanced'] },
        objective: { hasSome: ['competition'] },
      });
    });
  });

  describe('findById()', () => {
    it('returns null when the product does not exist', async () => {
      const prisma = makePrisma({ findUnique: jest.fn().mockResolvedValue(null) });
      const repo = new ProductRepository(prisma as unknown as import('@prisma/client').PrismaClient);

      const result = await repo.findById('non-existent-id');

      expect(result).toBeNull();
    });

    it('calls prisma.product.findUnique with the correct id', async () => {
      const prisma = makePrisma({ findUnique: jest.fn().mockResolvedValue(null) });
      const repo = new ProductRepository(prisma as unknown as import('@prisma/client').PrismaClient);

      await repo.findById('target-id');

      expect(prisma.product.findUnique).toHaveBeenCalledWith({ where: { id: 'target-id' } });
    });

    it('maps found product to domain type with numeric price', async () => {
      const prismaProduct = buildPrismaProduct({ price: mockDecimal(89.95) });
      const prisma = makePrisma({
        findUnique: jest.fn().mockResolvedValue(prismaProduct),
      });
      const repo = new ProductRepository(prisma as unknown as import('@prisma/client').PrismaClient);

      const result = await repo.findById('uuid-1');

      expect(result).not.toBeNull();
      expect(result!.id).toBe('uuid-1');
      expect(result!.price).toBe(89.95);
      expect(typeof result!.price).toBe('number');
    });

    it('returns domain Product without Prisma-specific fields', async () => {
      const prismaProduct = buildPrismaProduct();
      const prisma = makePrisma({
        findUnique: jest.fn().mockResolvedValue(prismaProduct),
      });
      const repo = new ProductRepository(prisma as unknown as import('@prisma/client').PrismaClient);

      const result = await repo.findById('uuid-1');

      expect((result as unknown as Record<string, unknown>).createdAt).toBeUndefined();
      expect((result as unknown as Record<string, unknown>).updatedAt).toBeUndefined();
    });
  });
});
