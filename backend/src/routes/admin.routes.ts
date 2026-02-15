import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { adminMetricsController } from '../controllers/admin/admin-metrics.controller';
import { adminVerificationController } from '../controllers/admin/admin-verification.controller';
import { adminReviewsController } from '../controllers/admin/admin-reviews.controller';

const router = Router();

router.use(authenticate, requireRole(['admin']));

router.get('/metrics', adminMetricsController.metrics);
router.get('/reservations', adminMetricsController.reservations);
router.get('/cancellations', adminMetricsController.cancellations);
router.get('/ratings', adminMetricsController.ratings);

router.get('/verification', adminVerificationController.list);
router.get('/verification/:doctorId/documents', adminVerificationController.listDoctorDocuments);
router.get('/verification/documents/:documentId/signed-url', adminVerificationController.getSignedUrl);
router.patch('/verification/:doctorId/approve', adminVerificationController.approve);
router.patch('/verification/:doctorId/reject', adminVerificationController.reject);

router.get('/reviews/moderation', adminReviewsController.moderationQueue);
router.patch('/reviews/:reviewId/approve', adminReviewsController.approve);
router.patch('/reviews/:reviewId/reject', adminReviewsController.reject);

export default router;
