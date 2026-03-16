import { AutorizacionTemporalModel } from '../models/autorizacion-temporal.model';
import { AutorizacionTemporalEntity } from '../../domain/entities/autorizacion-temporal.entity';

/**
 * Mapper para convertir entre AutorizacionTemporalModel (TypeORM) y AutorizacionTemporalEntity (Domain)
 */
export class AutorizacionTemporalMapper {
  /**
   * Convierte un modelo TypeORM a entidad de dominio
   */
  static toDomain(model: AutorizacionTemporalModel): AutorizacionTemporalEntity {
    return new AutorizacionTemporalEntity(
      model.id,
      model.usuarioId,
      model.fecha,
      model.horaInicio,
      model.minutosAutorizados,
      model.usuarioAutorizadorId,
      model.motivoAutorizacion,
      model.activo,
    );
  }
}

