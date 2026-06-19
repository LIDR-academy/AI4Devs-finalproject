export type OrderStatus = 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface CartItemResponse {
  productId: string;
  productName: string;
  productBrand: string;
  productPrice: number;
  image: string;
  quantity: number;
  stock: number;
  size?: string;
  color?: string;
}

export interface CartResponse {
  sessionId: string;
  items: CartItemResponse[];
  subtotal: number;
  shipping: number;
  total: number;
}

export interface Cart {
  id: string;
  sessionId: string;
}

export interface CartItemInput {
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
}

export interface CartWithItems {
  id: string;
  sessionId: string;
  items: CartItem[];
}

export interface ProductFilters {
  distance?: string[];
  surface?: string[];
  level?: string[];
  objective?: string[];
}

export interface ShippingInput {
  name: string;
  email: string;
  phone?: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface OrderItemResponse {
  productId: string;
  productName: string;
  productBrand: string;
  productPrice: number;
  quantity: number;
  size?: string;
  color?: string;
}

export interface OrderResponse {
  id: string;
  status: OrderStatus;
  date: string;
  subtotal: number;
  shipping: number;
  total: number;
  shippingName: string;
  shippingEmail: string;
  shippingPhone?: string;
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
  shippingCountry: string;
  items: OrderItemResponse[];
}

export interface OrderListItemResponse extends OrderItemResponse {
  image: string;
}

export interface OrderListResponse extends Omit<OrderResponse, 'items'> {
  items: OrderListItemResponse[];
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  category: string;
  subcategory: string;
  description: string;
  features: string[];
  distance: string[];
  surface: string[];
  level: string[];
  objective: string[];
  sizes: string[];
  colors: string[];
  stock: number;
}
