import { Router, RequestHandler } from 'express';
import { recipeController } from '../controllers/recipeController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Rutas protegidas que requieren autenticación
router.use(authMiddleware);

// Rutas de recetas
router.post('/', recipeController.createRecipe as RequestHandler);
router.get('/', recipeController.getUserRecipes as RequestHandler);
router.get('/:id', recipeController.getRecipe as RequestHandler);
router.put('/:id', recipeController.updateRecipe as RequestHandler);
router.delete('/:id', recipeController.deleteRecipe as RequestHandler);

export default router; 