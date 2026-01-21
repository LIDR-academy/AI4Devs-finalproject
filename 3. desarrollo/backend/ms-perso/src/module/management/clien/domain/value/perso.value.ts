import { PersoEntity } from "../entity/perso.entity";

/**
 * Value object para Persona
 * Encapsula lógica de normalización y validación
 */
export class PersoValue implements PersoEntity {
  perso_cod_perso?: number;
  perso_cod_tpers: number;
  perso_cod_tiden: number;
  perso_ide_perso: string;
  perso_nom_perso: string;
  perso_fec_inici: Date;
  perso_cod_sexos: number;
  perso_cod_nacio: number;
  perso_cod_instr: number;
  perso_cod_ecivi?: number | null;
  perso_cod_etnia?: number | null;
  perso_tlf_celul?: string;
  perso_tlf_conve?: string;
  perso_dir_email?: string;
  perso_dac_regci?: string;
  perso_fec_ultrc?: Date | null;
  perso_cap_socia?: number;
  perso_fot_perso?: string;
  perso_fir_perso?: string;
  perso_fec_ultfo?: Date | null;
  perso_fec_ultfi?: Date | null;
  created_at?: Date;
  updated_at?: Date;
  created_by: number;
  updated_by: number;
  deleted_at?: Date | null;

  constructor(data: PersoEntity, id?: number) {
    this.perso_cod_perso = id ?? data.perso_cod_perso;
    this.perso_cod_tpers = data.perso_cod_tpers;
    this.perso_cod_tiden = data.perso_cod_tiden;
    
    // Normalización: trim y mayúsculas para identificación
    this.perso_ide_perso = data.perso_ide_perso.trim().toUpperCase();
    
    // Normalización: trim y mayúsculas para nombre
    this.perso_nom_perso = data.perso_nom_perso.trim().toUpperCase();
    
    this.perso_fec_inici = data.perso_fec_inici;
    this.perso_cod_sexos = data.perso_cod_sexos;
    this.perso_cod_nacio = data.perso_cod_nacio;
    this.perso_cod_instr = data.perso_cod_instr;
    this.perso_cod_ecivi = data.perso_cod_ecivi ?? null;
    this.perso_cod_etnia = data.perso_cod_etnia ?? null;
    
    // Normalización: trim para teléfonos
    this.perso_tlf_celul = data.perso_tlf_celul?.trim();
    this.perso_tlf_conve = data.perso_tlf_conve?.trim();
    
    // Normalización: trim y minúsculas para email
    this.perso_dir_email = data.perso_dir_email?.trim().toLowerCase();
    
    this.perso_dac_regci = data.perso_dac_regci?.trim();
    this.perso_fec_ultrc = data.perso_fec_ultrc ?? null;
    this.perso_cap_socia = data.perso_cap_socia;
    this.perso_fot_perso = data.perso_fot_perso;
    this.perso_fir_perso = data.perso_fir_perso;
    this.perso_fec_ultfo = data.perso_fec_ultfo ?? null;
    this.perso_fec_ultfi = data.perso_fec_ultfi ?? null;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    this.created_by = data.created_by;
    this.updated_by = data.updated_by;
    this.deleted_at = data.deleted_at ?? null;
  }
  
  /**
   * Convierte el value object a entidad para persistencia
   */
  public toJson(): PersoEntity {
    return {
      ...(this.perso_cod_perso ? { perso_cod_perso: this.perso_cod_perso } : {}),
      perso_cod_tpers: this.perso_cod_tpers,
      perso_cod_tiden: this.perso_cod_tiden,
      perso_ide_perso: this.perso_ide_perso,
      perso_nom_perso: this.perso_nom_perso,
      perso_fec_inici: this.perso_fec_inici,
      perso_cod_sexos: this.perso_cod_sexos,
      perso_cod_nacio: this.perso_cod_nacio,
      perso_cod_instr: this.perso_cod_instr,
      perso_cod_ecivi: this.perso_cod_ecivi,
      perso_cod_etnia: this.perso_cod_etnia,
      ...(this.perso_tlf_celul ? { perso_tlf_celul: this.perso_tlf_celul } : {}),
      ...(this.perso_tlf_conve ? { perso_tlf_conve: this.perso_tlf_conve } : {}),
      ...(this.perso_dir_email ? { perso_dir_email: this.perso_dir_email } : {}),
      ...(this.perso_dac_regci ? { perso_dac_regci: this.perso_dac_regci } : {}),
      perso_fec_ultrc: this.perso_fec_ultrc,
      ...(this.perso_cap_socia ? { perso_cap_socia: this.perso_cap_socia } : {}),
      ...(this.perso_fot_perso ? { perso_fot_perso: this.perso_fot_perso } : {}),
      ...(this.perso_fir_perso ? { perso_fir_perso: this.perso_fir_perso } : {}),
      perso_fec_ultfo: this.perso_fec_ultfo,
      perso_fec_ultfi: this.perso_fec_ultfi,
      ...(this.created_at ? { created_at: this.created_at } : {}),
      ...(this.updated_at ? { updated_at: this.updated_at } : {}),
      created_by: this.created_by,
      updated_by: this.updated_by,
      deleted_at: this.deleted_at,
    };
  }
}

