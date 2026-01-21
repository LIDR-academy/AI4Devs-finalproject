import { ArbolCiiuResponseDto } from '../dto/response/arbol-ciiu.response.dto';
import { ArbolCiiuEntity } from '../../domain/entity';

/**
 * Mapper para convertir entre DTO y Entity de Árbol CIIU
 */
export class ArbolCiiuMapper {
  /**
   * Convierte DTO de respuesta a Entity de dominio
   */
  static toEntity(dto: ArbolCiiuResponseDto): ArbolCiiuEntity {
    return {
      nivel: dto.nivel,
      id: dto.id,
      parent_id: dto.parent_id,
      codigo: dto.codigo,
      descripcion: dto.descripcion,
      tipo: dto.tipo,
      semaf_cod: dto.semaf_cod,
      semaf_des: dto.semaf_des,
    };
  }
  
  /**
   * Convierte array de DTOs a array de Entities
   */
  static toEntityArray(dtos: ArbolCiiuResponseDto[]): ArbolCiiuEntity[] {
    return dtos.map(dto => this.toEntity(dto));
  }
}

