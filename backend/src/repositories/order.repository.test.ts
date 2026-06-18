import { OrderRepository } from './order.repository';
import { ShippingInput } from '../types/domain';

// ---------------------------------------------------------------------------
// Minimal Prisma mock — typed just enough for OrderRepository's usage.
// All operations happen inside prisma.$transaction(async (tx) => {...}),
// so the mock `tx` exposes the same shape as the top-level mock.
// ---------------------------------------------------------------------------

const mockCartFindUnique = jest.fn();
const mockProductFindUnique = jest.fn();
const mockOrderCreate = jest.fn();
const mockCartItemDeleteMany = jest.fn();

const mockTx = {
  cart: {
    findUnique: mockCartFindUnique,
  },
  product: {
    findUnique: mockProductFindUnique,
  },
  order: {
    create: mockOrderCreate,
  },
  cartItem: {
    deleteMany: mockCartItemDeleteMany,
  },
};

const mockTransaction = jest.fn((callback: (tx: typeof mockTx) => unknown) =>
  callback(mockTx),
);

const mockPrisma = {
  $transaction: mockTransaction,
} as unknown as import('@prisma/client').PrismaClient;

// ---------------------------------------------------------------------------
// Builders
// ---------------------------------------------------------------------------

const buildShipping = (overrides: Partial<ShippingInput> = {}): ShippingInput => ({
  name: 'Jane Runner',
  email: 'jane@example.com',
  address: 'Calle Falsa 123',
  city: 'Madrid',
  postalCode: '28001',
  country: 'España',
  ...overrides,
});

function decimal(value: number) {
  return { toNumber: () => value };
}

/**
 * Mimics what Prisma's `order.create` would actually return: Decimal fields
 * as Decimal-like objects, a real `date`, and nested `items` with their own
 * Decimal `productPrice`. The repository must map this row to `OrderResponse`.
 */
function asPrismaOrderRow(data: {
  id: string;
  subtotal: number;
  shipping: number;
  total: number;
  shippingName: string;
  shippingEmail: string;
  shippingPhone?: string | null;
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
  shippingCountry: string;
  items: { create: Array<Record<string, unknown>> };
}) {
  return {
    id: data.id,
    status: 'processing',
    date: new Date('2024-01-01T00:00:00.000Z'),
    subtotal: decimal(data.subtotal),
    shipping: decimal(data.shipping),
    total: decimal(data.total),
    shippingName: data.shippingName,
    shippingEmail: data.shippingEmail,
    shippingPhone: data.shippingPhone ?? null,
    shippingAddress: data.shippingAddress,
    shippingCity: data.shippingCity,
    shippingPostalCode: data.shippingPostalCode,
    shippingCountry: data.shippingCountry,
    items: data.items.create.map((item) => ({
      ...item,
      productPrice: decimal(item.productPrice as number),
    })),
  };
}

const buildCartRow = (items: Array<Record<string, unknown>>) => ({
  id: 'cart-1',
  sessionId: 'session-1',
  items,
});

const buildProductRow = (overrides: Record<string, unknown> = {}) => ({
  id: 'prod-1',
  name: 'Nike Pegasus 41',
  brand: 'Nike',
  price: decimal(40),
  stock: 10,
  ...overrides,
});

// ---------------------------------------------------------------------------

