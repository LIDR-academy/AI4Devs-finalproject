import { QueryFailedError } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Appointment } from '../models/appointment.entity';
import { AuditLog } from '../models/audit-log.entity';
import { Review } from '../models/review.entity';
import { notificationQueue } from '../config/queue';
import { logger } from '../utils/logger';

export class ReviewError extends Error {
  constructor(
    public readonly code: string,
    public readonly statusCode: number,
    message: string
  ) {
    super(message);
    this.name = 'ReviewError';
  }
}

export class ReviewService {
  private readonly appointmentRepo = AppDataSource.getRepository(Appointment);
  private readonly reviewRepo = AppDataSource.getRepository(Review);
  private readonly auditRepo = AppDataSource.getRepository(AuditLog);

  private sanitizeComment(comment: string): string {
    const withoutScripts = comment.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
    const withoutTags = withoutScripts.replace(/<[^>]*>/g, '');
    return withoutTags.trim();
  }

  private validateCommentLength(comment: string): void {
    if (comment.length < 10 || comment.length > 1000) {
      throw new ReviewError(
        'INVALID_COMMENT_LENGTH',
        400,
        'El comentario debe tener entre 10 y 1000 caracteres'
      );
    }
  }

  async createReview(params: {
    appointmentId: string;
    patientId: string;
    rating: number;
    comment: string;
    ipAddress: string;
  }): Promise<Review> {
    const { appointmentId, patientId, rating, comment, ipAddress } = params;

    const appointment = await this.appointmentRepo.findOne({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new ReviewError('APPOINTMENT_NOT_FOUND', 404, 'Cita no encontrada');
    }

    if (appointment.patientId !== patientId) {
      throw new ReviewError(
        'FORBIDDEN_REVIEW_APPOINTMENT',
        403,
        'No tienes permiso para crear una reseña de esta cita'
      );
    }

    if (appointment.status !== 'completed') {
      throw new ReviewError(
        'APPOINTMENT_NOT_COMPLETED',
        400,
        'Solo se pueden crear reseñas para citas completadas'
      );
    }

    const sanitizedComment = this.sanitizeComment(comment);
    this.validateCommentLength(sanitizedComment);

    const existingReview = await this.reviewRepo.findOne({
      where: { appointmentId },
    });
    if (existingReview) {
      throw new ReviewError(
        'REVIEW_ALREADY_EXISTS',
        409,
        'Ya existe una reseña para esta cita'
      );
    }

    try {
      const review = await this.reviewRepo.save(
        this.reviewRepo.create({
          appointmentId,
          patientId,
          doctorId: appointment.doctorId,
          rating,
          comment: sanitizedComment,
          moderationStatus: 'pending',
        })
      );

      await this.auditRepo.save(
        this.auditRepo.create({
          action: 'create_review',
          entityType: 'review',
          entityId: review.id,
          userId: patientId,
          ipAddress,
          newValues: JSON.stringify({
            appointmentId: review.appointmentId,
            doctorId: review.doctorId,
            rating: review.rating,
            moderationStatus: review.moderationStatus,
          }),
        })
      );

      try {
        await notificationQueue.add('send-review-pending-notification', {
          reviewId: review.id,
          appointmentId: review.appointmentId,
          doctorId: review.doctorId,
        });
      } catch (queueError) {
        logger.warn('No se pudo encolar notificación de reseña pendiente:', queueError);
      }

      return review;
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const dbError = error as QueryFailedError & { driverError?: { code?: string } };
        if (dbError.driverError?.code === 'ER_DUP_ENTRY') {
          throw new ReviewError(
            'REVIEW_ALREADY_EXISTS',
            409,
            'Ya existe una reseña para esta cita'
          );
        }
      }
      throw error;
    }
  }

  async getReviewByAppointment(
    appointmentId: string,
    patientId: string
  ): Promise<Review> {
    const appointment = await this.appointmentRepo.findOne({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new ReviewError('APPOINTMENT_NOT_FOUND', 404, 'Cita no encontrada');
    }

    if (appointment.patientId !== patientId) {
      throw new ReviewError(
        'FORBIDDEN_REVIEW_APPOINTMENT',
        403,
        'No tienes permiso para consultar la reseña de esta cita'
      );
    }

    const review = await this.reviewRepo.findOne({
      where: { appointmentId },
    });

    if (!review) {
      throw new ReviewError(
        'REVIEW_NOT_FOUND',
        404,
        'No existe reseña para esta cita'
      );
    }

    return review;
  }
}
