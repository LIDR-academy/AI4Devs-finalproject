import { EntityManager, IsNull } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Appointment } from '../models/appointment.entity';
import { AuditLog } from '../models/audit-log.entity';
import { Doctor } from '../models/doctor.entity';
import { DoctorSchedule } from '../models/doctor-schedule.entity';
import { Slot } from '../models/slot.entity';
import { CreateScheduleDto } from '../dto/schedules/create-schedule.dto';
import { UpdateScheduleDto } from '../dto/schedules/update-schedule.dto';

const MEXICO_CITY_TIMEZONE = 'America/Mexico_City';
const DAY_MS = 24 * 60 * 60 * 1000;

type ServiceError = Error & { statusCode?: number; code?: string };

export class DoctorScheduleService {
  private buildError(message: string, statusCode: number, code: string): ServiceError {
    const error = new Error(message) as ServiceError;
    error.statusCode = statusCode;
    error.code = code;
    return error;
  }

  private toMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map((part) => Number(part));
    return hours * 60 + minutes;
  }

  private assertTimeRange(startTime: string, endTime: string): void {
    if (this.toMinutes(endTime) <= this.toMinutes(startTime)) {
      throw this.buildError(
        'La hora de fin debe ser posterior a la hora de inicio',
        400,
        'INVALID_TIME_RANGE',
      );
    }
  }

  private getMexicoCityDateParts(date: Date): {
    date: string;
    dayOfWeek: number;
  } {
    const dateFmt = new Intl.DateTimeFormat('en-CA', {
      timeZone: MEXICO_CITY_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const weekdayFmt = new Intl.DateTimeFormat('en-US', {
      timeZone: MEXICO_CITY_TIMEZONE,
      weekday: 'short',
    });
    const dateParts = dateFmt.formatToParts(date);
    const dayName = weekdayFmt.format(date);
    const year = dateParts.find((part) => part.type === 'year')?.value;
    const month = dateParts.find((part) => part.type === 'month')?.value;
    const day = dateParts.find((part) => part.type === 'day')?.value;

    if (!year || !month || !day) {
      throw this.buildError(
        'No se pudo calcular fecha en zona horaria de CDMX',
        500,
        'TIMEZONE_PARSE_ERROR',
      );
    }

    const dayMap: Record<string, number> = {
      Sun: 0,
      Mon: 1,
      Tue: 2,
      Wed: 3,
      Thu: 4,
      Fri: 5,
      Sat: 6,
    };
    const dayOfWeek = dayMap[dayName];
    if (dayOfWeek === undefined) {
      throw this.buildError(
        'No se pudo calcular día de la semana en CDMX',
        500,
        'TIMEZONE_WEEKDAY_ERROR',
      );
    }

    return {
      date: `${year}-${month}-${day}`,
      dayOfWeek,
    };
  }

  private toMexicoCityDateTime(datePart: string, timePart: string): Date {
    return new Date(`${datePart}T${timePart}-06:00`);
  }

  private async getDoctorByUserId(
    entityManager: EntityManager,
    userId: string,
  ): Promise<Doctor> {
    const doctor = await entityManager.getRepository(Doctor).findOne({
      where: { userId },
    });
    if (!doctor) {
      throw this.buildError('Perfil de médico no encontrado', 404, 'DOCTOR_NOT_FOUND');
    }
    return doctor;
  }

  private async validateOverlap(params: {
    entityManager: EntityManager;
    doctorId: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    excludeScheduleId?: string;
  }): Promise<void> {
    const { entityManager, doctorId, dayOfWeek, startTime, endTime, excludeScheduleId } =
      params;
    const qb = entityManager
      .getRepository(DoctorSchedule)
      .createQueryBuilder('schedule')
      .where('schedule.doctor_id = :doctorId', { doctorId })
      .andWhere('schedule.dayOfWeek = :dayOfWeek', { dayOfWeek })
      .andWhere('schedule.is_active = true')
      .andWhere('schedule.deleted_at IS NULL')
      .andWhere('schedule.startTime < :endTime', { endTime })
      .andWhere('schedule.endTime > :startTime', { startTime });

    if (excludeScheduleId) {
      qb.andWhere('schedule.id != :excludeScheduleId', { excludeScheduleId });
    }

    const overlap = await qb.getOne();
    if (overlap) {
      throw this.buildError(
        'El horario se solapa con otro horario existente en el mismo día',
        400,
        'SCHEDULE_OVERLAP',
      );
    }
  }

  private async deleteFutureUnreservedSlots(
    entityManager: EntityManager,
    scheduleId: string,
  ): Promise<void> {
    const slots = await entityManager
      .getRepository(Slot)
      .createQueryBuilder('slot')
      .leftJoin(
        Appointment,
        'appointment',
        'appointment.slot_id = slot.id AND appointment.status IN (:...activeStatuses)',
        { activeStatuses: ['confirmed', 'pending'] },
      )
      .where('slot.schedule_id = :scheduleId', { scheduleId })
      .andWhere('slot.start_time > NOW()')
      .andWhere('slot.is_available = true')
      .andWhere('appointment.id IS NULL')
      .select(['slot.id'])
      .getMany();

    if (slots.length === 0) {
      return;
    }

    await entityManager
      .getRepository(Slot)
      .createQueryBuilder()
      .delete()
      .from(Slot)
      .whereInIds(slots.map((slot) => slot.id))
      .execute();
  }

  private async generateFutureSlots(
    entityManager: EntityManager,
    schedule: DoctorSchedule,
  ): Promise<void> {
    if (!schedule.isActive) {
      return;
    }

    const slotsToInsert: Array<Partial<Slot>> = [];

    for (let offset = 0; offset < 28; offset += 1) {
      const currentDate = new Date(Date.now() + offset * DAY_MS);
      const mexicoParts = this.getMexicoCityDateParts(currentDate);
      if (mexicoParts.dayOfWeek !== schedule.dayOfWeek) {
        continue;
      }

      const rangeStart = this.toMexicoCityDateTime(mexicoParts.date, schedule.startTime);
      const rangeEnd = this.toMexicoCityDateTime(mexicoParts.date, schedule.endTime);
      let cursor = new Date(rangeStart);

      while (cursor < rangeEnd) {
        const slotEnd = new Date(
          cursor.getTime() + schedule.slotDurationMinutes * 60 * 1000,
        );
        if (slotEnd > rangeEnd) {
          break;
        }

        slotsToInsert.push({
          doctorId: schedule.doctorId,
          scheduleId: schedule.id,
          startTime: new Date(cursor),
          endTime: slotEnd,
          isAvailable: true,
        });

        cursor = new Date(
          slotEnd.getTime() + schedule.breakDurationMinutes * 60 * 1000,
        );
      }
    }

    if (slotsToInsert.length > 0) {
      await entityManager.getRepository(Slot).save(slotsToInsert);
    }
  }

  private async createAuditLog(params: {
    entityManager: EntityManager;
    action: 'create_schedule' | 'update_schedule' | 'delete_schedule';
    scheduleId: string;
    userId: string;
    ipAddress: string;
    oldValues?: unknown;
    newValues?: unknown;
  }): Promise<void> {
    const { entityManager, action, scheduleId, userId, ipAddress, oldValues, newValues } =
      params;
    await entityManager.getRepository(AuditLog).save(
      entityManager.getRepository(AuditLog).create({
        action,
        entityType: 'doctor_schedule',
        entityId: scheduleId,
        userId,
        ipAddress,
        oldValues: oldValues ? JSON.stringify(oldValues) : undefined,
        newValues: newValues ? JSON.stringify(newValues) : undefined,
      }),
    );
  }

  async listMySchedules(userId: string): Promise<DoctorSchedule[]> {
    const doctor = await AppDataSource.getRepository(Doctor).findOne({
      where: { userId },
    });
    if (!doctor) {
      throw this.buildError('Perfil de médico no encontrado', 404, 'DOCTOR_NOT_FOUND');
    }

    return AppDataSource.getRepository(DoctorSchedule).find({
      where: { doctorId: doctor.id, deletedAt: IsNull() },
      order: { dayOfWeek: 'ASC', startTime: 'ASC' },
    });
  }

  async createSchedule(
    userId: string,
    dto: CreateScheduleDto,
    ipAddress: string,
  ): Promise<DoctorSchedule> {
    this.assertTimeRange(dto.startTime, dto.endTime);

    return AppDataSource.transaction(async (entityManager) => {
      const doctor = await this.getDoctorByUserId(entityManager, userId);
      const isActive = dto.isActive ?? true;

      if (isActive) {
        await this.validateOverlap({
          entityManager,
          doctorId: doctor.id,
          dayOfWeek: dto.dayOfWeek,
          startTime: dto.startTime,
          endTime: dto.endTime,
        });
      }

      const schedule = await entityManager.getRepository(DoctorSchedule).save(
        entityManager.getRepository(DoctorSchedule).create({
          doctorId: doctor.id,
          dayOfWeek: dto.dayOfWeek,
          startTime: dto.startTime,
          endTime: dto.endTime,
          slotDurationMinutes: dto.slotDurationMinutes,
          breakDurationMinutes: dto.breakDurationMinutes,
          isActive,
        }),
      );

      await this.generateFutureSlots(entityManager, schedule);
      await this.createAuditLog({
        entityManager,
        action: 'create_schedule',
        scheduleId: schedule.id,
        userId,
        ipAddress,
        newValues: schedule,
      });

      return schedule;
    });
  }

  async updateSchedule(
    userId: string,
    scheduleId: string,
    dto: UpdateScheduleDto,
    ipAddress: string,
  ): Promise<DoctorSchedule> {
    return AppDataSource.transaction(async (entityManager) => {
      const doctor = await this.getDoctorByUserId(entityManager, userId);
      const scheduleRepository = entityManager.getRepository(DoctorSchedule);
      const schedule = await scheduleRepository
        .createQueryBuilder('schedule')
        .where('schedule.id = :scheduleId', { scheduleId })
        .andWhere('schedule.doctor_id = :doctorId', { doctorId: doctor.id })
        .andWhere('schedule.deleted_at IS NULL')
        .setLock('pessimistic_write')
        .getOne();

      if (!schedule) {
        throw this.buildError('Horario no encontrado', 404, 'SCHEDULE_NOT_FOUND');
      }

      const previousValues = { ...schedule };
      const nextValues = {
        dayOfWeek: dto.dayOfWeek ?? schedule.dayOfWeek,
        startTime: dto.startTime ?? schedule.startTime,
        endTime: dto.endTime ?? schedule.endTime,
        slotDurationMinutes: dto.slotDurationMinutes ?? schedule.slotDurationMinutes,
        breakDurationMinutes:
          dto.breakDurationMinutes ?? schedule.breakDurationMinutes,
        isActive: dto.isActive ?? schedule.isActive,
      };

      this.assertTimeRange(nextValues.startTime, nextValues.endTime);

      if (nextValues.isActive) {
        await this.validateOverlap({
          entityManager,
          doctorId: doctor.id,
          dayOfWeek: nextValues.dayOfWeek,
          startTime: nextValues.startTime,
          endTime: nextValues.endTime,
          excludeScheduleId: schedule.id,
        });
      }

      schedule.dayOfWeek = nextValues.dayOfWeek;
      schedule.startTime = nextValues.startTime;
      schedule.endTime = nextValues.endTime;
      schedule.slotDurationMinutes = nextValues.slotDurationMinutes;
      schedule.breakDurationMinutes = nextValues.breakDurationMinutes;
      schedule.isActive = nextValues.isActive;

      const updated = await scheduleRepository.save(schedule);

      await this.deleteFutureUnreservedSlots(entityManager, updated.id);
      await this.generateFutureSlots(entityManager, updated);

      await this.createAuditLog({
        entityManager,
        action: 'update_schedule',
        scheduleId: updated.id,
        userId,
        ipAddress,
        oldValues: previousValues,
        newValues: updated,
      });

      return updated;
    });
  }

  async deleteSchedule(userId: string, scheduleId: string, ipAddress: string): Promise<void> {
    await AppDataSource.transaction(async (entityManager) => {
      const doctor = await this.getDoctorByUserId(entityManager, userId);
      const scheduleRepository = entityManager.getRepository(DoctorSchedule);
      const schedule = await scheduleRepository
        .createQueryBuilder('schedule')
        .where('schedule.id = :scheduleId', { scheduleId })
        .andWhere('schedule.doctor_id = :doctorId', { doctorId: doctor.id })
        .andWhere('schedule.deleted_at IS NULL')
        .setLock('pessimistic_write')
        .getOne();

      if (!schedule) {
        throw this.buildError('Horario no encontrado', 404, 'SCHEDULE_NOT_FOUND');
      }

      const futureActiveAppointments = await entityManager
        .getRepository(Appointment)
        .createQueryBuilder('appointment')
        .innerJoin(Slot, 'slot', 'slot.id = appointment.slot_id')
        .where('slot.schedule_id = :scheduleId', { scheduleId })
        .andWhere('appointment.status IN (:...statuses)', {
          statuses: ['confirmed', 'pending'],
        })
        .andWhere('appointment.appointment_date > NOW()')
        .getCount();

      if (futureActiveAppointments > 0) {
        throw this.buildError(
          'No se puede eliminar el horario porque tiene citas futuras confirmadas o pendientes',
          400,
          'SCHEDULE_HAS_FUTURE_APPOINTMENTS',
        );
      }

      await this.deleteFutureUnreservedSlots(entityManager, schedule.id);
      await scheduleRepository.softDelete(schedule.id);

      await this.createAuditLog({
        entityManager,
        action: 'delete_schedule',
        scheduleId: schedule.id,
        userId,
        ipAddress,
        oldValues: schedule,
      });
    });
  }
}
