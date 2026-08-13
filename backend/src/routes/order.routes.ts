import { Router } from 'express';
import { sessionMiddleware } from '../middleware/session';
import { OrderController } from '../controllers/order.controller';
import { IOrderService } from '../services/order.service';

export function createOrderRouter(orderService: IOrderService): Router {
  const router = Router();
  const controller = new OrderController(orderService);

  router.get(
    '/',
    sessionMiddleware,
    (req, res, next) => controller.listOrders(req, res, next),
  );

  return router;
}
