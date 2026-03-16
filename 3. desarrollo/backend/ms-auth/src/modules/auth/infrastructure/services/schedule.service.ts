import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { SCHEDULE_REPOSITORY } from '../../domain/ports/schedule-repository.port';
import { IScheduleRepository } from '../../domain/ports/schedule-repository.port';
import { UsuarioEntity } from '../../domain/entities/usuario.entity';
import { ScheduleCheckResult } from '../../domain/value-objects/schedule-check-result.vo';

/**
 * Servicio para validación de horarios de acceso
 */
@Injectable()
export class ScheduleService {
  constructor(
    @Inject(SCHEDULE_REPOSITORY)
    private readonly scheduleRepository: IScheduleRepository,
  ) {}

  /**
   * Verifica si el usuario puede acceder en este momento
   */
  async canUserAccessNow(user: UsuarioEntity): Promise<ScheduleCheckResult> {
    // Usuarios de tipo SISTEMA tienen acceso 24/7
    if (user.esTipoSistema()) {
      return ScheduleCheckResult.allowed();
    }

    // Obtener día de la semana actual (ISO: Monday=1, Sunday=7)
    const now = new Date();
    const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay(); // Convertir Sunday de 0 a 7

    // Obtener horario del usuario para este día
    const horario = await this.scheduleRepository.findUserSchedule(
      user.id,
      dayOfWeek,
    );

    // Si no tiene horario definido, denegar acceso
    if (!horario) {
      return ScheduleCheckResult.denied(
        'No tiene horario definido para hoy',
      );
    }

    // Obtener hora actual en formato HH:MM
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Verificar si está dentro del horario
    if (this.isTimeInRange(currentTime, horario.horaInicio, horario.horaFin)) {
      return ScheduleCheckResult.allowed();
    }

    // Si está fuera del horario, verificar autorización temporal
    const fecha = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tieneAutorizacion = await this.scheduleRepository.findTemporaryAuth(
      user.id,
      fecha,
      currentTime,
    );

    if (tieneAutorizacion) {
      return ScheduleCheckResult.temporaryAuth(
        'Acceso autorizado temporalmente',
      );
    }

    // Acceso denegado fuera del horario
    return ScheduleCheckResult.denied(
      `Acceso no permitido fuera del horario establecido (${horario.horaInicio} - ${horario.horaFin})`,
      horario.horaInicio,
      horario.horaFin,
    );
  }

  /**
   * Verifica si una hora está dentro de un rango
   */
  private isTimeInRange(
    time: string,
    start: string,
    end: string,
  ): boolean {
    const [timeHour, timeMin] = time.split(':').map(Number);
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);

    const timeMinutes = timeHour * 60 + timeMin;
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    return timeMinutes >= startMinutes && timeMinutes <= endMinutes;
  }
}

