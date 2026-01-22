import { Router } from 'express';
import { specialtiesController } from '../controllers/specialties.controller';

const router = Router();

// Endpoint público para obtener especialidades activas
router.get('/', specialtiesController.getAll);

export default router;
