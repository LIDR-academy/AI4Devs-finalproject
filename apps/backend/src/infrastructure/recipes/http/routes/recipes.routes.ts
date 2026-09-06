import { Router } from 'express';
import { RecipesController } from '../controllers/recipes.controller.js';
import { CreateRecipeUseCase } from '../../../../application/recipes/use-cases/CreateRecipeUseCase.js';
import { ListRecipesUseCase } from '../../../../application/recipes/use-cases/ListRecipesUseCase.js';
import { IRecipeRepository } from '../../../../domain/recipes/repositories/IRecipeRepository.js';
import { IInsumoRepository } from '../../../../domain/stock/repositories/IInsumoRepository.js';
import { SuggestRescueRecipesUseCase } from '../../../../application/recipes/use-cases/SuggestRescueRecipesUseCase.js';
import { requireRole } from '../../../http/middlewares/requireRole.js';

export function createRecipesRouter(
  recipeRepository: IRecipeRepository,
  insumoRepository: IInsumoRepository,
  suggestRescueRecipesUseCase?: SuggestRescueRecipesUseCase
): Router {
  const router = Router();
  const createRecipeUseCase = new CreateRecipeUseCase(recipeRepository, insumoRepository);
  const listRecipesUseCase = new ListRecipesUseCase(recipeRepository);
  const controller = new RecipesController(createRecipeUseCase, listRecipesUseCase, suggestRescueRecipesUseCase);

  // Modulo recipe (TK-069, sucesor de TK-057): alta administrativa, listado para cualquier autenticado.
  router.post('/', requireRole('ADMIN'), controller.createRecipe);
  router.get('/', controller.listRecipes);
  if (suggestRescueRecipesUseCase) {
    router.post('/rescue-suggestions', controller.suggestRescueRecipes);
  }

  return router;
}
