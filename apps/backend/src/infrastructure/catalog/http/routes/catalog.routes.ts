import { Router } from 'express';
import { CatalogController } from '../controllers/catalog.controller.js';
import { CreateRecipeUseCase } from '../../../../application/catalog/use-cases/CreateRecipeUseCase.js';
import { ListRecipesUseCase } from '../../../../application/catalog/use-cases/ListRecipesUseCase.js';
import { IRecipeRepository } from '../../../../domain/catalog/repositories/IRecipeRepository.js';
import { IInsumoRepository } from '../../../../domain/stock/repositories/IInsumoRepository.js';
import { requireRole } from '../../../http/middlewares/requireRole.js';

export function createCatalogRouter(recipeRepository: IRecipeRepository, insumoRepository: IInsumoRepository): Router {
  const router = Router();
  const createRecipeUseCase = new CreateRecipeUseCase(recipeRepository, insumoRepository);
  const listRecipesUseCase = new ListRecipesUseCase(recipeRepository);
  const controller = new CatalogController(createRecipeUseCase, listRecipesUseCase);

  // Catálogo de recetas (TK-057): alta administrativa, listado para cualquier autenticado.
  router.post('/recipes', requireRole('ADMIN'), controller.createRecipe);
  router.get('/recipes', controller.listRecipes);

  return router;
}
