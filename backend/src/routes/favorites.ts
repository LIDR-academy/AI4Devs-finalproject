import { Router } from 'express';
import { FavoriteController } from '../controllers/favoriteController';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { favoriteValidation } from '../validators/favoriteValidation';
import { favoritesRateLimit } from '../middleware/rateLimit';

const router = Router();

// Aplicar rate limiting específico a todas las rutas
router.use(favoritesRateLimit);

// Aplicar autenticación a todas las rutas
router.use(authenticateToken);

// GET /api/favorites - Obtener favoritos del usuario
router.get(
  '/',
  validateRequest(favoriteValidation.getUserFavorites),
  FavoriteController.getUserFavorites
);

// POST /api/favorites/:propertyId - Agregar propiedad a favoritos
router.post(
  '/:propertyId',
  validateRequest(favoriteValidation.addToFavorites),
  FavoriteController.addToFavorites
);

// DELETE /api/favorites/:propertyId - Remover propiedad de favoritos
router.delete(
  '/:propertyId',
  validateRequest(favoriteValidation.removeFromFavorites),
  FavoriteController.removeFromFavorites
);

// GET /api/favorites/:propertyId/status - Verificar si propiedad está en favoritos
router.get(
  '/:propertyId/status',
  validateRequest(favoriteValidation.checkFavoriteStatus),
  FavoriteController.checkFavoriteStatus
);

// GET /api/favorites/stats - Obtener estadísticas de favoritos
router.get(
  '/stats',
  FavoriteController.getFavoriteStats
);

export default router;
