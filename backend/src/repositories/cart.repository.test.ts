import { CartRepository } from './cart.repository';

// ---------------------------------------------------------------------------
// Minimal Prisma mock — typed just enough for CartRepository's usage
// ---------------------------------------------------------------------------

const mockCartFindUnique = jest.fn();
const mockCartCreate = jest.fn();
const mockCartItemFindUnique = jest.fn();
const mockCartItemCreate = jest.fn();
const mockCartItemUpdate = jest.fn();
const mockCartItemUpdateMany = jest.fn();
const mockCartItemDeleteMany = jest.fn();
const mockCartFindUniqueWithItems = jest.fn();

const mockPrisma = {
  cart: {
    findUnique: mockCartFindUnique,
    create: mockCartCreate,
  },
  cartItem: {
    findUnique: mockCartItemFindUnique,
    create: mockCartItemCreate,
    update: mockCartItemUpdate,
    updateMany: mockCartItemUpdateMany,
    deleteMany: mockCartItemDeleteMany,
  },
} as unknown as import('@prisma/client').PrismaClient;

// ---------------------------------------------------------------------------

describe('CartRepository', () => {
  let repo: CartRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new CartRepository(mockPrisma);
  });

  // -------------------------------------------------------------------------
  // findOrCreateCart
  // -------------------------------------------------------------------------

  describe('findOrCreateCart', () => {
    it('crea carrito si no existe para la sesión', async () => {
      const sessionId = 'session-abc';
      mockCartFindUnique.mockResolvedValueOnce(null);
      const created = { id: 'cart-1', sessionId };
      mockCartCreate.mockResolvedValueOnce(created);

      const result = await repo.findOrCreateCart(sessionId);

      expect(mockCartFindUnique).toHaveBeenCalledWith({
        where: { sessionId },
      });
      expect(mockCartCreate).toHaveBeenCalledWith({
        data: { sessionId },
      });
      expect(result).toEqual({ id: 'cart-1', sessionId });
    });

    it('devuelve carrito existente sin llamar a create', async () => {
      const sessionId = 'session-abc';
      const existing = { id: 'cart-existing', sessionId };
      mockCartFindUnique.mockResolvedValueOnce(existing);

      const result = await repo.findOrCreateCart(sessionId);

      expect(mockCartFindUnique).toHaveBeenCalledWith({
        where: { sessionId },
      });
      expect(mockCartCreate).not.toHaveBeenCalled();
      expect(result).toEqual({ id: 'cart-existing', sessionId });
    });
  });

  // -------------------------------------------------------------------------
  // upsertItem
  // -------------------------------------------------------------------------

  describe('upsertItem', () => {
    it('crea nuevo CartItem cuando no existe', async () => {
      mockCartItemFindUnique.mockResolvedValueOnce(null);
      const created = {
        id: 'item-1',
        cartId: 'cart-1',
        productId: 'prod-1',
        quantity: 2,
        size: 'M',
        color: 'red',
      };
      mockCartItemCreate.mockResolvedValueOnce(created);

      const result = await repo.upsertItem('cart-1', {
        productId: 'prod-1',
        quantity: 2,
        size: 'M',
        color: 'red',
      });

      expect(mockCartItemFindUnique).toHaveBeenCalledWith({
        where: {
          cartId_productId_size_color: {
            cartId: 'cart-1',
            productId: 'prod-1',
            size: 'M',
            color: 'red',
          },
        },
      });
      expect(mockCartItemCreate).toHaveBeenCalledWith({
        data: {
          cartId: 'cart-1',
          productId: 'prod-1',
          quantity: 2,
          size: 'M',
          color: 'red',
        },
      });
      expect(mockCartItemUpdate).not.toHaveBeenCalled();
      expect(result).toEqual({
        id: 'item-1',
        cartId: 'cart-1',
        productId: 'prod-1',
        quantity: 2,
        size: 'M',
        color: 'red',
      });
    });

    it('incrementa quantity cuando el ítem existe', async () => {
      const existing = {
        id: 'item-1',
        cartId: 'cart-1',
        productId: 'prod-1',
        quantity: 1,
        size: null,
        color: null,
      };
      mockCartItemFindUnique.mockResolvedValueOnce(existing);
      const updated = { ...existing, quantity: 2 };
      mockCartItemUpdate.mockResolvedValueOnce(updated);

      const result = await repo.upsertItem('cart-1', {
        productId: 'prod-1',
        quantity: 1,
      });

      expect(mockCartItemUpdate).toHaveBeenCalledWith({
        where: { id: 'item-1' },
        data: { quantity: 2 },
      });
      expect(mockCartItemCreate).not.toHaveBeenCalled();
      expect(result.quantity).toBe(2);
    });
  });

  // -------------------------------------------------------------------------
  // getCartWithItems
  // -------------------------------------------------------------------------

  describe('getCartWithItems', () => {
    it('devuelve null si la sesión no tiene carrito', async () => {
      mockCartFindUnique.mockResolvedValueOnce(null);

      const result = await repo.getCartWithItems('session-no-cart');

      expect(result).toBeNull();
    });

    it('devuelve el carrito con sus ítems mapeados a tipos de dominio', async () => {
      const prismaCart = {
        id: 'cart-1',
        sessionId: 'session-1',
        items: [
          {
            id: 'item-1',
            cartId: 'cart-1',
            productId: 'prod-1',
            quantity: 3,
            size: 'L',
            color: null,
          },
        ],
      };
      mockCartFindUnique.mockResolvedValueOnce(prismaCart);

      const result = await repo.getCartWithItems('session-1');

      expect(result).not.toBeNull();
      expect(result!.id).toBe('cart-1');
      expect(result!.sessionId).toBe('session-1');
      expect(result!.items).toHaveLength(1);
      expect(result!.items[0]).toEqual({
        id: 'item-1',
        cartId: 'cart-1',
        productId: 'prod-1',
        quantity: 3,
        size: 'L',
        color: undefined,
      });
    });
  });

  // -------------------------------------------------------------------------
  // removeItem
  // -------------------------------------------------------------------------

  describe('removeItem', () => {
    it('llama a deleteMany con la combinación correcta', async () => {
      mockCartItemDeleteMany.mockResolvedValueOnce({ count: 1 });

      await repo.removeItem('cart-1', 'prod-1', 'S', 'blue');

      expect(mockCartItemDeleteMany).toHaveBeenCalledWith({
        where: {
          cartId: 'cart-1',
          productId: 'prod-1',
          size: 'S',
          color: 'blue',
        },
      });
    });
  });

  // -------------------------------------------------------------------------
  // clearCart
  // -------------------------------------------------------------------------

  describe('clearCart', () => {
    it('elimina todos los ítems del carrito', async () => {
      mockCartItemDeleteMany.mockResolvedValueOnce({ count: 3 });

      await repo.clearCart('cart-1');

      expect(mockCartItemDeleteMany).toHaveBeenCalledWith({
        where: { cartId: 'cart-1' },
      });
    });
  });

  // -------------------------------------------------------------------------
  // updateItemQuantity (US-008)
  // -------------------------------------------------------------------------

  describe('updateItemQuantity', () => {
    it('establece la cantidad exacta cuando el ítem existe', async () => {
      mockCartItemUpdateMany.mockResolvedValueOnce({ count: 1 });

      await repo.updateItemQuantity('cart-1', 'prod-1', 3, 'M', 'red');

      expect(mockCartItemUpdateMany).toHaveBeenCalledWith({
        where: {
          cartId: 'cart-1',
          productId: 'prod-1',
          size: 'M',
          color: 'red',
        },
        data: { quantity: 3 },
      });
    });

    it('establece cantidad exacta sin talla ni color', async () => {
      mockCartItemUpdateMany.mockResolvedValueOnce({ count: 1 });

      await repo.updateItemQuantity('cart-1', 'prod-1', 2);

      expect(mockCartItemUpdateMany).toHaveBeenCalledWith({
        where: {
          cartId: 'cart-1',
          productId: 'prod-1',
          size: null,
          color: null,
        },
        data: { quantity: 2 },
      });
    });

    it('lanza NotFoundError si el ítem no existe', async () => {
      mockCartItemUpdateMany.mockResolvedValueOnce({ count: 0 });

      await expect(
        repo.updateItemQuantity('cart-1', 'prod-99', 1),
      ).rejects.toMatchObject({ name: 'NotFoundError' });
    });
  });
});
