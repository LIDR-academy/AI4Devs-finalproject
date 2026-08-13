import { Router } from 'express';
import { mutationLimiter } from '../middleware/rate-limit';
import { sessionMiddleware } from '../middleware/session';
import { CartController } from '../controllers/cart.controller';
import { ICartService } from '../services/cart.service';

export function createCartRouter(cartService: ICartService): Router {
  const router = Router();
  const controller = new CartController(cartService);

  router.get(
    '/',
    sessionMiddleware,
    (req, res, next) => controller.getCart(req, res, next),
  );

  router.post(
    '/',
    mutationLimiter,
    sessionMiddleware,
    (req, res, next) => controller.addItem(req, res, next),
  );

  router.put(
    '/:productId',
    mutationLimiter,
    sessionMiddleware,
    (req, res, next) => controller.updateItem(req, res, next),
  );

  router.delete(
    '/:productId',
    mutationLimiter,
    sessionMiddleware,
    (req, res, next) => controller.removeItem(req, res, next),
  );

  return router;
}
