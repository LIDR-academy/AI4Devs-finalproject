import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IScheduleRepository,
  SCHEDULE_REPOSITORY,
} from '../../domain/ports/schedule-repository.port';
import { HorarioUsuarioModel } from '../models/horario-usuario.model';
import { AutorizacionTemporalModel } from '../models/autorizacion-temporal.model';
import { HorarioUsuarioMapper } from '../mappers/horario-usuario.mapper';
import { HorarioUsuarioEntity } from '../../domain/entities/horario-usuario.entity';

/**
 * Implementación del repositorio de horarios
 */
@Injectable()
export class ScheduleRepository implements IScheduleRepository {
  constructor(
    @InjectRepository(HorarioUsuarioModel)
    private readonly horarioRepo: Repository<HorarioUsuarioModel>,
    @InjectRepository(AutorizacionTemporalModel)
    private readonly autorizacionRepo: Repository<AutorizacionTemporalModel>,
  ) {}

  async findUserSchedule(
    userId: number,
    dayOfWeek: number,
  ): Promise<HorarioUsuarioEntity | null> {
    const model = await this.horarioRepo.findOne({
      where: {
        usuarioId: userId,
        diaSemanaId: dayOfWeek,
        activo: true,
      },
      relations: ['diaSemana'],
    });

    return model ? HorarioUsuarioMapper.toDomain(model) : null;
  }

  async findTemporaryAuth(
    userId: number,
    date: Date,
    time: string,
  ): Promise<boolean> {
    const fechaStr = date.toISOString().split('T')[0]; // YYYY-MM-DD

    const [hora, minutos] = time.split(':').map(Number);
    const minutosTotal = hora * 60 + minutos;

    const autorizaciones = await this.autorizacionRepo
      .createQueryBuilder('auth')
      .where('auth.hisau_cod_usuar = :userId', { userId })
      .andWhere('auth.hisau_fec_hisau = :fecha', { fecha: fechaStr })
      .andWhere('auth.hisau_ctr_habil = true')
      .getMany();

    // Verificar si alguna autorización cubre el tiempo actual
    for (const auth of autorizaciones) {
      const [horaInicio, minutosInicio] = auth.horaInicio
        .split(':')
        .map(Number);
      const minutosInicioTotal = horaInicio * 60 + minutosInicio;
      const minutosFinTotal =
        minutosInicioTotal + auth.minutosAutorizados;

      if (
        minutosTotal >= minutosInicioTotal &&
        minutosTotal <= minutosFinTotal
      ) {
        return true;
      }
    }

    return false;
  }
}

