import { Router } from 'express';
import { healthController } from '../controllers/health.controller';

const router = Router();

router.get('/', healthController.check);

export default router;
