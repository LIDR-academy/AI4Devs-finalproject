import { ParroquiaResponseDto } from '../dto/response/parroquia.response.dto';
import { ParroquiaEntity, generarCodigoCompleto } from '../../domain/entity';

/**
 * Mapper para convertir entre DTO y Entity de Parroquia
 */
export class ParroquiaMapper {
  /**
   * Convierte DTO de respuesta a Entity de dominio
   */
  static toEntity(dto: ParroquiaResponseDto): ParroquiaEntity {
    // Manejar campos opcionales de forma segura
    const proviCodProv = dto.provi_cod_prov || undefined;
    const cantoCodCant = dto.canto_cod_cant || undefined;
    const parroCodParr = dto.parro_cod_parr || undefined;
    
    const codigoCompleto = proviCodProv && cantoCodCant && parroCodParr
      ? generarCodigoCompleto(proviCodProv, cantoCodCant, parroCodParr)
      : undefined;

    return {
      parro_cod_parro: dto.parro_cod_parro,
      canto_cod_canto: dto.canto_cod_canto,
      parro_cod_parr: dto.parro_cod_parr,
      parro_nom_parro: dto.parro_nom_parro,
      parro_tip_area: dto.parro_tip_area,
      parro_flg_acti: dto.parro_flg_acti,
      parro_fec_creac: dto.parro_fec_creac ? new Date(dto.parro_fec_creac) : undefined,
      parro_fec_modif: dto.parro_fec_modif ? new Date(dto.parro_fec_modif) : undefined,
      parro_fec_elimi: dto.parro_fec_elimi ? new Date(dto.parro_fec_elimi) : null,
      // Campos relacionados (opcionales)
      canto_cod_cant: cantoCodCant,
      canto_nom_canto: dto.canto_nom_canto || undefined,
      provi_cod_prov: proviCodProv,
      provi_nom_provi: dto.provi_nom_provi || undefined,
      codigoCompleto,
    };
  }
  
  /**
   * Convierte array de DTOs a array de Entities
   */
  static toEntityArray(dtos: ParroquiaResponseDto[]): ParroquiaEntity[] {
    return dtos.map(dto => this.toEntity(dto));
  }
}

