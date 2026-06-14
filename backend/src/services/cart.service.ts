import { ICartRepository } from '../repositories/cart.repository';
import { IProductRepository } from '../repositories/product.repository';
import {
  CartItemInput,
  CartItemResponse,
  CartResponse,
  CartWithItems,
} from '../types/domain';
import { NotFoundError, StockError } from '../types/errors';

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------

export interface ICartService {
  addItem(sessionId: string, item: CartItemInput): Promise<CartResponse>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const FREE_SHIPPING_THRESHOLD = 50;
const SHIPPING_COST = 4.99;

function calculateTotals(items: CartItemResponse[]): {
  subtotal: number;
  shipping: number;
  total: number;
} {
  const subtotal = items.reduce(
    (sum, item) => sum + item.productPrice * item.quantity,
    0,
  );
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = subtotal + shipping;
  return { subtotal, shipping, total };
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export class CartService implements ICartService {
  constructor(
    private readonly cartRepository: ICartRepository,
    private readonly productRepository: IProductRepository,
  ) {}

  async addItem(sessionId: string, item: CartItemInput): Promise<CartResponse> {
    // 1. Find or create the cart for this session
    const cart = await this.cartRepository.findOrCreateCart(sessionId);

    // 2. Validate product exists
    const product = await this.productRepository.findById(item.productId);
    if (!product) {
      throw new NotFoundError(`Product not found: ${item.productId}`);
    }

    // 3. Get existing cart items to check stock
    const currentCart: CartWithItems | null =
      await this.cartRepository.getCartWithItems(sessionId);

    // 4. Find existing quantity for (productId, size, color) combination
    const existingQty =
      currentCart?.items
        .filter(
          (i) =>
            i.productId === item.productId &&
            (i.size ?? undefined) === item.size &&
            (i.color ?? undefined) === item.color,
        )
        .reduce((sum, i) => sum + i.quantity, 0) ?? 0;

    // 5. Stock validation
    if (existingQty + item.quantity > product.stock) {
      throw new StockError(product.stock - existingQty);
    }

    // 6. Persist the item
    await this.cartRepository.upsertItem(cart.id, item);

    // 7. Get updated cart
    const updatedCart = await this.cartRepository.getCartWithItems(sessionId);

    // 8. Build response — prices always from DB, never from client input
    const itemResponses: CartItemResponse[] = await Promise.all(
      (updatedCart?.items ?? []).map(async (cartItem) => {
        const dbProduct = await this.productRepository.findById(cartItem.productId);
        return {
          productId: cartItem.productId,
          productName: dbProduct?.name ?? '',
          productBrand: dbProduct?.brand ?? '',
          productPrice: dbProduct?.price ?? 0,
          image: dbProduct?.image ?? '',
          quantity: cartItem.quantity,
          size: cartItem.size,
          color: cartItem.color,
        };
      }),
    );

    // 9. Calculate totals
    const { subtotal, shipping, total } = calculateTotals(itemResponses);

    return {
      sessionId,
      items: itemResponses,
      subtotal,
      shipping,
      total,
    };
  }
}
