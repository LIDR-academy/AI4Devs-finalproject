import { ClcygEntity } from '../entity/clcyg.entity';

/**
 * Value Object para Cónyuge
 * Normaliza los datos antes de persistir
 */
export class ClcygValue implements ClcygEntity {
  clcyg_cod_clcyg?: number;
  clcyg_cod_clien: number;
  clcyg_cod_perso: number;
  clcyg_nom_empre?: string | null;
  clcyg_des_cargo?: string | null;
  clcyg_val_ingre?: number | null;
  created_at?: Date;
  updated_at?: Date;
  created_by: number;
  updated_by: number;
  deleted_at?: Date | null;

  constructor(data: ClcygEntity, id?: number) {
    // Normalización de datos
    this.clcyg_cod_clcyg = id || data.clcyg_cod_clcyg;
    this.clcyg_cod_clien = data.clcyg_cod_clien;
    this.clcyg_cod_perso = data.clcyg_cod_perso;
    
    // Empresa: trim y mayúsculas, máximo 150 caracteres
    this.clcyg_nom_empre = data.clcyg_nom_empre 
      ? data.clcyg_nom_empre.trim().toUpperCase().substring(0, 150) 
      : null;
    
    // Cargo: trim y mayúsculas, máximo 100 caracteres
    this.clcyg_des_cargo = data.clcyg_des_cargo 
      ? data.clcyg_des_cargo.trim().toUpperCase().substring(0, 100) 
      : null;
    
    // Ingresos: mantener valor numérico o null
    this.clcyg_val_ingre = data.clcyg_val_ingre ?? null;
    
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
  public toJson(): ClcygEntity {
    return {
      clcyg_cod_clcyg: this.clcyg_cod_clcyg,
      clcyg_cod_clien: this.clcyg_cod_clien,
      clcyg_cod_perso: this.clcyg_cod_perso,
      clcyg_nom_empre: this.clcyg_nom_empre,
      clcyg_des_cargo: this.clcyg_des_cargo,
      clcyg_val_ingre: this.clcyg_val_ingre,
      created_at: this.created_at,
      updated_at: this.updated_at,
      created_by: this.created_by,
      updated_by: this.updated_by,
      deleted_at: this.deleted_at,
    };
  }
}

