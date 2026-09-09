import { Router } from 'express';
import { RecipesController } from '../controllers/recipes.controller.js';
import { CreateRecipeUseCase } from '../../../../application/recipes/use-cases/CreateRecipeUseCase.js';
import { ListRecipesUseCase } from '../../../../application/recipes/use-cases/ListRecipesUseCase.js';
import { UpdateRecipeUseCase } from '../../../../application/recipes/use-cases/UpdateRecipeUseCase.js';
import { DeactivateRecipeUseCase } from '../../../../application/recipes/use-cases/DeactivateRecipeUseCase.js';
import { IRecipeRepository } from '../../../../domain/recipes/repositories/IRecipeRepository.js';
import { IInsumoRepository } from '../../../../domain/stock/repositories/IInsumoRepository.js';
import { IRecipePreparationRepository } from '../../../../domain/kitchen/repositories/IRecipePreparationRepository.js';
import { SuggestRescueRecipesUseCase } from '../../../../application/recipes/use-cases/SuggestRescueRecipesUseCase.js';
import { requireRole } from '../../../http/middlewares/requireRole.js';
import { cryptoIdGenerator } from '../../../shared/cryptoIdGenerator.js';

export function createRecipesRouter(
  recipeRepository: IRecipeRepository,
  insumoRepository: IInsumoRepository,
  suggestRescueRecipesUseCase?: SuggestRescueRecipesUseCase,
  preparationRepository?: IRecipePreparationRepository
): Router {
  const router = Router();
  const createRecipeUseCase = new CreateRecipeUseCase(recipeRepository, insumoRepository, cryptoIdGenerator);
  const listRecipesUseCase = new ListRecipesUseCase(recipeRepository);
  const updateRecipeUseCase = preparationRepository
    ? new UpdateRecipeUseCase(recipeRepository, insumoRepository, cryptoIdGenerator, preparationRepository)
    : undefined;
  const deactivateRecipeUseCase = new DeactivateRecipeUseCase(recipeRepository);
  const controller = new RecipesController(
    createRecipeUseCase,
    listRecipesUseCase,
    suggestRescueRecipesUseCase,
    updateRecipeUseCase,
    deactivateRecipeUseCase
  );

  // Modulo recipe (TK-069): alta/edición/baja administrativa (ADMIN), listado para cualquier autenticado.
  router.post('/', requireRole('ADMIN'), controller.createRecipe);
  router.get('/', controller.listRecipes);
  if (suggestRescueRecipesUseCase) {
    router.post('/rescue-suggestions', controller.suggestRescueRecipes);
  }
  if (updateRecipeUseCase) {
    router.put('/:id', requireRole('ADMIN'), controller.updateRecipe);
  }
  router.delete('/:id', requireRole('ADMIN'), controller.deactivateRecipe);

  return router;
}
