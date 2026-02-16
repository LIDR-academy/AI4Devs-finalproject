import { AppDataSource } from '../config/database';
import { Appointment } from '../models/appointment.entity';
import { Slot } from '../models/slot.entity';
import { AppointmentHistory } from '../models/appointment-history.entity';
import { AuditLog } from '../models/audit-log.entity';
import { Doctor } from '../models/doctor.entity';
import { notificationQueue } from '../config/queue';
import { logger } from '../utils/logger';

const LOCK_DURATION_MS = 5 * 60 * 1000; // 5 minutos

export class AppointmentService {
  private buildError(message: string, statusCode: number, code: string): Error {
    const error = new Error(message) as Error & {
      statusCode?: number;
      code?: string;
    };
    error.statusCode = statusCode;
    error.code = code;
    return error;
  }

  private normalizeReason(reason?: string): string | undefined {
    if (!reason) return undefined;
    return reason.trim().substring(0, 500);
  }

  /**
   * Crea una cita médica en transacción ACID.
   * Previene doble booking con bloqueo pesimista (SELECT FOR UPDATE).
   * Encola notificación de confirmación por email (Web Push fuera del MVP).
   */
  async createAppointment(
    patientId: string,
    doctorId: string,
    slotId: string,
    appointmentDate: Date,
    notes?: string
  ): Promise<Appointment> {
    const savedAppointment = await AppDataSource.transaction(
      async (transactionalEntityManager) => {
        // 1. Bloquear y verificar slot con SELECT FOR UPDATE (pessimistic_write)
        const slot = await transactionalEntityManager
          .createQueryBuilder(Slot, 'slot')
          .where('slot.id = :slotId', { slotId })
          .andWhere('slot.doctor_id = :doctorId', { doctorId })
          .andWhere('slot.is_available = :available', { available: true })
          .andWhere(
            '(slot.locked_until IS NULL OR slot.locked_until < NOW())'
          )
          .setLock('pessimistic_write')
          .getOne();

        if (!slot) {
          const error = new Error('El slot seleccionado no está disponible');
          (error as Error & { statusCode?: number }).statusCode = 409;
          throw error;
        }

        // Bloquear slot por 5 minutos (soft lock durante el proceso)
        slot.lockedBy = patientId;
        slot.lockedUntil = new Date(Date.now() + LOCK_DURATION_MS);
        await transactionalEntityManager.save(slot);

        // 2. Verificar que paciente no tiene cita activa
        const activeAppointment = await transactionalEntityManager
          .createQueryBuilder(Appointment, 'appointment')
          .where('appointment.patient_id = :patientId', { patientId })
          .andWhere('appointment.status IN (:...statuses)', {
            statuses: ['confirmed', 'pending'],
          })
          .andWhere('appointment.appointment_date > NOW()')
          .getOne();

        if (activeAppointment) {
          const error = new Error(
            'Ya tienes una cita activa. Cancela o reprograma la cita existente antes de crear una nueva'
          );
          (error as Error & { statusCode?: number; code?: string }).statusCode =
            400;
          (error as Error & { statusCode?: number; code?: string }).code =
            'ACTIVE_APPOINTMENT_EXISTS';
          throw error;
        }

        // 3. Crear cita
        const appointment = transactionalEntityManager.create(Appointment, {
          patientId,
          doctorId,
          slotId,
          appointmentDate,
          status: 'confirmed' as const,
          notes: notes ? notes.substring(0, 500) : undefined,
          reminderSent: false,
        });

        const savedAppointment =
          await transactionalEntityManager.save(appointment);

        // 4. Marcar slot como no disponible y liberar lock
        slot.isAvailable = false;
        slot.lockedBy = undefined;
        slot.lockedUntil = undefined;
        await transactionalEntityManager.save(slot);

        // 5. Crear registro en historial
        const historyEntry = transactionalEntityManager.create(
          AppointmentHistory,
          {
            appointmentId: savedAppointment.id,
            oldStatus: undefined,
            newStatus: 'confirmed',
            changeReason: 'Cita creada',
            changedBy: patientId,
          }
        );
        await transactionalEntityManager.save(historyEntry);

        return savedAppointment;
      }
    );

    // Encolar notificación DESPUÉS del commit (no bloquea si Redis falla)
    try {
      await notificationQueue.add('send-appointment-confirmation', {
        appointmentId: savedAppointment.id,
      });
      logger.debug(
        `Notificación de confirmación encolada para cita ${savedAppointment.id}`
      );
    } catch (queueError) {
      // Log pero no fallar - la cita ya está creada
      logger.warn(
        'No se pudo encolar notificación de confirmación (Redis/Bull):',
        queueError
      );
    }

    return savedAppointment;
  }

