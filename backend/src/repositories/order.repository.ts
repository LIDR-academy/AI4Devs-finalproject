import { PrismaClient } from '@prisma/client';
import {
  OrderItemResponse,
  OrderListItemResponse,
  OrderListResponse,
  OrderResponse,
  ShippingInput,
} from '../types/domain';
import { NotFoundError, StockError, ValidationError } from '../types/errors';

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------

export interface IOrderRepository {
  createOrderFromCart(sessionId: string, shipping: ShippingInput): Promise<OrderResponse>;
  findBySession(sessionId: string): Promise<OrderListResponse[]>;
}

// ---------------------------------------------------------------------------
// Prisma row shapes (upper layers never see these)
// ---------------------------------------------------------------------------

type PrismaCartItemRow = {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  size: string | null;
  color: string | null;
};

type PrismaCartWithItemsRow = {
  id: string;
  sessionId: string;
  items: PrismaCartItemRow[];
};

type PrismaProductRow = {
  id: string;
  name: string;
  brand: string;
  price: { toNumber(): number };
  stock: number;
};

type PrismaOrderItemRow = {
  productId: string;
  productName: string;
  productBrand: string;
  productPrice: { toNumber(): number };
  quantity: number;
  size: string | null;
  color: string | null;
};

type PrismaOrderRow = {
  id: string;
  status: OrderResponse['status'];
  date: Date;
  subtotal: { toNumber(): number };
  shipping: { toNumber(): number };
  total: { toNumber(): number };
  shippingName: string;
  shippingEmail: string;
  shippingPhone: string | null;
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
  shippingCountry: string;
  items: PrismaOrderItemRow[];
};

type PrismaOrderListItemRow = PrismaOrderItemRow & {
  product: { image: string };
};

type PrismaOrderListRow = Omit<PrismaOrderRow, 'items'> & {
  items: PrismaOrderListItemRow[];
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const FREE_SHIPPING_THRESHOLD = 50;
const SHIPPING_COST = 4.99;

function mapToOrderItemResponse(row: PrismaOrderItemRow): OrderItemResponse {
  return {
    productId: row.productId,
    productName: row.productName,
    productBrand: row.productBrand,
    productPrice: row.productPrice.toNumber(),
    quantity: row.quantity,
    size: row.size ?? undefined,
    color: row.color ?? undefined,
  };
}

function mapToOrderResponse(row: PrismaOrderRow): OrderResponse {
  return {
    id: row.id,
    status: row.status,
    date: row.date.toISOString(),
    subtotal: row.subtotal.toNumber(),
    shipping: row.shipping.toNumber(),
    total: row.total.toNumber(),
    shippingName: row.shippingName,
    shippingEmail: row.shippingEmail,
    shippingPhone: row.shippingPhone ?? undefined,
    shippingAddress: row.shippingAddress,
    shippingCity: row.shippingCity,
    shippingPostalCode: row.shippingPostalCode,
    shippingCountry: row.shippingCountry,
    items: row.items.map(mapToOrderItemResponse),
  };
}

function mapToOrderListItemResponse(row: PrismaOrderListItemRow): OrderListItemResponse {
  return {
    ...mapToOrderItemResponse(row),
    image: row.product.image,
  };
}

function mapToOrderListResponse(row: PrismaOrderListRow): OrderListResponse {
  return {
    id: row.id,
    status: row.status,
    date: row.date.toISOString(),
    subtotal: row.subtotal.toNumber(),
    shipping: row.shipping.toNumber(),
    total: row.total.toNumber(),
    shippingName: row.shippingName,
    shippingEmail: row.shippingEmail,
    shippingPhone: row.shippingPhone ?? undefined,
    shippingAddress: row.shippingAddress,
    shippingCity: row.shippingCity,
    shippingPostalCode: row.shippingPostalCode,
    shippingCountry: row.shippingCountry,
    items: row.items.map(mapToOrderListItemResponse),
  };
}

// ---------------------------------------------------------------------------
// Repository
// ---------------------------------------------------------------------------

export class OrderRepository implements IOrderRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async createOrderFromCart(
    sessionId: string,
    shipping: ShippingInput,
  ): Promise<OrderResponse> {
    return this.prisma.$transaction(async (tx) => {
      // 1. Re-read the cart with its items inside the transaction.
      const cart = (await tx.cart.findUnique({
        where: { sessionId },
        include: { items: true },
      })) as PrismaCartWithItemsRow | null;

      if (!cart || cart.items.length === 0) {
        throw new ValidationError('El carrito está vacío');
      }

      // 2. Re-validate stock and snapshot price/name/brand for each item.
      let subtotal = 0;
      const orderItemsData: Array<{
        productId: string;
        productName: string;
        productBrand: string;
        productPrice: number;
        quantity: number;
        size: string | null;
        color: string | null;
      }> = [];

      for (const item of cart.items) {
        const product = (await tx.product.findUnique({
          where: { id: item.productId },
        })) as PrismaProductRow | null;

        if (!product) {
          throw new NotFoundError(`Product not found: ${item.productId}`);
        }

        // Atomic conditional decrement — the `gte` in `where` is evaluated by
        // PostgreSQL at write time, not from the `stock` read above. This is
        // what makes the check safe under concurrent checkouts of the same
        // product: two simultaneous requests cannot both pass.
        const stockUpdate = await tx.product.updateMany({
          where: { id: product.id, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });

        if (stockUpdate.count === 0) {
          throw new StockError(product.stock);
        }

        const price = product.price.toNumber();
        subtotal += price * item.quantity;

        orderItemsData.push({
          productId: product.id,
          productName: product.name,
          productBrand: product.brand,
          productPrice: price,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
        });
      }

      // 3. Calculate shipping/total (same constants as CartService).
      const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
      const total = subtotal + shippingCost;

      // 4. Create the Order with nested OrderItem[].
      const created = (await tx.order.create({
        data: {
          id: `ORD-${crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()}`,
          sessionId,
          subtotal,
          shipping: shippingCost,
          total,
          shippingName: shipping.name,
          shippingEmail: shipping.email,
          shippingPhone: shipping.phone ?? null,
          shippingAddress: shipping.address,
          shippingCity: shipping.city,
          shippingPostalCode: shipping.postalCode,
          shippingCountry: shipping.country,
          items: { create: orderItemsData },
        },
        include: { items: true },
      })) as PrismaOrderRow;

      // 5. Empty the cart.
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      // 6. Map to domain type (never the Prisma-generated type).
      return mapToOrderResponse(created);
    });
  }

  async findBySession(sessionId: string): Promise<OrderListResponse[]> {
    const rows = (await this.prisma.order.findMany({
      where: { sessionId },
      orderBy: { date: 'desc' },
      include: { items: { include: { product: { select: { image: true } } } } },
    })) as unknown as PrismaOrderListRow[];

    return rows.map(mapToOrderListResponse);
  }
}
