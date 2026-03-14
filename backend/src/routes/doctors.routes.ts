import { Router } from 'express';
import multer from 'multer';
import { NextFunction, Response } from 'express';
import { doctorsController } from '../controllers/doctors.controller';
import { AuthenticatedRequest, authenticate, requireRole } from '../middleware/auth.middleware';
import { verificationController } from '../controllers/verification.controller';
import { doctorSchedulesController } from '../controllers/doctor-schedules.controller';

const router = Router();
const maxFileSizeMb = Number(process.env.MAX_FILE_SIZE_MB || '10');
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxFileSizeMb * 1024 * 1024 },
});

const uploadVerificationDocument = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  upload.single('document')(req, res, (error: unknown) => {
    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({
        error: 'El archivo excede el tamaño máximo permitido',
        code: 'FILE_TOO_LARGE',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (error) {
      res.status(400).json({
        error: 'No se pudo procesar el archivo enviado',
        code: 'INVALID_MULTIPART_REQUEST',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    next();
  });
};

// Endpoint de búsqueda de médicos
router.get(
  '/',
  doctorsController.search
);

// Perfil del médico autenticado
router.get(
  '/me',
  authenticate,
  requireRole(['doctor']),
  doctorsController.getMe
);

// Últimos médicos registrados (público)
router.get(
  '/latest',
  doctorsController.getLatest
);

// Actualización de perfil del médico autenticado
router.patch(
  '/me',
  authenticate,
  requireRole(['doctor']),
  doctorsController.updateMe
);

// Gestión de horarios de trabajo del médico autenticado
router.get(
  '/me/schedules',
  authenticate,
  requireRole(['doctor']),
  doctorSchedulesController.list
);

router.post(
  '/me/schedules',
  authenticate,
  requireRole(['doctor']),
  doctorSchedulesController.create
);

router.patch(
  '/me/schedules/:scheduleId',
  authenticate,
  requireRole(['doctor']),
  doctorSchedulesController.update
);

router.delete(
  '/me/schedules/:scheduleId',
  authenticate,
  requireRole(['doctor']),
  doctorSchedulesController.remove
);

// Carga/listado de documentos de verificación del médico autenticado
router.post(
  '/verification',
  authenticate,
  requireRole(['doctor']),
  uploadVerificationDocument,
  verificationController.uploadMyDocument
);

router.get(
  '/verification',
  authenticate,
  requireRole(['doctor']),
  verificationController.listMyDocuments
);

// Slots disponibles del médico por fecha (debe ir antes de :doctorId)
router.get(
  '/:doctorId/slots',
  authenticate,
  requireRole(['patient']),
  doctorsController.getSlots
);

// Detalle de médico
router.get(
  '/:doctorId',
  authenticate,
  requireRole(['patient']),
  doctorsController.getById
);

export default router;
