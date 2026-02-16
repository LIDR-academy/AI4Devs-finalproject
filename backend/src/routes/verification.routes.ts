import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { verificationController } from '../controllers/verification.controller';

const router = Router();

router.get(
  '/:documentId/signed-url',
  authenticate,
  requireRole(['admin']),
  verificationController.getSignedUrlForAdmin
);

router.get('/file/:token', verificationController.streamSignedDocument);

export default router;
