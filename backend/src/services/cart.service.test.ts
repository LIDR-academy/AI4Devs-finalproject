import { CartService } from './cart.service';
import { ICartRepository } from '../repositories/cart.repository';
import { IProductRepository } from '../repositories/product.repository';
import { NotFoundError, StockError } from '../types/errors';
import {
  Cart,
  CartItem,
  CartItemInput,
  CartWithItems,
  Product,
} from '../types/domain';

// ---------------------------------------------------------------------------
// Builders
// ---------------------------------------------------------------------------

const buildProduct = (overrides: Partial<Product> = {}): Product => ({
  id: 'prod-1',
  name: 'Nike Pegasus 41',
  brand: 'Nike',
  price: 99.99,
  image: 'products/nike-pegasus.jpg',
  category: 'shoes',
  subcategory: 'road',
  description: 'Great running shoe',
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

const buildCart = (overrides: Partial<Cart> = {}): Cart => ({
  id: 'cart-1',
  sessionId: 'session-1',
  ...overrides,
});

const buildCartItem = (overrides: Partial<CartItem> = {}): CartItem => ({
  id: 'item-1',
  cartId: 'cart-1',
  productId: 'prod-1',
  quantity: 1,
  size: undefined,
  color: undefined,
  ...overrides,
});

const buildCartWithItems = (
  items: CartItem[] = [],
  overrides: Partial<CartWithItems> = {},
): CartWithItems => ({
  id: 'cart-1',
  sessionId: 'session-1',
  items,
  ...overrides,
});

const makeCartRepo = (
  overrides: Partial<ICartRepository> = {},
): jest.Mocked<ICartRepository> => ({
  findOrCreateCart: jest.fn().mockResolvedValue(buildCart()),
  upsertItem: jest.fn().mockResolvedValue(buildCartItem()),
  getCartWithItems: jest.fn().mockResolvedValue(buildCartWithItems()),
  removeItem: jest.fn().mockResolvedValue(undefined),
  clearCart: jest.fn().mockResolvedValue(undefined),
  ...overrides,
} as jest.Mocked<ICartRepository>);

const makeProductRepo = (
  overrides: Partial<IProductRepository> = {},
): jest.Mocked<IProductRepository> => ({
  findAll: jest.fn().mockResolvedValue([]),
  findById: jest.fn().mockResolvedValue(buildProduct()),
  ...overrides,
} as jest.Mocked<IProductRepository>);

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('CartService', () => {
  describe('addItem()', () => {
    it('lanza NotFoundError si el producto no existe', async () => {
      const productRepo = makeProductRepo({
        findById: jest.fn().mockResolvedValue(null),
      });
      const cartRepo = makeCartRepo();
      const service = new CartService(cartRepo, productRepo);

      const item: CartItemInput = { productId: 'nonexistent', quantity: 1 };

      await expect(service.addItem('session-1', item)).rejects.toThrow(NotFoundError);
    });

    it('lanza StockError si la cantidad supera el stock', async () => {
      const product = buildProduct({ stock: 2 });
      const existingItem = buildCartItem({ productId: 'prod-1', quantity: 2 });
      const cartWithItems = buildCartWithItems([existingItem]);

      const productRepo = makeProductRepo({
        findById: jest.fn().mockResolvedValue(product),
      });
      const cartRepo = makeCartRepo({
        getCartWithItems: jest.fn().mockResolvedValue(cartWithItems),
      });
      const service = new CartService(cartRepo, productRepo);

      const item: CartItemInput = { productId: 'prod-1', quantity: 1 };

      await expect(service.addItem('session-1', item)).rejects.toThrow(StockError);
    });

    it('StockError contiene available=0 cuando el stock está agotado por el carrito', async () => {
      const product = buildProduct({ stock: 2 });
      const existingItem = buildCartItem({ productId: 'prod-1', quantity: 2 });
      const cartWithItems = buildCartWithItems([existingItem]);

      const productRepo = makeProductRepo({
        findById: jest.fn().mockResolvedValue(product),
      });
      const cartRepo = makeCartRepo({
        getCartWithItems: jest.fn().mockResolvedValue(cartWithItems),
      });
      const service = new CartService(cartRepo, productRepo);

      const item: CartItemInput = { productId: 'prod-1', quantity: 1 };

      let thrownError: unknown;
      try {
        await service.addItem('session-1', item);
      } catch (e) {
        thrownError = e;
      }

      expect(thrownError).toBeInstanceOf(StockError);
      expect((thrownError as StockError).available).toBe(0);
    });

    it('llama a upsertItem cuando hay stock suficiente', async () => {
      const product = buildProduct({ stock: 5 });
      const emptyCart = buildCartWithItems([]);

      const productRepo = makeProductRepo({
        findById: jest.fn().mockResolvedValue(product),
      });
      const cartRepo = makeCartRepo({
        getCartWithItems: jest
          .fn()
          .mockResolvedValueOnce(emptyCart)   // first call: existing items check
          .mockResolvedValueOnce(buildCartWithItems([buildCartItem({ quantity: 2 })])), // second call: after upsert
      });
      const service = new CartService(cartRepo, productRepo);

      const item: CartItemInput = { productId: 'prod-1', quantity: 2 };
      await service.addItem('session-1', item);

      expect(cartRepo.upsertItem).toHaveBeenCalledTimes(1);
      expect(cartRepo.upsertItem).toHaveBeenCalledWith('cart-1', item);
    });

    it('addItem usa el precio de la BD, no del input', async () => {
      const product = buildProduct({ id: 'prod-1', price: 99.99, stock: 5 });
      const updatedItem = buildCartItem({ productId: 'prod-1', quantity: 1 });
      const updatedCart = buildCartWithItems([updatedItem]);

      const productRepo = makeProductRepo({
        findById: jest.fn().mockResolvedValue(product),
      });
      const cartRepo = makeCartRepo({
        getCartWithItems: jest
          .fn()
          .mockResolvedValueOnce(buildCartWithItems([]))   // existing items
          .mockResolvedValueOnce(updatedCart),              // after upsert
      });
      const service = new CartService(cartRepo, productRepo);

      // CartItemInput has no price field — but we verify the response uses DB price
      const item: CartItemInput = { productId: 'prod-1', quantity: 1 };
      const response = await service.addItem('session-1', item);

      expect(response.items[0].productPrice).toBe(99.99);
      expect(response.items[0].productName).toBe('Nike Pegasus 41');
      expect(response.items[0].productBrand).toBe('Nike');
    });

    it('calculateTotals devuelve shipping 0 cuando subtotal >= 50', async () => {
      const product = buildProduct({ id: 'prod-1', price: 30, stock: 10 });
      const items = [
        buildCartItem({ productId: 'prod-1', quantity: 2 }), // 30 * 2 = 60
      ];
      const cartWithItems = buildCartWithItems(items);

      const productRepo = makeProductRepo({
        findById: jest.fn().mockResolvedValue(product),
      });
      const cartRepo = makeCartRepo({
        getCartWithItems: jest
          .fn()
          .mockResolvedValueOnce(buildCartWithItems([]))  // existing items check
          .mockResolvedValueOnce(cartWithItems),           // after upsert
      });
      const service = new CartService(cartRepo, productRepo);

      const response = await service.addItem('session-1', {
        productId: 'prod-1',
        quantity: 2,
      });

      expect(response.subtotal).toBe(60);
      expect(response.shipping).toBe(0);
      expect(response.total).toBe(60);
    });

    it('calculateTotals devuelve shipping 4.99 cuando subtotal < 50', async () => {
      const product = buildProduct({ id: 'prod-1', price: 15, stock: 10 });
      const items = [
        buildCartItem({ productId: 'prod-1', quantity: 2 }), // 15 * 2 = 30
      ];
      const cartWithItems = buildCartWithItems(items);

      const productRepo = makeProductRepo({
        findById: jest.fn().mockResolvedValue(product),
      });
      const cartRepo = makeCartRepo({
        getCartWithItems: jest
          .fn()
          .mockResolvedValueOnce(buildCartWithItems([]))  // existing items check
          .mockResolvedValueOnce(cartWithItems),           // after upsert
      });
      const service = new CartService(cartRepo, productRepo);

      const response = await service.addItem('session-1', {
        productId: 'prod-1',
        quantity: 2,
      });

      expect(response.subtotal).toBe(30);
      expect(response.shipping).toBe(4.99);
      expect(response.total).toBeCloseTo(34.99, 2);
    });
  });
});
