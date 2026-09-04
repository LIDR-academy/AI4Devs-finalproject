import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { GetActiveRemanentesUseCase } from '../../../../application/kitchen/use-cases/GetActiveRemanentesUseCase.js';
import { ConsumeRemanenteUseCase } from '../../../../application/kitchen/use-cases/ConsumeRemanenteUseCase.js';
import { DiscardRemanenteUseCase } from '../../../../application/kitchen/use-cases/DiscardRemanenteUseCase.js';
import { ConsumeRecipeUseCase } from '../../../../application/kitchen/use-cases/ConsumeRecipeUseCase.js';
import { PerformShiftReconciliationUseCase } from '../../../../application/kitchen/use-cases/PerformShiftReconciliationUseCase.js';
import { GetRecipePreparationsUseCase } from '../../../../application/kitchen/use-cases/GetRecipePreparationsUseCase.js';
import { respondValidationError } from '../../../http/utils/responseUtils.js';

const getActiveRemanentesQuerySchema = z.object({
  location: z.string().min(1).optional(),
  insumoId: z.string().min(1, 'insumoId no puede ser una cadena vacia.').optional(),
});

const consumeRemanenteSchema = z.object({
  quantity: z.union([z.number().positive('La cantidad a consumir debe ser positiva.'), z.string().min(1)]),
});

const discardRemanenteSchema = z.object({
  reason: z.string().min(1, 'El motivo de descarte es obligatorio.'),
});

const consumeRecipeSchema = z.object({
  portions: z.number().int().positive().optional().default(1),
});

const performShiftReconciliationSchema = z.object({
  operatorId: z.string().min(1, 'El ID de operador es obligatorio.'),
  notes: z.string().optional(),
  items: z.array(
    z.object({
      remanenteId: z.string().min(1),
      physicalQuantity: z.union([z.number().min(0), z.string().min(1)]).transform((val) => val.toString()),
    })
  ),
});

export class KitchenController {
  constructor(
    private readonly getActiveRemanentesUseCase: GetActiveRemanentesUseCase,
    private readonly consumeRemanenteUseCase?: ConsumeRemanenteUseCase,
    private readonly discardRemanenteUseCase?: DiscardRemanenteUseCase,
    private readonly consumeRecipeUseCase?: ConsumeRecipeUseCase,
    private readonly performShiftReconciliationUseCase?: PerformShiftReconciliationUseCase,
    private readonly getRecipePreparationsUseCase?: GetRecipePreparationsUseCase
  ) {}

  public listRecipePreparations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!this.getRecipePreparationsUseCase) throw new Error('GetRecipePreparationsUseCase no configurado.');
      const status = typeof req.query.status === 'string' ? req.query.status : undefined;
      res.status(200).json(await this.getRecipePreparationsUseCase.list(status));
    } catch (error) {
      next(error);
    }
  };

  public getRecipePreparation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!this.getRecipePreparationsUseCase) throw new Error('GetRecipePreparationsUseCase no configurado.');
      res.status(200).json(await this.getRecipePreparationsUseCase.detail(req.params.id));
    } catch (error) {
      next(error);
    }
  };

  public getActiveRemanentes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = getActiveRemanentesQuerySchema.parse(req.query);
      const result = await this.getActiveRemanentesUseCase.execute(query.location, query.insumoId);
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        respondValidationError(req, res, error.errors.map((e) => e.message).join('; '));
        return;
      }
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
        respondValidationError(req, res, error.errors.map((e) => e.message).join('; '));
        return;
      }
      next(error);
    }
  };

  public discardRemanente = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const parsedBody = discardRemanenteSchema.parse(req.body);

      if (!this.discardRemanenteUseCase) {
        throw new Error('DiscardRemanenteUseCase no configurado.');
      }

      const result = await this.discardRemanenteUseCase.execute({
        remanenteId: id,
        reason: parsedBody.reason,
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

  public consumeRecipe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const parsedBody = consumeRecipeSchema.parse(req.body || {});

      if (!this.consumeRecipeUseCase) {
        throw new Error('ConsumeRecipeUseCase no configurado.');
      }

      const result = await this.consumeRecipeUseCase.execute({
        recipeId: id,
        portions: parsedBody.portions,
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

  public performShiftReconciliation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsedBody = performShiftReconciliationSchema.parse(req.body || {});

      if (!this.performShiftReconciliationUseCase) {
        throw new Error('PerformShiftReconciliationUseCase no configurado.');
      }

      const result = await this.performShiftReconciliationUseCase.execute(parsedBody);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        respondValidationError(req, res, error.errors.map((e) => e.message).join('; '));
        return;
      }
      next(error);
    }
  };
}