  async listPatientAppointments(
    patientId: string,
    status?: Appointment['status'],
    page = 1,
    limit = 10
  ): Promise<{
    appointments: Appointment[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const qb = AppDataSource.getRepository(Appointment)
      .createQueryBuilder('appointment')
      .where('appointment.patient_id = :patientId', { patientId })
      .orderBy('appointment.appointmentDate', 'DESC');

    if (status) {
      qb.andWhere('appointment.status = :status', { status });
    }

    const safePage = Math.max(1, page);
    const safeLimit = Math.min(Math.max(1, limit), 50);
    qb.skip((safePage - 1) * safeLimit).take(safeLimit);

    const [appointments, total] = await qb.getManyAndCount();

    return {
      appointments,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.max(1, Math.ceil(total / safeLimit)),
      },
    };
  }

  async listDoctorAppointments(
    doctorUserId: string,
    status?: Appointment['status'],
    page = 1,
    limit = 10
  ): Promise<{
    appointments: Appointment[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const doctor = await AppDataSource.getRepository(Doctor).findOne({
      where: { userId: doctorUserId },
      select: ['id'],
    });

    if (!doctor) {
      return {
        appointments: [],
        pagination: {
          page: Math.max(1, page),
          limit: Math.min(Math.max(1, limit), 50),
          total: 0,
          totalPages: 1,
        },
      };
    }

    const qb = AppDataSource.getRepository(Appointment)
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.patient', 'patient')
      .where('appointment.doctor_id = :doctorId', { doctorId: doctor.id });

    if (status) {
      qb.andWhere('appointment.status = :status', { status });
    }

    const safePage = Math.max(1, page);
    const safeLimit = Math.min(Math.max(1, limit), 50);
    const appointments = await qb
      .clone()
      .orderBy('appointment.appointmentDate', 'DESC')
      .skip((safePage - 1) * safeLimit)
      .take(safeLimit)
      .getMany();

    const countQb = AppDataSource.getRepository(Appointment)
      .createQueryBuilder('appointment')
      .where('appointment.doctor_id = :doctorId', { doctorId: doctor.id });
    if (status) {
      countQb.andWhere('appointment.status = :status', { status });
    }
    const total = await countQb.getCount();

    return {
      appointments,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.max(1, Math.ceil(total / safeLimit)),
      },
    };
  }

  async cancelAppointment(
    appointmentId: string,
    patientId: string,
    reason: string | undefined,
    ipAddress: string
  ): Promise<Appointment> {
    const normalizedReason = this.normalizeReason(reason);

    return AppDataSource.transaction(async (transactionalEntityManager) => {
      const appointment = await transactionalEntityManager
        .createQueryBuilder(Appointment, 'appointment')
        .where('appointment.id = :appointmentId', { appointmentId })
        .setLock('pessimistic_write')
        .getOne();

      if (!appointment) {
        throw this.buildError('Cita no encontrada', 404, 'APPOINTMENT_NOT_FOUND');
      }

      if (appointment.patientId !== patientId) {
        throw this.buildError(
          'No puedes cancelar una cita que no te pertenece',
          403,
          'FORBIDDEN_APPOINTMENT'
        );
      }

      if (!['confirmed', 'pending'].includes(appointment.status)) {
        throw this.buildError(
          'Solo se pueden cancelar citas en estado confirmed o pending',
          400,
          'INVALID_APPOINTMENT_STATUS'
        );
      }

      const slot = await transactionalEntityManager
        .createQueryBuilder(Slot, 'slot')
        .where('slot.id = :slotId', { slotId: appointment.slotId })
        .setLock('pessimistic_write')
        .getOne();

      if (slot) {
        slot.isAvailable = true;
        slot.lockedBy = undefined;
        slot.lockedUntil = undefined;
        await transactionalEntityManager.save(slot);
      }

      const previousStatus = appointment.status;
      appointment.status = 'cancelled';
      appointment.cancellationReason = normalizedReason;
      const updatedAppointment = await transactionalEntityManager.save(appointment);

      await transactionalEntityManager.save(AppointmentHistory, {
        appointmentId: appointment.id,
        oldStatus: previousStatus,
        newStatus: 'cancelled',
        changeReason: normalizedReason ?? 'Cita cancelada por paciente',
        changedBy: patientId,
      });

      await transactionalEntityManager.save(AuditLog, {
        action: 'cancel_appointment',
        entityType: 'appointment',
        entityId: appointment.id,
        userId: patientId,
        ipAddress,
      });

      return updatedAppointment;
    });
  }

