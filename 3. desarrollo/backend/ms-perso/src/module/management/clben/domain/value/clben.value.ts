import { ClbenEntity } from '../entity/clben.entity';

/**
 * Value Object para Beneficiario
 * Normaliza los datos antes de persistir
 */
export class ClbenValue implements ClbenEntity {
  clben_cod_clben?: number;
  clben_cod_clbnc: number;
  clben_num_cuent: string;
  clben_cod_tcuen: number;
  clben_cod_ifina?: number | null;
  clben_nom_benef: string;
  clben_ide_benef: string;
  clben_cod_tiden?: number | null;
  clben_ema_benef?: string | null;
  clben_ctr_exter: boolean;
  clben_ali_benef?: string | null;
  clben_ctr_activ: boolean;
  created_at?: Date;
  updated_at?: Date;
  created_by: number;
  updated_by: number;
  deleted_at?: Date | null;

  constructor(data: ClbenEntity, id?: number) {
    // Normalización de datos
    this.clben_cod_clben = id || data.clben_cod_clben;
    this.clben_cod_clbnc = data.clben_cod_clbnc;
    
    // Número cuenta: trim, máximo 20 caracteres
    this.clben_num_cuent = data.clben_num_cuent.trim().substring(0, 20);
    
    // Tipo cuenta: mantener valor
    this.clben_cod_tcuen = data.clben_cod_tcuen;
    
    // Institución financiera: mantener o null
    this.clben_cod_ifina = data.clben_cod_ifina ?? null;
    
    // Nombre beneficiario: trim, mayúsculas, máximo 250 caracteres
    this.clben_nom_benef = data.clben_nom_benef.trim().toUpperCase().substring(0, 250);
    
    // Identificación: trim, máximo 20 caracteres
    this.clben_ide_benef = data.clben_ide_benef.trim().substring(0, 20);
    
    // Tipo identificación: mantener o null
    this.clben_cod_tiden = data.clben_cod_tiden ?? null;
    
    // Email: trim, lowercase, máximo 150 caracteres
    this.clben_ema_benef = data.clben_ema_benef 
      ? data.clben_ema_benef.trim().toLowerCase().substring(0, 150) 
      : null;
    
    // Es externo: default false
    this.clben_ctr_exter = data.clben_ctr_exter ?? false;
    
    // Alias: trim, mayúsculas, máximo 50 caracteres
    this.clben_ali_benef = data.clben_ali_benef 
      ? data.clben_ali_benef.trim().toUpperCase().substring(0, 50) 
      : null;
    
    // Estado activo: default true
    this.clben_ctr_activ = data.clben_ctr_activ ?? true;
    
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
  public toJson(): ClbenEntity {
    return {
      clben_cod_clben: this.clben_cod_clben,
      clben_cod_clbnc: this.clben_cod_clbnc,
      clben_num_cuent: this.clben_num_cuent,
      clben_cod_tcuen: this.clben_cod_tcuen,
      clben_cod_ifina: this.clben_cod_ifina,
      clben_nom_benef: this.clben_nom_benef,
      clben_ide_benef: this.clben_ide_benef,
      clben_cod_tiden: this.clben_cod_tiden,
      clben_ema_benef: this.clben_ema_benef,
      clben_ctr_exter: this.clben_ctr_exter,
      clben_ali_benef: this.clben_ali_benef,
      clben_ctr_activ: this.clben_ctr_activ,
      created_at: this.created_at,
      updated_at: this.updated_at,
      created_by: this.created_by,
      updated_by: this.updated_by,
      deleted_at: this.deleted_at,
    };
  }
}

