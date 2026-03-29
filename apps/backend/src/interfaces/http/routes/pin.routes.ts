import { Router } from 'express';
import { PinController } from '../controllers/pin.controller';
import { CommentController } from '../controllers/comment.controller';
import { CreatePinUseCase } from '@/application/use-cases/create-pin.use-case';
import { GetPinUseCase } from '@/application/use-cases/get-pin.use-case';
import { ListLayerPinsUseCase } from '@/application/use-cases/list-layer-pins.use-case';
import { UpdatePinStatusUseCase } from '@/application/use-cases/update-pin-status.use-case';
import { DeletePinUseCase } from '@/application/use-cases/delete-pin.use-case';
import { AddCommentUseCase } from '@/application/use-cases/add-comment.use-case';
import { DeleteCommentUseCase } from '@/application/use-cases/delete-comment.use-case';
import { PrismaPinRepository } from '@/infrastructure/database/repositories/prisma-pin.repository';
import { PrismaCommentRepository } from '@/infrastructure/database/repositories/prisma-comment.repository';
import { prisma } from '@/infrastructure/database/prisma';
import { authMiddleware } from '../middlewares/auth.middleware';
import { guestAccessMiddleware } from '../middlewares/guest-access.middleware';

const router = Router();

// Dependency Injection
const pinRepository = new PrismaPinRepository(prisma);
const commentRepository = new PrismaCommentRepository(prisma);

const createPinUseCase = new CreatePinUseCase(pinRepository, commentRepository);
const getPinUseCase = new GetPinUseCase(pinRepository, commentRepository);
const listLayerPinsUseCase = new ListLayerPinsUseCase(pinRepository);
const updatePinStatusUseCase = new UpdatePinStatusUseCase(pinRepository);
const deletePinUseCase = new DeletePinUseCase(pinRepository);
const addCommentUseCase = new AddCommentUseCase(commentRepository, pinRepository);
const deleteCommentUseCase = new DeleteCommentUseCase(commentRepository);

const pinController = new PinController(
  createPinUseCase,
  getPinUseCase,
  listLayerPinsUseCase,
  updatePinStatusUseCase,
  deletePinUseCase
);

const commentController = new CommentController(addCommentUseCase, deleteCommentUseCase);

// Routes for /api/layers/:layerId/pins
const layerPinRouter = Router({ mergeParams: true });

// POST /api/layers/:layerId/pins
layerPinRouter.post(
  '/',
  authMiddleware,
  guestAccessMiddleware,
  (req, res) => pinController.create(req, res)
);

// GET /api/layers/:layerId/pins
layerPinRouter.get(
  '/',
  authMiddleware,
  guestAccessMiddleware,
  (req, res) => pinController.listByLayer(req, res)
);

// Routes for /api/pins/:pinId
// GET /api/pins/:pinId
router.get(
  '/:pinId',
  authMiddleware,
  guestAccessMiddleware,
  (req, res) => pinController.getById(req, res)
);

// PATCH /api/pins/:pinId/status
router.patch(
  '/:pinId/status',
  authMiddleware,
  (req, res) => pinController.updateStatus(req, res)
);

// DELETE /api/pins/:pinId
router.delete(
  '/:pinId',
  authMiddleware,
  (req, res) => pinController.delete(req, res)
);

// POST /api/pins/:pinId/comments
router.post(
  '/:pinId/comments',
  authMiddleware,
  guestAccessMiddleware,
  (req, res) => commentController.create(req, res)
);

export { router as pinRoutes, layerPinRouter };
