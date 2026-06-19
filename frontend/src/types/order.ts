import type { OrderStatus } from './index';

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

export interface OrderListResponse extends Omit<OrderResponse, 'status' | 'items'> {
  status: OrderStatus;
  items: OrderListItemResponse[];
}
