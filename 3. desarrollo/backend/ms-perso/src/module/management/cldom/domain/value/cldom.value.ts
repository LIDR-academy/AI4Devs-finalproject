import { CldomEntity } from '../entity/cldom.entity';

/**
 * Value Object para Domicilio
 * Normaliza los datos antes de persistir
 */
export class CldomValue implements CldomEntity {
  cldom_cod_cldom?: number;
  cldom_cod_clien: number;
  cldom_cod_provi: string;
  cldom_cod_canto: string;
  cldom_cod_parro: string;
  cldom_dir_domic: string;
  cldom_tlf_domic?: string | null;
  cldom_sit_refdo?: string | null;
  cldom_lat_coord?: number | null;
  cldom_lon_coord?: number | null;
  created_at?: Date;
  updated_at?: Date;
  created_by: number;
  updated_by: number;
  deleted_at?: Date | null;

  constructor(data: CldomEntity, id?: number) {
    // Normalización de datos
    this.cldom_cod_cldom = id || data.cldom_cod_cldom;
    this.cldom_cod_clien = data.cldom_cod_clien;
    
    // Códigos GEO: trim y padStart para asegurar formato correcto
    this.cldom_cod_provi = (data.cldom_cod_provi || '').trim().padStart(2, '0');
    this.cldom_cod_canto = (data.cldom_cod_canto || '').trim().padStart(4, '0');
    this.cldom_cod_parro = (data.cldom_cod_parro || '').trim().padStart(6, '0');
    
    // Dirección: trim y mayúsculas
    this.cldom_dir_domic = (data.cldom_dir_domic || '').trim().toUpperCase();
    
    // Teléfono: trim y limpiar espacios
    this.cldom_tlf_domic = data.cldom_tlf_domic ? data.cldom_tlf_domic.trim() : null;
    
    // Referencia: trim y mayúsculas
    this.cldom_sit_refdo = data.cldom_sit_refdo ? data.cldom_sit_refdo.trim().toUpperCase() : null;
    
    // Coordenadas GPS: mantener valores numéricos o null
    this.cldom_lat_coord = data.cldom_lat_coord ?? null;
    this.cldom_lon_coord = data.cldom_lon_coord ?? null;
    
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
  public toJson(): CldomEntity {
    return {
      cldom_cod_cldom: this.cldom_cod_cldom,
      cldom_cod_clien: this.cldom_cod_clien,
      cldom_cod_provi: this.cldom_cod_provi,
      cldom_cod_canto: this.cldom_cod_canto,
      cldom_cod_parro: this.cldom_cod_parro,
      cldom_dir_domic: this.cldom_dir_domic,
      cldom_tlf_domic: this.cldom_tlf_domic,
      cldom_sit_refdo: this.cldom_sit_refdo,
      cldom_lat_coord: this.cldom_lat_coord,
      cldom_lon_coord: this.cldom_lon_coord,
      created_at: this.created_at,
      updated_at: this.updated_at,
      created_by: this.created_by,
      updated_by: this.updated_by,
      deleted_at: this.deleted_at,
    };
  }
}

