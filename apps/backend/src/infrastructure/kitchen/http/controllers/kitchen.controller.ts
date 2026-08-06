import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { GetActiveRemanentesUseCase } from '../../../../application/kitchen/use-cases/GetActiveRemanentesUseCase.js';
import { ConsumeRemanenteUseCase } from '../../../../application/kitchen/use-cases/ConsumeRemanenteUseCase.js';

export const consumeRemanenteSchema = z.object({
  quantity: z.union([z.number().positive('La cantidad a consumir debe ser positiva.'), z.string().min(1)]),
});

export class KitchenController {
  constructor(
    private readonly getActiveRemanentesUseCase: GetActiveRemanentesUseCase,
    private readonly consumeRemanenteUseCase?: ConsumeRemanenteUseCase
  ) {}

  public getActiveRemanentes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const location = req.query.location as string | undefined;
      const result = await this.getActiveRemanentesUseCase.execute(location);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  public consumeRemanente = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const parsedBody = consumeRemanenteSchema.parse(req.body);

      if (!this.consumeRemanenteUseCase) {
        throw new Error('ConsumeRemanenteUseCase no configurado.');
      }

      const result = await this.consumeRemanenteUseCase.execute({
        remanenteId: id,
        quantityToConsume: parsedBody.quantity,
      });

      res.status(200).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'ValidationError',
          details: error.errors.map((e) => e.message),
        });
        return;
      }
      next(error);
    }
  };
}
