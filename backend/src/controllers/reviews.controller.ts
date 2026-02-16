import { Response } from 'express';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { CreateReviewDto } from '../dto/reviews/create-review.dto';
import { ReviewError, ReviewService } from '../services/review.service';
import { logger } from '../utils/logger';

const reviewService = new ReviewService();

function getRequestIp(req: AuthenticatedRequest): string {
  return req.ip || req.socket.remoteAddress || '0.0.0.0';
}

function formatValidationErrors(errors: Awaited<ReturnType<typeof validate>>) {
  const formattedErrors: Record<string, string[]> = {};
  errors.forEach((error) => {
    if (error.constraints) {
      formattedErrors[error.property] = Object.values(error.constraints);
    }
  });
  return formattedErrors;
}

function sendReviewError(res: Response, error: unknown): Response {
  if (error instanceof ReviewError) {
    return res.status(error.statusCode).json({
      error: error.message,
      code: error.code,
      timestamp: new Date().toISOString(),
    });
  }

  logger.error('Error en reviews.controller:', error);
  return res.status(500).json({
    error: 'Error interno del servidor',
    code: 'INTERNAL_ERROR',
    timestamp: new Date().toISOString(),
  });
}

export const reviewsController = {
  create: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const patientId = req.user?.id;
      if (!patientId) {
        return res.status(401).json({
          error: 'No autenticado',
          code: 'NOT_AUTHENTICATED',
          timestamp: new Date().toISOString(),
        });
      }

      const dto = plainToInstance(CreateReviewDto, req.body);
      const errors = await validate(dto);
      if (errors.length > 0) {
        return res.status(400).json({
          error: 'Datos de reseña inválidos',
          code: 'INVALID_REVIEW_DATA',
          details: formatValidationErrors(errors),
          timestamp: new Date().toISOString(),
        });
      }

      const review = await reviewService.createReview({
        appointmentId: req.params.id,
        patientId,
        rating: dto.rating,
        comment: dto.comment,
        ipAddress: getRequestIp(req),
      });

      return res.status(201).json({
        id: review.id,
        appointmentId: review.appointmentId,
        patientId: review.patientId,
        doctorId: review.doctorId,
        rating: review.rating,
        comment: review.comment,
        moderationStatus: review.moderationStatus,
        createdAt: review.createdAt,
        message: 'Tu reseña ha sido enviada y está pendiente de moderación',
      });
    } catch (error) {
      return sendReviewError(res, error);
    }
  },

  getByAppointment: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const patientId = req.user?.id;
      if (!patientId) {
        return res.status(401).json({
          error: 'No autenticado',
          code: 'NOT_AUTHENTICATED',
          timestamp: new Date().toISOString(),
        });
      }

      const review = await reviewService.getReviewByAppointment(req.params.id, patientId);

      return res.status(200).json({
        id: review.id,
        appointmentId: review.appointmentId,
        patientId: review.patientId,
        doctorId: review.doctorId,
        rating: review.rating,
        comment: review.comment,
        moderationStatus: review.moderationStatus,
        moderatedBy: review.moderatedBy ?? null,
        moderatedAt: review.moderatedAt ?? null,
        moderationNotes: review.moderationNotes ?? null,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
      });
    } catch (error) {
      return sendReviewError(res, error);
    }
  },
};