describe('OrderRepository', () => {
  let repo: OrderRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    mockTransaction.mockImplementation((callback: (tx: typeof mockTx) => unknown) =>
      callback(mockTx),
    );
    repo = new OrderRepository(mockPrisma);
  });

  describe('createOrderFromCart', () => {
    it('crea el Order con snapshot de precio leído de BD y vacía el carrito', async () => {
      const cartRow = buildCartRow([
        { id: 'item-1', cartId: 'cart-1', productId: 'prod-1', quantity: 2, size: 'M', color: null },
      ]);
      mockCartFindUnique.mockResolvedValueOnce(cartRow);
      mockProductFindUnique.mockResolvedValueOnce(buildProductRow({ price: decimal(40) }));
      mockOrderCreate.mockImplementationOnce(
        async ({ data }: { data: Parameters<typeof asPrismaOrderRow>[0] }) =>
          asPrismaOrderRow(data),
      );
      mockCartItemDeleteMany.mockResolvedValueOnce({ count: 1 });

      const shipping = buildShipping();
      const result = await repo.createOrderFromCart('session-1', shipping);

      // Price snapshot comes from DB (40), never from any input value
      expect(result.items[0].productPrice).toBe(40);
      expect(result.subtotal).toBe(80);

      // Cart is cleared with the correct cartId, within the same transaction
      expect(mockCartItemDeleteMany).toHaveBeenCalledWith({ where: { cartId: 'cart-1' } });
      expect(mockTransaction).toHaveBeenCalledTimes(1);
    });

    it('calcula subtotal/shipping/total correctamente para varios ítems', async () => {
      const cartRow = buildCartRow([
        { id: 'item-1', cartId: 'cart-1', productId: 'prod-1', quantity: 1, size: null, color: null },
        { id: 'item-2', cartId: 'cart-1', productId: 'prod-2', quantity: 2, size: null, color: null },
      ]);
      mockCartFindUnique.mockResolvedValueOnce(cartRow);
      mockProductFindUnique
        .mockResolvedValueOnce(buildProductRow({ id: 'prod-1', price: decimal(30) }))
        .mockResolvedValueOnce(buildProductRow({ id: 'prod-2', price: decimal(10) }));
      mockOrderCreate.mockImplementationOnce(
        async ({ data }: { data: Parameters<typeof asPrismaOrderRow>[0] }) =>
          asPrismaOrderRow(data),
      );
      mockCartItemDeleteMany.mockResolvedValueOnce({ count: 2 });

      // subtotal = 30*1 + 10*2 = 50 -> shipping should be 0 (>= 50)
      const result = await repo.createOrderFromCart('session-1', buildShipping());

      expect(result.subtotal).toBe(50);
      expect(result.shipping).toBe(0);
      expect(result.total).toBe(50);
    });

    it('aplica shipping de 4.99 cuando el subtotal es menor que 50', async () => {
      const cartRow = buildCartRow([
        { id: 'item-1', cartId: 'cart-1', productId: 'prod-1', quantity: 1, size: null, color: null },
      ]);
      mockCartFindUnique.mockResolvedValueOnce(cartRow);
      mockProductFindUnique.mockResolvedValueOnce(buildProductRow({ price: decimal(20) }));
      mockOrderCreate.mockImplementationOnce(
        async ({ data }: { data: Parameters<typeof asPrismaOrderRow>[0] }) =>
          asPrismaOrderRow(data),
      );
      mockCartItemDeleteMany.mockResolvedValueOnce({ count: 1 });

      const result = await repo.createOrderFromCart('session-1', buildShipping());

      expect(result.subtotal).toBe(20);
      expect(result.shipping).toBe(4.99);
      expect(result.total).toBeCloseTo(24.99, 2);
    });

    it('lanza ValidationError si el carrito está vacío', async () => {
      mockCartFindUnique.mockResolvedValueOnce(buildCartRow([]));

      await expect(
        repo.createOrderFromCart('session-1', buildShipping()),
      ).rejects.toMatchObject({ name: 'ValidationError' });
      expect(mockOrderCreate).not.toHaveBeenCalled();
    });

    it('lanza ValidationError si el carrito no existe', async () => {
      mockCartFindUnique.mockResolvedValueOnce(null);

      await expect(
        repo.createOrderFromCart('session-1', buildShipping()),
      ).rejects.toMatchObject({ name: 'ValidationError' });
      expect(mockOrderCreate).not.toHaveBeenCalled();
    });

    it('lanza StockError si algún ítem supera el stock disponible', async () => {
      const cartRow = buildCartRow([
        { id: 'item-1', cartId: 'cart-1', productId: 'prod-1', quantity: 5, size: null, color: null },
      ]);
      mockCartFindUnique.mockResolvedValueOnce(cartRow);
      mockProductFindUnique.mockResolvedValueOnce(buildProductRow({ stock: 2 }));

      await expect(
        repo.createOrderFromCart('session-1', buildShipping()),
      ).rejects.toMatchObject({ name: 'StockError', available: 2 });
      expect(mockOrderCreate).not.toHaveBeenCalled();
    });

    it('lanza NotFoundError si un producto del carrito ya no existe', async () => {
      const cartRow = buildCartRow([
        { id: 'item-1', cartId: 'cart-1', productId: 'prod-missing', quantity: 1, size: null, color: null },
      ]);
      mockCartFindUnique.mockResolvedValueOnce(cartRow);
      mockProductFindUnique.mockResolvedValueOnce(null);

      await expect(
        repo.createOrderFromCart('session-1', buildShipping()),
      ).rejects.toMatchObject({ name: 'NotFoundError' });
      expect(mockOrderCreate).not.toHaveBeenCalled();
    });
  });
});
