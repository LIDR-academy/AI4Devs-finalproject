import { ClienEntity } from '../../../domain/entity';

/**
 * DTO de request para crear Cliente
 */
export interface CreateClienRequestDto extends Omit<ClienEntity, 'clien_cod_clien' | 'created_at' | 'updated_at' | 'deleted_at' | 'persona'> {
  created_by: number;
  updated_by: number;
}

