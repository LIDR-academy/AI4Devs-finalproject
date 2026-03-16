import { HorarioUsuarioModel } from '../models/horario-usuario.model';
import { HorarioUsuarioEntity } from '../../domain/entities/horario-usuario.entity';

/**
 * Mapper para convertir entre HorarioUsuarioModel (TypeORM) y HorarioUsuarioEntity (Domain)
 */
export class HorarioUsuarioMapper {
  /**
   * Convierte un modelo TypeORM a entidad de dominio
   */
  static toDomain(model: HorarioUsuarioModel): HorarioUsuarioEntity {
    return new HorarioUsuarioEntity(
      model.id,
      model.usuarioId,
      model.diaSemanaId,
      model.horaInicio,
      model.horaFin,
      model.activo,
    );
  }
}

