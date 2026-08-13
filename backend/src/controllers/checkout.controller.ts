import { Request, Response, NextFunction } from 'express';
import { ICheckoutService } from '../services/checkout.service';
import { CheckoutSchema } from '../schemas/checkout.schema';
import { NotFoundError, StockError, ValidationError } from '../types/errors';

export class CheckoutController {
  constructor(private readonly checkoutService: ICheckoutService) {}

  confirmOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // 1. Validate request body — .strict() rejects extra fields (e.g. cardNumber, total, items)
    const parsed = CheckoutSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Datos de entrada inválidos' });
      return;
    }

    // 2. Extract sessionId from middleware
    const { sessionId } = req;

    try {
      // 3. Delegate to service — price/total are never read from the client
      const orderResponse = await this.checkoutService.processCheckout(sessionId, parsed.data);

      // 4. Emit Set-Cookie if this was a new session (same pattern as CartController)
      if (res.locals['newSessionId']) {
        // req.secure (no NODE_ENV): con 'trust proxy' activo refleja el
        // X-Forwarded-Proto real de nginx. Gatear por NODE_ENV rompía la
        // sesion en el despliegue MVP sin TLS (US-018) - el navegador nunca
        // guarda una cookie Secure sobre HTTP plano.
        const secureFlag = req.secure ? '; Secure' : '';
        res.setHeader(
          'Set-Cookie',
          `sessionId=${res.locals['newSessionId'] as string}; HttpOnly; SameSite=Strict; Path=/${secureFlag}`,
        );
      }

      res.status(201).json(orderResponse);
    } catch (err) {
      if (err instanceof ValidationError) {
        res.status(400).json({ error: err.message });
        return;
      }
      if (err instanceof NotFoundError) {
        res.status(404).json({ error: 'Producto no encontrado' });
        return;
      }
      if (err instanceof StockError) {
        res.status(409).json({ error: 'Stock insuficiente', available: err.available });
        return;
      }
      // All other errors go to the global error-handler (returns 500 with generic message)
      next(err);
    }
  };
}
