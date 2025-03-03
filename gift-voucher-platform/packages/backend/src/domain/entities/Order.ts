/**
 * Order entity representing a voucher purchase order
 */
export interface Order {
  id: string;
  userId: string;
  voucherId: string;
  recipientEmail: string;
  recipientName: string;
  message?: string;
  amount: number;
  currency: string;
  status: OrderStatus;
  paymentId?: string;
  paymentMethod?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Order status enum
 */
export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  CANCELLED = 'cancelled',
  FAILED = 'failed'
}

/**
 * Order creation data transfer object
 */
export interface CreateOrderDto {
  userId: string;
  voucherId: string;
  recipientEmail: string;
  recipientName: string;
  message?: string;
}

/**
 * Order update data transfer object
 */
export interface UpdateOrderDto {
  status?: OrderStatus;
  paymentId?: string;
  paymentMethod?: string;
}

/**
 * Payment confirmation data transfer object
 */
export interface PaymentConfirmationDto {
  orderId: string;
  paymentId: string;
  paymentMethod: string;
  status: 'success' | 'failure';
  amount: number;
  currency: string;
} 