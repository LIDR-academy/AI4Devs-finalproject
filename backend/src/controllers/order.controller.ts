import { Request, Response, NextFunction } from 'express';
import { IOrderService } from '../services/order.service';

export class OrderController {
  constructor(private readonly orderService: IOrderService) {}

  listOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { sessionId } = req;
    try {
      const orders = await this.orderService.getOrders(sessionId);
      res.status(200).json(orders);
    } catch (err) {
      next(err);
    }
  };
}
