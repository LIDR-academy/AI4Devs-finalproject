import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { CreateRecipeUseCase } from '../../../../application/recipes/use-cases/CreateRecipeUseCase.js';
import { ListRecipesUseCase } from '../../../../application/recipes/use-cases/ListRecipesUseCase.js';
import { SuggestRescueRecipesUseCase } from '../../../../application/recipes/use-cases/SuggestRescueRecipesUseCase.js';
import { respondValidationError } from '../../../http/utils/responseUtils.js';

const createRecipeSchema = z.object({
  name: z.string().min(1, 'El nombre de la receta es requerido.'),
  category: z.string().min(1, 'La categoría de la receta es requerida.'),
  description: z.string().optional(),
  ingredients: z
    .array(
      z.object({
        insumoId: z.string().min(1, 'El ID de insumo es obligatorio.'),
        quantity: z.union([z.number().positive('La cantidad debe ser positiva.'), z.string().min(1)]),
      })
    )
    .min(1, 'La receta debe tener al menos un ingrediente.'),
});

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

  public suggestRescueRecipes = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!this.suggestRescueRecipesUseCase) {
        throw new Error('Servicio de sugerencias de rescate culinario no inicializado.');
      }
      const result = await this.suggestRescueRecipesUseCase.execute();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
