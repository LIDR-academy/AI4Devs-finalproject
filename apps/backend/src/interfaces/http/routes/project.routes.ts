
import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { planRoutes } from './plan.routes';

const router = Router();
const projectController = new ProjectController();

router.use(authMiddleware);

router.post('/', projectController.create);
router.get('/', projectController.index);
router.delete('/:id', projectController.delete);

// Invitation routes
router.post('/:id/invitations', projectController.createInvitation);
router.get('/:id/invitations', projectController.getInvitations);
router.delete('/:id/invitations/:token', projectController.revokeInvitation);

// Nested routes
router.use('/:projectId/plans', planRoutes);

export { router as projectRoutes };
