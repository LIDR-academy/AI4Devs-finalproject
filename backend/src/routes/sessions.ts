import { Router } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { SessionController } from '../controllers/SessionController';

const router = Router();

const createSessionSchema = z.object({
  timezone: z.string().optional(),
});

const completeSessionSchema = z.object({
  answers: z
    .array(
      z.object({
        exerciseId: z.string(),
        userAnswer: z.string(),
      })
    )
    .length(10, 'Must provide exactly 10 answers'),
});

router.use(authMiddleware);

router.post('/daily', validate(createSessionSchema), SessionController.createDaily);
router.post('/:sessionId/complete', validate(completeSessionSchema), SessionController.complete);

export default router;
