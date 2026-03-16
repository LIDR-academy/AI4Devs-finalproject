import { DiaSemanaModel } from '../models/dia-semana.model';
import { DiaSemanaEntity } from '../../domain/entities/dia-semana.entity';

/**
 * Mapper para convertir entre DiaSemanaModel (TypeORM) y DiaSemanaEntity (Domain)
 */
export class DiaSemanaMapper {
  /**
   * Convierte un modelo TypeORM a entidad de dominio
   */
  static toDomain(model: DiaSemanaModel): DiaSemanaEntity {
    return new DiaSemanaEntity(
      model.id,
      model.nombre,
      model.abreviacion,
      model.numeroOrden,
    );
  }
}

