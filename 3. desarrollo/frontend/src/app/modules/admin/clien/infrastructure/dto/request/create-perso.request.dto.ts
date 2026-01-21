import { PersoEntity } from '../../../domain/entity';

/**
 * DTO de request para crear Persona
 */
export interface CreatePersoRequestDto extends Omit<PersoEntity, 'perso_cod_perso' | 'created_at' | 'updated_at' | 'deleted_at'> {
  created_by: number;
  updated_by: number;
}

