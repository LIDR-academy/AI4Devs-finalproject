import { IOrderRepository } from '../repositories/order.repository';
import { OrderListResponse } from '../types/domain';

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------

export interface IOrderService {
  getOrders(sessionId: string): Promise<OrderListResponse[]>;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export class OrderService implements IOrderService {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async getOrders(sessionId: string): Promise<OrderListResponse[]> {
    return this.orderRepository.findBySession(sessionId);
  }
}
