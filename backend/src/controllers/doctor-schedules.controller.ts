import { Response } from 'express';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { logger } from '../utils/logger';
import { CreateScheduleDto } from '../dto/schedules/create-schedule.dto';
import { UpdateScheduleDto } from '../dto/schedules/update-schedule.dto';
import { DoctorScheduleService } from '../services/doctor-schedule.service';

const doctorScheduleService = new DoctorScheduleService();

function mapValidationErrors(errors: Awaited<ReturnType<typeof validate>>) {
  const formattedErrors: Record<string, string[]> = {};
  errors.forEach((error) => {
    if (error.constraints) {
      formattedErrors[error.property] = Object.values(error.constraints);
    }
  });
  return formattedErrors;
}

export const doctorSchedulesController = {
  list: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          error: 'No autenticado',
          code: 'NOT_AUTHENTICATED',
          timestamp: new Date().toISOString(),
        });
      }

      const schedules = await doctorScheduleService.listMySchedules(userId);
      return res.status(200).json({ schedules });
    } catch (error) {
      if (error instanceof Error) {
        const serviceError = error as Error & { statusCode?: number; code?: string };
        if (serviceError.statusCode) {
          return res.status(serviceError.statusCode).json({
            error: serviceError.message,
            code: serviceError.code ?? 'SCHEDULES_ERROR',
            timestamp: new Date().toISOString(),
          });
        }
      }

      logger.error('Error al listar horarios del médico:', error);
      return res.status(500).json({
        error: 'Error interno del servidor',
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  },

  create: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          error: 'No autenticado',
          code: 'NOT_AUTHENTICATED',
          timestamp: new Date().toISOString(),
        });
      }

      const dto = plainToInstance(CreateScheduleDto, req.body);
      const errors = await validate(dto);
      if (errors.length > 0) {
        return res.status(400).json({
          error: 'Datos de horario inválidos',
          code: 'INVALID_SCHEDULE_DATA',
          details: mapValidationErrors(errors),
          timestamp: new Date().toISOString(),
        });
      }

      const ipAddress = req.ip || req.socket.remoteAddress || '0.0.0.0';
      const schedule = await doctorScheduleService.createSchedule(userId, dto, ipAddress);
      return res.status(201).json(schedule);
    } catch (error) {
      if (error instanceof Error) {
        const serviceError = error as Error & { statusCode?: number; code?: string };
        if (serviceError.statusCode) {
          return res.status(serviceError.statusCode).json({
            error: serviceError.message,
            code: serviceError.code ?? 'SCHEDULE_CREATE_ERROR',
            timestamp: new Date().toISOString(),
          });
        }
      }

      logger.error('Error al crear horario del médico:', error);
      return res.status(500).json({
        error: 'Error interno del servidor',
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  },

  update: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          error: 'No autenticado',
          code: 'NOT_AUTHENTICATED',
          timestamp: new Date().toISOString(),
        });
      }

      const dto = plainToInstance(UpdateScheduleDto, req.body);
      const errors = await validate(dto);
      if (errors.length > 0) {
        return res.status(400).json({
          error: 'Datos de actualización de horario inválidos',
          code: 'INVALID_SCHEDULE_UPDATE_DATA',
          details: mapValidationErrors(errors),
          timestamp: new Date().toISOString(),
        });
      }

      const { scheduleId } = req.params;
      const ipAddress = req.ip || req.socket.remoteAddress || '0.0.0.0';
      const schedule = await doctorScheduleService.updateSchedule(
        userId,
        scheduleId,
        dto,
        ipAddress,
      );
      return res.status(200).json(schedule);
    } catch (error) {
      if (error instanceof Error) {
        const serviceError = error as Error & { statusCode?: number; code?: string };
        if (serviceError.statusCode) {
          return res.status(serviceError.statusCode).json({
            error: serviceError.message,
            code: serviceError.code ?? 'SCHEDULE_UPDATE_ERROR',
            timestamp: new Date().toISOString(),
          });
        }
      }

      logger.error('Error al actualizar horario del médico:', error);
      return res.status(500).json({
        error: 'Error interno del servidor',
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  },

  remove: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          error: 'No autenticado',
          code: 'NOT_AUTHENTICATED',
          timestamp: new Date().toISOString(),
        });
      }

      const { scheduleId } = req.params;
      const ipAddress = req.ip || req.socket.remoteAddress || '0.0.0.0';
      await doctorScheduleService.deleteSchedule(userId, scheduleId, ipAddress);

      return res.status(200).json({ message: 'Horario eliminado exitosamente' });
    } catch (error) {
      if (error instanceof Error) {
        const serviceError = error as Error & { statusCode?: number; code?: string };
        if (serviceError.statusCode) {
          return res.status(serviceError.statusCode).json({
            error: serviceError.message,
            code: serviceError.code ?? 'SCHEDULE_DELETE_ERROR',
            timestamp: new Date().toISOString(),
          });
        }
      }

      logger.error('Error al eliminar horario del médico:', error);
      return res.status(500).json({
        error: 'Error interno del servidor',
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  },
};
