import { ClbncEntity } from '../entity/clbnc.entity';

/**
 * Value Object para Usuario Banca Digital
 * Normaliza los datos antes de persistir
 */
export class ClbncValue implements ClbncEntity {
  clbnc_cod_clbnc?: number;
  clbnc_cod_clien: number;
  clbnc_usr_banca: string;
  clbnc_pwd_banca: string;
  clbnc_fec_regis: Date;
  clbnc_fec_ultin?: Date | null;
  clbnc_tok_sesio?: string | null;
  clbnc_tok_notif?: string | null;
  clbnc_imei_disp?: string | null;
  clbnc_nom_dispo?: string | null;
  clbnc_det_dispo?: string | null;
  clbnc_ipa_ultin?: string | null;
  clbnc_lat_ultin?: number | null;
  clbnc_lon_ultin?: number | null;
  clbnc_geo_ultin?: string | null;
  clbnc_msj_bienv?: string | null;
  clbnc_ctr_activ: boolean;
  clbnc_ctr_termi: boolean;
  clbnc_lim_diario: number;
  clbnc_lim_mensu: number;
  created_at?: Date;
  updated_at?: Date;
  created_by: number;
  updated_by: number;
  deleted_at?: Date | null;

  constructor(data: ClbncEntity, id?: number) {
    // Normalización de datos
    this.clbnc_cod_clbnc = id || data.clbnc_cod_clbnc;
    this.clbnc_cod_clien = data.clbnc_cod_clien;
    
    // Username: trim y lowercase, máximo 150 caracteres
    this.clbnc_usr_banca = data.clbnc_usr_banca.trim().toLowerCase().substring(0, 150);
    
    // Password: mantener hash (no modificar)
    this.clbnc_pwd_banca = data.clbnc_pwd_banca;
    
    // Fecha registro: mantener o usar fecha actual
    this.clbnc_fec_regis = data.clbnc_fec_regis || new Date();
    
    // Último ingreso: mantener o null
    this.clbnc_fec_ultin = data.clbnc_fec_ultin ?? null;
    
    // Token sesión: trim, máximo 250 caracteres
    this.clbnc_tok_sesio = data.clbnc_tok_sesio 
      ? data.clbnc_tok_sesio.trim().substring(0, 250) 
      : null;
    
    // Token notificación: trim, máximo 250 caracteres
    this.clbnc_tok_notif = data.clbnc_tok_notif 
      ? data.clbnc_tok_notif.trim().substring(0, 250) 
      : null;
    
    // IMEI: trim, máximo 100 caracteres
    this.clbnc_imei_disp = data.clbnc_imei_disp 
      ? data.clbnc_imei_disp.trim().substring(0, 100) 
      : null;
    
    // Nombre dispositivo: trim, mayúsculas, máximo 150 caracteres
    this.clbnc_nom_dispo = data.clbnc_nom_dispo 
      ? data.clbnc_nom_dispo.trim().toUpperCase().substring(0, 150) 
      : null;
    
    // Detalles dispositivo: trim, máximo 250 caracteres
    this.clbnc_det_dispo = data.clbnc_det_dispo 
      ? data.clbnc_det_dispo.trim().substring(0, 250) 
      : null;
    
    // IP último acceso: trim, máximo 50 caracteres
    this.clbnc_ipa_ultin = data.clbnc_ipa_ultin 
      ? data.clbnc_ipa_ultin.trim().substring(0, 50) 
      : null;
    
    // Latitud: redondear a 6 decimales, mantener o null
    this.clbnc_lat_ultin = data.clbnc_lat_ultin !== null && data.clbnc_lat_ultin !== undefined
      ? Math.round(data.clbnc_lat_ultin * 1000000) / 1000000
      : null;
    
    // Longitud: redondear a 6 decimales, mantener o null
    this.clbnc_lon_ultin = data.clbnc_lon_ultin !== null && data.clbnc_lon_ultin !== undefined
      ? Math.round(data.clbnc_lon_ultin * 1000000) / 1000000
      : null;
    
    // Geocoder: trim, mayúsculas, máximo 250 caracteres
    this.clbnc_geo_ultin = data.clbnc_geo_ultin 
      ? data.clbnc_geo_ultin.trim().toUpperCase().substring(0, 250) 
      : null;
    
    // Mensaje bienvenida: trim, máximo 250 caracteres
    this.clbnc_msj_bienv = data.clbnc_msj_bienv 
      ? data.clbnc_msj_bienv.trim().substring(0, 250) 
      : null;
    
    // Estado activo: default true
    this.clbnc_ctr_activ = data.clbnc_ctr_activ ?? true;
    
    // Aceptó términos: default false
    this.clbnc_ctr_termi = data.clbnc_ctr_termi ?? false;
    
    // Límite diario: redondear a 2 decimales, mínimo 0, default 1000
    this.clbnc_lim_diario = Math.max(0, Math.round((data.clbnc_lim_diario ?? 1000) * 100) / 100);
    
    // Límite mensual: redondear a 2 decimales, mínimo 0, default 15000
    this.clbnc_lim_mensu = Math.max(0, Math.round((data.clbnc_lim_mensu ?? 15000) * 100) / 100);
    
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
  public toJson(): ClbncEntity {
    return {
      clbnc_cod_clbnc: this.clbnc_cod_clbnc,
      clbnc_cod_clien: this.clbnc_cod_clien,
      clbnc_usr_banca: this.clbnc_usr_banca,
      clbnc_pwd_banca: this.clbnc_pwd_banca,
      clbnc_fec_regis: this.clbnc_fec_regis,
      clbnc_fec_ultin: this.clbnc_fec_ultin,
      clbnc_tok_sesio: this.clbnc_tok_sesio,
      clbnc_tok_notif: this.clbnc_tok_notif,
      clbnc_imei_disp: this.clbnc_imei_disp,
      clbnc_nom_dispo: this.clbnc_nom_dispo,
      clbnc_det_dispo: this.clbnc_det_dispo,
      clbnc_ipa_ultin: this.clbnc_ipa_ultin,
      clbnc_lat_ultin: this.clbnc_lat_ultin,
      clbnc_lon_ultin: this.clbnc_lon_ultin,
      clbnc_geo_ultin: this.clbnc_geo_ultin,
      clbnc_msj_bienv: this.clbnc_msj_bienv,
      clbnc_ctr_activ: this.clbnc_ctr_activ,
      clbnc_ctr_termi: this.clbnc_ctr_termi,
      clbnc_lim_diario: this.clbnc_lim_diario,
      clbnc_lim_mensu: this.clbnc_lim_mensu,
      created_at: this.created_at,
      updated_at: this.updated_at,
      created_by: this.created_by,
      updated_by: this.updated_by,
      deleted_at: this.deleted_at,
    };
  }
}

