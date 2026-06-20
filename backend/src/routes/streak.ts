import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { StreakController } from '../controllers/StreakController';

const router = Router();

router.use(authMiddleware);
router.get('/', StreakController.get);

export default router;
