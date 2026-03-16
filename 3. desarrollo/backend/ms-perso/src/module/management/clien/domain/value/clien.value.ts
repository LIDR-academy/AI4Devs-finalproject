import { ClienEntity } from "../entity/clien.entity";

/**
 * Value object para Cliente
 * Encapsula lógica de normalización y validación
 */
export class ClienValue implements ClienEntity {
  clien_cod_clien?: number;
  clien_cod_perso: number;
  clien_cod_ofici: number;
  clien_ctr_socio: boolean;
  clien_fec_ingin: Date;
  clien_fec_salid?: Date | null;
  clien_obs_clien?: string;
  created_at?: Date;
  updated_at?: Date;
  created_by: number;
  updated_by: number;
  deleted_at?: Date | null;

  constructor(data: ClienEntity, id?: number) {
    this.clien_cod_clien = id ?? data.clien_cod_clien;
    this.clien_cod_perso = data.clien_cod_perso;
    this.clien_cod_ofici = data.clien_cod_ofici;
    this.clien_ctr_socio = data.clien_ctr_socio ?? false;  // Default false (Cliente)
    this.clien_fec_ingin = data.clien_fec_ingin;
    this.clien_fec_salid = data.clien_fec_salid ?? null;
    
    // Normalización: trim para observaciones
    this.clien_obs_clien = data.clien_obs_clien?.trim();
    
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    this.created_by = data.created_by;
    this.updated_by = data.updated_by;
    this.deleted_at = data.deleted_at ?? null;
  }
  
  /**
   * Convierte el value object a entidad para persistencia
   */
  public toJson(): ClienEntity {
    return {
      ...(this.clien_cod_clien ? { clien_cod_clien: this.clien_cod_clien } : {}),
      clien_cod_perso: this.clien_cod_perso,
      clien_cod_ofici: this.clien_cod_ofici,
      clien_ctr_socio: this.clien_ctr_socio,
      clien_fec_ingin: this.clien_fec_ingin,
      clien_fec_salid: this.clien_fec_salid,
      ...(this.clien_obs_clien ? { clien_obs_clien: this.clien_obs_clien } : {}),
      ...(this.created_at ? { created_at: this.created_at } : {}),
      ...(this.updated_at ? { updated_at: this.updated_at } : {}),
      created_by: this.created_by,
      updated_by: this.updated_by,
      deleted_at: this.deleted_at,
    };
  }
}

