import { ClrefEntity } from '../entity/clref.entity';

/**
 * Value Object para Referencia
 * Normaliza los datos antes de persistir
 */
export class ClrefValue implements ClrefEntity {
  clref_cod_clref?: number;
  clref_cod_clien: number;
  clref_cod_tiref: number;
  clref_cod_perso?: number | null;
  clref_nom_refer?: string | null;
  clref_dir_refer?: string | null;
  clref_tlf_refer?: string | null;
  clref_num_ctadp?: string | null;
  clref_val_saldo?: number | null;
  clref_fec_apert?: Date | null;
  created_at?: Date;
  updated_at?: Date;
  created_by: number;
  updated_by: number;
  deleted_at?: Date | null;

  constructor(data: ClrefEntity, id?: number) {
    // Normalización de datos
    this.clref_cod_clref = id || data.clref_cod_clref;
    this.clref_cod_clien = data.clref_cod_clien;
    this.clref_cod_tiref = data.clref_cod_tiref;
    this.clref_cod_perso = data.clref_cod_perso ?? null;
    
    // Nombre: trim y mayúsculas, máximo 150 caracteres
    this.clref_nom_refer = data.clref_nom_refer 
      ? data.clref_nom_refer.trim().toUpperCase().substring(0, 150) 
      : null;
    
    // Dirección: trim y mayúsculas, máximo 200 caracteres
    this.clref_dir_refer = data.clref_dir_refer 
      ? data.clref_dir_refer.trim().toUpperCase().substring(0, 200) 
      : null;
    
    // Teléfono: trim, máximo 15 caracteres
    this.clref_tlf_refer = data.clref_tlf_refer 
      ? data.clref_tlf_refer.trim().substring(0, 15) 
      : null;
    
    // Número de cuenta: trim, máximo 30 caracteres
    this.clref_num_ctadp = data.clref_num_ctadp 
      ? data.clref_num_ctadp.trim().substring(0, 30) 
      : null;
    
    // Saldo: mantener valor numérico o null
    this.clref_val_saldo = data.clref_val_saldo ?? null;
    
    // Fecha apertura: mantener o null
    this.clref_fec_apert = data.clref_fec_apert ?? null;
    
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
  public toJson(): ClrefEntity {
    return {
      clref_cod_clref: this.clref_cod_clref,
      clref_cod_clien: this.clref_cod_clien,
      clref_cod_tiref: this.clref_cod_tiref,
      clref_cod_perso: this.clref_cod_perso,
      clref_nom_refer: this.clref_nom_refer,
      clref_dir_refer: this.clref_dir_refer,
      clref_tlf_refer: this.clref_tlf_refer,
      clref_num_ctadp: this.clref_num_ctadp,
      clref_val_saldo: this.clref_val_saldo,
      clref_fec_apert: this.clref_fec_apert,
      created_at: this.created_at,
      updated_at: this.updated_at,
      created_by: this.created_by,
      updated_by: this.updated_by,
      deleted_at: this.deleted_at,
    };
  }
}

