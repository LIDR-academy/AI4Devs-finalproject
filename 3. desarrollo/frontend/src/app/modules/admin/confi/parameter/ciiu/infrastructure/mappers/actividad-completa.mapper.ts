import { ActividadCompletaResponseDto } from '../dto/response/actividad-completa.response.dto';
import { ActividadCompletaEntity } from '../../domain/entity';

/**
 * Mapper para convertir entre DTO y Entity de Actividad Completa
 */
export class ActividadCompletaMapper {
  /**
   * Convierte DTO de respuesta a Entity de dominio
   */
  static toEntity(dto: ActividadCompletaResponseDto): ActividadCompletaEntity {
    return {
      ciact_cod_ciact: dto.ciact_cod_ciact,
      ciact_abr_ciact: dto.ciact_abr_ciact,
      ciact_des_ciact: dto.ciact_des_ciact,
      ciact_cod_semaf: dto.ciact_cod_semaf,
      semaf_des_semaf: dto.semaf_des_semaf,
      semaf_ico_semaf: dto.semaf_ico_semaf,
      semaf_col_semaf: dto.semaf_col_semaf,
      cisub_cod_cisub: dto.cisub_cod_cisub,
      cisub_abr_cisub: dto.cisub_abr_cisub,
      cisub_des_cisub: dto.cisub_des_cisub,
      cicla_cod_cicla: dto.cicla_cod_cicla,
      cicla_abr_cicla: dto.cicla_abr_cicla,
      cicla_des_cicla: dto.cicla_des_cicla,
      cigru_cod_cigru: dto.cigru_cod_cigru,
      cigru_abr_cigru: dto.cigru_abr_cigru,
      cigru_des_cigru: dto.cigru_des_cigru,
      cidiv_cod_cidiv: dto.cidiv_cod_cidiv,
      cidiv_abr_cidiv: dto.cidiv_abr_cidiv,
      cidiv_des_cidiv: dto.cidiv_des_cidiv,
      cisec_cod_cisec: dto.cisec_cod_cisec,
      cisec_abr_cisec: dto.cisec_abr_cisec,
      cisec_des_cisec: dto.cisec_des_cisec,
    };
  }
  
  /**
   * Convierte array de DTOs a array de Entities
   */
  static toEntityArray(dtos: ActividadCompletaResponseDto[]): ActividadCompletaEntity[] {
    return dtos.map(dto => this.toEntity(dto));
  }
}

