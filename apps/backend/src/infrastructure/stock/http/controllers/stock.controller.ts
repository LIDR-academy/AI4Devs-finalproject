import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { RecordExtractionUseCase } from '../../../../application/stock/use-cases/RecordExtractionUseCase.js';
import { GetStockMovementHistoryUseCase } from '../../../../application/stock/use-cases/GetStockMovementHistoryUseCase.js';
import { CreateInsumoUseCase } from '../../../../application/stock/use-cases/CreateInsumoUseCase.js';
import { ListInsumosUseCase } from '../../../../application/stock/use-cases/ListInsumosUseCase.js';
import { RestockInsumoUseCase } from '../../../../application/stock/use-cases/RestockInsumoUseCase.js';
import { respondValidationError } from '../../../http/utils/responseUtils.js';

const recordExtractionSchema = z
  .object({
    insumoId: z.string().min(1, 'El ID de insumo es obligatorio.'),
    quantity: z.union([z.number().positive('La cantidad debe ser positiva.'), z.string().min(1)]),
    // US-025: sub-sector de bodega de origen — obligatorio.
    fromStorageLocationId: z
      .string({ required_error: 'El sub-sector de bodega de origen es obligatorio.' })
      .min(1, 'El sub-sector de bodega de origen es obligatorio.'),
    toLocation: z.string().optional().default('KITCHEN_FRIDGE'),
    operatorId: z.string().optional(),
    purpose: z.enum(['KITCHEN_STOCK', 'RECIPE', 'DIRECT_DISCARD']).optional().default('KITCHEN_STOCK'),
    reason: z.string().optional(),
    recipeId: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.purpose === 'DIRECT_DISCARD') {
        return !!data.reason && data.reason.trim().length > 0;
      }
      return true;
    },
    {
      message: 'El motivo es obligatorio para descarte directo desde bodega.',
      path: ['reason'],
    }
  );

const createInsumoSchema = z.object({
  name: z.string().min(1, 'El nombre del insumo es requerido.'),
  unitOfMeasure: z.enum(['KG', 'L', 'UNITS'], {
    errorMap: () => ({ message: 'La unidad de medida debe ser KG, L o UNITS.' }),
  }),
  // US-025: sub-sector de bodega donde queda depositado el stock inicial — obligatorio.
  storageLocationId: z
    .string({ required_error: 'El sub-sector de bodega es obligatorio.' })
    .min(1, 'El sub-sector de bodega es obligatorio.'),
  initialWarehouseStock: z
    .string()
    .regex(/^\d+(\.\d{1,4})?$/, 'El stock inicial debe ser un número decimal válido de hasta 4 decimales.')
    .optional(),
  // US-019: costo por unidad de compra, opcional. Maximo 2 decimales y 10 digitos enteros
  // para coincidir exactamente con la columna Decimal(12,2) — evita redondeo silencioso
  // (regex de 4 decimales) y overflow numerico sin capturar (400 explicito en vez de 500).
  unitCost: z
    .string()
    .regex(/^\d{1,10}(\.\d{1,2})?$/, 'El costo unitario debe ser un numero decimal valido de hasta 2 decimales (ej. "1800.00").')
    .optional(),
});

const restockInsumoSchema = z.object({
  quantity: z.coerce.number().positive('La cantidad a reabastecer debe ser positiva.'),
  // US-025: sub-sector de bodega al que se suma la cantidad recibida — obligatorio.
  storageLocationId: z
    .string({ required_error: 'El sub-sector de bodega es obligatorio.' })
    .min(1, 'El sub-sector de bodega es obligatorio.'),
});

const stockMovementHistoryQuerySchema = z.object({
  insumoId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});



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
      const userObj = (req as unknown as { user?: { id: string } }).user;
      // AUDIT-DEV-006 F-8: con autenticación activa la autoría SIEMPRE sale del token
      // (US-014 §Decisiones) — el `operatorId` del body se ignora. Solo se acepta del
      // body cuando no hay usuario autenticado (tests de negocio con requireAuth:false).
      const operatorId = userObj?.id ?? parsedBody.operatorId;
      const result = await this.recordExtractionUseCase.execute({
        ...parsedBody,
        operatorId,
      });
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
        storageLocationId: parsedBody.storageLocationId,
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