  async rescheduleAppointment(
    appointmentId: string,
    patientId: string,
    newSlotId: string,
    newDate: Date,
    ipAddress: string
  ): Promise<Appointment> {
    return AppDataSource.transaction(async (transactionalEntityManager) => {
      const appointment = await transactionalEntityManager
        .createQueryBuilder(Appointment, 'appointment')
        .where('appointment.id = :appointmentId', { appointmentId })
        .setLock('pessimistic_write')
        .getOne();

      if (!appointment) {
        throw this.buildError('Cita no encontrada', 404, 'APPOINTMENT_NOT_FOUND');
      }

      if (appointment.patientId !== patientId) {
        throw this.buildError(
          'No puedes reprogramar una cita que no te pertenece',
          403,
          'FORBIDDEN_APPOINTMENT'
        );
      }

      if (!['confirmed', 'pending'].includes(appointment.status)) {
        throw this.buildError(
          'Solo se pueden reprogramar citas en estado confirmed o pending',
          400,
          'INVALID_APPOINTMENT_STATUS'
        );
      }

      if (newSlotId === appointment.slotId) {
        throw this.buildError(
          'Debes seleccionar un slot distinto para reprogramar',
          400,
          'SAME_SLOT_NOT_ALLOWED'
        );
      }

      const otherActiveAppointment = await transactionalEntityManager
        .createQueryBuilder(Appointment, 'appointment')
        .where('appointment.patient_id = :patientId', { patientId })
        .andWhere('appointment.id != :appointmentId', { appointmentId })
        .andWhere('appointment.status IN (:...statuses)', {
          statuses: ['confirmed', 'pending'],
        })
        .andWhere('appointment.appointment_date > NOW()')
        .getOne();

      if (otherActiveAppointment) {
        throw this.buildError(
          'Ya tienes otra cita activa. Cancélala o reprograma esa cita primero',
          400,
          'ACTIVE_APPOINTMENT_EXISTS'
        );
      }

      const newSlot = await transactionalEntityManager
        .createQueryBuilder(Slot, 'slot')
        .where('slot.id = :newSlotId', { newSlotId })
        .setLock('pessimistic_write')
        .getOne();

      if (!newSlot) {
        throw this.buildError(
          'El nuevo slot seleccionado no existe',
          404,
          'SLOT_NOT_FOUND'
        );
      }

      if (newSlot.doctorId !== appointment.doctorId) {
        throw this.buildError(
          'Solo puedes reprogramar a slots del mismo médico',
          400,
          'SLOT_DOCTOR_MISMATCH'
        );
      }

      const activeLock =
        newSlot.lockedUntil && newSlot.lockedUntil.getTime() > Date.now();
      if (!newSlot.isAvailable || activeLock) {
        throw this.buildError(
          'El slot seleccionado no está disponible',
          409,
          'SLOT_NOT_AVAILABLE'
        );
      }

      const previousSlot = await transactionalEntityManager
        .createQueryBuilder(Slot, 'slot')
        .where('slot.id = :oldSlotId', { oldSlotId: appointment.slotId })
        .setLock('pessimistic_write')
        .getOne();

      if (previousSlot) {
        previousSlot.isAvailable = true;
        previousSlot.lockedBy = undefined;
        previousSlot.lockedUntil = undefined;
        await transactionalEntityManager.save(previousSlot);
      }

      const previousStatus = appointment.status;
      const previousDate = appointment.appointmentDate;
      const previousSlotId = appointment.slotId;
      appointment.slotId = newSlot.id;
      appointment.appointmentDate = newDate;
      appointment.status = 'confirmed';
      appointment.cancellationReason = undefined;
      const updatedAppointment = await transactionalEntityManager.save(appointment);

      newSlot.isAvailable = false;
      newSlot.lockedBy = undefined;
      newSlot.lockedUntil = undefined;
      await transactionalEntityManager.save(newSlot);

      await transactionalEntityManager.save(AppointmentHistory, {
        appointmentId: appointment.id,
        oldStatus: previousStatus,
        newStatus: 'confirmed',
        changeReason: 'Cita reprogramada',
        changedBy: patientId,
        metadata: {
          previousDate: previousDate.toISOString(),
          newDate: newDate.toISOString(),
          previousSlotId,
          newSlotId: newSlot.id,
        },
      });

      await transactionalEntityManager.save(AuditLog, {
        action: 'reschedule_appointment',
        entityType: 'appointment',
        entityId: appointment.id,
        userId: patientId,
        ipAddress,
      });

      return updatedAppointment;
    });
  }

