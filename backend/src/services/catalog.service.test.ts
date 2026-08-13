import { CatalogService } from './catalog.service';
import { IProductRepository } from '../repositories/product.repository';
import { Product, ProductFilters } from '../types/domain';

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

const makeRepo = (overrides: Partial<IProductRepository> = {}): IProductRepository => ({
  findAll: jest.fn().mockResolvedValue([]),
  findById: jest.fn().mockResolvedValue(null),
  ...overrides,
});

describe('CatalogService', () => {
  describe('getProducts()', () => {
    it('returns all products from the repository', async () => {
      const products = [buildProduct(), buildProduct({ id: 'uuid-2', name: 'Asics Gel' })];
      const repo = makeRepo({ findAll: jest.fn().mockResolvedValue(products) });
      const service = new CatalogService(repo);

      const result = await service.getProducts();

      expect(result.products).toEqual(products);
    });

    it('returns total equal to products length', async () => {
      const products = [buildProduct(), buildProduct({ id: 'uuid-2' }), buildProduct({ id: 'uuid-3' })];
      const repo = makeRepo({ findAll: jest.fn().mockResolvedValue(products) });
      const service = new CatalogService(repo);

      const result = await service.getProducts();

      expect(result.total).toBe(3);
      expect(result.total).toBe(result.products.length);
    });

    it('returns empty array and total 0 when no products exist', async () => {
      const repo = makeRepo({ findAll: jest.fn().mockResolvedValue([]) });
      const service = new CatalogService(repo);

      const result = await service.getProducts();

      expect(result.products).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('delegates to repository without accessing Prisma directly', async () => {
      const repo = makeRepo();
      const service = new CatalogService(repo);

      await service.getProducts();

      expect(repo.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('getProducts() with filters', () => {
    it('passes filters to repository findAll', async () => {
      const filters: ProductFilters = { distance: ['5K', 'marathon'] };
      const repo = makeRepo();
      const service = new CatalogService(repo);

      await service.getProducts(filters);

      expect(repo.findAll).toHaveBeenCalledWith(filters);
    });

    it('passes undefined to findAll when called without filters', async () => {
      const repo = makeRepo();
      const service = new CatalogService(repo);

      await service.getProducts();

      expect(repo.findAll).toHaveBeenCalledWith(undefined);
    });

    it('returns total equal to filtered products length', async () => {
      const filteredProducts = [buildProduct({ id: 'uuid-1' }), buildProduct({ id: 'uuid-2' })];
      const repo = makeRepo({ findAll: jest.fn().mockResolvedValue(filteredProducts) });
      const service = new CatalogService(repo);

      const result = await service.getProducts({ distance: ['marathon'] });

      expect(result.total).toBe(2);
      expect(result.products).toEqual(filteredProducts);
    });

    it('passes multi-dimension filters to repository', async () => {
      const filters: ProductFilters = { distance: ['5K'], surface: ['road'], level: ['beginner'] };
      const repo = makeRepo();
      const service = new CatalogService(repo);

      await service.getProducts(filters);

      expect(repo.findAll).toHaveBeenCalledWith(filters);
    });
  });

  describe('getProductById()', () => {
    it('returns null when product does not exist', async () => {
      const repo = makeRepo({ findById: jest.fn().mockResolvedValue(null) });
      const service = new CatalogService(repo);

      const result = await service.getProductById('non-existent');

      expect(result).toBeNull();
    });

    it('delegates to repository with the given id', async () => {
      const repo = makeRepo({ findById: jest.fn().mockResolvedValue(null) });
      const service = new CatalogService(repo);

      await service.getProductById('target-id');

      expect(repo.findById).toHaveBeenCalledWith('target-id');
    });

    it('returns the product when found', async () => {
      const product = buildProduct({ id: 'found-id' });
      const repo = makeRepo({ findById: jest.fn().mockResolvedValue(product) });
      const service = new CatalogService(repo);

      const result = await service.getProductById('found-id');

      expect(result).toEqual(product);
    });
  });
});
