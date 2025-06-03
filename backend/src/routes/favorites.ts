import { Router, RequestHandler } from 'express';
import { favoriteController } from '../controllers/favoriteController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Rutas protegidas que requieren autenticación
router.use(authMiddleware);

// Rutas de favoritos
router.get('/', favoriteController.getFavorites as RequestHandler);
router.post('/:recipeId', favoriteController.addFavorite as RequestHandler);
router.delete('/:recipeId', favoriteController.removeFavorite as RequestHandler);
router.get('/check/:recipeId', favoriteController.checkFavorite as RequestHandler);

export default router; 