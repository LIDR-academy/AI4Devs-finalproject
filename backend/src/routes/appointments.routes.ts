import { Router } from 'express';
import { appointmentsController } from '../controllers/appointments.controller';
import { reviewsController } from '../controllers/reviews.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

/**
 * GET /api/v1/appointments
 * Lista citas del paciente autenticado.
 */
router.get(
  '/',
  authenticate,
  requireRole(['patient']),
  appointmentsController.list
);

/**
 * POST /api/v1/appointments
 * Crea una nueva cita médica.
 * Requiere autenticación JWT con rol patient.
 */
router.post(
  '/',
  authenticate,
  requireRole(['patient']),
  appointmentsController.create
);

/**
 * GET /api/v1/appointments/:id/reviews
 * Obtiene la reseña asociada a una cita del paciente autenticado.
 */
router.get(
  '/:id/reviews',
  authenticate,
  requireRole(['patient']),
  reviewsController.getByAppointment
);

/**
 * POST /api/v1/appointments/:id/reviews
 * Crea reseña para una cita completada del paciente autenticado.
 */
router.post(
  '/:id/reviews',
  authenticate,
  requireRole(['patient']),
  reviewsController.create
);

/**
 * PATCH /api/v1/appointments/:id
 * Cancela o reprograma una cita del paciente autenticado.
 */
router.patch(
  '/:id',
  authenticate,
  requireRole(['patient']),
  appointmentsController.update
);

export default router;
