import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { RecordExtractionUseCase } from '../../../../application/stock/use-cases/RecordExtractionUseCase.js';

export const recordExtractionSchema = z.object({
  insumoId: z.string().min(1, 'El ID de insumo es obligatorio.'),
  quantity: z.union([z.number().positive('La cantidad debe ser positiva.'), z.string().min(1)]),
  toLocation: z.string().optional().default('KITCHEN_FRIDGE'),
});

export class StockController {
  constructor(private readonly recordExtractionUseCase: RecordExtractionUseCase) {}

  public recordExtraction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsedBody = recordExtractionSchema.parse(req.body);
      const result = await this.recordExtractionUseCase.execute(parsedBody);
      res.status(201).json(result);
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
