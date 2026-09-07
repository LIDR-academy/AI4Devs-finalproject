import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { CreateRecipeUseCase } from '../../../../application/recipes/use-cases/CreateRecipeUseCase.js';
import { ListRecipesUseCase } from '../../../../application/recipes/use-cases/ListRecipesUseCase.js';
import { SuggestRescueRecipesUseCase } from '../../../../application/recipes/use-cases/SuggestRescueRecipesUseCase.js';
import { respondValidationError } from '../../../http/utils/responseUtils.js';

const MAX_INGREDIENTS = 50;

// AUDIT-DEV-007 F-10 / backend_rules.md §3: el regex coincide con la escala física
// `RecipeIngredient.quantity Decimal(12,4)` (≤ 8 enteros, ≤ 4 decimales) — más estricto
// que el `DecimalString` genérico del contrato. Rechaza `0` / `"abc"` en la frontera
// (antes reventaban en `new DecimalQuantity` → HTTP 500).
const quantitySchema = z.union([
  z.number().positive('La cantidad debe ser positiva.').finite('La cantidad debe ser finita.'),
  z
    .string()
    .regex(/^\d{1,8}(\.\d{1,4})?$/, 'La cantidad debe ser un decimal de hasta 8 enteros y 4 decimales.')
    .refine((v) => parseFloat(v) > 0, 'La cantidad debe ser mayor que cero.'),
]);

const createRecipeSchema = z
  .object({
    name: z.string().min(1, 'El nombre de la receta es requerido.').max(120, 'El nombre no puede superar 120 caracteres.'),
    category: z.string().min(1, 'La categoría de la receta es requerida.').max(60, 'La categoría no puede superar 60 caracteres.'),
    description: z.string().max(500, 'La descripción no puede superar 500 caracteres.').optional(),
    ingredients: z
      .array(
        z.object({
          insumoId: z.string().min(1, 'El ID de insumo es obligatorio.'),
          quantity: quantitySchema,
        })
      )
      .min(1, 'La receta debe tener al menos un ingrediente.')
      .max(MAX_INGREDIENTS, `La receta no puede tener más de ${MAX_INGREDIENTS} ingredientes.`),
  })
  .superRefine((data, ctx) => {
    const seen = new Set<string>();
    for (const ingredient of data.ingredients) {
      if (seen.has(ingredient.insumoId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `El insumo ${ingredient.insumoId} aparece más de una vez; consolida la cantidad en una sola línea.`,
          path: ['ingredients'],
        });
        return;
      }
      seen.add(ingredient.insumoId);
    }
  });

const rescueSuggestionsSchema = z.object({
  mode: z.enum(['CATALOG', 'CREATIVE']).optional().default('CATALOG'),
}).optional();

export class RecipesController {
  constructor(
    private readonly createRecipeUseCase: CreateRecipeUseCase,
    private readonly listRecipesUseCase: ListRecipesUseCase,
    private readonly suggestRescueRecipesUseCase?: SuggestRescueRecipesUseCase
  ) {}

  public createRecipe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsedBody = createRecipeSchema.parse(req.body);
      const result = await this.createRecipeUseCase.execute(parsedBody);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        respondValidationError(req, res, error.errors.map((e) => e.message).join('; '));
        return;
      }
      next(error);
    }
  };

  public listRecipes = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.listRecipesUseCase.execute();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  public suggestRescueRecipes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!this.suggestRescueRecipesUseCase) {
        throw new Error('Servicio de sugerencias de rescate culinario no inicializado.');
      }
      const parsedBody = rescueSuggestionsSchema.parse(req.body ?? {});
      const mode = parsedBody?.mode ?? 'CATALOG';
      const result = await this.suggestRescueRecipesUseCase.execute(mode);
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

