import { PerfilModel } from '../models/perfil.model';
import { PerfilEntity } from '../../domain/entities/perfil.entity';

/**
 * Mapper para convertir entre PerfilModel (TypeORM) y PerfilEntity (Domain)
 */
export class PerfilMapper {
  /**
   * Convierte un modelo TypeORM a entidad de dominio
   */
  static toDomain(model: PerfilModel): PerfilEntity {
    return new PerfilEntity(
      model.id,
      model.nombre,
      model.descripcion,
      model.accessTokenMinutes,
      model.refreshTokenDays,
      model.minPasswordLength,
      model.maxPasswordLength,
      model.requiereMayuscula,
      model.requiereMinuscula,
      model.requiereNumero,
      model.requiereEspecial,
      model.diasVigenciaPassword,
      model.historialPasswordCount,
      model.maxIntentosFallidos,
      model.minutosBloqueo,
      model.ventanaMinutos,
      model.sesionUnica,
      model.timeoutMinutos,
      model.requiereMFA,
      model.activo,
      model.esDefecto,
      model.fechaCreacion,
      model.fechaModificacion,
    );
  }
}

