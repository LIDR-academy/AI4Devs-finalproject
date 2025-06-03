import { Router } from 'express';
import { searchController } from '../controllers/searchController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Ruta para búsqueda por ingredientes
router.post('/ingredients', authMiddleware, searchController.searchByIngredients);

// Ruta para búsqueda semántica
router.post('/semantic', authMiddleware, searchController.semanticSearch);

// Ruta para búsqueda con filtros
router.post('/filters', authMiddleware, searchController.searchWithFilters);

export default router; 