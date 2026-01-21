import { ClienResponseDto } from '../dto/response/clien.response.dto';
import { ClienEntity } from '../../domain/entity';
import { PersoMapper } from './perso.mapper';

/**
 * Mapper para convertir entre DTO y Entity de Cliente
 */
export class ClienMapper {
  /**
   * Convierte DTO de respuesta a Entity de dominio
   */
  static toEntity(dto: ClienResponseDto): ClienEntity {
    return {
      clien_cod_clien: dto.clien_cod_clien,
      clien_cod_perso: dto.clien_cod_perso,
      clien_cod_ofici: dto.clien_cod_ofici,
      clien_ctr_socio: dto.clien_ctr_socio,
      clien_fec_ingin: new Date(dto.clien_fec_ingin),
      clien_fec_salid: dto.clien_fec_salid ? new Date(dto.clien_fec_salid) : null,
      clien_des_obser: dto.clien_des_obser ?? null,
      created_at: dto.created_at ? new Date(dto.created_at) : undefined,
      updated_at: dto.updated_at ? new Date(dto.updated_at) : undefined,
      deleted_at: dto.deleted_at ? new Date(dto.deleted_at) : null,
      persona: dto.persona ? PersoMapper.toEntity(dto.persona) : undefined,
    };
  }
  
  /**
   * Convierte array de DTOs a array de Entities
   */
  static toEntityArray(dtos: ClienResponseDto[]): ClienEntity[] {
    return dtos.map(dto => this.toEntity(dto));
  }
}

