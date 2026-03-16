import { CantonResponseDto } from '../dto/response/canton.response.dto';
import { CantonEntity } from '../../domain/entity';

/**
 * Mapper para convertir entre DTO y Entity de Cantón
 */
export class CantonMapper {
  /**
   * Convierte DTO de respuesta a Entity de dominio
   */
  static toEntity(dto: CantonResponseDto): CantonEntity {
    return {
      canto_cod_canto: dto.canto_cod_canto,
      provi_cod_provi: dto.provi_cod_provi,
      canto_cod_cant: dto.canto_cod_cant,
      canto_nom_canto: dto.canto_nom_canto,
      canto_flg_acti: dto.canto_flg_acti,
      canto_fec_creac: dto.canto_fec_creac ? new Date(dto.canto_fec_creac) : undefined,
      canto_fec_modif: dto.canto_fec_modif ? new Date(dto.canto_fec_modif) : undefined,
      canto_fec_elimi: dto.canto_fec_elimi ? new Date(dto.canto_fec_elimi) : null,
      provi_cod_prov: dto.provi_cod_prov,
      provi_nom_provi: dto.provi_nom_provi,
    };
  }
  
  /**
   * Convierte array de DTOs a array de Entities
   */
  static toEntityArray(dtos: CantonResponseDto[]): CantonEntity[] {
    return dtos.map(dto => this.toEntity(dto));
  }
}

