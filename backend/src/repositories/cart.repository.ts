import { PrismaClient } from '@prisma/client';
import { Cart, CartItem, CartItemInput, CartWithItems } from '../types/domain';
import { NotFoundError } from '../types/errors';

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------

export interface ICartRepository {
  findOrCreateCart(sessionId: string): Promise<Cart>;
  upsertItem(cartId: string, item: CartItemInput): Promise<CartItem>;
  getCartWithItems(sessionId: string): Promise<CartWithItems | null>;
  removeItem(cartId: string, productId: string, size?: string, color?: string): Promise<void>;
  clearCart(cartId: string): Promise<void>;
  updateItemQuantity(
    cartId: string,
    productId: string,
    quantity: number,
    size?: string,
    color?: string,
  ): Promise<void>;
}

// ---------------------------------------------------------------------------
// Prisma row shapes (upper layers never see these)
// ---------------------------------------------------------------------------

type PrismaCartRow = {
  id: string;
  sessionId: string;
};

type PrismaCartItemRow = {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  size: string | null;
  color: string | null;
};

type PrismaCartWithItemsRow = PrismaCartRow & {
  items: PrismaCartItemRow[];
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Prisma's generated CartItemCartIdProductIdSizeColorCompoundUniqueInput
 * declares size/color as `string`, but the actual DB column is nullable.
 * Prisma requires `null` to match NULL rows in the composite unique index.
 * We cast here to satisfy the Prisma call while keeping the rest of the
 * codebase typed correctly.
 */
type CompositeUniqueKey = {
  cartId: string;
  productId: string;
  size: string | null;
  color: string | null;
};

// ---------------------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------------------

function mapToCart(row: PrismaCartRow): Cart {
  return { id: row.id, sessionId: row.sessionId };
}

function mapToCartItem(row: PrismaCartItemRow): CartItem {
  return {
    id: row.id,
    cartId: row.cartId,
    productId: row.productId,
    quantity: row.quantity,
    size: row.size ?? undefined,
    color: row.color ?? undefined,
  };
}

function mapToCartWithItems(row: PrismaCartWithItemsRow): CartWithItems {
  return {
    id: row.id,
    sessionId: row.sessionId,
    items: row.items.map(mapToCartItem),
  };
}

// ---------------------------------------------------------------------------
// Repository
// ---------------------------------------------------------------------------

export class CartRepository implements ICartRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findOrCreateCart(sessionId: string): Promise<Cart> {
    const existing = await this.prisma.cart.findUnique({ where: { sessionId } });
    if (existing) return mapToCart(existing);

    const created = await this.prisma.cart.create({ data: { sessionId } });
    return mapToCart(created);
  }

  async upsertItem(cartId: string, item: CartItemInput): Promise<CartItem> {
    const { productId, quantity, size, color } = item;

    const key: CompositeUniqueKey = {
      cartId,
      productId,
      size: size ?? null,
      color: color ?? null,
    };

    const existing = await this.prisma.cartItem.findUnique({
      where: {
        cartId_productId_size_color: key as {
          cartId: string;
          productId: string;
          size: string;
          color: string;
        },
      },
    });

    if (existing) {
      const updated = await this.prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
      });
      return mapToCartItem(updated);
    }

    const created = await this.prisma.cartItem.create({
      data: {
        cartId,
        productId,
        quantity,
        size: size ?? null,
        color: color ?? null,
      },
    });
    return mapToCartItem(created);
  }

  async getCartWithItems(sessionId: string): Promise<CartWithItems | null> {
    const row = await this.prisma.cart.findUnique({
      where: { sessionId },
      include: { items: true },
    });
    if (!row) return null;
    return mapToCartWithItems(row as PrismaCartWithItemsRow);
  }

  async removeItem(
    cartId: string,
    productId: string,
    size?: string,
    color?: string,
  ): Promise<void> {
    await this.prisma.cartItem.deleteMany({
      where: {
        cartId,
        productId,
        size: size !== undefined ? size : null,
        color: color !== undefined ? color : null,
      },
    });
  }

  async clearCart(cartId: string): Promise<void> {
    await this.prisma.cartItem.deleteMany({ where: { cartId } });
  }

  async updateItemQuantity(
    cartId: string,
    productId: string,
    quantity: number,
    size?: string,
    color?: string,
  ): Promise<void> {
    const result = await this.prisma.cartItem.updateMany({
      where: {
        cartId,
        productId,
        size: size !== undefined ? size : null,
        color: color !== undefined ? color : null,
      },
      data: { quantity },
    });
    if (result.count === 0) {
      throw new NotFoundError('Cart item not found');
    }
  }
}
