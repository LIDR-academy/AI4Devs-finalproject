import { Response } from 'express';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { logger } from '../utils/logger';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { AppointmentService } from '../services/appointment.service';
import { CreateAppointmentDto } from '../dto/appointments/create-appointment.dto';
import { UpdateAppointmentDto } from '../dto/appointments/update-appointment.dto';

const appointmentService = new AppointmentService();

export const appointmentsController = {
  list: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const patientId = req.user!.id;
      const status = req.query.status as string | undefined;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

      const allowedStatuses = [
        'confirmed',
        'pending',
        'completed',
        'cancelled',
        'no_show',
      ];
      if (status && !allowedStatuses.includes(status)) {
        return res.status(400).json({
          error: 'status inválido',
          code: 'INVALID_STATUS_FILTER',
          timestamp: new Date().toISOString(),
        });
      }

      const result = await appointmentService.listPatientAppointments(
        patientId,
        status as
          | 'confirmed'
          | 'pending'
          | 'completed'
          | 'cancelled'
          | 'no_show'
          | undefined,
        page,
        limit
      );

      return res.status(200).json({
        appointments: result.appointments,
        pagination: result.pagination,
      });
    } catch (error) {
      logger.error('Error al listar citas:', error);
      return res.status(500).json({
        error: 'Error interno del servidor',
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  },

  create: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const dto = plainToInstance(CreateAppointmentDto, req.body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        const formattedErrors: Record<string, string[]> = {};
        errors.forEach((error) => {
          if (error.constraints) {
            formattedErrors[error.property] = Object.values(error.constraints);
          }
        });

        return res.status(400).json({
          error: 'Datos de reserva inválidos',
          code: 'INVALID_APPOINTMENT_DATA',
          details: formattedErrors,
          timestamp: new Date().toISOString(),
        });
      }

      const patientId = req.user!.id;
      const appointmentDate = new Date(dto.appointmentDate);

      const appointment = await appointmentService.createAppointment(
        patientId,
        dto.doctorId,
        dto.slotId,
        appointmentDate,
        dto.notes
      );

      return res.status(201).json({
        id: appointment.id,
        patientId: appointment.patientId,
        doctorId: appointment.doctorId,
        slotId: appointment.slotId,
        appointmentDate: appointment.appointmentDate,
        status: appointment.status,
        notes: appointment.notes,
        createdAt: appointment.createdAt,
        message: 'Cita reservada correctamente',
      });
    } catch (error) {
      if (error instanceof Error) {
        const err = error as Error & { statusCode?: number; code?: string };

        if (err.statusCode === 409) {
          return res.status(409).json({
            error: err.message,
            code: 'SLOT_NOT_AVAILABLE',
            timestamp: new Date().toISOString(),
          });
        }

        if (err.statusCode === 400) {
          return res.status(400).json({
            error: err.message,
            code: err.code ?? 'BAD_REQUEST',
            timestamp: new Date().toISOString(),
          });
        }

        logger.error('Error al crear cita:', error);
      }

      return res.status(500).json({
        error: 'Error interno del servidor',
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  },

  update: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const dto = plainToInstance(UpdateAppointmentDto, req.body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        const formattedErrors: Record<string, string[]> = {};
        errors.forEach((error) => {
          if (error.constraints) {
            formattedErrors[error.property] = Object.values(error.constraints);
          }
        });

        return res.status(400).json({
          error: 'Datos de actualización inválidos',
          code: 'INVALID_APPOINTMENT_UPDATE_DATA',
          details: formattedErrors,
          timestamp: new Date().toISOString(),
        });
      }

      const hasCancelAction = dto.status === 'cancelled';
      const hasRescheduleAction = !!dto.slotId || !!dto.appointmentDate;

      if (!hasCancelAction && !hasRescheduleAction) {
        return res.status(400).json({
          error:
            "Debes enviar status='cancelled' para cancelar o slotId+appointmentDate para reprogramar",
          code: 'UPDATE_ACTION_REQUIRED',
          timestamp: new Date().toISOString(),
        });
      }

      if (hasCancelAction && hasRescheduleAction) {
        return res.status(400).json({
          error: 'No puedes cancelar y reprogramar en la misma solicitud',
          code: 'INVALID_UPDATE_ACTION',
          timestamp: new Date().toISOString(),
        });
      }

      const patientId = req.user!.id;
      const ipAddress = req.ip || req.socket.remoteAddress || '0.0.0.0';
      const { id } = req.params;

      if (hasCancelAction) {
        const updated = await appointmentService.cancelAppointment(
          id,
          patientId,
          dto.cancellationReason,
          ipAddress
        );

        return res.status(200).json({
          id: updated.id,
          status: updated.status,
          cancellationReason: updated.cancellationReason,
          updatedAt: updated.updatedAt,
          message: 'Cita cancelada correctamente',
        });
      }

      if (!dto.slotId || !dto.appointmentDate) {
        return res.status(400).json({
          error: 'Para reprogramar debes enviar slotId y appointmentDate',
          code: 'RESCHEDULE_FIELDS_REQUIRED',
          timestamp: new Date().toISOString(),
        });
      }

      const updated = await appointmentService.rescheduleAppointment(
        id,
        patientId,
        dto.slotId,
        new Date(dto.appointmentDate),
        ipAddress
      );

      return res.status(200).json({
        id: updated.id,
        slotId: updated.slotId,
        appointmentDate: updated.appointmentDate,
        status: updated.status,
        updatedAt: updated.updatedAt,
        message: 'Cita reprogramada correctamente',
      });
    } catch (error) {
      if (error instanceof Error) {
        const err = error as Error & { statusCode?: number; code?: string };

        if (err.statusCode) {
          return res.status(err.statusCode).json({
            error: err.message,
            code: err.code ?? 'APPOINTMENT_UPDATE_ERROR',
            timestamp: new Date().toISOString(),
          });
        }

        logger.error('Error al actualizar cita:', error);
      }

      return res.status(500).json({
        error: 'Error interno del servidor',
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  },
};
