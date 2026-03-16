import { HorarioUsuarioEntity } from '../entities/horario-usuario.entity';

/**
 * Puerto (interfaz) para el repositorio de horarios
 */
export interface IScheduleRepository {
  findUserSchedule(
    userId: number,
    dayOfWeek: number,
  ): Promise<HorarioUsuarioEntity | null>;
  findTemporaryAuth(
    userId: number,
    date: Date,
    time: string,
  ): Promise<boolean>;
}

/**
 * Token para inyección de dependencias
 */
export const SCHEDULE_REPOSITORY = Symbol('SCHEDULE_REPOSITORY');

