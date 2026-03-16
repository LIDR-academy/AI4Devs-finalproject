import { SesionModel } from '../models/sesion.model';
import { SesionEntity } from '../../domain/entities/sesion.entity';

/**
 * Mapper para convertir entre SesionModel (TypeORM) y SesionEntity (Domain)
 */
export class SesionMapper {
  /**
   * Convierte un modelo TypeORM a entidad de dominio
   */
  static toDomain(model: SesionModel): SesionEntity {
    return new SesionEntity(
      model.id,
      model.uuid,
      model.usuarioId,
      model.refreshTokenHash,
      model.tokenFamily,
      model.ipLogin,
      model.userAgent,
      model.deviceFingerprint,
      model.deviceName,
      model.activo,
      model.fechaCreacion,
      model.fechaExpiracion,
      model.fechaUltimaActividad,
      model.fechaRevocacion,
      model.motivoRevocacion,
    );
  }
}

