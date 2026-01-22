import { Router } from 'express';
import { doctorsController } from '../controllers/doctors.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

// Endpoint de búsqueda de médicos
// Requiere autenticación y rol de paciente
router.get(
  '/',
  authenticate,
  requireRole(['patient']),
  doctorsController.search
);

export default router;
