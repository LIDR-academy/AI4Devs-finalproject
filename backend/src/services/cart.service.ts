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
  getCart(sessionId: string): Promise<CartResponse>;
  addItem(sessionId: string, item: CartItemInput): Promise<CartResponse>;
  updateItem(
    sessionId: string,
    productId: string,
    quantity: number,
    size?: string,
    color?: string,
  ): Promise<CartResponse>;
  removeItem(
    sessionId: string,
    productId: string,
    size?: string,
    color?: string,
  ): Promise<CartResponse>;
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

  private async buildCartResponse(
    cartWithItems: CartWithItems | null,
  ): Promise<CartResponse> {
    const itemResponses: CartItemResponse[] = await Promise.all(
      (cartWithItems?.items ?? []).map(async (cartItem) => {
        const dbProduct = await this.productRepository.findById(cartItem.productId);
        return {
          productId: cartItem.productId,
          productName: dbProduct?.name ?? '',
          productBrand: dbProduct?.brand ?? '',
          productPrice: dbProduct?.price ?? 0,
          image: dbProduct?.image ?? '',
          stock: dbProduct?.stock ?? 0,
          quantity: cartItem.quantity,
          size: cartItem.size,
          color: cartItem.color,
        };
      }),
    );
    const { subtotal, shipping, total } = calculateTotals(itemResponses);
    return { items: itemResponses, subtotal, shipping, total };
  }

  async getCart(sessionId: string): Promise<CartResponse> {
    const cartWithItems = await this.cartRepository.getCartWithItems(sessionId);
    return this.buildCartResponse(cartWithItems);
  }

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

    // 7. Build response from updated cart
    const updatedCart = await this.cartRepository.getCartWithItems(sessionId);
    return this.buildCartResponse(updatedCart);
  }

  async updateItem(
    sessionId: string,
    productId: string,
    quantity: number,
    size?: string,
    color?: string,
  ): Promise<CartResponse> {
    // 1. Verify cart and item exist
    const currentCart = await this.cartRepository.getCartWithItems(sessionId);
    if (!currentCart) {
      throw new NotFoundError('Cart not found');
    }
    const itemExists = currentCart.items.some(
      (i) =>
        i.productId === productId &&
        (i.size ?? undefined) === size &&
        (i.color ?? undefined) === color,
    );
    if (!itemExists) {
      throw new NotFoundError('Cart item not found');
    }

    // 2. Validate stock
    const product = await this.productRepository.findById(productId);
    if (quantity > (product?.stock ?? 0)) {
      throw new StockError(product?.stock ?? 0);
    }

    // 3. Update quantity
    await this.cartRepository.updateItemQuantity(
      currentCart.id,
      productId,
      quantity,
      size,
      color,
    );

    // 4. Return updated cart
    const updatedCart = await this.cartRepository.getCartWithItems(sessionId);
    return this.buildCartResponse(updatedCart);
  }

  async removeItem(
    sessionId: string,
    productId: string,
    size?: string,
    color?: string,
  ): Promise<CartResponse> {
    // 1. Verify cart and item exist
    const currentCart = await this.cartRepository.getCartWithItems(sessionId);
    if (!currentCart) {
      throw new NotFoundError('Cart not found');
    }
    const itemExists = currentCart.items.some(
      (i) =>
        i.productId === productId &&
        (i.size ?? undefined) === size &&
        (i.color ?? undefined) === color,
    );
    if (!itemExists) {
      throw new NotFoundError('Cart item not found');
    }

    // 2. Remove item
    await this.cartRepository.removeItem(currentCart.id, productId, size, color);

    // 3. Return updated cart
    const updatedCart = await this.cartRepository.getCartWithItems(sessionId);
    return this.buildCartResponse(updatedCart);
  }
}
