import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { RecordExtractionUseCase } from '../../../../application/stock/use-cases/RecordExtractionUseCase.js';
import { GetStockMovementHistoryUseCase } from '../../../../application/stock/use-cases/GetStockMovementHistoryUseCase.js';
import { CreateInsumoUseCase } from '../../../../application/stock/use-cases/CreateInsumoUseCase.js';
import { ListInsumosUseCase } from '../../../../application/stock/use-cases/ListInsumosUseCase.js';
import { RestockInsumoUseCase } from '../../../../application/stock/use-cases/RestockInsumoUseCase.js';

export const recordExtractionSchema = z.object({
  insumoId: z.string().min(1, 'El ID de insumo es obligatorio.'),
  quantity: z.union([z.number().positive('La cantidad debe ser positiva.'), z.string().min(1)]),
  toLocation: z.string().optional().default('KITCHEN_FRIDGE'),
});

export const createInsumoSchema = z.object({
  name: z.string().min(1, 'El nombre del insumo es requerido.'),
  unitOfMeasure: z.enum(['KG', 'L', 'UNITS'], {
    errorMap: () => ({ message: 'La unidad de medida debe ser KG, L o UNITS.' }),
  }),
});

export const restockInsumoSchema = z.object({
  quantity: z.coerce.number().positive('La cantidad a reabastecer debe ser positiva.'),
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
    private readonly getStockMovementHistoryUseCase?: GetStockMovementHistoryUseCase,
    private readonly createInsumoUseCase?: CreateInsumoUseCase,
    private readonly listInsumosUseCase?: ListInsumosUseCase,
    private readonly restockInsumoUseCase?: RestockInsumoUseCase
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

  public createInsumo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsedBody = createInsumoSchema.parse(req.body);

      if (!this.createInsumoUseCase) {
        throw new Error('CreateInsumoUseCase no configurado.');
      }

      const result = await this.createInsumoUseCase.execute(parsedBody);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        respondValidationError(req, res, error.errors.map((e) => e.message).join('; '));
        return;
      }
      next(error);
    }
  };

  public listInsumos = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!this.listInsumosUseCase) {
        throw new Error('ListInsumosUseCase no configurado.');
      }
      const result = await this.listInsumosUseCase.execute();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  public restockInsumo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsedBody = restockInsumoSchema.parse(req.body);

      if (!this.restockInsumoUseCase) {
        throw new Error('RestockInsumoUseCase no configurado.');
      }

      const result = await this.restockInsumoUseCase.execute({
        insumoId: req.params.id,
        quantity: parsedBody.quantity,
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
