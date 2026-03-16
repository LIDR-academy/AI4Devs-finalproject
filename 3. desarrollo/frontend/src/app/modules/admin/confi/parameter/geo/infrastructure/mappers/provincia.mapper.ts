import { ProvinciaResponseDto } from '../dto/response/provincia.response.dto';
import { ProvinciaEntity } from '../../domain/entity';

/**
 * Mapper para convertir entre DTO y Entity de Provincia
 */
export class ProvinciaMapper {
  /**
   * Convierte DTO de respuesta a Entity de dominio
   */
  static toEntity(dto: ProvinciaResponseDto): ProvinciaEntity {
    return {
      provi_cod_provi: dto.provi_cod_provi,
      provi_cod_prov: dto.provi_cod_prov,
      provi_nom_provi: dto.provi_nom_provi,
      provi_flg_acti: dto.provi_flg_acti,
      provi_fec_creac: dto.provi_fec_creac ? new Date(dto.provi_fec_creac) : undefined,
      provi_fec_modif: dto.provi_fec_modif ? new Date(dto.provi_fec_modif) : undefined,
      provi_fec_elimi: dto.provi_fec_elimi ? new Date(dto.provi_fec_elimi) : null,
    };
  }
  
  /**
   * Convierte array de DTOs a array de Entities
   */
  static toEntityArray(dtos: ProvinciaResponseDto[]): ProvinciaEntity[] {
    return dtos.map(dto => this.toEntity(dto));
  }
}

