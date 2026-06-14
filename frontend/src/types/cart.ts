export interface CartItemUI {
  productId: string;
  productName: string;
  productBrand: string;
  productPrice: number;
  image: string;
  quantity: number;
  size?: string;
  color?: string;
}

export interface CartState {
  sessionId: string | null;
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
  addItem(
    productId: string,
    quantity: number,
    size?: string,
    color?: string,
  ): Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export interface CartResponse {
  sessionId: string;
  items: CartItemUI[];
  subtotal: number;
  shipping: number;
  total: number;
}
