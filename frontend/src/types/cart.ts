export interface CartItemUI {
  productId: string;
  productName: string;
  productBrand: string;
  productPrice: number;
  image: string;
  stock: number;
  quantity: number;
  size?: string;
  color?: string;
}

export interface CartState {
  items: CartItemUI[];
  subtotal: number;
  shipping: number;
  total: number;
}

export interface CartContextValue {
  items: CartItemUI[];
  itemCount: number;
  subtotal: number;
  shipping: number;
  total: number;
  addItem(productId: string, quantity: number, size?: string, color?: string): Promise<void>;
  updateItem(productId: string, quantity: number, size?: string, color?: string): Promise<void>;
  removeItem(productId: string, size?: string, color?: string): Promise<void>;
  clearCart(): void;
  isLoading: boolean;
  error: string | null;
}

export interface CartResponse {
  items: CartItemUI[];
  subtotal: number;
  shipping: number;
  total: number;
}
