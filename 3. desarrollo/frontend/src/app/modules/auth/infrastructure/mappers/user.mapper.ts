import { UserEntity, OfficeEntity } from '../../domain/entities';
import { UserDto, OfficeDto, LoginResponseDto } from '../dto/response/login.response.dto';
import { LoginResponse } from '../../domain/ports/auth.port';

/**
 * Mapper para convertir entre DTOs y entidades de dominio
 */
export class UserMapper {
  /**
   * Convierte UserDto a UserEntity
   */
  static toDomain(dto: UserDto): UserEntity {
    return new UserEntity(
      dto.id,
      dto.uuid,
      dto.username,
      dto.nombreCompleto,
      dto.email,
      dto.empresaId,
      dto.oficinaId,
      dto.perfilId,
      dto.tipoUsuario,
      dto.esAdmin,
      dto.accesoGlobal,
      dto.requiereCambioPassword,
      dto.oficinasPermitidas?.map(office => this.officeToDomain(office)) || []
    );
  }

  /**
   * Convierte OfficeDto a OfficeEntity
   */
  static officeToDomain(dto: OfficeDto): OfficeEntity {
    return new OfficeEntity(
      dto.id,
      dto.codigo,
      dto.nombre,
      dto.direccion,
      dto.activo
    );
  }

  /**
   * Convierte LoginResponseDto a LoginResponse
   */
  static loginResponseToDomain(dto: LoginResponseDto): LoginResponse {
    return {
      accessToken: dto.accessToken,
      refreshToken: dto.refreshToken,
      expiresIn: dto.expiresIn,
      tokenType: dto.tokenType,
      user: this.toDomain(dto.user),
      requirePasswordChange: dto.requirePasswordChange,
      schedule: dto.schedule ? {
        inicio: dto.schedule.inicio,
        fin: dto.schedule.fin,
        mensaje: dto.schedule.mensaje,
      } : undefined,
      activeSession: dto.activeSession ? {
        id: dto.activeSession.id,
        device: dto.activeSession.device,
        ip: dto.activeSession.ip,
        lastActivity: typeof dto.activeSession.lastActivity === 'string'
          ? new Date(dto.activeSession.lastActivity)
          : dto.activeSession.lastActivity,
      } : undefined,
    };
  }

  /**
   * Convierte AuthEntity (formato actual) a UserEntity
   * Mantiene compatibilidad con el código existente
   */
  static fromAuthEntity(authEntity: any): UserEntity {
    // Adaptador para convertir del formato actual al nuevo formato
    const user = authEntity?.user || authEntity;
    
    return new UserEntity(
      user.usuar_cod_usuar || user.id,
      user.uuid || '',
      user.usuar_nom_usuar || user.username,
      user.perso_nom_rzsoc || user.nombreCompleto || user.usuar_nom_usuar,
      user.usuar_dir_corre || user.email || null,
      user.empresaId || 0,
      user.oficinaId || null,
      user.usuar_cod_perfi || user.perfilId || 0,
      'EMPLEADO', // Por defecto, se puede ajustar según datos
      false, // esAdmin - se debe obtener de perfil
      false, // accesoGlobal - se debe obtener de perfil
      false, // requiereCambioPassword - se debe obtener de datos
      [] // oficinasPermitidas - se debe obtener de datos
    );
  }
}

