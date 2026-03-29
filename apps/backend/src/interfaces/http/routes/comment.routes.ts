import { Router } from 'express';
import { CommentController } from '../controllers/comment.controller';
import { DeleteCommentUseCase } from '@/application/use-cases/delete-comment.use-case';
import { PrismaCommentRepository } from '@/infrastructure/database/repositories/prisma-comment.repository';
import { prisma } from '@/infrastructure/database/prisma';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Dependency Injection
const commentRepository = new PrismaCommentRepository(prisma);
const deleteCommentUseCase = new DeleteCommentUseCase(commentRepository);
const commentController = new CommentController(null as any, deleteCommentUseCase);

// DELETE /api/comments/:commentId
router.delete(
  '/:commentId',
  authMiddleware,
  (req, res) => commentController.delete(req, res)
);

export { router as commentRoutes };
