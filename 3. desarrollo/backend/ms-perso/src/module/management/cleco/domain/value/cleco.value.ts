import { ClecoEntity } from '../entity/cleco.entity';

/**
 * Value Object para Actividad Económica
 * Normaliza los datos antes de persistir
 */
export class ClecoValue implements ClecoEntity {
  cleco_cod_cleco?: number;
  cleco_cod_clien: number;
  cleco_cod_aebce: string;
  cleco_cod_saebc: string;
  cleco_cod_dtfin: string;
  cleco_cod_sebce: string;
  cleco_cod_ssgbc: string;
  created_at?: Date;
  updated_at?: Date;
  created_by: number;
  updated_by: number;
  deleted_at?: Date | null;

  constructor(data: ClecoEntity, id?: number) {
    // Normalización de datos
    this.cleco_cod_cleco = id || data.cleco_cod_cleco;
    this.cleco_cod_clien = data.cleco_cod_clien;
    
    // Códigos BCE: trim y mayúsculas, máximo 10 caracteres
    this.cleco_cod_aebce = (data.cleco_cod_aebce || '').trim().toUpperCase().substring(0, 10);
    this.cleco_cod_saebc = (data.cleco_cod_saebc || '').trim().toUpperCase().substring(0, 10);
    this.cleco_cod_dtfin = (data.cleco_cod_dtfin || '').trim().toUpperCase().substring(0, 10);
    this.cleco_cod_sebce = (data.cleco_cod_sebce || '').trim().toUpperCase().substring(0, 10);
    this.cleco_cod_ssgbc = (data.cleco_cod_ssgbc || '').trim().toUpperCase().substring(0, 10);
    
    // Auditoría
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    this.created_by = data.created_by;
    this.updated_by = data.updated_by;
    this.deleted_at = data.deleted_at ?? null;
  }

  /**
   * Convierte el Value Object a Entity
   */
  public toJson(): ClecoEntity {
    return {
      cleco_cod_cleco: this.cleco_cod_cleco,
      cleco_cod_clien: this.cleco_cod_clien,
      cleco_cod_aebce: this.cleco_cod_aebce,
      cleco_cod_saebc: this.cleco_cod_saebc,
      cleco_cod_dtfin: this.cleco_cod_dtfin,
      cleco_cod_sebce: this.cleco_cod_sebce,
      cleco_cod_ssgbc: this.cleco_cod_ssgbc,
      created_at: this.created_at,
      updated_at: this.updated_at,
      created_by: this.created_by,
      updated_by: this.updated_by,
      deleted_at: this.deleted_at,
    };
  }
}

