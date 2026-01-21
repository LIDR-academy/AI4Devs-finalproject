import { ClrfiEntity } from '../entity/clrfi.entity';

/**
 * Value Object para Residencia Fiscal
 * Normaliza los datos antes de persistir
 */
export class ClrfiValue implements ClrfiEntity {
  clrfi_cod_clrfi?: number;
  clrfi_cod_clien: number;
  clrfi_ctr_resfi: boolean;
  clrfi_cod_nacio?: number | null;
  clrfi_dir_resfi?: string | null;
  clrfi_des_provi?: string | null;
  clrfi_des_ciuda?: string | null;
  clrfi_cod_posta?: string | null;
  created_at?: Date;
  updated_at?: Date;
  created_by: number;
  updated_by: number;
  deleted_at?: Date | null;

  constructor(data: ClrfiEntity, id?: number) {
    // Normalización de datos
    this.clrfi_cod_clrfi = id || data.clrfi_cod_clrfi;
    this.clrfi_cod_clien = data.clrfi_cod_clien;
    
    // Tiene residencia fiscal: default false
    this.clrfi_ctr_resfi = data.clrfi_ctr_resfi ?? false;
    
    // País: mantener o null
    this.clrfi_cod_nacio = data.clrfi_cod_nacio ?? null;
    
    // Dirección: trim, mayúsculas, máximo 200 caracteres
    this.clrfi_dir_resfi = data.clrfi_dir_resfi 
      ? data.clrfi_dir_resfi.trim().toUpperCase().substring(0, 200) 
      : null;
    
    // Provincia: trim, mayúsculas, máximo 50 caracteres
    this.clrfi_des_provi = data.clrfi_des_provi 
      ? data.clrfi_des_provi.trim().toUpperCase().substring(0, 50) 
      : null;
    
    // Ciudad: trim, mayúsculas, máximo 50 caracteres
    this.clrfi_des_ciuda = data.clrfi_des_ciuda 
      ? data.clrfi_des_ciuda.trim().toUpperCase().substring(0, 50) 
      : null;
    
    // Código postal: trim, mayúsculas, máximo 10 caracteres
    this.clrfi_cod_posta = data.clrfi_cod_posta 
      ? data.clrfi_cod_posta.trim().toUpperCase().substring(0, 10) 
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
  public toJson(): ClrfiEntity {
    return {
      clrfi_cod_clrfi: this.clrfi_cod_clrfi,
      clrfi_cod_clien: this.clrfi_cod_clien,
      clrfi_ctr_resfi: this.clrfi_ctr_resfi,
      clrfi_cod_nacio: this.clrfi_cod_nacio,
      clrfi_dir_resfi: this.clrfi_dir_resfi,
      clrfi_des_provi: this.clrfi_des_provi,
      clrfi_des_ciuda: this.clrfi_des_ciuda,
      clrfi_cod_posta: this.clrfi_cod_posta,
      created_at: this.created_at,
      updated_at: this.updated_at,
      created_by: this.created_by,
      updated_by: this.updated_by,
      deleted_at: this.deleted_at,
    };
  }
}

