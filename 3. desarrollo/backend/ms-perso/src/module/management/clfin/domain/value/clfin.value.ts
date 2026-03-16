import { ClfinEntity } from '../entity/clfin.entity';

/**
 * Value Object para Información Financiera
 * Normaliza los datos antes de persistir
 */
export class ClfinValue implements ClfinEntity {
  clfin_cod_clfin?: number;
  clfin_cod_clien: number;
  clfin_cod_tifin: number;
  clfin_val_monto: number;
  created_at?: Date;
  updated_at?: Date;
  created_by: number;
  updated_by: number;
  deleted_at?: Date | null;

  constructor(data: ClfinEntity, id?: number) {
    // Normalización de datos
    this.clfin_cod_clfin = id || data.clfin_cod_clfin;
    this.clfin_cod_clien = data.clfin_cod_clien;
    this.clfin_cod_tifin = data.clfin_cod_tifin;
    
    // Monto: redondear a 2 decimales, mínimo 0
    this.clfin_val_monto = Math.max(0, Math.round((data.clfin_val_monto || 0) * 100) / 100);
    
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
  public toJson(): ClfinEntity {
    return {
      clfin_cod_clfin: this.clfin_cod_clfin,
      clfin_cod_clien: this.clfin_cod_clien,
      clfin_cod_tifin: this.clfin_cod_tifin,
      clfin_val_monto: this.clfin_val_monto,
      created_at: this.created_at,
      updated_at: this.updated_at,
      created_by: this.created_by,
      updated_by: this.updated_by,
      deleted_at: this.deleted_at,
    };
  }
}

