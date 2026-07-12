import { Request, Response, NextFunction } from 'express';
import { ICartService } from '../services/cart.service';
import { AddToCartSchema, UpdateCartItemSchema } from '../schemas/cart.schema';
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

  getCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { sessionId } = req;
    try {
      const cartResponse = await this.cartService.getCart(sessionId);
      res.status(200).json(cartResponse);
    } catch (err) {
      next(err);
    }
  };

  updateItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const parsed = UpdateCartItemSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Datos de entrada inválidos' });
      return;
    }

    const productId = String(req.params['productId']);
    const { sessionId } = req;
    const { quantity, size, color } = parsed.data;

    try {
      const cartResponse = await this.cartService.updateItem(sessionId, productId, quantity, size, color);
      res.status(200).json(cartResponse);
    } catch (err) {
      if (err instanceof NotFoundError) {
        res.status(404).json({ error: 'Ítem no encontrado en el carrito' });
        return;
      }
      if (err instanceof StockError) {
        res.status(409).json({ error: 'Stock insuficiente', available: err.available });
        return;
      }
      next(err);
    }
  };

  removeItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const productId = String(req.params['productId']);
    const { sessionId } = req;
    const size = typeof req.query['size'] === 'string' && req.query['size'] !== '' ? req.query['size'] : undefined;
    const color = typeof req.query['color'] === 'string' && req.query['color'] !== '' ? req.query['color'] : undefined;

    try {
      const cartResponse = await this.cartService.removeItem(sessionId, productId, size, color);
      res.status(200).json(cartResponse);
    } catch (err) {
      if (err instanceof NotFoundError) {
        res.status(404).json({ error: 'Ítem no encontrado en el carrito' });
        return;
      }
      next(err);
    }
  };
}
