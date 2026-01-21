import { ClrepEntity } from '../entity/clrep.entity';

/**
 * Value Object para Representante
 * Normaliza los datos antes de persistir
 */
export class ClrepValue implements ClrepEntity {
  clrep_cod_clrep?: number;
  clrep_cod_clien: number;
  clrep_cod_perso: number;
  clrep_cod_trep: number;
  clrep_fec_nombr?: Date | null;
  clrep_fec_venci?: Date | null;
  clrep_obs_clrep?: string | null;
  created_at?: Date;
  updated_at?: Date;
  created_by: number;
  updated_by: number;
  deleted_at?: Date | null;

  constructor(data: ClrepEntity, id?: number) {
    // Normalización de datos
    this.clrep_cod_clrep = id || data.clrep_cod_clrep;
    this.clrep_cod_clien = data.clrep_cod_clien;
    this.clrep_cod_perso = data.clrep_cod_perso;
    this.clrep_cod_trep = data.clrep_cod_trep;
    
    // Fechas: mantener o null
    this.clrep_fec_nombr = data.clrep_fec_nombr ?? null;
    this.clrep_fec_venci = data.clrep_fec_venci ?? null;
    
    // Observaciones: trim y mayúsculas, máximo 200 caracteres
    this.clrep_obs_clrep = data.clrep_obs_clrep 
      ? data.clrep_obs_clrep.trim().toUpperCase().substring(0, 200) 
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
  public toJson(): ClrepEntity {
    return {
      clrep_cod_clrep: this.clrep_cod_clrep,
      clrep_cod_clien: this.clrep_cod_clien,
      clrep_cod_perso: this.clrep_cod_perso,
      clrep_cod_trep: this.clrep_cod_trep,
      clrep_fec_nombr: this.clrep_fec_nombr,
      clrep_fec_venci: this.clrep_fec_venci,
      clrep_obs_clrep: this.clrep_obs_clrep,
      created_at: this.created_at,
      updated_at: this.updated_at,
      created_by: this.created_by,
      updated_by: this.updated_by,
      deleted_at: this.deleted_at,
    };
  }
}

