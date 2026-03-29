import { Router } from 'express';
import multer from 'multer';
import { LayerController } from '../controllers/layer.controller';
import { UploadLayerUseCase } from '@/application/use-cases/upload-layer.use-case';
import { LocalFileStorage } from '@/infrastructure/storage/local-file.storage';
import { PrismaLayerRepository } from '@/infrastructure/database/repositories/prisma-layer.repository';
import { BullMQProducer } from '@/infrastructure/queue/bullmq.producer';
import { prisma } from '@/infrastructure/database/prisma';
import { authMiddleware } from '../middlewares/auth.middleware';
import { ensureProjectPermission } from '../middlewares/project-permission.middleware';
import { ProjectRole } from '@prisma/client';

const router = Router({ mergeParams: true });

// Multer config (MemoryStorage: we process buffer in UseCase/LocalFileStorage)
// We use memory storage so the file is available in req.file.buffer
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Dependency Injection
const fileStorage = new LocalFileStorage();
const layerRepository = new PrismaLayerRepository(prisma);
const jobQueue = new BullMQProducer('layer-processing'); // Queue Name
const uploadLayerUseCase = new UploadLayerUseCase(fileStorage, layerRepository, jobQueue);
const layerController = new LayerController(uploadLayerUseCase);

// POST /api/plans/:planId/layers
router.post(
  '/',
  authMiddleware,
  // We need to fetch the PROJECT ID from the PLAN ID to check permissions.
  // This is a bit tricky with the current middleware which expects :projectId param.
  // We'll implementing a specific middleware or adapting the existing one shortly.
  // For now, let's assume the previous router (plan.routes.ts) structure was /projects/:projectId/plans/:planId/layers
  // But strict REST for sub-resource is: /plans/:planId/layers OR /projects/:projectId/plans/:planId/layers
  // IF we use /plans/:planId/layers, we need to lookup the project ID.
  // Let's create a specific middleware adapter here inline or separated.
  async (req, res, next) => {
      const { planId } = req.params;
      if (!planId) return res.status(400).json({ error: 'planId required' });
      
      try {
          const plan = await prisma.plan.findUnique({ where: { id: planId }, select: { projectId: true }});
          if (!plan) return res.status(404).json({ error: 'Plan not found' });
          
          // Inject projectId for the ensureProjectPermission middleware
          req.body.projectId = plan.projectId; 
          next();
      } catch (e) {
          next(e);
      }
  },
  ensureProjectPermission([ProjectRole.OWNER, ProjectRole.EDITOR]),
  upload.single('file'),
  (req, res) => layerController.upload(req, res)
);

export { router as layerRoutes };