  async confirmAppointmentByDoctor(
    appointmentId: string,
    doctorUserId: string,
    ipAddress: string
  ): Promise<Appointment> {
    return AppDataSource.transaction(async (transactionalEntityManager) => {
      const doctor = await transactionalEntityManager.findOne(Doctor, {
        where: { userId: doctorUserId },
        select: ['id'],
      });

      if (!doctor) {
        throw this.buildError(
          'Perfil de médico no encontrado',
          404,
          'DOCTOR_NOT_FOUND'
        );
      }

      const appointment = await transactionalEntityManager
        .createQueryBuilder(Appointment, 'appointment')
        .where('appointment.id = :appointmentId', { appointmentId })
        .setLock('pessimistic_write')
        .getOne();

      if (!appointment) {
        throw this.buildError('Cita no encontrada', 404, 'APPOINTMENT_NOT_FOUND');
      }

      if (appointment.doctorId !== doctor.id) {
        throw this.buildError(
          'No puedes confirmar una cita que no está asignada a tu perfil',
          403,
          'FORBIDDEN_APPOINTMENT'
        );
      }

      if (appointment.status !== 'pending') {
        throw this.buildError(
          'Solo se pueden confirmar citas en estado pending',
          400,
          'INVALID_APPOINTMENT_STATUS'
        );
      }

      const previousStatus = appointment.status;
      appointment.status = 'confirmed';
      appointment.cancellationReason = undefined;
      const updatedAppointment = await transactionalEntityManager.save(appointment);

      await transactionalEntityManager.save(AppointmentHistory, {
        appointmentId: appointment.id,
        oldStatus: previousStatus,
        newStatus: 'confirmed',
        changeReason: 'Cita confirmada por médico',
        changedBy: doctorUserId,
      });

      await transactionalEntityManager.save(AuditLog, {
        action: 'confirm_appointment_by_doctor',
        entityType: 'appointment',
        entityId: appointment.id,
        userId: doctorUserId,
        ipAddress,
      });

      return updatedAppointment;
    });
  }

  async cancelAppointmentByDoctor(
    appointmentId: string,
    doctorUserId: string,
    reason: string | undefined,
    ipAddress: string
  ): Promise<Appointment> {
    const normalizedReason = this.normalizeReason(reason);

    return AppDataSource.transaction(async (transactionalEntityManager) => {
      const doctor = await transactionalEntityManager.findOne(Doctor, {
        where: { userId: doctorUserId },
        select: ['id'],
      });

      if (!doctor) {
        throw this.buildError(
          'Perfil de médico no encontrado',
          404,
          'DOCTOR_NOT_FOUND'
        );
      }

      const appointment = await transactionalEntityManager
        .createQueryBuilder(Appointment, 'appointment')
        .where('appointment.id = :appointmentId', { appointmentId })
        .setLock('pessimistic_write')
        .getOne();

      if (!appointment) {
        throw this.buildError('Cita no encontrada', 404, 'APPOINTMENT_NOT_FOUND');
      }

      if (appointment.doctorId !== doctor.id) {
        throw this.buildError(
          'No puedes cancelar una cita que no está asignada a tu perfil',
          403,
          'FORBIDDEN_APPOINTMENT'
        );
      }

      if (!['confirmed', 'pending'].includes(appointment.status)) {
        throw this.buildError(
          'Solo se pueden cancelar citas en estado confirmed o pending',
          400,
          'INVALID_APPOINTMENT_STATUS'
        );
      }

      const slot = await transactionalEntityManager
        .createQueryBuilder(Slot, 'slot')
        .where('slot.id = :slotId', { slotId: appointment.slotId })
        .setLock('pessimistic_write')
        .getOne();

      if (slot) {
        slot.isAvailable = true;
        slot.lockedBy = undefined;
        slot.lockedUntil = undefined;
        await transactionalEntityManager.save(slot);
      }

      const previousStatus = appointment.status;
      appointment.status = 'cancelled';
      appointment.cancellationReason =
        normalizedReason ?? 'Cita cancelada por médico';
      const updatedAppointment = await transactionalEntityManager.save(appointment);

      await transactionalEntityManager.save(AppointmentHistory, {
        appointmentId: appointment.id,
        oldStatus: previousStatus,
        newStatus: 'cancelled',
        changeReason: normalizedReason ?? 'Cita cancelada por médico',
        changedBy: doctorUserId,
      });

      await transactionalEntityManager.save(AuditLog, {
        action: 'cancel_appointment_by_doctor',
        entityType: 'appointment',
        entityId: appointment.id,
        userId: doctorUserId,
        ipAddress,
      });

      return updatedAppointment;
    });
  }
}
