import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthenticateByPinUseCase } from '../../../application/auth/use-cases/AuthenticateByPinUseCase.js';

export const authPinSchema = z.object({
  userId: z.string().min(1, 'El ID de usuario es requerido.'),
  pin: z.string().regex(/^\d{4,6}$/, 'El PIN debe contener entre 4 y 6 digitos numericos.'),
});

export class AuthController {
  constructor(private readonly authenticateByPinUseCase: AuthenticateByPinUseCase) {}

  public loginWithPin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsedBody = authPinSchema.parse(req.body);
      const result = await this.authenticateByPinUseCase.execute(parsedBody);
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const detailMsg = error.errors.map((e) => e.message).join('; ');
        res.status(400).json({
          type: 'https://restostock.com/errors/validation-error',
          title: 'ValidationError',
          status: 400,
          detail: detailMsg,
          instance: req.originalUrl || req.url,
          error: 'ValidationError',
          message: detailMsg,
        });
        return;
      }
      next(error);
    }
  };
}
