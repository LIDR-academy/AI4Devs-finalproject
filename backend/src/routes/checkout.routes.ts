import { Router } from 'express';
import { mutationLimiter } from '../middleware/rate-limit';
import { sessionMiddleware } from '../middleware/session';
import { CheckoutController } from '../controllers/checkout.controller';
import { ICheckoutService } from '../services/checkout.service';

export function createCheckoutRouter(checkoutService: ICheckoutService): Router {
  const router = Router();
  const controller = new CheckoutController(checkoutService);

  router.post(
    '/',
    mutationLimiter,
    sessionMiddleware,
    (req, res, next) => controller.confirmOrder(req, res, next),
  );

  return router;
}
