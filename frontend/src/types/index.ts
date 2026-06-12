export type OrderStatus = 'processing' | 'shipped' | 'delivered' | 'cancelled';

export type Category = 'shoes' | 'clothing' | 'accessories';

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  category: Category;
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

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
  product?: Product;
}

export interface Cart {
  id: string;
  sessionId: string;
  items: CartItem[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productBrand: string;
  productPrice: number;
  quantity: number;
  size?: string;
  color?: string;
}

export interface Order {
  id: string;
  sessionId: string;
  date: string;
  status: OrderStatus;
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
  items: OrderItem[];
}

export interface ProductsResponse {
  products: Product[];
  total: number;
}

export interface ProductFilters {
  distance?: string[];
  surface?: string[];
  level?: string[];
  objective?: string[];
}
