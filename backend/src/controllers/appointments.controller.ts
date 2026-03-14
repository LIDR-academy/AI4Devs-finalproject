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
      const userId = req.user!.id;
      const userRole = req.user!.role;
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

      const normalizedStatus = status as
        | 'confirmed'
        | 'pending'
        | 'completed'
        | 'cancelled'
        | 'no_show'
        | undefined;
      const result =
        userRole === 'doctor'
          ? await appointmentService.listDoctorAppointments(
              userId,
              normalizedStatus,
              page,
              limit
            )
          : await appointmentService.listPatientAppointments(
              userId,
              normalizedStatus,
              page,
              limit
            );

      return res.status(200).json({
        appointments: result.appointments.map((appointment) => ({
          id: appointment.id,
          patientId: appointment.patientId,
          doctorId: appointment.doctorId,
          slotId: appointment.slotId,
          appointmentDate: appointment.appointmentDate,
          status: appointment.status,
          notes: appointment.notes,
          cancellationReason: appointment.cancellationReason,
          createdAt: appointment.createdAt,
          updatedAt: appointment.updatedAt,
          patient:
            req.user?.role === 'doctor' && appointment.patient
              ? {
                  id: appointment.patient.id,
                  firstName: appointment.patient.firstName,
                  lastName: appointment.patient.lastName,
                  email: appointment.patient.email,
                  phone: appointment.patient.phone,
                }
              : undefined,
        })),
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
      const hasDoctorConfirmAction = dto.status === 'confirmed';
      const hasRescheduleAction = !!dto.slotId || !!dto.appointmentDate;
      const userRole = req.user!.role;

      if (!hasCancelAction && !hasDoctorConfirmAction && !hasRescheduleAction) {
        return res.status(400).json({
          error:
            "Debes enviar status='cancelled' para cancelar, status='confirmed' para confirmar o slotId+appointmentDate para reprogramar",
          code: 'UPDATE_ACTION_REQUIRED',
          timestamp: new Date().toISOString(),
        });
      }

      if (
        Number(hasCancelAction) +
          Number(hasDoctorConfirmAction) +
          Number(hasRescheduleAction) >
        1
      ) {
        return res.status(400).json({
          error: 'No puedes combinar múltiples acciones en la misma solicitud',
          code: 'INVALID_UPDATE_ACTION',
          timestamp: new Date().toISOString(),
        });
      }

      const userId = req.user!.id;
      const ipAddress = req.ip || req.socket.remoteAddress || '0.0.0.0';
      const { id } = req.params;

      if (hasCancelAction) {
        if (userRole !== 'patient' && userRole !== 'doctor') {
          return res.status(403).json({
            error: 'Solo pacientes o médicos pueden cancelar citas',
            code: 'FORBIDDEN_ROLE',
            timestamp: new Date().toISOString(),
          });
        }

        if (userRole === 'doctor') {
          const updated = await appointmentService.cancelAppointmentByDoctor(
            id,
            userId,
            dto.cancellationReason,
            ipAddress
          );

          return res.status(200).json({
            id: updated.id,
            status: updated.status,
            cancellationReason: updated.cancellationReason,
            updatedAt: updated.updatedAt,
            message: 'Cita cancelada correctamente por el médico',
          });
        }

        const updated = await appointmentService.cancelAppointment(
          id,
          userId,
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

      if (hasDoctorConfirmAction) {
        if (userRole !== 'doctor') {
          return res.status(403).json({
            error: 'Solo los médicos pueden confirmar citas pendientes',
            code: 'FORBIDDEN_ROLE',
            timestamp: new Date().toISOString(),
          });
        }

        const updated = await appointmentService.confirmAppointmentByDoctor(
          id,
          userId,
          ipAddress
        );

        return res.status(200).json({
          id: updated.id,
          status: updated.status,
          updatedAt: updated.updatedAt,
          message: 'Cita confirmada correctamente por el médico',
        });
      }

      if (!dto.slotId || !dto.appointmentDate) {
        return res.status(400).json({
          error: 'Para reprogramar debes enviar slotId y appointmentDate',
          code: 'RESCHEDULE_FIELDS_REQUIRED',
          timestamp: new Date().toISOString(),
        });
      }

      if (userRole !== 'patient') {
        return res.status(403).json({
          error: 'Solo los pacientes pueden reprogramar citas',
          code: 'FORBIDDEN_ROLE',
          timestamp: new Date().toISOString(),
        });
      }

      const updated = await appointmentService.rescheduleAppointment(
        id,
        userId,
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
