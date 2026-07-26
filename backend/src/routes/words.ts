import { Router } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { WordController } from '../controllers/WordController';

const router = Router();

const createWordSchema = z.object({
  term: z.string().min(1, 'Term is required').max(100),
  definitionLanguage: z.enum(['es', 'en']),
});

const updateWordSchema = z.object({
  definition: z.string().min(1).max(500).optional(),
  imageUrl: z.string().url().optional(),
  unsplashPhotoId: z.string().optional(),
  status: z.enum(['active', 'learned']).optional(),
});

router.use(authMiddleware);

router.post('/', validate(createWordSchema), WordController.create);
router.get('/', WordController.list);
router.put('/:wordId', validate(updateWordSchema), WordController.update);
router.delete('/:wordId', WordController.remove);

export default router;
