import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { GetActiveRemanentesUseCase } from '../../../../application/kitchen/use-cases/GetActiveRemanentesUseCase.js';
import { ConsumeRemanenteUseCase } from '../../../../application/kitchen/use-cases/ConsumeRemanenteUseCase.js';
import { DiscardRemanenteUseCase } from '../../../../application/kitchen/use-cases/DiscardRemanenteUseCase.js';
import { ConsumeRecipeUseCase } from '../../../../application/kitchen/use-cases/ConsumeRecipeUseCase.js';
import { GetRecipeAvailabilityUseCase } from '../../../../application/kitchen/use-cases/GetRecipeAvailabilityUseCase.js';
import { PerformShiftReconciliationUseCase } from '../../../../application/kitchen/use-cases/PerformShiftReconciliationUseCase.js';
import { GetRecipePreparationsUseCase } from '../../../../application/kitchen/use-cases/GetRecipePreparationsUseCase.js';
import { ClosePreparationUseCase } from '../../../../application/kitchen/use-cases/ClosePreparationUseCase.js';
import { AbandonPreparationUseCase } from '../../../../application/kitchen/use-cases/AbandonPreparationUseCase.js';
import { respondValidationError } from '../../../http/utils/responseUtils.js';

const getActiveRemanentesQuerySchema = z.object({
  location: z.string().min(1).optional(),
  insumoId: z.string().min(1, 'insumoId no puede ser una cadena vacia.').optional(),
});

const consumeRemanenteSchema = z.object({
  quantity: z.union([z.number().positive('La cantidad a consumir debe ser positiva.'), z.string().min(1)]),
  // ADR-004 / US-004 / TK-108: motivo estructurado obligatorio; texto libre siempre opcional.
  reasonId: z.string().min(1, 'Debe indicar el motivo del consumo.'),
  notes: z.string().optional(),
});

const discardRemanenteSchema = z.object({
  reason: z.string().min(1, 'El motivo de descarte es obligatorio.'),
});

const consumeRecipeSchema = z.object({
  portions: z.number().int().positive().optional().default(1),
});

// US-007 v1.1.0 / TK-111: mismo criterio de `portions` que consumeRecipeSchema, pero
// vía query string (z.coerce, ya que los query params llegan siempre como texto).
const recipeAvailabilityQuerySchema = z.object({
  portions: z.coerce.number().int().positive().optional().default(1),
});

const qty = z.union([z.number().min(0), z.string().min(1)]).transform((v) => v.toString());

const closePreparationSchema = z.object({
  actualPortions: z.number().int().min(0),
  closedByOperatorId: z.string().min(1).optional(),
  items: z
    .array(
      z
        .object({
          insumoId: z.string().min(1),
          leftoverQty: qty.default('0'),
          leftoverLocationId: z.string().min(1).optional(),
          markedUnopened: z.boolean().optional(),
          wastedQty: qty.default('0'),
          wasteReason: z.string().min(1).optional(),
        })
        // US-028: merma con motivo obligatorio (además de la guarda de dominio).
        .superRefine((item, ctx) => {
          if (Number(item.wastedQty) > 0 && !item.wasteReason?.trim()) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['wasteReason'],
              message: `Debe indicar el motivo de la merma del insumo ${item.insumoId}.`,
            });
          }
        })
    )
    .default([]),
});

const abandonPreparationSchema = z.object({
  closedByOperatorId: z.string().min(1).optional(),
});

const performShiftReconciliationSchema = z.object({
  operatorId: z.string().min(1, 'El ID de operador es obligatorio.'),
  notes: z.string().optional(),
  items: z.array(
    z.object({
      remanenteId: z.string().min(1),
      physicalQuantity: z.union([z.number().min(0), z.string().min(1)]).transform((val) => val.toString()),
      // ADR-004 / US-008 / TK-109: opcional a nivel de schema — la obligatoriedad depende
      // de si la varianza resulta negativa, se valida en el dominio/aplicación (mismo
      // patrón que la merma de TK-104).
      reasonId: z.string().min(1).optional(),
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
    private readonly getRecipePreparationsUseCase?: GetRecipePreparationsUseCase,
    private readonly closePreparationUseCase?: ClosePreparationUseCase,
    private readonly abandonPreparationUseCase?: AbandonPreparationUseCase,
    private readonly getRecipeAvailabilityUseCase?: GetRecipeAvailabilityUseCase
  ) {}

  public closePreparation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!this.closePreparationUseCase) throw new Error('ClosePreparationUseCase no configurado.');
      const body = closePreparationSchema.parse(req.body ?? {});
      const operatorId = (req as { user?: { id?: string } }).user?.id ?? body.closedByOperatorId;
      const result = await this.closePreparationUseCase.execute({
        preparationId: req.params.id,
        actualPortions: body.actualPortions,
        closedByOperatorId: operatorId,
        items: body.items,
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

  public abandonPreparation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!this.abandonPreparationUseCase) throw new Error('AbandonPreparationUseCase no configurado.');
      const body = abandonPreparationSchema.parse(req.body ?? {});
      const operatorId = (req as { user?: { id?: string } }).user?.id ?? body.closedByOperatorId;
      const result = await this.abandonPreparationUseCase.execute({
        preparationId: req.params.id,
        closedByOperatorId: operatorId,
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
        reasonId: parsedBody.reasonId,
        notes: parsedBody.notes,
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

  // US-007 v1.1.0 / TK-111: vista previa de solo lectura — requerido vs. disponible por
  // ingrediente, antes de que el cocinero confirme el consumo (evita descubrir el
  // quiebre de stock recién con el 422 de `consumeRecipe`).
  public getRecipeAvailability = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const query = recipeAvailabilityQuerySchema.parse(req.query);

      if (!this.getRecipeAvailabilityUseCase) {
        throw new Error('GetRecipeAvailabilityUseCase no configurado.');
      }

      const result = await this.getRecipeAvailabilityUseCase.execute(id, query.portions);
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

