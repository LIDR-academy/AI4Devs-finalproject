import { PersoResponseDto } from '../dto/response/perso.response.dto';
import { PersoEntity } from '../../domain/entity';

/**
 * Mapper para convertir entre DTO y Entity de Persona
 */
export class PersoMapper {
  /**
   * Convierte DTO de respuesta a Entity de dominio
   */
  static toEntity(dto: PersoResponseDto): PersoEntity {
    return {
      perso_cod_perso: dto.perso_cod_perso,
      perso_cod_tpers: dto.perso_cod_tpers,
      perso_cod_tiden: dto.perso_cod_tiden,
      perso_ide_perso: dto.perso_ide_perso,
      perso_nom_perso: dto.perso_nom_perso,
      perso_fec_inici: dto.perso_fec_inici ? new Date(dto.perso_fec_inici) : null,
      perso_cod_sexos: dto.perso_cod_sexos ?? null,
      perso_cod_nacio: dto.perso_cod_nacio ?? null,
      perso_cod_instr: dto.perso_cod_instr ?? null,
      perso_ema_perso: dto.perso_ema_perso ?? null,
      perso_tel_perso: dto.perso_tel_perso ?? null,
      perso_cel_perso: dto.perso_cel_perso ?? null,
      created_at: dto.created_at ? new Date(dto.created_at) : undefined,
      updated_at: dto.updated_at ? new Date(dto.updated_at) : undefined,
      deleted_at: dto.deleted_at ? new Date(dto.deleted_at) : null,
    };
  }
  
  /**
   * Convierte array de DTOs a array de Entities
   */
  static toEntityArray(dtos: PersoResponseDto[]): PersoEntity[] {
    return dtos.map(dto => this.toEntity(dto));
  }
}

