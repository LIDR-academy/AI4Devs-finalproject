import { CllabEntity } from '../entity/cllab.entity';

/**
 * Value Object para Información Laboral
 * Normaliza los datos antes de persistir
 */
export class CllabValue implements CllabEntity {
  cllab_cod_cllab?: number;
  cllab_cod_clien: number;
  cllab_cod_depen?: number | null;
  cllab_des_cargo?: string | null;
  cllab_cod_tcont?: number | null;
  cllab_fec_ingre?: Date | null;
  cllab_fec_finct?: Date | null;
  cllab_val_ingre?: number | null;
  cllab_dir_traba?: string | null;
  cllab_tlf_traba?: string | null;
  created_at?: Date;
  updated_at?: Date;
  created_by: number;
  updated_by: number;
  deleted_at?: Date | null;

  constructor(data: CllabEntity, id?: number) {
    // Normalización de datos
    this.cllab_cod_cllab = id || data.cllab_cod_cllab;
    this.cllab_cod_clien = data.cllab_cod_clien;
    this.cllab_cod_depen = data.cllab_cod_depen ?? null;
    this.cllab_cod_tcont = data.cllab_cod_tcont ?? null;
    
    // Cargo: trim y mayúsculas, máximo 100 caracteres
    this.cllab_des_cargo = data.cllab_des_cargo 
      ? data.cllab_des_cargo.trim().toUpperCase().substring(0, 100) 
      : null;
    
    // Fechas: mantener o null
    this.cllab_fec_ingre = data.cllab_fec_ingre ?? null;
    this.cllab_fec_finct = data.cllab_fec_finct ?? null;
    
    // Ingreso: mantener valor numérico o null
    this.cllab_val_ingre = data.cllab_val_ingre ?? null;
    
    // Dirección: trim y mayúsculas, máximo 300 caracteres
    this.cllab_dir_traba = data.cllab_dir_traba 
      ? data.cllab_dir_traba.trim().toUpperCase().substring(0, 300) 
      : null;
    
    // Teléfono: trim, máximo 15 caracteres
    this.cllab_tlf_traba = data.cllab_tlf_traba 
      ? data.cllab_tlf_traba.trim().substring(0, 15) 
      : null;
    
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
  public toJson(): CllabEntity {
    return {
      cllab_cod_cllab: this.cllab_cod_cllab,
      cllab_cod_clien: this.cllab_cod_clien,
      cllab_cod_depen: this.cllab_cod_depen,
      cllab_des_cargo: this.cllab_des_cargo,
      cllab_cod_tcont: this.cllab_cod_tcont,
      cllab_fec_ingre: this.cllab_fec_ingre,
      cllab_fec_finct: this.cllab_fec_finct,
      cllab_val_ingre: this.cllab_val_ingre,
      cllab_dir_traba: this.cllab_dir_traba,
      cllab_tlf_traba: this.cllab_tlf_traba,
      created_at: this.created_at,
      updated_at: this.updated_at,
      created_by: this.created_by,
      updated_by: this.updated_by,
      deleted_at: this.deleted_at,
    };
  }
}
