import { Response } from 'express';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { PaginationQueryDto } from '../../dto/admin/pagination-query.dto';
import { AdminMetricsService } from '../../services/admin-metrics.service';
import { logger } from '../../utils/logger';

const adminMetricsService = new AdminMetricsService();

function badRequest(res: Response, error: string, code: string) {
  return res.status(400).json({
    error,
    code,
    timestamp: new Date().toISOString(),
  });
}

function serverError(res: Response) {
  return res.status(500).json({
    error: 'Error interno del servidor',
    code: 'INTERNAL_ERROR',
    timestamp: new Date().toISOString(),
  });
}

export const adminMetricsController = {
  metrics: async (_req: AuthenticatedRequest, res: Response) => {
    try {
      const data = await adminMetricsService.getMetricsSnapshot();
      return res.status(200).json(data);
    } catch (error) {
      logger.error('Error al obtener métricas admin:', error);
      const fallback = await adminMetricsService.getLastSnapshotFallback();
      if (fallback) {
        return res.status(200).json({
          ...fallback,
          stale: true,
        });
      }
      return serverError(res);
    }
  },

  reservations: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const paginationDto = plainToInstance(PaginationQueryDto, req.query);
      const errors = await validate(paginationDto);
      if (errors.length > 0) {
        return badRequest(res, 'Parámetros de paginación inválidos', 'INVALID_PAGINATION');
      }

      const { status, startDate, endDate, doctorId } = req.query as Record<string, string>;
      const result = await adminMetricsService.getReservations({
        page: paginationDto.page || 1,
        limit: paginationDto.limit || 20,
        status: status || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        doctorId: doctorId || undefined,
      });
      return res.status(200).json(result);
    } catch (error) {
      logger.error('Error al obtener reservas admin:', error);
      return serverError(res);
    }
  },

  cancellations: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const paginationDto = plainToInstance(PaginationQueryDto, req.query);
      const errors = await validate(paginationDto);
      if (errors.length > 0) {
        return badRequest(res, 'Parámetros de paginación inválidos', 'INVALID_PAGINATION');
      }

      const { reason, startDate, endDate } = req.query as Record<string, string>;
      const result = await adminMetricsService.getCancellations({
        page: paginationDto.page || 1,
        limit: paginationDto.limit || 20,
        reason: reason || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      return res.status(200).json(result);
    } catch (error) {
      logger.error('Error al obtener cancelaciones admin:', error);
      return serverError(res);
    }
  },

  ratings: async (_req: AuthenticatedRequest, res: Response) => {
    try {
      const snapshot = await adminMetricsService.getMetricsSnapshot();
      return res.status(200).json({
        ratingsBySpecialty: snapshot.ratingsBySpecialty,
        topDoctorsByAppointments: snapshot.topDoctorsByAppointments,
        topDoctorsByRating: snapshot.topDoctorsByRating,
        generatedAt: snapshot.generatedAt,
      });
    } catch (error) {
      logger.error('Error al obtener ratings admin:', error);
      return serverError(res);
    }
  },
};
