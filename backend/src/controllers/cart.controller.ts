import { Request, Response, NextFunction } from 'express';
import { ICartService } from '../services/cart.service';
import { AddToCartSchema } from '../schemas/cart.schema';
import { NotFoundError, StockError } from '../types/errors';

export class CartController {
  constructor(private readonly cartService: ICartService) {}

  addItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // 1. Validate request body — .strict() rejects extra fields
    const parsed = AddToCartSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Datos de entrada inválidos' });
      return;
    }

    // 2. Extract sessionId from middleware
    const { sessionId } = req;

    try {
      // 3. Delegate to service
      const cartResponse = await this.cartService.addItem(sessionId, parsed.data);

      // 4. Emit Set-Cookie if this was a new session
      if (res.locals['newSessionId']) {
        const secureFlag = process.env.NODE_ENV !== 'development' ? '; Secure' : '';
        res.setHeader(
          'Set-Cookie',
          `sessionId=${res.locals['newSessionId'] as string}; HttpOnly; SameSite=Strict; Path=/${secureFlag}`,
        );
      }

      res.status(200).json(cartResponse);
    } catch (err) {
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
