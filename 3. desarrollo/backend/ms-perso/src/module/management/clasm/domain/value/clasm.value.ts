import { ClasmEntity } from '../entity/clasm.entity';

/**
 * Value Object para Asamblea
 * Normaliza los datos antes de persistir
 */
export class ClasmValue implements ClasmEntity {
  clasm_cod_clasm?: number;
  clasm_cod_clien: number;
  clasm_cod_rasam?: number | null;
  clasm_fec_rasam?: Date | null;
  clasm_ctr_direc: boolean;
  clasm_fec_direc?: Date | null;
  created_at?: Date;
  updated_at?: Date;
  created_by: number;
  updated_by: number;
  deleted_at?: Date | null;

  constructor(data: ClasmEntity, id?: number) {
    // Normalización de datos
    this.clasm_cod_clasm = id || data.clasm_cod_clasm;
    this.clasm_cod_clien = data.clasm_cod_clien;
    
    // Tipo representante asamblea: mantener o null
    this.clasm_cod_rasam = data.clasm_cod_rasam ?? null;
    
    // Fecha nombramiento asamblea: mantener o null
    this.clasm_fec_rasam = data.clasm_fec_rasam ?? null;
    
    // Es directivo: default false
    this.clasm_ctr_direc = data.clasm_ctr_direc ?? false;
    
    // Fecha nombramiento directivo: mantener o null
    this.clasm_fec_direc = data.clasm_fec_direc ?? null;
    
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
  public toJson(): ClasmEntity {
    return {
      clasm_cod_clasm: this.clasm_cod_clasm,
      clasm_cod_clien: this.clasm_cod_clien,
      clasm_cod_rasam: this.clasm_cod_rasam,
      clasm_fec_rasam: this.clasm_fec_rasam,
      clasm_ctr_direc: this.clasm_ctr_direc,
      clasm_fec_direc: this.clasm_fec_direc,
      created_at: this.created_at,
      updated_at: this.updated_at,
      created_by: this.created_by,
      updated_by: this.updated_by,
      deleted_at: this.deleted_at,
    };
  }
}

