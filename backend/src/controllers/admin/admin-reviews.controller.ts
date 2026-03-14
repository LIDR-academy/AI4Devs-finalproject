import { Response } from 'express';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { PaginationQueryDto } from '../../dto/admin/pagination-query.dto';
import { RejectActionDto } from '../../dto/admin/reject-action.dto';
import { AdminReviewsService } from '../../services/admin-reviews.service';
import { AdminMetricsService } from '../../services/admin-metrics.service';
import { logger } from '../../utils/logger';

const adminReviewsService = new AdminReviewsService();
const adminMetricsService = new AdminMetricsService();

function sendError(res: Response, error: string, code: string, status = 400) {
  return res.status(status).json({
    error,
    code,
    timestamp: new Date().toISOString(),
  });
}

export const adminReviewsController = {
  moderationQueue: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const dto = plainToInstance(PaginationQueryDto, req.query);
      const errors = await validate(dto);
      if (errors.length > 0) {
        return sendError(res, 'Parámetros de paginación inválidos', 'INVALID_PAGINATION');
      }

      const data = await adminReviewsService.listModerationQueue(dto.page || 1, dto.limit || 20);
      return res.status(200).json(data);
    } catch (error) {
      logger.error('Error al listar cola de moderación:', error);
      return sendError(res, 'Error interno del servidor', 'INTERNAL_ERROR', 500);
    }
  },

  approve: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { reviewId } = req.params;
      const adminUserId = req.user!.id;
      const ipAddress = req.ip || req.socket.remoteAddress || '0.0.0.0';
      const notes = typeof req.body?.notes === 'string' ? req.body.notes : undefined;

      const result = await adminReviewsService.approveReview({
        reviewId,
        adminUserId,
        ipAddress,
        notes,
      });
      await adminMetricsService.invalidateMetricsCache();

      return res.status(200).json({
        message: 'Reseña aprobada correctamente',
        ...result,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'REVIEW_NOT_FOUND') {
        return sendError(res, 'Reseña no encontrada', 'REVIEW_NOT_FOUND', 404);
      }
      logger.error('Error al aprobar reseña:', error);
      return sendError(res, 'Error interno del servidor', 'INTERNAL_ERROR', 500);
    }
  },

  reject: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const dto = plainToInstance(RejectActionDto, req.body);
      const errors = await validate(dto);
      if (errors.length > 0) {
        return sendError(res, 'La nota de moderación es requerida', 'MODERATION_NOTES_REQUIRED');
      }

      const { reviewId } = req.params;
      const adminUserId = req.user!.id;
      const ipAddress = req.ip || req.socket.remoteAddress || '0.0.0.0';

      const result = await adminReviewsService.rejectReview({
        reviewId,
        adminUserId,
        ipAddress,
        notes: dto.notes,
      });
      await adminMetricsService.invalidateMetricsCache();

      return res.status(200).json({
        message: 'Reseña rechazada correctamente',
        ...result,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'REVIEW_NOT_FOUND') {
        return sendError(res, 'Reseña no encontrada', 'REVIEW_NOT_FOUND', 404);
      }
      if (error instanceof Error && error.message === 'MODERATION_NOTES_REQUIRED') {
        return sendError(res, 'La nota de moderación es requerida', 'MODERATION_NOTES_REQUIRED');
      }
      logger.error('Error al rechazar reseña:', error);
      return sendError(res, 'Error interno del servidor', 'INTERNAL_ERROR', 500);
    }
  },
};
