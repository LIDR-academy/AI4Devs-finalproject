import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { RecordExtractionUseCase } from '../../../../application/stock/use-cases/RecordExtractionUseCase.js';
import { GetStockMovementHistoryUseCase } from '../../../../application/stock/use-cases/GetStockMovementHistoryUseCase.js';

export const recordExtractionSchema = z.object({
  insumoId: z.string().min(1, 'El ID de insumo es obligatorio.'),
  quantity: z.union([z.number().positive('La cantidad debe ser positiva.'), z.string().min(1)]),
  toLocation: z.string().optional().default('KITCHEN_FRIDGE'),
});

export const stockMovementHistoryQuerySchema = z.object({
  insumoId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

function respondValidationError(req: Request, res: Response, detailMsg: string): void {
  res.status(400).json({
    type: 'https://restostock.com/errors/validation-error',
    title: 'ValidationError',
    status: 400,
    detail: detailMsg,
    instance: req.originalUrl || req.url,
    error: 'ValidationError',
    message: detailMsg,
  });
}

export class StockController {
  constructor(
    private readonly recordExtractionUseCase: RecordExtractionUseCase,
    private readonly getStockMovementHistoryUseCase?: GetStockMovementHistoryUseCase
  ) {}

  public recordExtraction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsedBody = recordExtractionSchema.parse(req.body);
      const result = await this.recordExtractionUseCase.execute(parsedBody);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        respondValidationError(req, res, error.errors.map((e) => e.message).join('; '));
        return;
      }
      next(error);
    }
  };

  public getMovementHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = stockMovementHistoryQuerySchema.parse(req.query);

      if (!this.getStockMovementHistoryUseCase) {
        throw new Error('GetStockMovementHistoryUseCase no configurado.');
      }

      const result = await this.getStockMovementHistoryUseCase.execute({
        insumoId: query.insumoId,
        startDate: query.startDate ? new Date(query.startDate) : undefined,
        endDate: query.endDate ? new Date(query.endDate) : undefined,
      });
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        respondValidationError(req, res, error.errors.map((e) => e.message).join('; '));
        return;
      }
      next(error);
    }
  };
}
