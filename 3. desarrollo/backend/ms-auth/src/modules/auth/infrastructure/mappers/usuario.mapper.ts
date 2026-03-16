import { UsuarioModel } from '../models/usuario.model';
import { UsuarioEntity } from '../../domain/entities/usuario.entity';

/**
 * Mapper para convertir entre UsuarioModel (TypeORM) y UsuarioEntity (Domain)
 */
export class UsuarioMapper {
  /**
   * Convierte un modelo TypeORM a entidad de dominio
   */
  static toDomain(model: UsuarioModel): UsuarioEntity {
    return new UsuarioEntity(
      model.id,
      model.uuid,
      model.username,
      model.nombreCompleto,
      model.email,
      model.passwordHash,
      model.empresaId,
      model.oficinaId,
      model.perfilId,
      model.empleadoId,
      model.tipoUsuario,
      model.esAdmin,
      model.accesoGlobal,
      model.fechaUltimoPassword,
      model.forzarCambioPassword,
      model.passwordNuncaExpira,
      model.intentosFallidos,
      model.fechaPrimerIntentoFallido,
      model.bloqueadoHasta,
      model.motivoBloqueo,
      model.fechaUltimoLogin,
      model.ultimaIpLogin,
      model.mfaActivado,
      model.totpSecret,
      model.activo,
      model.esSistema,
      model.fechaEliminacion,
    );
  }

  /**
   * Convierte una entidad de dominio a modelo TypeORM (para actualizaciones)
   */
  static toModel(entity: UsuarioEntity): Partial<UsuarioModel> {
    return {
      id: entity.id,
      uuid: entity.uuid,
      username: entity.username,
      nombreCompleto: entity.nombreCompleto,
      email: entity.email,
      passwordHash: entity.passwordHash,
      empresaId: entity.empresaId,
      oficinaId: entity.oficinaId,
      perfilId: entity.perfilId,
      empleadoId: entity.empleadoId,
      tipoUsuario: entity.tipoUsuario,
      esAdmin: entity.esAdmin,
      accesoGlobal: entity.accesoGlobal,
      fechaUltimoPassword: entity.fechaUltimoPassword,
      forzarCambioPassword: entity.forzarCambioPassword,
      passwordNuncaExpira: entity.passwordNuncaExpira,
      intentosFallidos: entity.intentosFallidos,
      fechaPrimerIntentoFallido: entity.fechaPrimerIntentoFallido,
      bloqueadoHasta: entity.bloqueadoHasta,
      motivoBloqueo: entity.motivoBloqueo,
      fechaUltimoLogin: entity.fechaUltimoLogin,
      ultimaIpLogin: entity.ultimaIpLogin,
      mfaActivado: entity.mfaActivado,
      totpSecret: entity.totpSecret,
      activo: entity.activo,
      esSistema: entity.esSistema,
      fechaEliminacion: entity.fechaEliminacion,
    };
  }
}

