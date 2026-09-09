import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { CreateRecipeUseCase } from '../../../../application/recipes/use-cases/CreateRecipeUseCase.js';
import { ListRecipesUseCase } from '../../../../application/recipes/use-cases/ListRecipesUseCase.js';
import { SuggestRescueRecipesUseCase } from '../../../../application/recipes/use-cases/SuggestRescueRecipesUseCase.js';
import { UpdateRecipeUseCase } from '../../../../application/recipes/use-cases/UpdateRecipeUseCase.js';
import { DeactivateRecipeUseCase } from '../../../../application/recipes/use-cases/DeactivateRecipeUseCase.js';
import { handleZodOrNext } from '../../../http/utils/responseUtils.js';

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

const ingredientSchema = z.object({
  insumoId: z.string().min(1, 'El ID de insumo es obligatorio.'),
  quantity: quantitySchema,
});

const ingredientsArraySchema = z
  .array(ingredientSchema)
  .min(1, 'La receta debe tener al menos un ingrediente.')
  .max(MAX_INGREDIENTS, `La receta no puede tener más de ${MAX_INGREDIENTS} ingredientes.`);

/** `.superRefine` compartido: rechaza un `insumoId` repetido en la lista de ingredientes. */
function rejectDuplicateInsumoId(
  ingredients: Array<{ insumoId: string }> | undefined,
  ctx: z.RefinementCtx
): void {
  if (!ingredients) return;
  const seen = new Set<string>();
  for (const ingredient of ingredients) {
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
}

const createRecipeSchema = z
  .object({
    name: z.string().min(1, 'El nombre de la receta es requerido.').max(120, 'El nombre no puede superar 120 caracteres.'),
    category: z.string().min(1, 'La categoría de la receta es requerida.').max(60, 'La categoría no puede superar 60 caracteres.'),
    description: z.string().max(500, 'La descripción no puede superar 500 caracteres.').optional(),
    ingredients: ingredientsArraySchema,
  })
  .superRefine((data, ctx) => rejectDuplicateInsumoId(data.ingredients, ctx));

const rescueSuggestionsSchema = z.object({
  mode: z.enum(['CATALOG', 'CREATIVE']).optional().default('CATALOG'),
}).optional();

// US-037: edición parcial de una receta. Todos los campos opcionales; `.strict()` rechaza
// claves desconocidas (p. ej. `isActive`, que no se edita por esta vía).
const updateRecipeSchema = z
  .object({
    name: z.string().min(1, 'El nombre de la receta no puede estar vacío.').max(120).optional(),
    category: z.string().min(1, 'La categoría no puede estar vacía.').max(60).optional(),
    description: z.string().max(500).nullable().optional(),
    ingredients: ingredientsArraySchema.optional(),
  })
  .strict('Ese campo no se puede editar en una receta.')
  .superRefine((data, ctx) => rejectDuplicateInsumoId(data.ingredients, ctx));

export class RecipesController {
  constructor(
    private readonly createRecipeUseCase: CreateRecipeUseCase,
    private readonly listRecipesUseCase: ListRecipesUseCase,
    private readonly suggestRescueRecipesUseCase?: SuggestRescueRecipesUseCase,
    private readonly updateRecipeUseCase?: UpdateRecipeUseCase,
    private readonly deactivateRecipeUseCase?: DeactivateRecipeUseCase
  ) {}

  public updateRecipe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsedBody = updateRecipeSchema.parse(req.body);
      if (!this.updateRecipeUseCase) {
        throw new Error('UpdateRecipeUseCase no configurado.');
      }
      const result = await this.updateRecipeUseCase.execute({ id: req.params.id, ...parsedBody });
      res.status(200).json(result);
    } catch (error) {
      handleZodOrNext(req, res, next, error);
    }
  };

  public deactivateRecipe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!this.deactivateRecipeUseCase) {
        throw new Error('DeactivateRecipeUseCase no configurado.');
      }
      await this.deactivateRecipeUseCase.execute(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  public createRecipe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsedBody = createRecipeSchema.parse(req.body);
      const result = await this.createRecipeUseCase.execute(parsedBody);
      res.status(201).json(result);
    } catch (error) {
      handleZodOrNext(req, res, next, error);
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
      handleZodOrNext(req, res, next, error);
    }
  };
}

