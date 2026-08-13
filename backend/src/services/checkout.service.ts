import { IOrderRepository } from '../repositories/order.repository';
import { OrderResponse, ShippingInput } from '../types/domain';

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------

export interface ICheckoutService {
  processCheckout(sessionId: string, shipping: ShippingInput): Promise<OrderResponse>;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export class CheckoutService implements ICheckoutService {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async processCheckout(sessionId: string, shipping: ShippingInput): Promise<OrderResponse> {
    return this.orderRepository.createOrderFromCart(sessionId, shipping);
  }
}
